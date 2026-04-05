import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';

function Plan({ user }) {
  const navigate = useNavigate();
  const [curriculum, setCurriculum] = useState([]);
  const [prerequisites, setPrerequisites] = useState([]);
  const [sections, setSections] = useState([]); 
  const [allCourses, setAllCourses] = useState([]); 
  const [draftPlan, setDraftPlan] = useState(null); 
  const [selectedCourses, setSelectedCourses] = useState([]);
  const [loading, setLoading] = useState(false);
  const [recommendations, setRecommendations] = useState([]);
  const [hoveredCourseId, setHoveredCourseId] = useState(null);
  const hoverTimerRef = useRef(null);

  // Modal State
  const [showModal, setShowModal] = useState(false);
  const [previewCourse, setPreviewCourse] = useState(null);
  const [activeElectiveCourse, setActiveElectiveCourse] = useState(null); 
  const [previewSectionId, setPreviewSectionId] = useState(null);

  // Checkbox States for Rankings Filter
  const [showCore, setShowCore] = useState(true);
  const [showElective, setShowElective] = useState(false);
  const [showFree, setShowFree] = useState(false);

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

      fetch(`http://localhost:5000/courses`)
        .then(res => res.json())
        .then(data => setAllCourses(data))
        .catch(err => console.warn("Could not fetch all courses. Falling back to sections extractor.", err));

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

  const isPlaceholder = (c) => {
    if (!c) return false;
    const prefix = (c.course_prefix || c.prefix || '').toUpperCase();
    const name = (c.course_name || c.name || '').toUpperCase();
    return prefix.includes('ELEC') || prefix.includes('FREE') || name.includes('ELECTIVE') || name.includes('FREE');
  };

  const isPreviewPlaceholder = isPlaceholder(previewCourse);
  const evaluatedCourse = isPreviewPlaceholder ? activeElectiveCourse : previewCourse;

  const getConflictingCourse = (targetSection) => {
      const excludeId = isPreviewPlaceholder ? (activeElectiveCourse?.course_id || null) : previewCourse.course_id;
      const otherSelectedCourses = selectedCourses.filter(c => c.course_id !== excludeId && c.selected_section_id);
      
      for (let selectedCourse of otherSelectedCourses) {
          const selectedSectionDetails = sections.find(s => s.section_id === parseInt(selectedCourse.selected_section_id));
          if (selectedSectionDetails && hasTimeConflict(targetSection, selectedSectionDetails)) {
              return selectedCourse; 
          }
      }
      return null;
  };

  const handleCourseClick = (course) => {
    clearFocus();
    const isPlc = isPlaceholder(course);
    const existingSelection = selectedCourses.find(c => isPlc ? c.placeholder_id === course.course_id : c.course_id === course.course_id);
    
    setPreviewCourse(course);
    setActiveElectiveCourse(existingSelection || null);
    setPreviewSectionId(existingSelection ? existingSelection.selected_section_id : null);
    setShowModal(true);
  };

  const handleSaveCourseSelection = () => {
    if (!previewSectionId) {
        setSelectedCourses(selectedCourses.filter(c => isPreviewPlaceholder ? c.placeholder_id !== previewCourse.course_id : c.course_id !== previewCourse.course_id));
        setShowModal(false);
        return;
    }
    
    const filtered = selectedCourses.filter(c => isPreviewPlaceholder ? c.placeholder_id !== previewCourse.course_id : c.course_id !== previewCourse.course_id);
    
    const newSelection = { ...evaluatedCourse, selected_section_id: previewSectionId };
    if (isPreviewPlaceholder) {
        newSelection.placeholder_id = previewCourse.course_id; 
    }

    setSelectedCourses([...filtered, newSelection]);
    setShowModal(false);
  };

  const handleRemoveCourseSelection = () => {
    setSelectedCourses(selectedCourses.filter(c => isPreviewPlaceholder ? c.placeholder_id !== previewCourse.course_id : c.course_id !== previewCourse.course_id));
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
  
  const isSummer = draftPlan?.semester_name?.toLowerCase().includes('summer');
  const minCredits = isSummer ? 0 : 10;
  const maxCredits = isSummer ? 9 : 20;
  const isInvalidLoad = totalCredits < minCredits || totalCredits > maxCredits;

  const getProgress = () => {
      let elecComp = 0, freeComp = 0;
      let elecPlan = 0, freePlan = 0;
      let requiredElec = 0, requiredFree = 0;

      curriculum.forEach(c => {
          const isElec = (c.historical_placeholder_name || '').toUpperCase().includes('ELECTIVE') || (c.course_prefix || '').toUpperCase().includes('ELEC') || (c.course_name || '').toUpperCase().includes('ELECTIVE');
          const isFree = (c.historical_placeholder_name || '').toUpperCase().includes('FREE') || (c.course_prefix || '').toUpperCase().includes('FREE') || (c.course_name || '').toUpperCase().includes('FREE');
          
          if (isElec) {
              requiredElec += Number(c.credits) || 0;
              if (c.status === 'completed' || c.status === 'undergoing') elecComp += Number(c.credits) || 0;
          }
          if (isFree) {
              requiredFree += Number(c.credits) || 0;
              if (c.status === 'completed' || c.status === 'undergoing') freeComp += Number(c.credits) || 0;
          }
      });

      selectedCourses.forEach(sc => {
          const placeholder = curriculum.find(c => c.course_id === sc.placeholder_id);
          if (placeholder) {
              const isElec = (placeholder.course_prefix || '').toUpperCase().includes('ELEC') || (placeholder.course_name || '').toUpperCase().includes('ELECTIVE');
              const isFree = (placeholder.course_prefix || '').toUpperCase().includes('FREE') || (placeholder.course_name || '').toUpperCase().includes('FREE');
              if (isElec) elecPlan += Number(sc.credits) || 0;
              if (isFree) freePlan += Number(sc.credits) || 0;
          }
      });

      return { elecComp, freeComp, elecPlan, freePlan, requiredElec, requiredFree };
  };

  const { elecComp, freeComp, elecPlan, freePlan, requiredElec, requiredFree } = getProgress();

  const getAvailableElectives = (targetPlaceholder) => {
      if (!targetPlaceholder) return [];

      const isCore = (id) => curriculum.some(core => core.course_id === id && !isPlaceholder(core));
      const isAlreadySelected = (id) => selectedCourses.some(sc => sc.course_id === id && sc.placeholder_id !== targetPlaceholder.course_id);

      const isElecSlot = (targetPlaceholder.course_prefix || '').toUpperCase().includes('ELEC') || (targetPlaceholder.course_name || '').toUpperCase().includes('ELECTIVE');
      const isFreeSlot = (targetPlaceholder.course_prefix || '').toUpperCase().includes('FREE') || (targetPlaceholder.course_name || '').toUpperCase().includes('FREE');

      let list = allCourses.length > 0 
          ? allCourses.filter(c => !isCore(c.course_id) && !isPlaceholder(c)) 
          : sections.reduce((acc, sec) => {
              if (!isCore(sec.course_id) && !isPlaceholder(sec) && !acc.find(c => c.course_id === sec.course_id)) {
                  acc.push({
                      course_id: sec.course_id,
                      course_prefix: sec.course_prefix,
                      course_number: sec.course_number,
                      course_name: sec.course_name || `${sec.course_prefix} ${sec.course_number}`,
                      credits: sec.credits || 3
                  });
              }
              return acc;
          }, []);
          
      return list.filter(c => {
          if (isAlreadySelected(c.course_id)) return false;
          const prefix = (c.course_prefix || '').toUpperCase();
          if (isElecSlot && prefix !== 'CPIS') return false;
          if (isFreeSlot && prefix === 'CPIS') return false;
          return true;
      });
  };

  const filteredRecommendations = recommendations.filter(rec => {
      if (isPlaceholder(rec)) return false;

      const isCore = curriculum.some(core => core.course_id === rec.id && !isPlaceholder(core));
      const prefix = (rec.prefix || '').toUpperCase();
      
      let courseType = 'free';
      if (isCore) {
          courseType = 'core';
      } else if (prefix === 'CPIS') {
          courseType = 'elective';
      }

      if (courseType === 'core' && showCore) return true;
      if (courseType === 'elective' && showElective) return true;
      if (courseType === 'free' && showFree) return true;

      return false;
  });

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
                        <div 
                             onClick={!isPreview ? () => handleCourseClick(sec) : undefined}
                             className={`h-100 w-100 rounded shadow p-2 text-white d-flex flex-column justify-content-center ${!isPreview ? 'schedule-block-hover' : ''}`} 
                             style={{ 
                                 backgroundColor: getColorForCourse(sec.course_id), 
                                 border: isPreview ? '3px dashed #ffc107' : 'none',
                                 borderLeft: isPreview ? '3px dashed #ffc107' : '5px solid rgba(0,0,0,0.3)', 
                                 fontSize: '0.8rem', overflow: 'hidden',
                                 boxShadow: isPreview ? '0 0 15px rgba(255, 193, 7, 0.7)' : 'none',
                                 animation: isPreview ? 'pulse 2s infinite' : 'none',
                                 cursor: !isPreview ? 'pointer' : 'default'
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
        .course-modal { background: white; padding: 30px; border-radius: 16px; width: 90vw; max-width: 1100px; max-height: 95vh; overflow-y: auto; }
        .swimlane { background-color: #f8f9fa; border-radius: 12px; padding: 15px; height: 100%; border: 1px solid #e9ecef; }
        .chain-card { transition: transform 0.2s; cursor: pointer; }
        .chain-card:hover { transform: translateY(-3px); }
        .schedule-block-hover { transition: transform 0.2s ease, filter 0.2s ease; }
        .schedule-block-hover:hover { transform: scale(1.03); filter: brightness(1.1); z-index: 25 !important; }
        
        .custom-scrollbar::-webkit-scrollbar { width: 6px; height: 6px; }
        .custom-scrollbar::-webkit-scrollbar-track { background: transparent; }
        .custom-scrollbar::-webkit-scrollbar-thumb { background-color: rgba(16, 73, 41, 0.2); border-radius: 10px; }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover { background-color: rgba(16, 73, 41, 0.4); }
      `}</style>

      <div className="container p-0">
        <div className="row g-4 align-items-stretch">
          
          {/* --- COLUMN 1: RECOMMENDATIONS (Fixed Height: 1100px) --- */}
          <div className="col-lg-4 d-flex flex-column">
            <div className="p-4 rounded-4 shadow-sm border bg-white d-flex flex-column w-100" style={{ height: '1100px' }}>
              <h5 className="fw-bold mb-3" style={{ color: '#104929' }}>✨ E-Advisor Rankings</h5>
              
              <div className="d-flex justify-content-between align-items-center mb-3 px-2 small bg-light rounded p-2 border">
                  <div className="form-check form-switch mb-0">
                      <input className="form-check-input" type="checkbox" id="checkCore" checked={showCore} onChange={(e) => setShowCore(e.target.checked)} style={{ cursor: 'pointer' }} />
                      <label className="form-check-label fw-bold" htmlFor="checkCore" style={{ cursor: 'pointer', color: '#104929' }}>Core</label>
                  </div>
                  <div className="form-check form-switch mb-0">
                      <input className="form-check-input" type="checkbox" id="checkElec" checked={showElective} onChange={(e) => setShowElective(e.target.checked)} style={{ cursor: 'pointer' }} />
                      <label className="form-check-label fw-bold" htmlFor="checkElec" style={{ cursor: 'pointer', color: '#d97706' }}>Elective</label>
                  </div>
                  <div className="form-check form-switch mb-0">
                      <input className="form-check-input" type="checkbox" id="checkFree" checked={showFree} onChange={(e) => setShowFree(e.target.checked)} style={{ cursor: 'pointer' }} />
                      <label className="form-check-label fw-bold" htmlFor="checkFree" style={{ cursor: 'pointer', color: '#0284c7' }}>Free</label>
                  </div>
              </div>

              <div className="fw-bold text-center mb-3 p-2 rounded-pill w-100" style={{ fontSize: '0.7rem', color: '#104929', backgroundColor: '#eef6f1', border: '1px solid #10492922', flexShrink: 0 }}>▲ MOST RECOMMENDED</div>
              
              <div className="flex-grow-1 custom-scrollbar" style={{ overflowY: 'auto', minHeight: 0, paddingRight: '10px' }}>
                <div className="d-flex flex-column gap-3 pb-2">
                  {filteredRecommendations.length > 0 ? (
                      filteredRecommendations.map((rec) => {
                        const isSelected = selectedCourses.some(c => c.course_id === rec.id);
                        const isDimmed = hoveredCourseId !== null && hoveredCourseId !== rec.id;
                        
                        const fullData = curriculum.find(c => c.course_id === rec.id) || 
                                         allCourses.find(c => c.course_id === rec.id) || 
                                         { ...rec, course_id: rec.id, course_prefix: rec.prefix, course_number: rec.number, course_name: rec.name };

                        const isCore = curriculum.some(core => core.course_id === rec.id && !isPlaceholder(core));
                        const prefix = (rec.prefix || '').toUpperCase();
                        let badgeColor = isCore ? '#104929' : (prefix === 'CPIS' ? '#d97706' : '#0284c7');
                        let typeLabel = isCore ? 'Core' : (prefix === 'CPIS' ? 'Elective' : 'Free');

                        return (
                          <div key={rec.id} onClick={() => handleCourseClick(fullData)}
                            style={{ 
                              cursor: 'pointer', backgroundColor: isSelected ? '#f0fdf4' : '#ffffff',
                              border: isSelected ? `2px solid ${badgeColor}` : '1px solid #dee2e6', borderRadius: '15px',
                              transition: 'all 0.3s ease', opacity: isDimmed ? 0.3 : 1, textAlign: 'center', padding: '1.5rem',
                              position: 'relative'
                            }}>
                            <div className="position-absolute top-0 end-0 mt-2 me-2 badge rounded-pill" style={{backgroundColor: badgeColor, fontSize: '0.6rem'}}>
                                {typeLabel}
                            </div>
                            <div className="fw-bold mb-1 mt-2" style={{ fontSize: '1.4rem', color: badgeColor }}>{rec.prefix}{rec.number}</div>
                            <div className="text-muted small mb-2">{rec.name}</div>
                            <span className="badge rounded-pill bg-light text-dark border px-3">{rec.credits} Credits</span>
                          </div>
                        );
                      })
                  ) : (
                      <div className="text-center p-4 text-muted small border border-dashed rounded">
                          No courses match your selected filters. Try checking more boxes above!
                      </div>
                  )}
                </div>
              </div>
              
              <div className="fw-bold text-center mt-3 p-2 rounded-pill w-100" style={{ fontSize: '0.7rem', color: '#dc3545', backgroundColor: '#fce8e8', border: '1px solid #f5c2c7', flexShrink: 0 }}>
                  ▼ LEAST RECOMMENDED
              </div>
            </div>
          </div>

          {/* --- COLUMN 2: ROADMAP (Fixed Height: 1100px) --- */}
          <div className="col-lg-8 d-flex flex-column">
            <div className="p-4 rounded-4 shadow-sm border bg-white d-flex flex-column w-100" style={{ height: '1100px' }}>
              <div className="text-center mb-5 flex-shrink-0">
                <h2 className="fw-bold" style={{ color: '#104929' }}>Academic Roadmap Planner</h2>
                <p className="text-muted">Click a course to view its requirements and add it to your schedule.</p>
              </div>

              <div className="pb-4 custom-scrollbar flex-grow-1" style={{ display: 'flex', overflowX: 'auto', overflowY: 'auto', gap: '1.5rem', minHeight: 0 }}>
                {Object.entries(groupedCurriculum).map(([termLabel, semCourses], semIdx) => (
                  <div key={semIdx} style={{ minWidth: '300px' }}>
                    <h6 className="text-center fw-bold mb-4 py-2 rounded-pill text-white shadow-sm" style={{ backgroundColor: '#104929', fontSize: '0.8rem' }}>{termLabel}</h6>
                    
                    <div className="d-flex flex-column gap-3">
                      {semCourses.map(course => {
                        const isPlc = isPlaceholder(course);
                        const filledCourse = selectedCourses.find(c => c.placeholder_id === course.course_id);
                        
                        const isPassed = course.status === 'completed';
                        const isOngoing = course.status === 'undergoing';
                        const prereqsMet = checkPrereqsMet(course.course_id);
                        const isLocked = !isPassed && !isOngoing && !prereqsMet;
                        const isAvailable = !isPassed && !isOngoing && prereqsMet;
                        const isSpotlighted = hoveredCourseId === course.course_id && isAvailable;

                        const isSelected = selectedCourses.some(c => c.course_id === course.course_id) || !!filledCourse;

                        let bgColor = isPassed ? '#f8f9fa' : isOngoing ? '#eef2ff' : isLocked ? '#fce8e8' : isSelected ? '#f0fdf4' : '#ffffff';
                        let borderColor = isSelected ? '#104929' : isLocked ? '#f5c2c7' : '#dee2e6';
                        let opacityLevel = (hoveredCourseId && !isSpotlighted) ? 0.3 : (isPassed ? 0.6 : 1);

                        const displayPrefix = filledCourse ? filledCourse.course_prefix : course.course_prefix;
                        const displayNumber = filledCourse ? filledCourse.course_number : course.course_number;
                        const displayName = filledCourse ? filledCourse.course_name : course.course_name;
                        const displayCredits = filledCourse ? filledCourse.credits : course.credits;

                        const fulfillingName = filledCourse ? course.course_name : course.historical_placeholder_name;

                        return (
                          <div key={course.course_id}
                            onClick={() => handleCourseClick(course)}
                            onMouseEnter={isAvailable ? () => startFocusTimer(course.course_id) : undefined}
                            onMouseLeave={isAvailable ? clearFocus : undefined}
                            className={`card shadow-sm border-2`}
                            style={{ 
                              backgroundColor: bgColor,
                              borderColor: borderColor,
                              cursor: 'pointer', 
                              transition: 'all 0.3s ease',
                              transform: isSpotlighted ? 'scale(1.05)' : 'scale(1)', 
                              zIndex: isSpotlighted ? 100 : 1,
                              opacity: opacityLevel
                            }}>
                            <div className="card-body p-3 position-relative">
                              <div className="d-flex justify-content-between align-items-center mb-2">
                                <span className="fw-bold" style={{ color: (isLocked || isPassed) ? '#6c757d' : '#104929' }}>
                                  {displayPrefix}-{displayNumber}
                                </span>
                                <span className="badge bg-light text-dark border">{displayCredits} Cr</span>
                              </div>
                              <div className={`small fw-bold text-truncate mb-2 ${(isLocked || isPassed) ? 'text-muted' : ''}`}>
                                {displayName}
                              </div>
                              
                              {fulfillingName && (
                                <div className="small fw-bold mt-1" style={{color: '#d97706', fontSize: '0.7rem'}}>
                                  ★ Fulfills: {fulfillingName}
                                </div>
                              )}
                              
                              {isPassed && <span className="badge bg-secondary w-100 mt-2">Grade: {course.grade}</span>}
                              {isOngoing && <span className="badge bg-primary w-100 mt-2">In Progress</span>}
                              {isLocked && <span className="badge bg-danger w-100 mt-2">🔒 Locked</span>}
                              {isSelected && !filledCourse && !course.historical_placeholder_name && <span className="badge bg-success w-100 mt-2">Added to Plan</span>}
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
        </div>

        {/* MAIN PAGE SCHEDULE PREVIEW */}
        <div className="mt-5 pt-5">
          <div className="p-4 rounded-4 shadow-sm border bg-white">
              <h3 className="fw-bold text-center mb-4" style={{ color: '#104929' }}>Your Weekly Plan</h3>
              {mainScheduleSections.length > 0 ? renderScheduleGrid(mainScheduleSections) : (
                  <div className="text-center p-5 text-muted bg-light rounded border border-dashed">
                      No courses added to your schedule yet. Click an available course above to begin.
                  </div>
              )}
          </div>
        </div>

        {/* --- DYNAMIC FOOTER --- */}
        <div className="mt-5 p-4 rounded-4 bg-white shadow-lg border d-flex justify-content-between align-items-center sticky-bottom" style={{ bottom: '20px', zIndex: 50 }}>
          
          <div className="d-flex gap-4 align-items-center">
            {/* Semester Load */}
            <div>
              <h5 className="fw-bold mb-0">Total Credits: <span className={isInvalidLoad ? 'text-danger' : 'text-success'}>{totalCredits}</span></h5>
              <small className="text-muted">min credits: {minCredits} - max credits: {maxCredits}</small>
            </div>
            
            {/* Electives Progress */}
            {requiredElec > 0 && (
                <div className="border-start ps-4">
                  <h6 className="fw-bold mb-0" style={{color: '#d97706'}}>
                     Elective Credits: {elecComp + elecPlan} / {requiredElec}
                  </h6>
                  <small className="text-muted">
                     {elecComp} Done + {elecPlan} Planned
                  </small>
                </div>
            )}

            {/* Free Course Progress */}
            {requiredFree > 0 && (
                <div className="border-start ps-4">
                  <h6 className="fw-bold mb-0" style={{color: '#0284c7'}}>
                     Free Credits: {freeComp + freePlan} / {requiredFree}
                  </h6>
                  <small className="text-muted">
                     {freeComp} Done + {freePlan} Planned
                  </small>
                </div>
            )}
          </div>

          <button 
            className="btn btn-lg px-5 py-3 fw-bold rounded-pill text-white shadow"
            disabled={isInvalidLoad || loading}
            onClick={handleConfirmPlan}
            style={{ backgroundColor: isInvalidLoad ? '#6c757d' : '#104929', border: 'none' }}
          >
            {loading ? 'Saving...' : (totalCredits < minCredits ? 'Under Min Credits' : (totalCredits > maxCredits ? 'Over Max Credits' : 'Confirm Draft Plan'))}
          </button>
        </div>
      </div>

      {/* --- COURSE VIEWER MODAL --- */}
      {showModal && previewCourse && draftPlan && (
        <div className="modal-overlay" onClick={() => setShowModal(false)}>
          <div className="course-modal shadow-lg d-flex flex-column" onClick={e => e.stopPropagation()}>
            
            <div className="d-flex justify-content-between align-items-center mb-4">
              <h3 className="fw-bold m-0" style={{ color: '#104929' }}>
                  {isPreviewPlaceholder ? `Select Course: ${previewCourse.course_name}` : 'Course Details'}
              </h3>
              <button className="btn-close" onClick={() => setShowModal(false)}></button>
            </div>

            {/* --- ELECTIVE/FREE COURSE SELECTION CAROUSEL --- */}
            {isPreviewPlaceholder && (
                <div className="mb-4">
                    <h6 className="fw-bold mb-3 text-muted">Available Courses to Fulfill this Requirement:</h6>
                    <div className="d-flex gap-3 overflow-auto custom-scrollbar pb-3">
                        {getAvailableElectives(previewCourse).map(c => {
                            const isEvalLocked = !checkPrereqsMet(c.course_id);
                            return (
                                <div key={c.course_id}
                                    onClick={() => { setActiveElectiveCourse(c); setPreviewSectionId(null); }}
                                    className={`card shadow-sm flex-shrink-0 transition-all`}
                                    style={{
                                        width: '220px', cursor: 'pointer',
                                        border: activeElectiveCourse?.course_id === c.course_id ? '2px solid #104929' : '1px solid #dee2e6',
                                        backgroundColor: activeElectiveCourse?.course_id === c.course_id ? '#eefaf4' : '#fff',
                                        transform: activeElectiveCourse?.course_id === c.course_id ? 'scale(1.03)' : 'none',
                                        opacity: isEvalLocked ? 0.6 : 1
                                    }}>
                                    <div className="card-body p-3">
                                        <div className="fw-bold fs-5 mb-1" style={{color: '#104929'}}>{c.course_prefix}-{c.course_number}</div>
                                        <div className="small text-muted fw-bold text-truncate">{c.course_name}</div>
                                        <div className="mt-2 text-end small fw-bold">
                                            {!isEvalLocked ? <span className="text-success"><i className="bi bi-unlock-fill me-1"></i>Available</span> : <span className="text-danger"><i className="bi bi-lock-fill me-1"></i>Locked</span>}
                                        </div>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                </div>
            )}

            {/* --- MAIN MODAL CONTENT --- */}
            {!evaluatedCourse ? (
                <div className="text-center p-5 text-muted bg-light rounded border border-dashed flex-grow-1 d-flex align-items-center justify-content-center">
                    <p className="m-0">Please select a course from the list above to view its details and sections.</p>
                </div>
            ) : (
                <>
                    {/* SWIMLANES */}
                    {(() => {
                        const isCoreCourse = (id) => curriculum.some(core => core.course_id === id && !isPlaceholder(core) && !core.historical_placeholder_name);

                        const reqIds = prerequisites.filter(p => p.course_id === evaluatedCourse.course_id).map(p => p.prereq_id);
                        const unlockIds = prerequisites.filter(p => p.prereq_id === evaluatedCourse.course_id).map(p => p.course_id);
                        
                        const reqCourses = reqIds.map(id => {
                            const inCurr = curriculum.find(c => c.course_id === id);
                            const inCatalog = allCourses.find(c => c.course_id === id);
                            const courseData = inCurr || (inCatalog ? { ...inCatalog, status: 'unattempted' } : null);
                            return courseData ? { ...courseData, isElective: !isCoreCourse(id) } : null;
                        }).filter(Boolean);

                        const unlockCourses = unlockIds.map(id => {
                            const inCurr = curriculum.find(c => c.course_id === id);
                            const inCatalog = allCourses.find(c => c.course_id === id);
                            const courseData = inCurr || (inCatalog ? { ...inCatalog, status: 'unattempted' } : null);
                            return courseData ? { ...courseData, isElective: !isCoreCourse(id) } : null;
                        }).filter(Boolean);

                        const getSwimlaneStyle = (c) => {
                            const isPassed = c.status === 'completed';
                            const isOngoing = c.status === 'undergoing';
                            const isSelected = selectedCourses.some(sc => sc.course_id === c.course_id);
                            const prereqsMet = checkPrereqsMet(c.course_id);
                            const isLocked = !isPassed && !isOngoing && !prereqsMet;

                            let bgColor = isPassed ? '#f8f9fa' : isOngoing ? '#eef2ff' : isLocked ? '#fce8e8' : isSelected ? '#f0fdf4' : '#ffffff';
                            let textColor = (isLocked || isPassed) ? '#6c757d' : '#212529';
                            let borderColor = isPassed ? '#dee2e6' : 'transparent';
                            
                            return { bgColor, textColor, borderColor, isPassed, isOngoing, isLocked, isSelected };
                        };

                        return (
                            <div className="row g-3 mb-5">
                                <div className="col-4">
                                    <div className="swimlane custom-scrollbar" style={{maxHeight: '300px', overflowY: 'auto'}}>
                                        <h6 className="fw-bold text-muted mb-3 text-center border-bottom pb-2">Requires</h6>
                                        {reqCourses.length > 0 ? reqCourses.map(c => {
                                            const { bgColor, textColor, borderColor, isPassed, isLocked } = getSwimlaneStyle(c);
                                            return (
                                                <div key={c.course_id} onClick={() => handleCourseClick(c)} className="card shadow-sm mb-2 chain-card" style={{ backgroundColor: bgColor, border: `1px solid ${borderColor}`, borderLeft: '4px solid #dc3545' }}>
                                                    <div className="p-2 small fw-bold d-flex justify-content-between align-items-center" style={{ color: textColor }}>
                                                        <div>
                                                            <div style={{ lineHeight: '1.2' }}>{c.course_prefix}-{c.course_number}</div>
                                                            {c.isElective && <div style={{color: '#d97706', fontSize: '0.65rem', marginTop: '2px'}}>★ Elective</div>}
                                                        </div>
                                                        <div>
                                                            {isPassed && <i className="bi bi-check-circle-fill text-success"></i>}
                                                            {isLocked && <i className="bi bi-lock-fill text-danger"></i>}
                                                        </div>
                                                    </div>
                                                </div>
                                            );
                                        }) : <div className="text-center text-muted small mt-4">No prerequisites</div>}
                                    </div>
                                </div>
                                <div className="col-4">
                                    <div className="swimlane" style={{ backgroundColor: '#eef6f1', borderColor: '#104929' }}>
                                        <h6 className="fw-bold mb-3 text-center border-bottom pb-2" style={{color: '#104929'}}>Selected Course</h6>
                                        <div className="card shadow-sm border-0" style={{borderLeft: '4px solid #104929'}}>
                                            <div className="p-2 fw-bold text-center">
                                                <div className="fs-5">{evaluatedCourse.course_prefix}-{evaluatedCourse.course_number}</div>
                                                <div className="small text-muted fw-normal">{evaluatedCourse.course_name}</div>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                                <div className="col-4">
                                    <div className="swimlane custom-scrollbar" style={{maxHeight: '300px', overflowY: 'auto'}}>
                                        <h6 className="fw-bold text-muted mb-3 text-center border-bottom pb-2">Unlocks</h6>
                                        {unlockCourses.length > 0 ? unlockCourses.map(c => {
                                            const { bgColor, textColor, borderColor, isPassed, isLocked } = getSwimlaneStyle(c);
                                            return (
                                                <div key={c.course_id} onClick={() => handleCourseClick(c)} className="card shadow-sm mb-2 chain-card" style={{ backgroundColor: bgColor, border: `1px solid ${borderColor}`, borderLeft: '4px solid #0d6efd' }}>
                                                    <div className="p-2 small fw-bold d-flex justify-content-between align-items-center" style={{ color: textColor }}>
                                                        <div>
                                                            <div style={{ lineHeight: '1.2' }}>{c.course_prefix}-{c.course_number}</div>
                                                            {c.isElective && <div style={{color: '#d97706', fontSize: '0.65rem', marginTop: '2px'}}>★ Elective</div>}
                                                        </div>
                                                        <div>
                                                            {isPassed ? <i className="bi bi-check-circle-fill text-success"></i> : 
                                                             isLocked ? <i className="bi bi-lock-fill text-danger"></i> : 
                                                             <i className="bi bi-arrow-right-circle text-primary"></i>}
                                                        </div>
                                                    </div>
                                                </div>
                                            );
                                        }) : <div className="text-center text-muted small mt-4">Unlocks no courses</div>}
                                    </div>
                                </div>
                            </div>
                        );
                    })()}

                    {/* --- ELIGIBILITY CHECK & SCHEDULING --- */}
                    {(() => {
                        const isPassed = evaluatedCourse.status === 'completed';
                        const isOngoing = evaluatedCourse.status === 'undergoing';
                        const prereqsMet = checkPrereqsMet(evaluatedCourse.course_id);
                        const isAvailable = !isPassed && !isOngoing && prereqsMet;

                        if (!isAvailable) {
                            const isLockedAlert = !isPassed && !isOngoing;
                            return (
                                <div className="alert text-center p-4" style={{
                                    backgroundColor: isLockedAlert ? '#fce8e8' : '#e9ecef',
                                    color: isLockedAlert ? '#dc3545' : '#6c757d',
                                    border: isLockedAlert ? '1px solid #f5c2c7' : '1px solid #dee2e6'
                                }}>
                                    <h5 className="fw-bold mb-2">Registration Unavailable</h5>
                                    <p className="mb-0">
                                        {isPassed ? "You have already completed this course." : 
                                         isOngoing ? "You are currently enrolled in this course." : 
                                         "You must complete all required prerequisites before adding this course."}
                                    </p>
                                </div>
                            );
                        }

                        return (
                            <div className="row g-4 flex-grow-1 border-top pt-4">
                                <div className="col-md-4 d-flex flex-column gap-3">
                                    <h5 className="fw-bold">Available Sections</h5>
                                    {sections.filter(s => s.course_id === evaluatedCourse.course_id && s.semester_id === draftPlan.semester_id).map(sec => {
                                        const isSelectedSection = previewSectionId === sec.section_id;
                                        const conflictingCourse = getConflictingCourse(sec);
                                        const isConflicting = !!conflictingCourse;

                                        return (
                                            <div key={sec.section_id} 
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

                                <div className="col-md-8">
                                    <h5 className="fw-bold mb-3">Live Schedule Preview</h5>
                                    <div style={{ transform: 'scale(0.85)', transformOrigin: 'top left', width: '117%' }}>
                                        {(() => {
                                            const baseSections = selectedCourses
                                                .filter(c => (isPreviewPlaceholder ? c.placeholder_id !== previewCourse.course_id : c.course_id !== evaluatedCourse.course_id) && c.selected_section_id)
                                                .map(c => ({ ...c, ...sections.find(s => s.section_id === parseInt(c.selected_section_id)) }));
                                            
                                            const previewSecInfo = sections.find(s => s.section_id === previewSectionId);
                                            const scheduleData = previewSecInfo 
                                                ? [...baseSections, { ...evaluatedCourse, ...previewSecInfo, isPreview: true }]
                                                : baseSections;

                                            return renderScheduleGrid(scheduleData.filter(s => s.start_time && s.end_time));
                                        })()}
                                    </div>
                                </div>
                            </div>
                        );
                    })()}
                </>
            )}

            <div className="mt-4 pt-3 border-top d-flex justify-content-between">
              {selectedCourses.some(c => isPreviewPlaceholder ? c.placeholder_id === previewCourse.course_id : c.course_id === previewCourse.course_id) ? (
                  <button className="btn btn-outline-danger fw-bold px-4" onClick={handleRemoveCourseSelection}>Remove from Plan</button>
              ) : <div></div>}
              
              {(() => {
                  const existingSelection = selectedCourses.find(c => isPreviewPlaceholder ? c.placeholder_id === previewCourse.course_id : c.course_id === previewCourse.course_id);
                  const initialSectionId = existingSelection ? existingSelection.selected_section_id : null;
                  const initialElectiveId = existingSelection ? existingSelection.course_id : null;
                  
                  const hasChanged = previewSectionId !== initialSectionId || (isPreviewPlaceholder && evaluatedCourse?.course_id !== initialElectiveId);
                  const isButtonDisabled = existingSelection ? !hasChanged : !previewSectionId;

                  return (
                      <div className="d-flex gap-2">
                          <button className="btn btn-secondary fw-bold px-4" onClick={() => setShowModal(false)}>Close</button>
                          
                          {(!evaluatedCourse || !checkPrereqsMet(evaluatedCourse.course_id) || evaluatedCourse.status === 'completed' || evaluatedCourse.status === 'undergoing') ? null : (
                              <button 
                                  className="btn fw-bold px-5 text-white transition-all" 
                                  style={{ 
                                      backgroundColor: isButtonDisabled ? '#6c757d' : '#104929', 
                                      cursor: isButtonDisabled ? 'not-allowed' : 'pointer' 
                                  }} 
                                  onClick={handleSaveCourseSelection}
                                  disabled={isButtonDisabled}
                              >
                                  {existingSelection ? "Update Section" : "Add Course"}
                              </button>
                          )}
                      </div>
                  );
              })()}
            </div>
          </div>
        </div>
      )}

    </div>
  );
}

export default Plan;