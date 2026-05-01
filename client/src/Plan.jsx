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

  // --- AI PREDICTION STATES ---
  const [predictions, setPredictions] = useState({});
  const [isPredicting, setIsPredicting] = useState(false);

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
        .catch(err => console.warn("Could not fetch all courses.", err));

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

  // ==========================================
  // HARDCODED KNOWLEDGE BASE (HISTORICAL AVERAGES)
  // ==========================================
  const COURSE_DATA_DICTIONARY = {
      'ELIS-101': 93, 'ELIS-102': 87, 'ELIS-103': 86, 'ELIS-104': 85,
      'ISLS-101': 86, 'ISLS-201': 94, 'ISLS-301': 93, 'ISLS-401': 95,
      'ARAB-101': 83, 'ARAB-201': 91,
      'MATH-110': 77, 'STAT-110': 79, 'PHYS-110': 80, 'BIO-110': 88, 'CHEM-110': 79,
      'STAT-210': 71,
      'BUS-232': 88, 'BUS-433': 87,
      'MRKT-260': 89, 'ACCT-333': 84, 'MRKC-323': 90, 'PR-211': 91, 'COMM-101': 93,
      'CPCS-202': 82, 'CPCS-222': 80, 'CPCS-203': 78, 'CPCS-204': 76,
      'CPIT-110': 79, 'CPIT-201': 85, 'CPIT-221': 90,
      'CPIS-210': 80, 'CPIS-220': 90, 'CPIS-222': 73, 'CPIS-240': 86, 'CPIS-250': 88,
      'CPIS-312': 79, 'CPIS-320': 89, 'CPIS-323': 96, 'CPIS-334': 89, 'CPIS-342': 79,
      'CPIS-350': 87, 'CPIS-351': 89, 'CPIS-352': 86, 'CPIS-354': 91, 'CPIS-357': 88,
      'CPIS-358': 84, 'CPIS-363': 87, 'CPIS-370': 79, 'CPIS-380': 91, 'CPIS-420': 86,
      'CPIS-428': 88, 'CPIS-434': 86, 'CPIS-486': 88, 'CPIS-498': 92, 'CPIS-499': 88
  };

  const getHistoricalStats = (course) => {
      if (!course) return { courseAvg: 85, profAvg: 85 };
      const key = `${(course.course_prefix || '').toUpperCase()}-${course.course_number || ''}`;
      
      const courseAvg = COURSE_DATA_DICTIONARY[key] || 85; 
      
      const profOffset = ((course.selected_section_id || 1) % 5) - 2; 
      const profAvg = courseAvg + profOffset;

      return { courseAvg, profAvg };
  };

  const calculateCurrentGPA = () => {
      let totalPoints = 0;
      let totalCr = 0;
      curriculum.filter(c => c.status === 'completed' && c.grade).forEach(c => {
          let p = 1.0;
          if(c.grade >= 95) p = 5.0; else if(c.grade >= 90) p = 4.75; 
          else if(c.grade >= 85) p = 4.5; else if(c.grade >= 80) p = 4.0; 
          else if(c.grade >= 75) p = 3.5; else if(c.grade >= 70) p = 3.0; 
          else if(c.grade >= 65) p = 2.5; else if(c.grade >= 60) p = 2.0;
          totalPoints += (p * (Number(c.credits) || 3));
          totalCr += (Number(c.credits) || 3);
      });
      return totalCr > 0 ? (totalPoints / totalCr) : 0;
  };

  const currentGPA = calculateCurrentGPA();
  const totalCompletedCredits = curriculum
    .filter(c => c.status === 'completed')
    .reduce((sum, c) => sum + (Number(c.credits) || 0), 0);

  const totalCredits = selectedCourses.reduce((sum, c) => sum + (Number(c.credits) ?? 0), 0);
  const isSummer = draftPlan?.semester_name?.toLowerCase().includes('summer');
  const minCredits = isSummer ? 0 : 10;
  const maxCredits = isSummer ? 9 : 20;
  const isInvalidLoad = totalCredits < minCredits || totalCredits > maxCredits;

  // --- NEW: AI Prediction Trigger (Simultaneous Individual Fetches) ---
  useEffect(() => {
      if (isInvalidLoad || selectedCourses.length === 0) {
          setPredictions({});
          return;
      }

      const fetchPredictions = async () => {
          setIsPredicting(true);
          
          const avgDifficulty = selectedCourses.reduce((sum, c) => sum + getHistoricalStats(c).courseAvg, 0) / selectedCourses.length;
          
          const predictionPromises = selectedCourses.map(async (course) => {
              const { courseAvg, profAvg } = getHistoricalStats(course);
              
              const payload = {
                  course_credits: Number(course.credits) || 3,
                  is_summer: isSummer ? 1 : 0,
                  course_historical_average: courseAvg, 
                  prof_historical_average: profAvg,
                  prof_course_specific_average: profAvg - 1,
                  credits_completed_before: totalCompletedCredits,
                  cumulative_gpa_before: currentGPA === 0 ? 4.0 : currentGPA,
                  attempted_semester_credits: totalCredits,
                  current_schedule_difficulty: avgDifficulty
              };

              try {
                  const res = await fetch('http://localhost:5000/api/predict', {
                      method: 'POST',
                      headers: { 'Content-Type': 'application/json' },
                      body: JSON.stringify(payload)
                  });
                  const data = await res.json();
                  
                  if (data.success) {
                      return { id: course.course_id, grade: data.predicted_grade };
                  }
              } catch (err) {
                  console.error("Prediction failed for course", course.course_id, err);
              }
              return { id: course.course_id, grade: 85.0 };
          });

          const results = await Promise.all(predictionPromises);
          
          const newPredictions = {};
          results.forEach(res => {
              newPredictions[res.id] = res.grade;
          });
          
          setPredictions(newPredictions);
          setIsPredicting(false);
      };

      const timer = setTimeout(() => {
          fetchPredictions();
      }, 1500);

      return () => clearTimeout(timer);
  }, [selectedCourses, isInvalidLoad, totalCredits, isSummer, totalCompletedCredits, currentGPA]);


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

  const checkCreditRequirements = (course) => {
      if (!course) return true;
      const prefix = (course.course_prefix || '').toUpperCase();
      const number = (course.course_number || '');
      
      if (prefix === 'CPIS' && number === '323') return totalCompletedCredits >= 80;
      if (prefix === 'CPIS' && number === '498') return totalCompletedCredits >= 100;
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

  const gradeToGPA = (grade) => {
      if (!grade) return 0;
      if(grade >= 95) return 5.0; if(grade >= 90) return 4.75;
      if(grade >= 85) return 4.5; if(grade >= 80) return 4.0;
      if(grade >= 75) return 3.5; if(grade >= 70) return 3.0;
      if(grade >= 65) return 2.5; if(grade >= 60) return 2.0;
      return 1.0;
  };

  let predictedSemPoints = 0;
  selectedCourses.forEach(c => {
      const grade = predictions[c.course_id] || 85; 
      predictedSemPoints += (gradeToGPA(grade) * (Number(c.credits) || 3));
  });

  const predictedSemesterGPA = totalCredits > 0 ? (predictedSemPoints / totalCredits) : 0;
  const currentTotalPoints = currentGPA * totalCompletedCredits;
  const newCumulativeGPA = (totalCompletedCredits + totalCredits) > 0 ? ((currentTotalPoints + predictedSemPoints) / (totalCompletedCredits + totalCredits)) : 0;
  const gpaChange = newCumulativeGPA - currentGPA;
  
  // --- PROGRAM COMPLETION LOGIC ---
  const totalProgramCredits = 140; 
  
  // 1. Ahead or Behind Logic (NOW DYNAMICALLY CALCULATED EVERY RENDER!)
  const getAcademicStatus = () => {
      const admissionYear = 2023; 
      const currentYear = 2026; 
      let yearsEnrolled = currentYear - admissionYear;
      if (yearsEnrolled <= 0) yearsEnrolled = 1; 

      const creditsPerYear = totalProgramCredits / 5; 
      let expectedCredits = Math.round(yearsEnrolled * creditsPerYear);
      if (expectedCredits > totalProgramCredits) expectedCredits = totalProgramCredits;

      // THE FIX: We now include totalCredits (the courses you just clicked) in the calculation!
      const currentAndPlannedCredits = totalCompletedCredits + totalCredits;
      const difference = currentAndPlannedCredits - expectedCredits;
      
      if (expectedCredits === 0) return { label: 'On Track', color: 'text-primary' };
      
      const rawPct = (difference / expectedCredits) * 100;
      const pct = Math.abs(Math.round(rawPct));

      if (rawPct > 5) return { label: `${pct}% Ahead`, color: 'text-success' };
      if (rawPct < -5) return { label: `${pct}% Behind`, color: 'text-danger' };
      return { label: 'On Track', color: 'text-primary' };
  };
  const progressStatus = getAcademicStatus();

  // 2. Critical Path DAG Algorithm (Minimum Semesters Left)
  const calculateMinSemesters = () => {
      const remainingCredits = Math.max(0, totalProgramCredits - (totalCompletedCredits + totalCredits));
      
      // A. Capacity constraint
      let creds = remainingCredits;
      let credSems = 0;
      while (creds > 0) {
          credSems++;
          if (credSems % 3 === 0) creds -= 10; 
          else creds -= 20; 
      }

      // B. Prerequisite Bottleneck constraint (DAG Depth)
      const remainingCourses = curriculum.filter(c => 
          c.status !== 'completed' && 
          c.status !== 'undergoing' && 
          !selectedCourses.some(sc => sc.course_id === c.course_id || sc.placeholder_id === c.course_id)
      );

      const depthMap = {};
      remainingCourses.forEach(c => depthMap[c.course_id] = 1);

      let changed = true;
      while (changed) {
          changed = false;
          for (let course of remainingCourses) {
              const reqs = prerequisites.filter(p => p.course_id === course.course_id);
              let maxReqDepth = 0;
              for (let req of reqs) {
                  if (depthMap[req.prereq_id]) {
                      maxReqDepth = Math.max(maxReqDepth, depthMap[req.prereq_id]);
                  }
              }
              if (depthMap[course.course_id] < maxReqDepth + 1) {
                  depthMap[course.course_id] = maxReqDepth + 1;
                  changed = true;
              }
          }
      }

      const maxDagDepth = remainingCourses.length > 0 ? Math.max(...Object.values(depthMap)) : 0;
      return Math.max(credSems, maxDagDepth);
  };
  const minSemestersLeft = calculateMinSemesters();

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

        .dashboard-locked { background: linear-gradient(135deg, #104929 0%, #0a2e1a 100%); color: white; position: relative; overflow: hidden; }
        .dashboard-locked::after { content: ''; position: absolute; top: 0; left: -100%; width: 50%; height: 100%; background: linear-gradient(to right, transparent, rgba(255,255,255,0.1), transparent); transform: skewX(-25deg); animation: shine 3s infinite; }
        @keyframes shine { 0% { left: -100%; } 100% { left: 200%; } }
      `}</style>

      <div className="container p-0">
        <div className="row g-4 align-items-stretch">
          
          {/* --- COLUMN 1: RECOMMENDATIONS --- */}
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

          {/* --- COLUMN 2: ROADMAP --- */}
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
                        const filledCourse = selectedCourses.find(c => c.placeholder_id === course.course_id);
                        
                        const isPassed = course.status === 'completed';
                        const isOngoing = course.status === 'undergoing';
                        
                        const prereqsMet = checkPrereqsMet(course.course_id);
                        const creditsMet = checkCreditRequirements(course);

                        const isLocked = !isPassed && !isOngoing && (!prereqsMet || !creditsMet);
                        const isAvailable = !isPassed && !isOngoing && prereqsMet && creditsMet;
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
        <div className="mt-5 pt-3">
          <div className="p-4 rounded-4 shadow-sm border bg-white">
              <h3 className="fw-bold text-center mb-4" style={{ color: '#104929' }}>Your Weekly Plan</h3>
              {mainScheduleSections.length > 0 ? renderScheduleGrid(mainScheduleSections) : (
                  <div className="text-center p-5 text-muted bg-light rounded border border-dashed">
                      No courses added to your schedule yet. Click an available course above to begin.
                  </div>
              )}
          </div>
        </div>

        {/* ========================================== */}
        {/* NEW AI MISSION CONTROL DASHBOARD           */}
        {/* ========================================== */}
        <div className="mt-4 pt-2 mb-5">
            {isInvalidLoad ? (
                // LOCKED GAMIFIED STATE
                <div className="p-5 rounded-4 shadow-lg dashboard-locked text-center border">
                    <i className="bi bi-lock-fill mb-3 d-block" style={{ fontSize: '3.5rem', opacity: 0.8 }}></i>
                    <h2 className="fw-bold mb-3">AI Prediction Engine Standby</h2>
                    <p className="lead m-0 opacity-75">
                        You need to hit the minimum credit requirement <strong className="text-white">({minCredits} credits)</strong> for the AI to activate. <br/>
                        Add more courses to your schedule to unlock your future!
                    </p>
                </div>
            ) : (
                // UNLOCKED DASHBOARD STATE
                <div className="p-4 rounded-4 shadow-sm border bg-white position-relative">
                    {isPredicting && (
                        <div className="position-absolute top-0 start-0 w-100 h-100 bg-white opacity-75 d-flex justify-content-center align-items-center" style={{zIndex: 5, borderRadius: '15px'}}>
                            <div className="spinner-border text-success" role="status"><span className="visually-hidden">Loading...</span></div>
                        </div>
                    )}
                    
                    <div className="d-flex justify-content-between align-items-center border-bottom pb-3 mb-4">
                        <h4 className="fw-bold m-0" style={{ color: '#104929' }}><i className="bi bi-cpu-fill me-2"></i>E-Advisor AI Predictions</h4>
                        <span className="badge bg-success text-white px-3 py-2 rounded-pill"><i className="bi bi-check-circle-fill me-2"></i>Engine Active</span>
                    </div>

                    <div className="row g-0 align-items-stretch">
                        
                        {/* LEFT: THE TUBES (Individual Course Predictions) */}
                        <div className="col-md-4 pe-4 d-flex flex-column justify-content-center">
                            <h6 className="fw-bold text-muted mb-3 text-uppercase small">Course Grade Breakdown</h6>
                            <div className="d-flex flex-column gap-3">
                                {selectedCourses.map(c => {
                                    const predGrade = predictions[c.course_id] || 0;
                                    const { courseAvg: avgGrade } = getHistoricalStats(c); 
                                    
                                    return (
                                        <div key={c.course_id}>
                                            <div className="d-flex justify-content-between small fw-bold mb-1">
                                                <span style={{color: '#104929'}}>{c.course_prefix}-{c.course_number}</span>
                                                <span className="text-muted">
                                                    Pred: <span className={predGrade >= avgGrade ? "text-success" : "text-danger"}>{predGrade ? predGrade.toFixed(1) : '--'}</span> | Avg: {avgGrade}
                                                </span>
                                            </div>
                                            {/* Tube 1: The AI Predicted Grade */}
                                            <div className="progress shadow-sm" style={{ height: '14px', backgroundColor: '#e9ecef', borderRadius: '10px' }}>
                                                <div className="progress-bar" style={{ width: `${predGrade}%`, backgroundColor: predGrade >= avgGrade ? '#104929' : '#d97706' }}></div>
                                            </div>
                                            {/* Tube 2: The Historical Average Grade */}
                                            <div className="progress mt-1" style={{ height: '6px', backgroundColor: '#e9ecef', borderRadius: '10px' }}>
                                                <div className="progress-bar bg-secondary opacity-50" style={{ width: `${avgGrade}%` }}></div>
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                        </div>

                        {/* CENTER: THE GPA HUB */}
                        <div className="col-md-4 px-4 border-start border-end d-flex flex-column align-items-center justify-content-center">
                            <h6 className="text-muted fw-bold mb-3 text-uppercase small">Predicted GPA After Semester</h6>
                            <h1 className="display-2 fw-bold m-0" style={{ color: '#104929', textShadow: '2px 2px 4px rgba(0,0,0,0.1)' }}>
                                {newCumulativeGPA.toFixed(2)}
                            </h1>
                            <div className={`mt-3 badge rounded-pill px-4 py-2 fs-6 shadow-sm ${gpaChange >= 0 ? 'bg-success' : 'bg-danger'}`}>
                                {gpaChange >= 0 ? '▲' : '▼'} {Math.abs(gpaChange).toFixed(2)} {gpaChange >= 0 ? 'positive' : 'negative'}
                            </div>
                            <div className="mt-3 text-center small fw-bold bg-light px-3 py-2 rounded border w-100">
                                <div className="text-muted">Current GPA: <span className="text-dark">{currentGPA.toFixed(2)}</span></div>
                            </div>
                        </div>

                        {/* RIGHT: HARD METRICS */}
                        <div className="col-md-4 ps-4 d-flex flex-column justify-content-center gap-4">
                            <div>
                                <div className="text-muted small fw-bold text-uppercase mb-1"><i className="bi bi-mortarboard-fill me-2"></i>Credits Done → Credits Done After Semester</div>
                                <h4 className="fw-bold m-0 text-dark">
                                    {totalCompletedCredits} <span className="text-muted fs-6">/ {totalProgramCredits}</span> <span className="text-success mx-1">→</span> {totalCompletedCredits + totalCredits} <span className="text-muted fs-6">/ {totalProgramCredits}</span>
                                </h4>
                            </div>
                            <div>
                                <div className="text-muted small fw-bold text-uppercase mb-1"><i className="bi bi-pie-chart-fill me-2"></i>Ahead or Behind Program Plan</div>
                                <h3 className={`fw-bold m-0 ${progressStatus.color}`}>{progressStatus.label}</h3>
                            </div>
                            <div>
                                <div className="text-muted small fw-bold text-uppercase mb-1"><i className="bi bi-calendar-event-fill me-2"></i>Minimum Semesters Left</div>
                                <h3 className="fw-bold m-0" style={{ color: '#104929' }}>{minSemestersLeft}</h3>
                            </div>
                        </div>

                    </div>
                </div>
            )}
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
                            const isEvalLocked = !checkPrereqsMet(c.course_id) || !checkCreditRequirements(c);
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
                            const creditsMet = checkCreditRequirements(c);
                            const isLocked = !isPassed && !isOngoing && (!prereqsMet || !creditsMet);

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
                        const creditsMet = checkCreditRequirements(evaluatedCourse);
                        const isAvailable = !isPassed && !isOngoing && prereqsMet && creditsMet;

                        if (!isAvailable) {
                            const isLockedAlert = !isPassed && !isOngoing;
                            
                            let lockReason = "";
                            if (isPassed) lockReason = "You have already completed this course.";
                            else if (isOngoing) lockReason = "You are currently enrolled in this course.";
                            else if (!prereqsMet) lockReason = "You must complete all required prerequisites before adding this course.";
                            else if (!creditsMet) {
                                if (evaluatedCourse.course_number === '323') lockReason = `You need at least 80 completed credits to register for Summer Training. You currently have ${totalCompletedCredits}.`;
                                if (evaluatedCourse.course_number === '498') lockReason = `You need at least 100 completed credits to register for Senior Project (1). You currently have ${totalCompletedCredits}.`;
                            }

                            return (
                                <div className="alert text-center p-4" style={{
                                    backgroundColor: isLockedAlert ? '#fce8e8' : '#e9ecef',
                                    color: isLockedAlert ? '#dc3545' : '#6c757d',
                                    border: isLockedAlert ? '1px solid #f5c2c7' : '1px solid #dee2e6'
                                }}>
                                    <h5 className="fw-bold mb-2">Registration Unavailable</h5>
                                    <p className="mb-0 fw-bold">{lockReason}</p>
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
                                        
                                        // NEW: Check if the section has reached max capacity
                                        const isFull = sec.enrolled_count >= sec.max_capacity;
                                        
                                        // If it's full or conflicting, disable it. 
                                        // Exception: If the user already selected it, keep it active so they can unselect it!
                                        const isDisabled = (isConflicting || isFull) && !isSelectedSection;

                                        return (
                                            <div key={sec.section_id} 
                                                 onClick={!isDisabled ? () => setPreviewSectionId(previewSectionId === sec.section_id ? null : sec.section_id) : undefined}
                                                 className={`p-3 border rounded shadow-sm transition-all ${isDisabled ? 'opacity-50' : ''}`}
                                                 style={{ 
                                                     cursor: isDisabled ? 'not-allowed' : 'pointer', 
                                                     // Gray out the background if it's full and they haven't selected it
                                                     backgroundColor: isFull && !isSelectedSection ? '#e9ecef' : (isConflicting ? '#f8d7da' : (isSelectedSection ? '#eefaf4' : '#fff')), 
                                                     border: isSelectedSection ? '2px solid #104929' : (isConflicting ? '1px solid #dc3545' : '1px solid #dee2e6') 
                                                 }}>
                                                <div className="d-flex justify-content-between align-items-center mb-2">
                                                    <span className="fw-bold fs-5" style={{ color: isFull && !isSelectedSection ? '#6c757d' : 'inherit' }}>
                                                        {sec.section_name}
                                                    </span>
                                                    
                                                    <div className="d-flex gap-2 align-items-center">
                                                        {/* NEW: Max Capacity Badge */}
                                                        {isFull && !isSelectedSection && (
                                                            <span className="badge bg-secondary">Max Capacity</span>
                                                        )}
                                                        <span className={`badge ${isConflicting ? 'bg-danger' : isFull && !isSelectedSection ? 'bg-secondary' : 'bg-primary'}`}>
                                                            {sec.days}
                                                        </span>
                                                    </div>
                                                </div>
                                                
                                                {isConflicting && (
                                                    <div className="small fw-bold text-danger mb-2">
                                                        ⚠ Time Conflict: {conflictingCourse.course_prefix}-{conflictingCourse.course_number}
                                                    </div>
                                                )}
                                                
                                                <div className="small text-muted mb-1"><i className="bi bi-person-fill me-2"></i>{sec.professor_name}</div>
                                                <div className="small text-muted mb-1"><i className="bi bi-clock-fill me-2"></i>{sec.start_time.substring(0,5)} - {sec.end_time.substring(0,5)}</div>
                                                
                                                <div className="small text-muted d-flex justify-content-between mt-2 pt-2 border-top">
                                                    <span><i className="bi bi-geo-alt-fill me-2"></i>{sec.room_number}</span>
                                                    {/* NEW: Seats Tracker */}
                                                    <span className="fw-bold" style={{ color: isFull && !isSelectedSection ? '#dc3545' : '#104929' }}>
                                                        {sec.enrolled_count || 0} / {sec.max_capacity} Seats
                                                    </span>
                                                </div>
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
                          
                          {(!evaluatedCourse || !checkPrereqsMet(evaluatedCourse.course_id) || !checkCreditRequirements(evaluatedCourse) || evaluatedCourse.status === 'completed' || evaluatedCourse.status === 'undergoing') ? null : (
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