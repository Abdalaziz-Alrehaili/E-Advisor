import React, { useState, useEffect } from 'react';

function Plan({ user }) {
  const [curriculum, setCurriculum] = useState([]);
  const [selectedCourses, setSelectedCourses] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (user && user.user_id) {
      fetch(`http://localhost:5000/curriculum-status/${user.user_id}`)
        .then(res => res.json())
        .then(data => setCurriculum(data))
        .catch(err => console.error("Error fetching curriculum:", err));
    }
  }, [user]);

  // NEW: Function to send the plan to the database
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
        alert("Plan Confirmed! Your advisor will review it.");
        window.location.reload(); // Refresh to update course colors to 'undergoing'
      } else {
        alert("Error: " + data.error);
      }
    })
    .catch(err => console.error("Error:", err))
    .finally(() => setLoading(false));
  };

  const semesters = [];
  for (let i = 0; i < curriculum.length; i += 5) {
    semesters.push(curriculum.slice(i, i + 5));
  }

  const toggleCourse = (course) => {
    if (course.status === 'completed' || course.status === 'undergoing') return;
    if (selectedCourses.find(c => c.course_id === course.course_id)) {
      setSelectedCourses(selectedCourses.filter(c => c.course_id !== course.course_id));
    } else {
      setSelectedCourses([...selectedCourses, course]);
    }
  };

  const totalCredits = selectedCourses.reduce((sum, c) => sum + (c.credits || 3), 0);

  return (
    <div className="container plan-page-container shadow-lg bg-white rounded p-4 my-5">
      <div className="text-center mb-4">
        <h3 className="fw-bold" style={{ color: '#104929' }}>Build Your Semester</h3>
        <p className="text-muted small">Choose your courses for the upcoming term.</p>
      </div>

      <div className="plan-grid">
        {semesters.map((semCourses, semIdx) => (
          <div key={semIdx} className="sem-col">
            <h6 className="text-center fw-bold mb-3 py-1 rounded shadow-sm" 
                style={{ backgroundColor: '#104929', color: '#fff', fontSize: '0.75rem' }}>
              TERM {semIdx + 1}
            </h6>
            
            {semCourses.map(course => {
              const isPassed = course.status === 'completed';
              const isOngoing = course.status === 'undergoing';
              const isSelected = selectedCourses.find(c => c.course_id === course.course_id);

              let bgColor = '#fff';
              if (isPassed) bgColor = '#ffcccc';
              else if (isOngoing) bgColor = '#fff3cd';
              else if (isSelected) bgColor = '#d1e7dd';

              return (
                <div 
                  key={course.course_id}
                  onClick={() => toggleCourse(course)}
                  className={`card course-card-slim shadow-sm ${(isPassed || isOngoing) ? 'locked' : ''}`}
                  style={{ backgroundColor: bgColor }}
                >
                  <div className="card-body p-2 px-3">
                    <div className="d-flex justify-content-between align-items-center">
                      <span style={{ fontSize: '0.7rem', fontWeight: '800', color: '#104929' }}>
                        {course.course_id}
                      </span>
                      <span className="text-muted" style={{ fontSize: '0.6rem' }}>
                        {course.credits} Cr
                      </span>
                    </div>
                    <div style={{ fontSize: '0.8rem', fontWeight: '600', margin: '2px 0' }}>
                      {course.course_name}
                    </div>
                    {isPassed && (
                      <span className="badge bg-danger mt-1" style={{ fontSize: '0.55rem', alignSelf: 'start' }}>
                        Grade: {course.grade}
                      </span>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        ))}
      </div>

      <div className="mt-5 pt-3 border-top d-flex justify-content-between align-items-center">
        <div className="fw-bold">
          Selected Credits: <span className={totalCredits > 18 ? 'text-danger' : 'text-success'}>
            {totalCredits}
          </span>
        </div>
        {/* UPDATED BUTTON: Added onClick and disabled state for loading */}
        <button 
          className="btn btn-success px-5 py-2 shadow-sm" 
          disabled={selectedCourses.length === 0 || loading}
          onClick={handleConfirmPlan}
        >
          {loading ? 'Saving...' : 'Confirm Plan'}
        </button>
      </div>
    </div>
  );
}

export default Plan;