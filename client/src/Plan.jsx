import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';

function Plan({ user }) {
  const navigate = useNavigate();
  const [curriculum, setCurriculum] = useState([]);
  const [prerequisites, setPrerequisites] = useState([]);
  const [sections, setSections] = useState([]); 
  const [draftPlan, setDraftPlan] = useState(null); 
  const [selectedCourses, setSelectedCourses] = useState([]);
  const [loading, setLoading] = useState(false);
  const [recommendations, setRecommendations] = useState([]);
  const [hoveredCourseId, setHoveredCourseId] = useState(null);
  const hoverTimerRef = useRef(null);

  // Modal State
  const [showModal, setShowModal] = useState(false);
  const [previewCourse, setPreviewCourse] = useState(null);
  const [previewSectionId, setPreviewSectionId] = useState(null);

  useEffect(() => {
    if (user && user.user_id) {
      fetch(`http://localhost:5000/curriculum-status/${user.user_id}`)
        .then(res => res.json())
        .then(data => setCurriculum(data))
        .catch(err => console.error("Error fetching curriculum:", err));

      fetch(`http://localhost:5000/prerequisites`)
        .then(res => res.json())
        .then(data => setPrerequisites(data))
        .catch(err => console.error("Error fetching prerequisites:", err));

      fetch(`http://localhost:5000/api/recommendations/${user.user_id}`)
        .then(res => res.json())
        .then(data => setRecommendations(data))
        .catch(err => console.error("Error fetching recommendations:", err));

      fetch(`http://localhost:5000/sections`)
        .then(res => res.json())
        .then(data => setSections(data))
        .catch(err => console.error("Error fetching sections:", err));

      fetch(`http://localhost:5000/my-draft/${user.user_id}`)
        .then(res => res.json())
        .then(data => {
            setDraftPlan(data);
            if (data && data.courses) {
                setSelectedCourses(data.courses.map(c => ({...c, selected_section_id: c.selected_section_id || null})));
            }
        })
        .catch(err => console.error("Error fetching draft:", err));
    }
  }, [user]);

  const handleConfirmPlan = () => {
    const missingSections = selectedCourses.some(c => !c.selected_section_id);
    if (missingSections) {
      alert("Please select a specific section/time for all your chosen courses.");
      return;
    }

    setLoading(true);
    fetch('http://localhost:5000/save-plan', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ user_id: user.user_id, selectedCourses: selectedCourses }),
    })
    .then(res => res.json())
    .then(data => {
      setLoading(false);
      if (data.success) {
        alert("Plan saved successfully!");
        navigate('/profile');
      } else {
        alert("Error saving plan: " + data.error);
      }
    })
    .catch(err => {
      setLoading(false);
      console.error("Error saving plan:", err);
    });
  };

  const checkPrereqsMet = (courseId) => {
    const reqsForThisCourse = prerequisites.filter(p => p.course_id === courseId);
    for (let req of reqsForThisCourse) {
      const prereqCourse = curriculum.find(c => c.course_id === req.prereq_id);
      if (!prereqCourse || prereqCourse.status !== 'completed') return false;
    }
    return true;
  };

  // --- TIME CONFLICT ENGINE ---
  const hasTimeConflict = (sec1, sec2) => {
    const days1 = sec1.days.split('-');
    const days2 = sec2.days.split('-');
    const dayOverlap = days1.some(d => days2.includes(d));
    
    if (!dayOverlap) return false;

    const timeToNum = (t) => {
        const [h, m] = t.split(':').map(Number);
        return h + (m / 60);
    };

    const start1 = timeToNum(sec1.start_time);
    const end1 = timeToNum(sec1.end_time);
    const start2 = timeToNum(sec2.start_time);
    const end2 = timeToNum(sec2.end_time);

    return (start1 < end2) && (end1 > start2);
  };

  const getConflictingCourse = (targetSection) => {
      const otherSelectedCourses = selectedCourses.filter(c => c.course_id !== previewCourse.course_id && c.selected_section_id);
      
      for (let selectedCourse of otherSelectedCourses) {
          const selectedSectionDetails = sections.find(s => s.section_id === parseInt(selectedCourse.selected_section_id));
          if (selectedSectionDetails && hasTimeConflict(targetSection, selectedSectionDetails)) {
              return selectedCourse; 
          }
      }
      return null;
  };

  // --- Modal Control Logic ---
  const handleCourseClick = (course) => {
    clearFocus();
    if (course.status === 'completed' || course.status === 'undergoing' || !checkPrereqsMet(course.course_id)) return;
    
    const existingSelection = selectedCourses.find(c => c.course_id === course.course_id);
    
    setPreviewCourse(course);
    setPreviewSectionId(existingSelection ? existingSelection.selected_section_id : null);
    setShowModal(true);
  };

  const handleSaveCourseSelection = () => {
    if (!previewSectionId) {
        alert("Please select a section time before adding the course.");
        return;
    }
    
    const filtered = selectedCourses.filter(c => c.course_id !== previewCourse.course_id);
    setSelectedCourses([...filtered, { ...previewCourse, selected_section_id: previewSectionId }]);
    setShowModal(false);
  };

  const handleRemoveCourseSelection = () => {
    setSelectedCourses(selectedCourses.filter(c => c.course_id !== previewCourse.course_id));
    setShowModal(false);
  };

  const clearFocus = () => {
    if (hoverTimerRef.current) clearTimeout(hoverTimerRef.current);
    setHoveredCourseId(null);
  };

  const startFocusTimer = (courseId) => {
    if (hoverTimerRef.current) clearTimeout(hoverTimerRef.current);
    hoverTimerRef.current = setTimeout(() => setHoveredCourseId(courseId), 1000);
  };

  const groupedCurriculum = curriculum.reduce((acc, course) => {
    const termNames = { '1': 'First Sem', '2': 'Second Sem', 'Summer': 'Summer' };
    const termLabel = `Year ${course.ideal_year} - ${termNames[course.ideal_semester] || 'Unknown'}`;
    if (!acc[termLabel]) acc[termLabel] = [];
    acc[termLabel].push(course);
    return acc;
  }, {});

  const totalCredits = selectedCourses.reduce((sum, c) => sum + (Number(c.credits) ?? 0), 0);
  const isInvalidLoad = totalCredits < 10 || totalCredits > 20;

  // --- SCHEDULE VISUALIZER LOGIC ---
  const DAYS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu'];
  const HOURS = Array.from({length: 17}, (_, i) => i + 7); 
  const ROW_HEIGHT = 50; 

  const getTopOffset = (timeStr) => {
      const [h, m] = timeStr.split(':').map(Number);
      return ((h + m/60) - 7) * ROW_HEIGHT;
  };

  const getHeight = (start, end) => {
      const [sh, sm] = start.split(':').map(Number);
      const [eh, em] = end.split(':').map(Number);
      return ((eh + em/60) - (sh + sm/60)) * ROW_HEIGHT;
  };

  const getColorForCourse = (id) => {
      const colors = ['#4f46e5', '#0284c7', '#0891b2', '#0d9488', '#059669', '#16a34a', '#65a30d', '#ca8a04', '#d97706', '#ea580c', '#dc2626', '#e11d48', '#db2777', '#c026d3', '#9333ea'];
      return colors[(id || 0) % colors.length];
  };

  const renderScheduleGrid = (sectionsToDraw) => (
    <div className="schedule-container d-flex shadow-sm" style={{ backgroundColor: '#f8f9fa', border: '1px solid #dee2e6', borderRadius: '12px', overflow: 'hidden' }}>
      <div style={{ width: '70px', borderRight: '1px solid #dee2e6', backgroundColor: '#fff', paddingTop: '42px' }}>
         {HOURS.map(h => (
            <div key={h} style={{ height: `${ROW_HEIGHT}px`, borderBottom: '1px solid #eee', fontSize: '0.75rem', color: '#6c757d', textAlign: 'center', boxSizing: 'border-box' }}>
               {h > 12 ? h-12 : h}:00 {h >= 12 ? 'PM' : 'AM'}
            </div>
         ))}
      </div>
      {DAYS.map((day, idx) => (
         <div key={day} className="flex-grow-1 position-relative" style={{ borderRight: idx < 4 ? '1px solid #dee2e6' : 'none' }}>
            <div className="text-center fw-bold py-2 shadow-sm position-absolute w-100" style={{ backgroundColor: '#eef6f1', borderBottom: '1px solid #dee2e6', color: '#104929', zIndex: 20, height: '42px' }}>
                {day}
            </div>
            <div className="position-relative w-100" style={{ height: `${HOURS.length * ROW_HEIGHT}px`, marginTop: '42px' }}>
               {HOURS.map(h => <div key={h} style={{ height: `${ROW_HEIGHT}px`, borderBottom: '1px dashed #f0f0f0', boxSizing: 'border-box' }}></div>)}
               {sectionsToDraw.filter(sec => sec.days && sec.days.includes(day)).map((sec, i) => {
                  const top = getTopOffset(sec.start_time);
                  const height = getHeight(sec.start_time, sec.end_time);
                  const isPreview = sec.isPreview; 
                  return (
                     <div key={i} className="position-absolute w-100 p-1" style={{ top: `${top}px`, height: `${height}px`, zIndex: isPreview ? 15 : 10 }}>
                        <div className="h-100 w-100 rounded shadow p-2 text-white d-flex flex-column justify-content-center" 
                             style={{ 
                                 backgroundColor: getColorForCourse(sec.course_id), 
                                 border: isPreview ? '3px dashed #ffc107' : 'none',
                                 borderLeft: isPreview ? '3px dashed #ffc107' : '5px solid rgba(0,0,0,0.3)', 
                                 fontSize: '0.8rem', overflow: 'hidden',
                                 boxShadow: isPreview ? '0 0 15px rgba(255, 193, 7, 0.7)' : 'none',
                                 animation: isPreview ? 'pulse 2s infinite' : 'none'
                             }}>
                           <div className="fw-bold text-truncate">{sec.course_prefix}-{sec.course_number}</div>
                           <div className="small text-truncate opacity-75">{sec.start_time.substring(0,5)} - {sec.end_time.substring(0,5)}</div>
                        </div>
                     </div>
                  );
               })}
            </div>
         </div>
      ))}
    </div>
  );

  const mainScheduleSections = selectedCourses
    .filter(c => c.selected_section_id)
    .map(c => ({ ...c, ...sections.find(s => s.section_id === parseInt(c.selected_section_id)) }))
    .filter(s => s.start_time && s.end_time);

  return (
    <div className="container-fluid plan-page-container bg-light min-vh-100 py-5">
      <style>{`
        @keyframes pulse { 0% { transform: scale(1); } 50% { transform: scale(1.02); } 100% { transform: scale(1); } }
        .modal-overlay { position: fixed; top: 0; left: 0; width: 100%; height: 100%; background: rgba(0,0,0,0.7); z-index: 10000; display: flex; align-items: center; justify-content: center; backdrop-filter: blur(5px); }
        .course-modal { background: white; padding: 30px; border-radius: 16px; width: 90vw; max-width: 1000px; max-height: 90vh; overflow-y: auto; }
      `}</style>

      <div className="container bg-white shadow-lg rounded-4 p-5">
        <div className="row g-5">
          
          {/* --- COLUMN 1: RECOMMENDATIONS --- */}
          <div className="col-lg-4">
            <div className="p-4 rounded-4 shadow-sm border bg-white h-100">
              <h5 className="fw-bold mb-4" style={{ color: '#104929' }}>✨ E-Advisor Rankings</h5>
              <div className="fw-bold text-center mb-3 p-2 rounded-pill w-100" style={{ fontSize: '0.7rem', color: '#104929', backgroundColor: '#eef6f1', border: '1px solid #10492922' }}>▲ MOST RECOMMENDED</div>
              
              <div style={{ maxHeight: '600px', overflowY: 'auto', paddingRight: '10px' }}>
                <div className="d-flex flex-column gap-3">
                  {recommendations.map((rec) => {
                    const isSelected = selectedCourses.some(c => c.course_id === rec.id);
                    const isDimmed = hoveredCourseId !== null && hoveredCourseId !== rec.id;
                    const fullData = curriculum.find(c => c.course_id === rec.id) || { ...rec, course_id: rec.id };

                    return (
                      <div key={rec.id} onClick={() => handleCourseClick(fullData)}
                        style={{ 
                          cursor: 'pointer', backgroundColor: isSelected ? '#f0fdf4' : '#ffffff',
                          border: isSelected ? '2px solid #104929' : '1px solid #dee2e6', borderRadius: '15px',
                          transition: 'all 0.3s ease', opacity: isDimmed ? 0.3 : 1, textAlign: 'center', padding: '1.5rem'
                        }}>
                        <div className="fw-bold mb-1" style={{ fontSize: '1.4rem', color: '#104929' }}>{rec.prefix}{rec.number}</div>
                        <div className="text-muted small mb-2">{rec.name}</div>
                        <span className="badge rounded-pill bg-light text-dark border px-3">{rec.credits} Credits</span>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          </div>

          {/* --- COLUMN 2: ROADMAP --- */}
          <div className="col-lg-8">
            <div className="text-center mb-5">
              <h2 className="fw-bold" style={{ color: '#104929' }}>Academic Roadmap Planner</h2>
              <p className="text-muted">Click a course to view sections and add to your schedule.</p>
            </div>

            <div className="pb-4" style={{ display: 'flex', overflowX: 'auto', gap: '1.5rem', paddingBottom: '2rem' }}>
              {Object.entries(groupedCurriculum).map(([termLabel, semCourses], semIdx) => (
                <div key={semIdx} style={{ minWidth: '300px' }}>
                  <h6 className="text-center fw-bold mb-4 py-2 rounded-pill text-white shadow-sm" style={{ backgroundColor: '#104929', fontSize: '0.8rem' }}>{termLabel}</h6>
                  
                  <div className="d-flex flex-column gap-3">
                    {semCourses.map(course => {
                      const isPassed = course.status === 'completed';
                      const isOngoing = course.status === 'undergoing';
                      const isSelected = selectedCourses.some(c => c.course_id === course.course_id);
                      const prereqsMet = checkPrereqsMet(course.course_id);
                      const isLocked = !isPassed && !isOngoing && !prereqsMet;
                      const isAvailable = !isPassed && !isOngoing && prereqsMet;
                      const isSpotlighted = hoveredCourseId === course.course_id && isAvailable;

                      // COLOR SWAP LOGIC: Passed = Grey, Locked = Red
                      let bgColor = isPassed ? '#f8f9fa' : isOngoing ? '#eef2ff' : isLocked ? '#fce8e8' : isSelected ? '#f0fdf4' : '#ffffff';
                      let borderColor = isSelected ? '#104929' : isLocked ? '#f5c2c7' : '#dee2e6';
                      let opacityLevel = (hoveredCourseId && !isSpotlighted) ? 0.3 : (isPassed ? 0.6 : 1);

                      return (
                        <div key={course.course_id}
                          onClick={isAvailable ? () => handleCourseClick(course) : undefined}
                          onMouseEnter={isAvailable ? () => startFocusTimer(course.course_id) : undefined}
                          onMouseLeave={isAvailable ? clearFocus : undefined}
                          className={`card shadow-sm border-2`}
                          style={{ 
                            backgroundColor: bgColor,
                            borderColor: borderColor,
                            cursor: !isAvailable ? 'not-allowed' : 'pointer', 
                            transition: 'all 0.3s ease',
                            transform: isSpotlighted ? 'scale(1.05)' : 'scale(1)', 
                            zIndex: isSpotlighted ? 100 : 1,
                            opacity: opacityLevel
                          }}>
                          <div className="card-body p-3">
                            <div className="d-flex justify-content-between align-items-center mb-2">
                              <span className="fw-bold" style={{ color: (isLocked || isPassed) ? '#6c757d' : '#104929' }}>
                                {course.course_prefix}-{course.course_number}
                              </span>
                              <span className="badge bg-light text-dark border">{course.credits} Cr</span>
                            </div>
                            <div className={`small fw-bold text-truncate mb-2 ${(isLocked || isPassed) ? 'text-muted' : ''}`}>
                              {course.course_name}
                            </div>
                            
                            {/* BADGE SWAP LOGIC */}
                            {isPassed && <span className="badge bg-secondary w-100">Grade: {course.grade}</span>}
                            {isOngoing && <span className="badge bg-primary w-100">In Progress</span>}
                            {isLocked && <span className="badge bg-danger w-100">🔒 Locked</span>}
                            {isSelected && <span className="badge bg-success w-100 mt-2">Added to Plan</span>}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* MAIN PAGE SCHEDULE PREVIEW */}
        <div className="mt-5 pt-4 border-top">
          <h3 className="fw-bold text-center mb-4" style={{ color: '#104929' }}>Your Weekly Plan</h3>
          {mainScheduleSections.length > 0 ? renderScheduleGrid(mainScheduleSections) : (
              <div className="text-center p-5 text-muted bg-light rounded border border-dashed">
                  No courses added to your schedule yet. Click a course above to begin.
              </div>
          )}
        </div>

        {/* STICKY FOOTER */}
        <div className="mt-5 p-4 rounded-4 bg-white shadow-lg border d-flex justify-content-between align-items-center sticky-bottom" style={{ bottom: '20px', zIndex: 50 }}>
          <div>
            <h5 className="fw-bold mb-0">Total Credits: <span className={isInvalidLoad ? 'text-danger' : 'text-success'}>{totalCredits}</span></h5>
            <small className="text-muted">Required: 10 - 20 Credits</small>
          </div>
          <button 
            className="btn btn-lg px-5 py-3 fw-bold rounded-pill text-white shadow"
            disabled={isInvalidLoad || loading}
            onClick={handleConfirmPlan}
            style={{ backgroundColor: isInvalidLoad ? '#6c757d' : '#104929', border: 'none' }}
          >
            {loading ? 'Saving...' : (totalCredits < 10 ? 'Under Min Credits' : (totalCredits > 20 ? 'Over Max Credits' : 'Confirm Draft Plan'))}
          </button>
        </div>
      </div>

      {/* --- SECTION SELECTION MODAL --- */}
      {showModal && previewCourse && draftPlan && (
        <div className="modal-overlay" onClick={() => setShowModal(false)}>
          <div className="course-modal shadow-lg d-flex flex-column" onClick={e => e.stopPropagation()}>
            
            <div className="d-flex justify-content-between align-items-center mb-4 border-bottom pb-3">
              <div>
                  <h2 className="fw-bold m-0" style={{ color: '#104929' }}>{previewCourse.course_prefix}-{previewCourse.course_number}</h2>
                  <p className="text-muted m-0">{previewCourse.course_name} ({previewCourse.credits} Credits)</p>
              </div>
              <button className="btn-close" onClick={() => setShowModal(false)}></button>
            </div>

            <div className="row g-4 flex-grow-1">
                {/* Left Side: Section Details & Selection */}
                <div className="col-md-4 d-flex flex-column gap-3">
                    <h5 className="fw-bold">Available Sections</h5>
                    {sections.filter(s => s.course_id === previewCourse.course_id && s.semester_id === draftPlan.semester_id).map(sec => {
                        const isSelectedSection = previewSectionId === sec.section_id;
                        
                        // Check if this section conflicts with any already selected courses
                        const conflictingCourse = getConflictingCourse(sec);
                        const isConflicting = !!conflictingCourse;

                        return (
                            <div key={sec.section_id} 
                                 // Toggle logic: If clicking the already selected one, set to null
                                 onClick={!isConflicting ? () => setPreviewSectionId(previewSectionId === sec.section_id ? null : sec.section_id) : undefined}
                                 className={`p-3 border rounded shadow-sm transition-all ${isConflicting ? 'opacity-50' : ''}`}
                                 style={{ 
                                     cursor: isConflicting ? 'not-allowed' : 'pointer', 
                                     backgroundColor: isConflicting ? '#f8d7da' : (isSelectedSection ? '#eefaf4' : '#fff'), 
                                     border: isSelectedSection ? '2px solid #104929' : (isConflicting ? '1px solid #dc3545' : '1px solid #dee2e6') 
                                 }}>
                                <div className="d-flex justify-content-between align-items-center mb-2">
                                    <span className="fw-bold fs-5">{sec.section_name}</span>
                                    <span className={`badge ${isConflicting ? 'bg-danger' : 'bg-primary'}`}>{sec.days}</span>
                                </div>
                                {isConflicting && (
                                    <div className="small fw-bold text-danger mb-2">
                                        ⚠ Time Conflict: {conflictingCourse.course_prefix}-{conflictingCourse.course_number}
                                    </div>
                                )}
                                <div className="small text-muted mb-1"><i className="bi bi-person-fill me-2"></i>{sec.professor_name}</div>
                                <div className="small text-muted mb-1"><i className="bi bi-clock-fill me-2"></i>{sec.start_time.substring(0,5)} - {sec.end_time.substring(0,5)}</div>
                                <div className="small text-muted"><i className="bi bi-geo-alt-fill me-2"></i>{sec.room_number}</div>
                            </div>
                        );
                    })}
                </div>

                {/* Right Side: Live Schedule Preview */}
                <div className="col-md-8">
                    <h5 className="fw-bold mb-3">Live Schedule Preview</h5>
                    <div style={{ transform: 'scale(0.85)', transformOrigin: 'top left', width: '117%' }}>
                        {(() => {
                            const baseSections = selectedCourses
                                .filter(c => c.course_id !== previewCourse.course_id && c.selected_section_id)
                                .map(c => ({ ...c, ...sections.find(s => s.section_id === parseInt(c.selected_section_id)) }));
                            
                            const previewSecInfo = sections.find(s => s.section_id === previewSectionId);
                            const scheduleData = previewSecInfo 
                                ? [...baseSections, { ...previewCourse, ...previewSecInfo, isPreview: true }]
                                : baseSections;

                            return renderScheduleGrid(scheduleData.filter(s => s.start_time && s.end_time));
                        })()}
                    </div>
                </div>
            </div>

            <div className="mt-4 pt-3 border-top d-flex justify-content-between">
              {selectedCourses.some(c => c.course_id === previewCourse.course_id) ? (
                  <button className="btn btn-outline-danger fw-bold px-4" onClick={handleRemoveCourseSelection}>Remove from Plan</button>
              ) : <div></div>}
              
              <div className="d-flex gap-2">
                  <button className="btn btn-secondary fw-bold px-4" onClick={() => setShowModal(false)}>Cancel</button>
                  <button className="btn fw-bold px-5 text-white" style={{ backgroundColor: '#104929' }} onClick={handleSaveCourseSelection}>
                      {selectedCourses.some(c => c.course_id === previewCourse.course_id) ? "Update Section" : "Add Course"}
                  </button>
              </div>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}

export default Plan;