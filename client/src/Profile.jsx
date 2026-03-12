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
  
  const totalCreditsDone = safeGrades.filter(c => c.status === 'completed').reduce((sum, course) => sum + (Number(course.credits) || 0), 0);

  const isCurrentlyUndergoing = safeGrades.some(c => c.status === 'undergoing');

  const yearData = safeGrades.reduce((acc, current) => {
    const year = current.year_number;
    if (!acc[year]) acc[year] = {};
    
    let semKey = current.ideal_semester; 
    if (current.actual_rule_id === 1) semKey = '1';
    else if (current.actual_rule_id === 2) semKey = '2';
    else if (current.actual_rule_id === 3) semKey = 'Summer';

    if (!acc[year][semKey]) acc[year][semKey] = { 
      name: `Year ${year} - ${semKey === 'Summer' ? 'Summer' : 'Sem ' + semKey}`, 
      courses: [] 
    };
    acc[year][semKey].courses.push(current);
    return acc;
  }, {});

  // --- ACADEMIC CHRONOLOGY LOGIC ---
  const regSemName = draftPlan?.semester_name || "Upcoming Semester";
  let regSemKey = '1'; 
  if (draftPlan) {
      const lowerName = regSemName.toLowerCase();
      if (lowerName.includes('second')) regSemKey = '2';
      else if (lowerName.includes('summer')) regSemKey = 'Summer';
  }

  let maxYear = 0;
  let maxSemRule = 0; // 1=First, 2=Second, 3=Summer
  
  safeGrades.forEach(c => {
      let rule = c.actual_rule_id || 1;
      if (c.year_number > maxYear) {
          maxYear = c.year_number;
          maxSemRule = rule;
      } else if (c.year_number === maxYear && rule > maxSemRule) {
          maxSemRule = rule;
      }
  });

  let regSemRule = 1;
  if (regSemKey === '2') regSemRule = 2;
  if (regSemKey === 'Summer') regSemRule = 3;

  let isLogicalNextSemester = true;
  if (maxYear > 0) {
      if (maxSemRule === 3) {
          isLogicalNextSemester = (regSemRule === 1); // After Summer -> Only First Sem is allowed
      } else if (maxSemRule === 2) {
          isLogicalNextSemester = (regSemRule === 3 || regSemRule === 1); // After Sem 2 -> Summer OR First Sem (if skipping summer)
      } else if (maxSemRule === 1) {
          isLogicalNextSemester = (regSemRule === 2); // After Sem 1 -> Only Second Sem is allowed
      }
  }

  // Hide the registration box if:
  // 1. There is no open registration
  // 2. The student is currently in an ongoing semester
  // 3. The open registration breaks chronological order
  const isRegOpen = draftPlan !== null && !isCurrentlyUndergoing && isLogicalNextSemester;
  
  const regYear = isRegOpen ? (draftPlan.year_number || 1) : null;
  const allYearKeys = Array.from(new Set([
    ...Object.keys(yearData), 
    regYear ? regYear.toString() : null
  ].filter(Boolean))).sort((a, b) => Number(a) - Number(b));

  return (
    <div className="full-width-white-box">
      
      <style>{`
        @keyframes spin { 100% { transform: rotate(360deg); } }
        @keyframes pulseBlue { 
          0% { box-shadow: 0 0 0 0 rgba(13, 110, 253, 0.4); } 
          70% { box-shadow: 0 0 0 8px rgba(13, 110, 253, 0); } 
          100% { box-shadow: 0 0 0 0 rgba(13, 110, 253, 0); } 
        }
      `}</style>

      <div className="centered-content-container">
        
        <div className="profile-info-header" style={{ width: '75vw', margin: '0 auto', borderBottom: '2px solid rgba(16, 73, 41, 0.15)', paddingBottom: '45px', marginBottom: '50px' }}>
          
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
            
            <div style={{ position: 'absolute', top: 0, bottom: 0, left: '50%', borderLeft: '4px solid #bce0c8' }}></div>

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

        {allYearKeys.length === 0 && !isRegOpen ? (
            <div className="text-center p-5 text-muted">
                <h4>No academic records found.</h4>
            </div>
        ) : (
          <div style={{ 
            display: 'grid', 
            gridTemplateColumns: 'repeat(3, 1fr)', 
            borderTop: '3px solid #bce0c8',
            width: '100%'
          }}>
            
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

            {allYearKeys.map(yearNum => {
              return ['1', '2', 'Summer'].map((slot, idx) => {
                const semData = yearData[yearNum]?.[slot];
                const isRegistrationSlot = isRegOpen && Number(yearNum) === Number(regYear) && slot === regSemKey;

                const isUndergoing = semData ? semData.courses.some(c => c.status === 'undergoing') : false;
                
                const themeColor = isUndergoing ? '#0d6efd' : '#104929'; 
                const cellBgColor = isRegistrationSlot ? '#fdfdf8' : (isUndergoing ? '#fdfdf8' : 'transparent');
                
                // If it has semData AND is a registration slot (edge case fallback), keep the normal borders
                const borderAccent = isUndergoing ? '#0d6efd' : (isRegistrationSlot && !semData ? '#8c6b41' : '#1a9044');

                const cellStyle = {
                  padding: '30px 20px',
                  borderLeft: '3px solid #bce0c8',
                  borderRight: idx === 2 ? '3px solid #bce0c8' : 'none',
                  borderBottom: '3px solid #bce0c8',
                  display: 'flex',
                  flexDirection: 'column',
                  backgroundColor: cellBgColor,
                  transition: 'background-color 0.3s ease'
                };

                if (semData) {
                  const totalSemCredits = semData.courses.reduce((sum, c) => sum + (Number(c.credits) || 0), 0);
                  const currentWeight = (Number(yearNum) * 10) + (slot === '1' ? 1 : slot === '2' ? 2 : 3);
                  
                  const cumulativeCourses = safeGrades.filter(c => {
                    let cSemKey = c.ideal_semester; 
                    if (c.actual_rule_id === 1) cSemKey = '1';
                    else if (c.actual_rule_id === 2) cSemKey = '2';
                    else if (c.actual_rule_id === 3) cSemKey = 'Summer';

                    const cWeight = (Number(c.year_number) * 10) + (cSemKey === '1' ? 1 : cSemKey === '2' ? 2 : 3);
                    return cWeight <= currentWeight && (c.status === 'completed' || c.status === 'undergoing'); 
                  });

                  const cumCredits = cumulativeCourses.reduce((sum, c) => sum + (Number(c.credits) || 0), 0);
                  const cumGPA = calculateGPA(cumulativeCourses);

                  const hasDraftedCourses = draftPlan?.courses && draftPlan.courses.length > 0;

                  return (
                    <div key={`${yearNum}-${slot}`} style={cellStyle}>
                      <div className="semester-column flex-grow-1 d-flex flex-column" style={{ borderLeft: `6px solid ${borderAccent}`, paddingLeft: '15px' }}>
                        
                        <div className="mb-4 border-bottom pb-3">
                          <h4 className="fw-bold mb-3 d-flex align-items-center gap-2" style={{ color: themeColor }}>
                            {semData.name}
                            
                            {isUndergoing && (
                                <span style={{ display: 'inline-flex', alignItems: 'center', justifyContent: 'center', width: '28px', height: '28px', borderRadius: '50%', backgroundColor: themeColor, color: 'white', animation: 'pulseBlue 2s infinite' }}>
                                    <i className="bi bi-gear-fill" style={{ fontSize: '1rem', animation: 'spin 3s linear infinite' }}></i>
                                </span>
                            )}
                          </h4>
                          <h5 className="fw-bold m-0 mb-2" style={{ color: themeColor }}>
                            Semester Credits: {totalSemCredits} <span className="mx-2">|</span> Semester GPA: {isUndergoing ? '--' : calculateGPA(semData.courses)}
                          </h5>
                          <h5 className="fw-bold m-0" style={{ color: themeColor }}>
                            Cumulative Credits: {cumCredits} <span className="mx-2">|</span> Cumulative GPA: {isUndergoing ? '--' : cumGPA}
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
                                  <td className="text-end fw-bold" style={{ width: '10%', color: themeColor }}>
                                      {course.status === 'undergoing' ? (
                                          <span className="badge rounded-pill" style={{ backgroundColor: '#cfe2ff', color: '#0a58ca', fontSize: '0.7rem' }}>In Progress</span>
                                      ) : (
                                          course.grade || '--'
                                      )}
                                  </td>
                                </tr>
                              );
                            })}
                          </tbody>
                        </table>

                        {/* Edge case fallback: If the backend incorrectly allows registration in a completed slot, append it below */}
                        {isRegistrationSlot && (
                          <div className="mt-4 pt-4 border-top border-warning flex-grow-1 d-flex flex-column">
                            <h5 className="fw-bold mb-3 text-warning" style={{ color: '#8c6b41' }}>
                              Registration Open ({regSemName})
                            </h5>
                            
                            <div className="flex-grow-1">
                              {hasDraftedCourses ? (
                                <table className="table table-sm table-borderless align-middle mb-0" style={{ fontSize: '0.85rem' }}>
                                  <tbody>
                                    {draftPlan.courses.map((course, cIdx) => {
                                      const courseCode = course.course_prefix ? `${course.course_prefix}-${course.course_number}` : `Course ${course.course_id}`;
                                      return (
                                        <tr key={`draft-${cIdx}`}>
                                          <td className="fw-bold text-muted pe-1" style={{ width: '25%' }}>{courseCode}</td>
                                          <td className="text-capitalize pe-1" style={{ width: '45%' }}>{course.course_name ? course.course_name.toLowerCase() : ''}</td>
                                          <td className="text-muted pe-1" style={{ width: '20%' }}>{course.credits} Cr.</td>
                                          <td className="text-end fw-bold text-warning" style={{ width: '10%' }}>Draft</td>
                                        </tr>
                                      );
                                    })}
                                  </tbody>
                                </table>
                              ) : (
                                <p className="text-muted small">Build your additional study plan for this semester.</p>
                              )}
                            </div>

                            <div className="mt-3 text-center">
                              {hasDraftedCourses ? (
                                <div className="d-flex justify-content-center gap-2">
                                  <Link to="/plan" className="btn btn-outline-dark btn-sm fw-bold px-3">Edit plan</Link>
                                  <button onClick={handleDeletePlan} className="btn btn-outline-danger btn-sm fw-bold px-3">Delete ✖</button>
                                </div>
                              ) : (
                                <Link to="/plan" className="btn btn-outline-dark btn-sm fw-bold px-3">Build semester plan</Link>
                              )}
                            </div>
                          </div>
                        )}
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
                      <div className="semester-column registration-active-box flex-grow-1 d-flex flex-column" style={{ borderLeft: `6px solid ${borderAccent}`, paddingLeft: '15px' }}>
                        
                        <div className="mb-4 border-bottom border-warning pb-3">
                          <h4 className="fw-bold mb-2" style={{ color: borderAccent }}>
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