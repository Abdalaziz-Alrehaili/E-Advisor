import React, { useState, useEffect } from 'react';

function Plan({ user }) {
  const [curriculum, setCurriculum] = useState([]);
  const [prerequisites, setPrerequisites] = useState([]); // NEW: State to hold prerequisite rules
  const [selectedCourses, setSelectedCourses] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (user && user.user_id) {
      // 1. Fetch the student's curriculum status
      fetch(`http://localhost:5000/curriculum-status/${user.user_id}`)
        .then(res => res.json())
        .then(data => setCurriculum(data))
        .catch(err => console.error("Error fetching curriculum:", err));

      // 2. NEW: Fetch the master list of prerequisite rules
      fetch(`http://localhost:5000/prerequisites`)
        .then(res => res.json())
        .then(data => setPrerequisites(data))
        .catch(err => console.error("Error fetching prerequisites:", err));
    }
  }, [user]);

  const handleConfirmPlan = () => {
    setLoading(true);
    fetch('http://localhost:5000/save-plan', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        user_id: user.user_id,
        selectedCourses: selectedCourses
      })
    })
    .then(res => res.json())
    .then(data => {
      if (data.success) {
        alert("Plan Draft Saved! It has been sent to your advisor.");
        window.location.reload(); 
      } else {
        alert("Error: " + data.error);
      }
    })
    .catch(err => console.error("Error:", err))
    .finally(() => setLoading(false));
  };

  // --- NEW: Prerequisite Checker Function ---
  const checkPrereqsMet = (courseId) => {
    // Find all rules where this course is the target
    const reqsForThisCourse = prerequisites.filter(p => p.course_id === courseId);
    
    // Check if the student has 'completed' every required course in that list
    for (let req of reqsForThisCourse) {
      const prereqCourse = curriculum.find(c => c.course_id === req.prereq_id);
      // If the prereq course isn't in their curriculum, or its status is NOT completed, they fail the check
      if (!prereqCourse || prereqCourse.status !== 'completed') {
        return false;
      }
    }
    return true; // All good!
  };

  const toggleCourse = (course) => {
    // Block clicks on courses that are passed, ongoing, or missing prerequisites
    if (course.status === 'completed' || course.status === 'undergoing' || !checkPrereqsMet(course.course_id)) {
      return; 
    }

    if (selectedCourses.find(c => c.course_id === course.course_id)) {
      setSelectedCourses(selectedCourses.filter(c => c.course_id !== course.course_id));
    } else {
      setSelectedCourses([...selectedCourses, course]);
    }
  };

  // Group courses by their official Year and Semester from the database
  const groupedCurriculum = curriculum.reduce((acc, course) => {
    const termNames = { '1': 'First Sem', '2': 'Second Sem', 'Summer': 'Summer' };
    const semesterName = termNames[course.ideal_semester] || 'Unknown';
    const termLabel = `Year ${course.ideal_year} - ${semesterName}`;
    
    if (!acc[termLabel]) acc[termLabel] = [];
    acc[termLabel].push(course);
    return acc;
  }, {});

  const totalCredits = selectedCourses.reduce((sum, c) => sum + (Number(c.credits) || 3), 0);

  return (
    <div className="container plan-page-container shadow-lg bg-white rounded p-4 my-5" style={{ maxWidth: '1200px' }}>
      <div className="text-center mb-4">
        <h3 className="fw-bold" style={{ color: '#104929' }}>Academic Roadmap Planner</h3>
        <p className="text-muted small">Select available courses to build your upcoming semester draft.</p>
      </div>

      <div 
        className="pb-4" 
        style={{ 
          display: 'flex', 
          flexWrap: 'nowrap', 
          overflowX: 'auto', 
          gap: '1.5rem', 
          paddingBottom: '20px' 
        }}
      >
        {Object.entries(groupedCurriculum).map(([termLabel, semCourses], semIdx) => (
          <div key={semIdx} className="sem-col" style={{ minWidth: '260px', flexShrink: 0 }}>
            
            <h6 className="text-center fw-bold mb-3 py-2 rounded shadow-sm" 
                style={{ backgroundColor: '#104929', color: '#fff', fontSize: '0.85rem' }}>
              {termLabel}
            </h6>
            
            <div className="d-flex flex-column gap-3">
              {semCourses.map(course => {
                const isPassed = course.status === 'completed';
                const isOngoing = course.status === 'undergoing';
                const isSelected = selectedCourses.find(c => c.course_id === course.course_id);
                
                // NEW: Run the check to see if prerequisites are met
                const prereqsMet = checkPrereqsMet(course.course_id);
                const isLockedOut = !isPassed && !isOngoing && !prereqsMet;

                let bgColor = '#ffffff';
                let borderColor = '#dee2e6';
                
                if (isPassed) {
                  bgColor = '#fce8e8'; 
                  borderColor = '#f5c2c7';
                } else if (isOngoing) {
                  bgColor = '#fff3cd'; 
                  borderColor = '#ffecb5';
                } else if (isSelected) {
                  bgColor = '#d1e7dd'; 
                  borderColor = '#badbcc';
                } else if (isLockedOut) {
                  bgColor = '#f8f9fa'; // Light gray for locked courses
                  borderColor = '#e9ecef';
                }

                return (
                  <div 
                    key={course.course_id}
                    onClick={() => toggleCourse(course)}
                    className={`card shadow-sm ${(isPassed || isOngoing || isLockedOut) ? 'locked' : ''}`}
                    style={{ 
                      backgroundColor: bgColor, 
                      border: `2px solid ${borderColor}`, 
                      borderRadius: '8px',
                      cursor: (isPassed || isOngoing || isLockedOut) ? 'not-allowed' : 'pointer',
                      opacity: isLockedOut ? 0.7 : 1, // Dim the locked courses slightly
                      transition: 'all 0.2s ease-in-out'
                    }}
                  >
                    <div className="card-body p-3">
                      <div className="d-flex justify-content-between align-items-center w-100 mb-2">
                        <span style={{ fontSize: '0.8rem', fontWeight: '800', color: isLockedOut ? '#6c757d' : '#104929' }}>
                          ID: {course.course_id}
                        </span>
                        <span className="badge bg-secondary" style={{ fontSize: '0.7rem' }}>
                          {course.credits} Cr
                        </span>
                      </div>
                      
                      <div style={{ fontSize: '0.8rem', fontWeight: '700', lineHeight: '1.3', color: isLockedOut ? '#6c757d' : '#000' }}>
                        {course.course_name}
                      </div>
                      
                      {isPassed && (
                        <div className="mt-2">
                           <span className="badge bg-danger" style={{ fontSize: '0.65rem' }}>
                             Grade: {course.grade}
                           </span>
                        </div>
                      )}
                      {isOngoing && (
                         <div className="mt-2">
                           <span className="badge bg-warning text-dark" style={{ fontSize: '0.65rem' }}>
                             IN PROGRESS
                           </span>
                         </div>
                      )}
                      {/* NEW: Display a lock badge if missing prerequisites */}
                      {isLockedOut && (
                         <div className="mt-2">
                           <span className="badge bg-secondary" style={{ fontSize: '0.65rem' }}>
                             🔒 MISSING PREREQ
                           </span>
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

      <div className="mt-4 pt-3 border-top d-flex justify-content-between align-items-center position-sticky bg-white pb-2" style={{ bottom: '-1px', zIndex: 10 }}>
        <div className="fw-bold">
          Selected Credits: <span className={totalCredits > 18 ? 'text-danger' : 'text-success'}>
            {totalCredits}
          </span>
        </div>
        
        <button 
          className="btn btn-success px-5 py-2 shadow-sm fw-bold" 
          disabled={selectedCourses.length === 0 || loading}
          onClick={handleConfirmPlan}
          style={{ backgroundColor: '#104929', borderColor: '#104929' }}
        >
          {loading ? 'Saving Draft...' : 'Confirm Draft Plan'}
        </button>
      </div>
    </div>
  );
}

export default Plan;