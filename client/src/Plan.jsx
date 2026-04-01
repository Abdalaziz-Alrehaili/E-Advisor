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
                setSelectedCourses(data.courses.map(c => ({...c, selected_section_id: null})));
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

  const toggleCourse = (course) => {
    clearFocus();
    if (course.status === 'completed' || course.status === 'undergoing' || !checkPrereqsMet(course.course_id)) return;
    
    if (selectedCourses.find(c => c.course_id === course.course_id)) {
      setSelectedCourses(selectedCourses.filter(c => c.course_id !== course.course_id));
    } else {
      setSelectedCourses([...selectedCourses, { ...course, selected_section_id: null }]);
    }
  };

  const handleSectionChange = (courseId, sectionId) => {
    setSelectedCourses(prev => prev.map(c => 
      c.course_id === courseId ? { ...c, selected_section_id: sectionId } : c
    ));
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
  const HOURS = Array.from({length: 17}, (_, i) => i + 7); // 7 AM to 11 PM (23:00)
  const ROW_HEIGHT = 50; // 50px per hour for easy math

  // Combines selected courses with their full section details for the calendar
  const activeSections = selectedCourses
    .filter(c => c.selected_section_id)
    .map(c => {
       const secInfo = sections.find(s => s.section_id === parseInt(c.selected_section_id));
       return { ...c, ...secInfo };
    })
    .filter(s => s.start_time && s.end_time);

  // Calculates pixels from the top (7:00 AM)
  const getTopOffset = (timeStr) => {
      const [h, m] = timeStr.split(':').map(Number);
      return ((h + m/60) - 7) * ROW_HEIGHT;
  };

  // Calculates height of the block based on duration
  const getHeight = (start, end) => {
      const [sh, sm] = start.split(':').map(Number);
      const [eh, em] = end.split(':').map(Number);
      return ((eh + em/60) - (sh + sm/60)) * ROW_HEIGHT;
  };

  // Assigns a consistent color based on the Course ID
  const getColorForCourse = (id) => {
      const colors = ['#4f46e5', '#0284c7', '#0891b2', '#0d9488', '#059669', '#16a34a', '#65a30d', '#ca8a04', '#d97706', '#ea580c', '#dc2626', '#e11d48', '#db2777', '#c026d3', '#9333ea'];
      return colors[(id || 0) % colors.length];
  };

  return (
    <div className="container-fluid plan-page-container bg-light min-vh-100 py-5">
      <div className="container bg-white shadow-lg rounded-4 p-5">
        
        {/* TOP SECTION: RECOMMENDATIONS & ROADMAP */}
        <div className="row g-5">
          
          <div className="col-lg-4">
            <div className="p-4 rounded-4 shadow-sm border bg-white h-100">
              <h5 className="fw-bold mb-4" style={{ color: '#104929' }}>✨ E-Advisor Rankings</h5>
              <div className="fw-bold text-center mb-3 p-2 rounded-pill w-100" style={{ fontSize: '0.7rem', color: '#104929', backgroundColor: '#eef6f1', border: '1px solid #10492922' }}>▲ MOST RECOMMENDED</div>
              
              <div style={{ maxHeight: '600px', overflowY: 'auto', paddingRight: '10px' }}>
                <div className="d-flex flex-column gap-3">
                  {recommendations.map((rec) => {
                    const isSelected = selectedCourses.find(c => c.course_id === rec.id);
                    const isDimmed = hoveredCourseId !== null && hoveredCourseId !== rec.id;
                    const fullData = curriculum.find(c => c.course_id === rec.id) || { ...rec, course_id: rec.id };

                    return (
                      <div key={rec.id} onClick={() => toggleCourse(fullData)}
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

          <div className="col-lg-8">
            <div className="text-center mb-5">
              <h2 className="fw-bold" style={{ color: '#104929' }}>Academic Roadmap Planner</h2>
              <p className="text-muted">Select your courses and specific sections below.</p>
            </div>

            <div className="pb-4" style={{ display: 'flex', overflowX: 'auto', gap: '1.5rem', paddingBottom: '2rem' }}>
              {Object.entries(groupedCurriculum).map(([termLabel, semCourses], semIdx) => (
                <div key={semIdx} style={{ minWidth: '300px' }}>
                  <h6 className="text-center fw-bold mb-4 py-2 rounded-pill text-white shadow-sm" style={{ backgroundColor: '#104929', fontSize: '0.8rem' }}>{termLabel}</h6>
                  
                  <div className="d-flex flex-column gap-3">
                    {semCourses.map(course => {
                      const isPassed = course.status === 'completed';
                      const isOngoing = course.status === 'undergoing';
                      const selectedObj = selectedCourses.find(c => c.course_id === course.course_id);
                      const isSelected = !!selectedObj;
                      const prereqsMet = checkPrereqsMet(course.course_id);
                      const isLocked = !isPassed && !isOngoing && !prereqsMet;
                      const isAvailable = !isPassed && !isOngoing && prereqsMet;
                      const isSpotlighted = hoveredCourseId === course.course_id && isAvailable;

                      return (
                        <div key={course.course_id}
                          onClick={isAvailable ? () => toggleCourse(course) : undefined}
                          onMouseEnter={isAvailable ? () => startFocusTimer(course.course_id) : undefined}
                          onMouseLeave={isAvailable ? clearFocus : undefined}
                          className={`card shadow-sm border-2 ${isSelected ? 'border-success' : ''}`}
                          style={{ 
                            backgroundColor: isPassed ? '#f8f9fa' : isOngoing ? '#eef2ff' : isSelected ? '#f0fdf4' : '#ffffff',
                            cursor: !isAvailable ? 'not-allowed' : 'pointer', transition: 'all 0.3s ease',
                            transform: isSpotlighted ? 'scale(1.05)' : 'scale(1)', zIndex: isSpotlighted ? 100 : 1,
                            opacity: (hoveredCourseId && !isSpotlighted) ? 0.3 : (isLocked ? 0.6 : 1)
                          }}>
                          <div className="card-body p-3">
                            <div className="d-flex justify-content-between align-items-center mb-2">
                              <span className="fw-bold" style={{ color: '#104929' }}>{course.course_prefix}-{course.course_number}</span>
                              <span className="badge bg-light text-dark border">{course.credits} Cr</span>
                            </div>
                            <div className="small fw-bold text-truncate mb-2">{course.course_name}</div>
                            
                            {isPassed && <span className="badge bg-danger w-100">Grade: {course.grade}</span>}
                            {isOngoing && <span className="badge bg-primary w-100">In Progress</span>}
                            {isLocked && <span className="badge bg-secondary w-100">🔒 Locked</span>}

                            {/* SECTION SELECTOR */}
                            {isSelected && draftPlan && (
                              <div className="mt-3 pt-3 border-top" onClick={e => e.stopPropagation()}>
                                <label className="small fw-bold mb-1">Choose Section:</label>
                                <select 
                                  className="form-select form-select-sm"
                                  value={selectedObj.selected_section_id || ""}
                                  onChange={(e) => handleSectionChange(course.course_id, e.target.value)}
                                >
                                  <option value="">-- Pick a Time --</option>
                                  {sections
                                    .filter(sec => 
                                      sec.course_id === course.course_id && 
                                      sec.semester_id === draftPlan.semester_id 
                                    )
                                    .map(sec => (
                                      <option key={sec.section_id} value={sec.section_id}>
                                        {sec.section_name} | {sec.days} | {sec.start_time.substring(0,5)} ({sec.professor_name})
                                      </option>
                                    ))
                                  }
                                </select>
                              </div>
                            )}
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

        {/* --- NEW: VISUAL SCHEDULE TIMETABLE --- */}
        <div className="mt-5 pt-4 border-top">
          <h3 className="fw-bold text-center mb-4" style={{ color: '#104929' }}>Weekly Schedule Preview</h3>
          
          <div className="schedule-container d-flex shadow-sm" style={{ backgroundColor: '#f8f9fa', border: '1px solid #dee2e6', borderRadius: '12px', overflow: 'hidden' }}>
            
            {/* Y-Axis: Time Column */}
            <div style={{ width: '70px', borderRight: '1px solid #dee2e6', backgroundColor: '#fff', paddingTop: '42px' }}>
               {HOURS.map(h => (
                  <div key={h} style={{ height: `${ROW_HEIGHT}px`, borderBottom: '1px solid #eee', fontSize: '0.75rem', color: '#6c757d', textAlign: 'center', boxSizing: 'border-box' }}>
                     {h > 12 ? h-12 : h}:00 {h >= 12 ? 'PM' : 'AM'}
                  </div>
               ))}
            </div>

            {/* X-Axis: Day Columns */}
            {DAYS.map((day, idx) => (
               <div key={day} className="flex-grow-1 position-relative" style={{ borderRight: idx < 4 ? '1px solid #dee2e6' : 'none' }}>
                  
                  {/* Day Header */}
                  <div className="text-center fw-bold py-2 shadow-sm position-absolute w-100" style={{ backgroundColor: '#eef6f1', borderBottom: '1px solid #dee2e6', color: '#104929', zIndex: 20, height: '42px' }}>
                      {day}
                  </div>
                  
                  {/* Grid Background */}
                  <div className="position-relative w-100" style={{ height: `${HOURS.length * ROW_HEIGHT}px`, marginTop: '42px' }}>
                     {HOURS.map(h => <div key={h} style={{ height: `${ROW_HEIGHT}px`, borderBottom: '1px dashed #f0f0f0', boxSizing: 'border-box' }}></div>)}
                     
                     {/* Floating Course Blocks */}
                     {activeSections.filter(sec => sec.days && sec.days.includes(day)).map((sec, i) => {
                        const top = getTopOffset(sec.start_time);
                        const height = getHeight(sec.start_time, sec.end_time);
                        
                        return (
                           <div key={i} className="position-absolute w-100 p-1" style={{ top: `${top}px`, height: `${height}px`, zIndex: 10 }}>
                              <div className="h-100 w-100 rounded shadow-sm p-2 text-white d-flex flex-column justify-content-center" 
                                   style={{ backgroundColor: getColorForCourse(sec.course_id), borderLeft: '5px solid rgba(0,0,0,0.2)', fontSize: '0.8rem', overflow: 'hidden' }}>
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
        </div>

        {/* --- STICKY FOOTER --- */}
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
    </div>
  );
}

export default Plan;