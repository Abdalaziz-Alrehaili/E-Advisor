import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';

function Profile({ user }) {
  const [grades, setGrades] = useState([]);
  const [draftPlan, setDraftPlan] = useState(null); // NEW: State for the Draft Plan

  useEffect(() => {
    if (user && user.user_id) {
      // Fetch historical grades
      fetch(`http://localhost:5000/my-grades/${user.user_id}`)
        .then(res => res.json())
        .then(data => setGrades(data))
        .catch(err => console.error("Error fetching grades:", err));

      // NEW: Fetch the drafted plan
      fetch(`http://localhost:5000/my-draft/${user.user_id}`)
        .then(res => res.json())
        .then(data => setDraftPlan(data))
        .catch(err => console.error("Error fetching draft:", err));
    }
  }, [user]);

  // GPA Helper Function
  const calculateGPA = (academicRecords) => {
    const gradePoints = { 'A+': 5.0, 'A': 4.75, 'B+': 4.5, 'B': 4.0, 'C+': 3.5, 'C': 3.0, 'D+': 2.5, 'D': 2.0, 'F': 0 };
    let totalPoints = 0;
    let totalCredits = 0;

    const completed = academicRecords.filter(g => g.grade && gradePoints[g.grade] !== undefined);
    
    if (completed.length === 0) return "N/A";

    completed.forEach(record => {
      const credits = Number(record.credits) || 0; 
      totalPoints += gradePoints[record.grade] * credits;
      totalCredits += credits;
    });

    if (totalCredits === 0) return "N/A";
    
    return (totalPoints / totalCredits).toFixed(2);
  };

  // Grouping Logic by the New display_term
  const groupedGrades = grades.reduce((acc, current) => {
    const term = current.display_term || 'Unassigned Electives'; 
    if (!acc[term]) acc[term] = [];
    acc[term].push(current);
    return acc;
  }, {});

  return (
    <div className="container my-5 p-4 rounded bg-white shadow-lg text-start" style={{ maxWidth: '1000px' }}>
      <div className="kau-header text-center mb-4">
        <img src="https://verification.kau.edu.sa/images/logo2.png" alt="KAU Logo" style={{ height: '50px' }} />
        <h2 className="mt-2" style={{ fontFamily: 'IBM Plex Sans Arabic, sans-serif' }}>ملف الطالب<br />Student Profile</h2>
      </div>

      {/* User Info Section */}
      <div className="row g-3 mb-4 profile-form border-bottom pb-4">
        <div className="col-md-4 text-center">
            <div className="profile-img mx-auto" style={{ width: '80px', height: '80px', backgroundColor: '#f2f8f1', borderRadius: '50%', border: '2px solid #104929' }}></div>
            <h6 className="mt-2 text-success">Overall GPA: {calculateGPA(grades)}</h6>
        </div>
        <div className="col-md-8">
          <p className="mb-1"><strong>Name:</strong> {user.first_name} {user.last_name}</p>
          <p className="mb-0"><strong>Email:</strong> {user.username}</p>
          <p className="mb-0 text-muted small">User ID: {user.user_id}</p>
        </div>
      </div>

      <h4 className="text-center mb-4" style={{ color: '#104929' }}>Academic Performance Record</h4>

      {/* NEW: DRAFT PLAN BOX (Only shows if a plan exists) */}
      {draftPlan && draftPlan.courses && draftPlan.courses.length > 0 && (
        <div className="semester-box p-4 rounded shadow-sm border mb-5" style={{ backgroundColor: '#fffdfa', borderLeft: '5px solid #b9915e' }}>
          <div className="d-flex justify-content-between align-items-center mb-3 border-bottom pb-2">
            <h5 className="fw-bold m-0" style={{ color: '#b9915e' }}>
              📝 Proposed Plan: {draftPlan.semester_name}
            </h5>
            <span className="badge bg-warning text-dark px-3 py-2" style={{ letterSpacing: '1px' }}>
              {draftPlan.status.toUpperCase()}
            </span>
          </div>
          
          <table className="table table-hover align-middle">
            <thead className="table-light">
              <tr>
                <th>Code</th>
                <th>Course Name</th>
                <th className="text-center">Credits</th>
              </tr>
            </thead>
            <tbody>
              {draftPlan.courses.map((course, idx) => (
                <tr key={idx}>
                  <td className="fw-bold text-muted">{course.course_id}</td>
                  <td>{course.course_name}</td>
                  <td className="fw-bold text-center">{course.credits} Cr</td>
                </tr>
              ))}
            </tbody>
          </table>
          <div className="text-muted small text-end mt-2 fw-bold">
            Total Planned Credits: {draftPlan.courses.reduce((sum, c) => sum + (Number(c.credits) || 3), 0)}
          </div>
        </div>
      )}

      {/* DYNAMIC SEMESTER BOXES */}
      {Object.keys(groupedGrades).length > 0 ? (
        Object.entries(groupedGrades).map(([termName, termCourses], index) => (
          <div key={index} className="semester-box p-4 rounded shadow-sm border mb-5" style={{ backgroundColor: '#ffffff', borderLeft: '5px solid #1a9044' }}>
            <div className="d-flex justify-content-between align-items-center mb-3 border-bottom pb-2">
              <h5 className="fw-bold m-0" style={{ color: '#104929' }}>{termName}</h5>
              <span className="badge bg-dark">Term GPA: {calculateGPA(termCourses)}</span>
            </div>
            
            <table className="table table-hover align-middle">
              <thead className="table-light">
                <tr>
                  <th>Code</th>
                  <th>Course Name</th>
                  <th>Status</th>
                  <th>Grade</th>
                </tr>
              </thead>
              <tbody>
                {termCourses.map((course, idx) => (
                  <tr key={idx}>
                    <td className="fw-bold">{course.course_id}</td>
                    <td>{course.course_name}</td>
                    <td>
                      <span className={`badge ${course.status === 'completed' ? 'bg-success' : 'bg-warning'}`} style={{fontSize: '0.7rem'}}>
                        {course.status.toUpperCase()}
                      </span>
                    </td>
                    <td className="fw-bold text-center">{course.grade || '--'}</td>
                  </tr>
                ))}
              </tbody>
            </table>
            <div className="text-muted small text-end mt-2">
              Term Credits: {termCourses.reduce((sum, c) => sum + (Number(c.credits) || 0), 0)}
            </div>
          </div>
        ))
      ) : (
        <div className="text-center p-5 border rounded bg-light mb-4">
          <p>No academic records found.</p>
        </div>
      )}
      <div className="text-center mt-5 mb-3">
        <Link to="/plan" className="btn btn-success btn-lg px-5 py-3 shadow" style={{ backgroundColor: '#104929', borderRadius: '30px', fontWeight: 'bold' }}>
           {draftPlan ? 'Edit Semester Plan / تعديل الجدول الدراسي ➔' : 'Build a Semester / بناء الجدول الدراسي ➔'}
        </Link>
      </div>
    </div>
  );
}

export default Profile;