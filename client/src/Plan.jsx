import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';

function Plan({ user }) {
  const navigate = useNavigate();
  const [curriculum, setCurriculum] = useState([]);
  const [prerequisites, setPrerequisites] = useState([]);
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
    }
  }, [user]);

  const handleConfirmPlan = () => {
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
      setSelectedCourses([...selectedCourses, course]);
    }
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

  return (
    <div className="container plan-page-container shadow-lg bg-white rounded p-4 my-5" style={{ maxWidth: '1200px' }}>
      
      {/* --- STRATEGIC PRIORITY SECTION --- */}
      {recommendations.length > 0 && (
        <div className="mb-5 p-4 rounded shadow-sm border bg-white">
          <h5 className="fw-bold mb-4" style={{ color: '#104929' }}>✨ E-Advisor: Strategic Course Ranking</h5>
          
          <div className="d-flex flex-column align-items-center">
            <div className="fw-bold text-center mb-3 p-2 rounded-pill w-100" 
                 style={{ fontSize: '0.75rem', color: '#104929', backgroundColor: '#eef6f1', letterSpacing: '1px', border: '1px solid #10492922' }}>
              ▲ MOST RECOMMENDED
            </div>

            <div className="w-100 mb-3" style={{ maxHeight: '450px', overflowY: 'auto', paddingRight: '10px' }}>
              <div className="d-flex flex-column gap-3">
                {recommendations.map((rec) => {
                  const isSelected = selectedCourses.find(c => c.course_id === rec.id);
                  const isSpotlighted = hoveredCourseId === rec.id;
                  const isDimmed = hoveredCourseId !== null && hoveredCourseId !== rec.id;
                  const fullData = curriculum.find(c => c.course_id === rec.id) || { ...rec, course_id: rec.id };

                  return (
                    <div 
                      key={rec.id}
                      onClick={() => toggleCourse(fullData)}
                      onMouseEnter={() => startFocusTimer(rec.id)}
                      onMouseLeave={clearFocus}
                      className="p-4"
                      style={{ 
                        cursor: 'pointer',
                        backgroundColor: isSelected ? '#d1e7dd' : '#ffffff',
                        border: isSelected ? '2px solid #198754' : (isSpotlighted ? '2px solid #104929' : '1px solid #dee2e6'),
                        borderRadius: '15px',
                        transition: 'all 0.3s ease',
                        boxShadow: isSpotlighted ? '0 0 20px rgba(16, 73, 41, 0.4)' : (isSelected ? '0 4px 8px rgba(0,0,0,0.1)' : '0 2px 4px rgba(0,0,0,0.02)'),
                        textAlign: 'center',
                        position: 'relative',
                        opacity: isDimmed ? 0.3 : 1,
                        transform: isSpotlighted ? 'scale(1.02)' : 'scale(1)',
                        zIndex: isSpotlighted ? 10 : 1
                      }}
                    >
                      {isSelected && (
                        <div style={{ position: 'absolute', top: '12px', right: '15px', backgroundColor: '#198754', color: 'white', padding: '2px 10px', borderRadius: '10px', fontSize: '0.7rem', fontWeight: 'bold' }}>
                          ✓ SELECTED
                        </div>
                      )}
                      <div className="fw-bold mb-1" style={{ fontSize: '1.8rem', color: '#104929', letterSpacing: '1px' }}>
                        {rec.prefix}{rec.number}
                      </div>
                      <div className="text-muted mb-3" style={{ fontSize: '1rem', fontWeight: '500' }}>{rec.name}</div>
                      <div className="d-flex justify-content-center">
                        <span className="badge rounded-pill bg-light text-dark border px-3 py-2">{rec.credits} Credits</span>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            <div className="fw-bold text-center mt-1 p-2 rounded-pill w-100" 
                 style={{ fontSize: '0.75rem', color: '#a82020', backgroundColor: '#fff5f5', letterSpacing: '1px', border: '1px solid #f8d7da' }}>
              ▼ LEAST RECOMMENDED
            </div>
          </div>
        </div>
      )}

      {/* --- MAIN ROADMAP SECTION --- */}
      <div className="text-center mb-4 pt-4 border-top">
        <h3 className="fw-bold" style={{ color: '#104929' }}>Academic Roadmap Planner</h3>
      </div>

      <div className="pb-4" style={{ display: 'flex', flexWrap: 'nowrap', overflowX: 'auto', gap: '1.5rem', paddingBottom: '20px' }}>
        {Object.entries(groupedCurriculum).map(([termLabel, semCourses], semIdx) => (
          <div key={semIdx} className="sem-col" style={{ minWidth: '260px', flexShrink: 0 }}>
            <h6 className="text-center fw-bold mb-3 py-2 rounded shadow-sm" style={{ backgroundColor: '#104929', color: '#fff', fontSize: '0.85rem' }}>
              {termLabel}
            </h6>
            
            <div className="d-flex flex-column gap-3">
              {semCourses.map(course => {
                const isPassed = course.status === 'completed';
                const isOngoing = course.status === 'undergoing';
                const isSelected = selectedCourses.find(c => c.course_id === course.course_id);
                const prereqsMet = checkPrereqsMet(course.course_id);
                const isLockedOut = !isPassed && !isOngoing && !prereqsMet;
                
                // --- NEW CONDITION: Is the course takeable/available? ---
                const isAvailable = !isPassed && !isOngoing && prereqsMet;
                const isSpotlighted = hoveredCourseId === course.course_id && isAvailable;
                const isDimmed = hoveredCourseId !== null && !isSpotlighted;

                let bgColor = isPassed ? '#fce8e8' : isOngoing ? '#fff3cd' : isSelected ? '#d1e7dd' : isLockedOut ? '#f8f9fa' : '#ffffff';
                let borderColor = isPassed ? '#f5c2c7' : isOngoing ? '#ffecb5' : isSelected ? '#badbcc' : isLockedOut ? '#e9ecef' : '#dee2e6';

                return (
                  <div 
                    key={course.course_id}
                    onClick={() => toggleCourse(course)}
                    onMouseEnter={isAvailable ? () => startFocusTimer(course.course_id) : undefined}
                    onMouseLeave={isAvailable ? clearFocus : undefined}
                    className="card shadow-sm"
                    style={{ 
                      backgroundColor: bgColor, 
                      border: isSpotlighted ? '3px solid #104929' : `2px solid ${borderColor}`, 
                      borderRadius: '8px',
                      cursor: !isAvailable ? 'not-allowed' : 'pointer',
                      opacity: isDimmed ? 0.15 : (isLockedOut ? 0.7 : 1), 
                      transition: 'all 0.3s ease',
                      transform: isSpotlighted ? 'scale(1.08)' : 'scale(1)',
                      zIndex: isSpotlighted ? 100 : 1,
                      boxShadow: isSpotlighted ? '0 0 15px rgba(0,0,0,0.3)' : 'none'
                    }}
                  >
                    <div className="card-body p-3">
                      <div className="d-flex justify-content-between align-items-center mb-2">
                        <span style={{ fontSize: '0.8rem', fontWeight: '800', color: isLockedOut ? '#6c757d' : '#104929' }}>ID: {course.course_id}</span>
                        <span className="badge bg-secondary" style={{ fontSize: '0.7rem' }}>{course.credits} Cr</span>
                      </div>
                      <div style={{ fontSize: '0.8rem', fontWeight: '700', color: isLockedOut ? '#6c757d' : '#000' }}>{course.course_name}</div>
                      {isPassed && <div className="mt-2"><span className="badge bg-danger" style={{ fontSize: '0.65rem' }}>Grade: {course.grade}</span></div>}
                      {isOngoing && <div className="mt-2"><span className="badge bg-warning text-dark" style={{ fontSize: '0.65rem' }}>IN PROGRESS</span></div>}
                      {isLockedOut && <div className="mt-2"><span className="badge bg-secondary" style={{ fontSize: '0.65rem' }}>🔒 MISSING PREREQ</span></div>}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        ))}
      </div>

      {/* --- FOOTER BAR --- */}
      <div className="mt-4 pt-3 border-top d-flex justify-content-between align-items-center position-sticky bg-white pb-2" style={{ bottom: '-1px', zIndex: 10, opacity: hoveredCourseId ? 0.2 : 1 }}>
        <div className="fw-bold">
          Selected Credits: <span className={totalCredits > 18 ? 'text-danger' : 'text-success'}>{totalCredits} / 18</span>
        </div>
        <button className="btn px-5 py-2 fw-bold shadow-sm" disabled={selectedCourses.length === 0 || totalCredits > 18 || loading} onClick={handleConfirmPlan}
          style={{ backgroundColor: totalCredits > 18 ? '#dc3545' : '#104929', borderColor: totalCredits > 18 ? '#dc3545' : '#104929', color: 'white' }}>
          {loading ? 'Saving Draft...' : totalCredits > 18 ? 'Limit Exceeded' : 'Confirm Draft Plan'}
        </button>
      </div>
    </div>
  );
}

export default Plan;