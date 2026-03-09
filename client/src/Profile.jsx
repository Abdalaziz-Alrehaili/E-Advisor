import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';

function Profile({ user }) {
  const [grades, setGrades] = useState([]);
  const [draftPlan, setDraftPlan] = useState(null);
  const [major, setMajor] = useState('');

  const fetchDraft = () => {
    fetch(`http://localhost:5000/my-draft/${user.user_id}`)
      .then(res => res.json())
      .then(data => {
          if (data && data.error) throw new Error(data.error);
          setDraftPlan(data);
      })
      .catch(err => { console.error("Draft error:", err); setDraftPlan(null); });
  };

  useEffect(() => {
    if (user && user.user_id) {
      // Fetch Grades
      fetch(`http://localhost:5000/my-grades/${user.user_id}`)
        .then(res => res.json())
        .then(data => {
            if (data.error) throw new Error(data.error);
            setGrades(Array.isArray(data) ? data : []);
        })
        .catch(err => { console.error("Grades error:", err); setGrades([]); });

      // Fetch Major dynamically from the database
      fetch(`http://localhost:5000/my-major/${user.user_id}`)
        .then(res => res.json())
        .then(data => {
            if (data && data.major) setMajor(data.major);
        })
        .catch(err => console.error("Major fetch error:", err));

      // Fetch Draft
      fetchDraft();
    }
  }, [user]);

  const handleDeletePlan = () => {
      if (window.confirm("Are you sure you want to delete your semester plan? You will have to start over.")) {
          fetch(`http://localhost:5000/delete-plan/${user.user_id}`, { method: 'DELETE' })
          .then(res => res.json())
          .then(data => {
              if (data.success) fetchDraft();
              else alert("Error deleting plan");
          })
          .catch(err => console.error("Delete error:", err));
      }
  };

  const calculateGPA = (academicRecords) => {
    if (!Array.isArray(academicRecords)) return "N/A";
    const gradePoints = { 'A+': 5.0, 'A': 4.75, 'B+': 4.5, 'B': 4.0, 'C+': 3.5, 'C': 3.0, 'D+': 2.5, 'D': 2.0, 'F': 0 };
    let totalPoints = 0, totalCredits = 0;
    academicRecords.forEach(record => {
      if (record.grade && gradePoints[record.grade] !== undefined) {
        const credits = Number(record.credits) || 0;
        totalPoints += gradePoints[record.grade] * credits;
        totalCredits += credits;
      }
    });
    return totalCredits === 0 ? "N/A" : (totalPoints / totalCredits).toFixed(2);
  };

  const safeGrades = Array.isArray(grades) ? grades : [];
  
  // Calculate total credits done for the new header
  const totalCreditsDone = safeGrades.reduce((sum, course) => sum + (Number(course.credits) || 0), 0);

  const yearData = safeGrades.reduce((acc, current) => {
    const year = current.year_number;
    if (!acc[year]) acc[year] = {};
    const semKey = current.ideal_semester; 
    if (!acc[year][semKey]) acc[year][semKey] = { 
      name: `Year ${year} - ${semKey === 'Summer' ? 'Summer' : 'Sem ' + semKey}`, 
      courses: [] 
    };
    acc[year][semKey].courses.push(current);
    return acc;
  }, {});

  const isRegOpen = draftPlan !== null;
  const regYear = isRegOpen ? (draftPlan.year_number || 1) : null;
  const regSemName = draftPlan?.semester_name || "Upcoming Semester";
  
  let regSemKey = '1'; 
  if (isRegOpen) {
      const lowerName = regSemName.toLowerCase();
      if (lowerName.includes('second')) regSemKey = '2';
      else if (lowerName.includes('summer')) regSemKey = 'Summer';
  }

  const allYearKeys = Array.from(new Set([
    ...Object.keys(yearData), 
    regYear ? regYear.toString() : null
  ].filter(Boolean))).sort((a, b) => Number(a) - Number(b));

  return (
    <div className="full-width-white-box">
      <div className="centered-content-container">
        
        {/* NEW TRANSCRIPT-STYLE HEADER */}
        <div className="profile-info-header" style={{ width: '75vw', margin: '0 auto', borderBottom: '2px solid rgba(16, 73, 41, 0.15)', paddingBottom: '45px', marginBottom: '50px' }}>
          
          {/* Avatar and Name */}
          <div style={{ width: '100%', textAlign: 'center', marginBottom: '40px' }}>
            <div 
              className="shadow-sm" 
              style={{ 
                width: '130px', 
                height: '130px', 
                margin: '0 auto 15px auto', 
                display: 'flex', 
                alignItems: 'center', 
                justifyContent: 'center', 
                border: '4px solid #104929', 
                borderRadius: '50%',
                backgroundColor: '#ffffff'
              }}
            >
               <i className="bi bi-person-fill" style={{ fontSize: '4rem', color: '#104929' }}></i>
            </div>
            
            <h1 className="fw-bold m-0" style={{ color: '#104929', fontSize: '2.5rem' }}>
              {user.first_name} {user.last_name}
            </h1>
          </div>
          
          {/* CSS GRID FOR PERFECT VERTICAL ALIGNMENT */}
          <div style={{ 
            display: 'grid', 
            gridTemplateColumns: '1fr 1fr', 
            alignItems: 'center', 
            rowGap: '30px', 
            maxWidth: '1000px', 
            margin: '0 auto', 
            position: 'relative',
            paddingTop: '10px'
          }}>
            
            {/* The absolute centered divider line */}
            <div style={{ 
              position: 'absolute', 
              top: 0, 
              bottom: 0, 
              left: '50%', 
              borderLeft: '4px solid #bce0c8' 
            }}></div>

            {/* ROW 1: GPA (Left) & Major (Right) */}
            <div style={{ textAlign: 'left', paddingRight: '50px' }}>
              <h3 className="fw-bold m-0" style={{ color: '#104929' }}>
                GPA: {calculateGPA(grades)}
              </h3>
            </div>
            
            <div style={{ textAlign: 'left', paddingLeft: '50px' }}>
              <h3 className="fw-bold m-0 text-capitalize" style={{ color: '#104929', lineHeight: '1.4' }}>
                Major: {major || 'Loading...'}
              </h3>
            </div>

            {/* ROW 2: Credits (Left) & Supervisor (Right) */}
            <div style={{ textAlign: 'left', paddingRight: '50px' }}>
              <h3 className="fw-bold m-0" style={{ color: '#104929' }}>
                Credits Completed: {totalCreditsDone}
              </h3>
            </div>
            
            <div style={{ textAlign: 'left', paddingLeft: '50px' }}>
              <h3 className="fw-bold m-0" style={{ color: '#104929' }}>
                Supervisor: 
              </h3>
            </div>

          </div>

        </div>

        {/* EMPTY STATE */}
        {allYearKeys.length === 0 && !isRegOpen ? (
            <div className="text-center p-5 text-muted">
                <h4>No academic records found.</h4>
            </div>
        ) : (
          /* UNIFIED TRANSCRIPT GRID (Columns with full vertical lines) */
          <div style={{ 
            display: 'grid', 
            gridTemplateColumns: 'repeat(3, 1fr)', 
            borderTop: '3px solid #bce0c8',
            width: '100%'
          }}>
            
            {/* TRANSCRIPT COLUMN HEADERS */}
            {['First Semester', 'Second Semester', 'Summer Semester'].map((title, idx) => (
              <div key={`header-${idx}`} className="text-center" style={{ 
                padding: '20px 15px', 
                borderLeft: '3px solid #bce0c8', 
                borderRight: idx === 2 ? '3px solid #bce0c8' : 'none', 
                borderBottom: '3px solid #bce0c8',
                backgroundColor: '#f8fdf9'
              }}>
                <h3 className="fw-bold m-0" style={{ color: '#104929' }}>
                  {title}
                </h3>
              </div>
            ))}

            {/* YEAR DATA */}
            {allYearKeys.map(yearNum => {
              return ['1', '2', 'Summer'].map((slot, idx) => {
                const semData = yearData[yearNum]?.[slot];
                const isRegistrationSlot = isRegOpen && Number(yearNum) === Number(regYear) && slot === regSemKey;

                const cellStyle = {
                  padding: '30px 20px',
                  borderLeft: '3px solid #bce0c8',
                  borderRight: idx === 2 ? '3px solid #bce0c8' : 'none',
                  borderBottom: '3px solid #bce0c8',
                  display: 'flex',
                  flexDirection: 'column',
                  backgroundColor: isRegistrationSlot ? '#fdfdf8' : 'transparent'
                };

                if (semData) {
                  const totalSemCredits = semData.courses.reduce((sum, c) => sum + (Number(c.credits) || 0), 0);
                  const currentWeight = (Number(yearNum) * 10) + (slot === '1' ? 1 : slot === '2' ? 2 : 3);
                  const cumulativeCourses = safeGrades.filter(c => {
                    const cWeight = (Number(c.year_number) * 10) + (c.ideal_semester === '1' ? 1 : c.ideal_semester === '2' ? 2 : 3);
                    return cWeight <= currentWeight;
                  });
                  const cumCredits = cumulativeCourses.reduce((sum, c) => sum + (Number(c.credits) || 0), 0);
                  const cumGPA = calculateGPA(cumulativeCourses);

                  return (
                    <div key={`${yearNum}-${slot}`} style={cellStyle}>
                      <div className="semester-column flex-grow-1" style={{ borderLeft: '6px solid #1a9044', paddingLeft: '15px' }}>
                        
                        <div className="mb-4 border-bottom pb-3">
                          <h4 className="fw-bold mb-3" style={{ color: '#104929' }}>
                            {semData.name}
                          </h4>
                          <h5 className="fw-bold m-0 mb-2" style={{ color: '#104929' }}>
                            Semester Credits: {totalSemCredits} <span className="mx-2">|</span> Semester GPA: {calculateGPA(semData.courses)}
                          </h5>
                          <h5 className="fw-bold m-0" style={{ color: '#104929' }}>
                            Cumulative Credits: {cumCredits} <span className="mx-2">|</span> Cumulative GPA: {cumGPA}
                          </h5>
                        </div>
                        
                        <table className="table table-sm table-borderless align-middle mb-0" style={{ fontSize: '0.85rem' }}>
                          <tbody>
                            {semData.courses.map((course, cIdx) => {
                              const courseCode = course.course_prefix ? `${course.course_prefix}-${course.course_number}` : `Course ${course.course_id}`;
                              return (
                                <tr key={cIdx}>
                                  <td className="fw-bold text-muted pe-1" style={{ width: '25%' }}>{courseCode}</td>
                                  <td className="text-capitalize pe-1" style={{ width: '45%' }}>{course.course_name ? course.course_name.toLowerCase() : ''}</td>
                                  <td className="text-muted pe-1" style={{ width: '20%' }}>{course.credits} Cr.</td>
                                  <td className="text-end fw-bold" style={{ width: '10%', color: '#1a9044' }}>{course.grade || '--'}</td>
                                </tr>
                              );
                            })}
                          </tbody>
                        </table>
                      </div>
                    </div>
                  );
                }

                if (isRegistrationSlot) {
                  const hasDraftedCourses = draftPlan.courses && draftPlan.courses.length > 0;
                  const formattedDate = draftPlan.registration_close_date 
                      ? new Date(draftPlan.registration_close_date).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }) 
                      : null;

                  return (
                    <div key={`${yearNum}-${slot}`} style={cellStyle}>
                      <div className="semester-column registration-active-box flex-grow-1 d-flex flex-column" style={{ borderLeft: '6px solid #8c6b41', paddingLeft: '15px' }}>
                        
                        <div className="mb-4 border-bottom border-warning pb-3">
                          <h4 className="fw-bold mb-2" style={{ color: '#8c6b41' }}>
                            {regSemName}
                          </h4>
                          {formattedDate && (
                              <h6 className="fw-bold m-0 text-danger">
                                🛑 Closes approx: {formattedDate}
                              </h6>
                          )}
                        </div>
                        
                        <div className="flex-grow-1">
                          {hasDraftedCourses ? (
                            <table className="table table-sm table-borderless align-middle mb-0" style={{ fontSize: '0.85rem' }}>
                              <tbody>
                                {draftPlan.courses.map((course, cIdx) => {
                                  const courseCode = course.course_prefix ? `${course.course_prefix}-${course.course_number}` : `Course ${course.course_id}`;
                                  return (
                                    <tr key={cIdx}>
                                      <td className="fw-bold text-muted pe-1" style={{ width: '25%' }}>{courseCode}</td>
                                      <td className="text-capitalize pe-1" style={{ width: '45%' }}>{course.course_name ? course.course_name.toLowerCase() : ''}</td>
                                      <td className="text-muted pe-1" style={{ width: '20%' }}>{course.credits} Cr.</td>
                                      <td className="text-end fw-bold text-muted" style={{ width: '10%' }}>--</td>
                                    </tr>
                                  );
                                })}
                              </tbody>
                            </table>
                          ) : (
                            <p className="text-muted small mt-2">Enrollment is currently available. Build your study plan for this semester.</p>
                          )}
                        </div>

                        <div className="mt-4 pt-3 border-top border-warning text-center">
                          {hasDraftedCourses ? (
                            <div className="d-flex justify-content-center gap-3">
                              <Link 
                                to="/plan" 
                                className="btn btn-build shadow-sm text-decoration-none fw-bold"
                                style={{ border: '2px solid #000000', padding: '10px 25px' }}
                              >
                                Edit plan
                              </Link>
                              <button 
                                onClick={handleDeletePlan}
                                className="btn btn-delete-plan shadow-sm fw-bold"
                                style={{ padding: '10px 25px' }}
                              >
                                Delete plan ✖
                              </button>
                            </div>
                          ) : (
                            <Link 
                              to="/plan" 
                              className="btn btn-build shadow-sm text-decoration-none fw-bold"
                              style={{ border: '2px solid #000000', padding: '10px 25px', display: 'inline-block' }}
                            >
                               Build semester plan
                            </Link>
                          )}
                        </div>
                      </div>
                    </div>
                  );
                }

                return (
                  <div key={`${yearNum}-${slot}`} style={cellStyle}>
                     <div className="h-100 w-100 opacity-25" style={{ minHeight: '150px' }}></div>
                  </div>
                );
              });
            })}
          </div>
        )}
      </div>
    </div>
  );
}

export default Profile;