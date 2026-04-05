import React, { useState, useEffect, useRef } from 'react';
import { io } from 'socket.io-client';

const socket = io('http://localhost:5000');

function SupervisorDashboard({ user }) {
  const [students, setStudents] = useState([]);
  const [selectedStudent, setSelectedStudent] = useState(null);
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  const chatEndRef = useRef(null);

  const [sortConfig, setSortConfig] = useState({ key: null, direction: 'default' });

  const [showPlanModal, setShowPlanModal] = useState(false);
  const [studentGrades, setStudentGrades] = useState([]);
  const [studentDraft, setStudentDraft] = useState(null);

  useEffect(() => {
    if (user && user.user_id) {
      socket.emit('join_user_room', user.user_id);

      fetch(`http://localhost:5000/api/supervisor/students/${user.user_id}`)
        .then(res => res.json())
        .then(data => setStudents(data))
        .catch(err => console.error("Error fetching students:", err));
    }
  }, [user]);

  useEffect(() => {
    if (selectedStudent && user) {
      fetch('http://localhost:5000/api/chat/mark-read', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ sender_id: selectedStudent.user_id, receiver_id: user.user_id })
      }).then(() => {
          setStudents(prev => prev.map(s => s.user_id === selectedStudent.user_id ? { ...s, unread_count: 0 } : s));
      }).catch(err => console.error("Error marking messages read:", err));

      fetch(`http://localhost:5000/api/chat/history/${user.user_id}/${selectedStudent.user_id}`)
        .then(res => res.json())
        .then(data => setMessages(data))
        .catch(err => console.error("Error fetching chat history:", err));
    }
  }, [selectedStudent, user]);

  useEffect(() => {
    const handleReceiveMessage = (message) => {
      if (selectedStudent && (message.sender_id === selectedStudent.user_id || message.receiver_id === selectedStudent.user_id)) {
        setMessages((prev) => [...prev, message]);
        
        if (message.sender_id === selectedStudent.user_id) {
            fetch('http://localhost:5000/api/chat/mark-read', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ sender_id: selectedStudent.user_id, receiver_id: user.user_id })
            }).catch(e => console.error(e));
        }
      } else {
        setStudents(prev => prev.map(s => {
            if (s.user_id === message.sender_id) return { ...s, unread_count: Number(s.unread_count || 0) + 1 };
            return s;
        }));
      }
    };

    socket.on('receive_message', handleReceiveMessage);
    return () => socket.off('receive_message', handleReceiveMessage);
  }, [selectedStudent, user]);

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const handleSendMessage = (e) => {
    e.preventDefault();
    if (!newMessage.trim() || !selectedStudent || !user) return;

    const messageData = {
      sender_id: user.user_id,
      receiver_id: selectedStudent.user_id,
      content: newMessage.trim()
    };

    socket.emit('send_message', messageData);
    setNewMessage(''); 
  };

  const handleOpenPlanModal = () => {
      setShowPlanModal(true);
      fetch(`http://localhost:5000/my-grades/${selectedStudent.user_id}`)
        .then(res => res.json())
        .then(data => setStudentGrades(data))
        .catch(err => console.error(err));

      fetch(`http://localhost:5000/my-draft/${selectedStudent.user_id}`)
        .then(res => res.json())
        .then(data => setStudentDraft(data))
        .catch(err => console.error(err));
  };

  const getProgressMetric = (student) => {
    const currentYear = 2026; 
    let yearsEnrolled = currentYear - student.admission_year;
    if (yearsEnrolled <= 0) yearsEnrolled = 1; 

    const creditsPerYear = student.total_credits_required / student.duration_years;
    let expectedCredits = Math.round(yearsEnrolled * creditsPerYear);
    
    if (expectedCredits > student.total_credits_required) expectedCredits = student.total_credits_required;

    const completed = Number(student.credits_completed) || 0;
    const difference = completed - expectedCredits;

    if (expectedCredits === 0) return 0;
    return (difference / expectedCredits) * 100; 
  };

  const getAcademicStatus = (student) => {
    const rawPct = getProgressMetric(student);
    const pct = Math.abs(Math.round(rawPct));

    if (rawPct > 5) return { label: `${pct}% Ahead`, color: 'bg-success' };
    if (rawPct < -5) return { label: `${pct}% Behind`, color: 'bg-danger' };
    return { label: 'On Track', color: 'bg-primary' };
  };

  const handleSort = (key) => {
    if (sortConfig.key === key) {
      if (sortConfig.direction === 'desc') {
        setSortConfig({ key, direction: 'asc' }); 
      } else if (sortConfig.direction === 'asc') {
        setSortConfig({ key: null, direction: 'default' }); 
      }
    } else {
      setSortConfig({ key, direction: 'desc' }); 
    }
  };

  // FIXED: The arrows have been swapped exactly as requested!
  const getSortIcon = (key) => {
    if (sortConfig.key !== key) return '';
    if (sortConfig.direction === 'desc') return ' ↑'; // Highest to Lowest
    if (sortConfig.direction === 'asc') return ' ↓';  // Lowest to Highest
    return '';
  };

  const sortedStudents = [...students].sort((a, b) => {
    if (!sortConfig.key || sortConfig.direction === 'default') {
      return a.first_name.localeCompare(b.first_name);
    }
    
    let aValue, bValue;

    if (sortConfig.key === 'gpa') {
      aValue = parseFloat(a.gpa);
      bValue = parseFloat(b.gpa);
    } else if (sortConfig.key === 'admission_year') {
      aValue = parseInt(a.admission_year);
      bValue = parseInt(b.admission_year);
    } else if (sortConfig.key === 'credits') {
      aValue = getProgressMetric(a);
      bValue = getProgressMetric(b);
    }

    if (aValue < bValue) return sortConfig.direction === 'asc' ? -1 : 1;
    if (aValue > bValue) return sortConfig.direction === 'asc' ? 1 : -1;
    return 0;
  });

  if (!user || user.role !== 'supervisor') {
    return <div className="container mt-5 alert alert-danger">Access Denied. Supervisor portal only.</div>;
  }

  return (
    <div className="container-fluid bg-light min-vh-100 py-4">
      <div className="container">
        <div className="row mb-4">
          <div className="col-12">
            <h2 className="fw-bold" style={{ color: '#104929' }}>Supervisor Dashboard</h2>
            <p className="text-muted">Manage your assigned students, view academic progress, and provide real-time advising.</p>
          </div>
        </div>

        <div className="row g-4" style={{ height: '750px' }}>
          
          <div className="col-lg-4 d-flex flex-column">
            <div className="card shadow-sm border-0 h-100 rounded-4 overflow-hidden d-flex flex-column">
              <div className="card-header bg-white border-bottom py-3">
                <h5 className="fw-bold m-0" style={{ color: '#104929' }}>My Advisees</h5>
              </div>
              
              <div className="bg-light border-bottom px-3 py-2 d-flex justify-content-between align-items-center" style={{ fontSize: '0.8rem' }}>
                <span className="text-muted fw-bold">Sort by:</span>
                <div className="d-flex gap-1">
                  <button 
                    onClick={() => handleSort('gpa')} 
                    className={`btn btn-sm ${sortConfig.key === 'gpa' ? 'btn-secondary text-white' : 'btn-outline-secondary'}`}
                    style={{ fontSize: '0.75rem', padding: '0.2rem 0.5rem' }}
                  >
                    GPA{getSortIcon('gpa')}
                  </button>
                  <button 
                    onClick={() => handleSort('credits')} 
                    className={`btn btn-sm ${sortConfig.key === 'credits' ? 'btn-secondary text-white' : 'btn-outline-secondary'}`}
                    style={{ fontSize: '0.75rem', padding: '0.2rem 0.5rem' }}
                  >
                    Progress{getSortIcon('credits')}
                  </button>
                  <button 
                    onClick={() => handleSort('admission_year')} 
                    className={`btn btn-sm ${sortConfig.key === 'admission_year' ? 'btn-secondary text-white' : 'btn-outline-secondary'}`}
                    style={{ fontSize: '0.75rem', padding: '0.2rem 0.5rem' }}
                  >
                    Year{getSortIcon('admission_year')}
                  </button>
                </div>
              </div>

              <div className="card-body p-0 overflow-auto custom-scrollbar flex-grow-1">
                {sortedStudents.map(student => {
                  const isSelected = selectedStudent?.student_id === student.student_id;
                  const status = getAcademicStatus(student);
                  
                  return (
                    <div 
                      key={student.student_id} 
                      onClick={() => setSelectedStudent(isSelected ? null : student)}
                      className={`p-3 transition-all ${isSelected ? 'bg-success bg-opacity-10' : 'bg-white hover-bg-light'}`}
                      style={{ cursor: 'pointer', borderBottom: '1px solid #f1f3f5' }}
                    >
                      <div className="d-flex justify-content-between align-items-start mb-1">
                        <h6 className={`fw-bold m-0 ${isSelected ? 'text-success' : 'text-dark'}`}>
                          {student.first_name} {student.last_name}
                        </h6>
                        <div className="d-flex gap-2 align-items-center">
                            
                            {student.unread_count > 0 && !isSelected && (
                                <span className="badge bg-secondary rounded-pill shadow-sm px-2 py-1" style={{ fontSize: '0.65rem' }}>
                                    {student.unread_count} New
                                </span>
                            )}
                            
                            <span className={`badge rounded-pill ${status.color}`} style={{ fontSize: '0.65rem' }}>
                                {status.label}
                            </span>
                        </div>
                      </div>
                      
                      <div className="small text-muted mb-2">Admitted: {student.admission_year}</div>
                      
                      <div className="d-flex justify-content-between align-items-center bg-light p-2 rounded border">
                        <div className="text-center w-50 border-end">
                          <div className="small text-muted" style={{ fontSize: '0.65rem' }}>GPA</div>
                          <div className="fw-bold" style={{ color: student.gpa < 3.0 ? '#dc3545' : '#104929' }}>
                            {student.gpa} / 5.0
                          </div>
                        </div>
                        <div className="text-center w-50">
                          <div className="small text-muted" style={{ fontSize: '0.65rem' }}>Credits</div>
                          <div className="fw-bold text-dark">
                            {student.credits_completed} <span className="fw-normal text-muted small">/ {student.total_credits_required}</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                })}
                {students.length === 0 && (
                  <div className="p-4 text-center text-muted small">No students assigned yet.</div>
                )}
              </div>
            </div>
          </div>

          <div className="col-lg-8 d-flex flex-column">
            <div className="card shadow-sm border-0 h-100 rounded-4 overflow-hidden d-flex flex-column">
              {selectedStudent ? (
                <>
                  <div className="card-header bg-white border-bottom py-3 d-flex justify-content-between align-items-center">
                    <div>
                      <h5 className="fw-bold m-0" style={{ color: '#104929' }}>
                        Chat with {selectedStudent.first_name}
                      </h5>
                      <small className="text-muted">Academic Advising Channel</small>
                    </div>
                    <button onClick={handleOpenPlanModal} className="btn btn-sm rounded px-3 fw-bold shadow-sm" style={{backgroundColor: '#eef6f1', color: '#104929', border: '1px solid #104929'}}>
                       View Full Plan
                    </button>
                  </div>

                  <div className="card-body overflow-auto p-4 custom-scrollbar" style={{ backgroundColor: '#f8f9fa' }}>
                    {messages.length === 0 ? (
                      <div className="h-100 d-flex flex-column align-items-center justify-content-center text-muted">
                         <div className="bg-white p-4 rounded-4 shadow-sm text-center border">
                            <h6 className="fw-bold text-dark">Start the conversation</h6>
                            <p className="small mb-0">Provide guidance and answer questions for {selectedStudent.first_name}.</p>
                          </div>
                      </div>
                    ) : (
                      <div className="d-flex flex-column gap-3">
                        {messages.map((msg, idx) => {
                          const isMine = msg.sender_id === user.user_id;
                          return (
                            <div key={idx} className={`d-flex ${isMine ? 'justify-content-end' : 'justify-content-start'}`}>
                              <div 
                                className={`p-3 shadow-sm ${isMine ? 'text-white' : 'bg-white border'}`}
                                style={{ 
                                  maxWidth: '75%', 
                                  backgroundColor: isMine ? '#104929' : '#fff',
                                  borderTopLeftRadius: '16px',
                                  borderTopRightRadius: '16px',
                                  borderBottomRightRadius: isMine ? '4px' : '16px',
                                  borderBottomLeftRadius: isMine ? '16px' : '4px'
                                }}
                              >
                                <p className="mb-1" style={{ fontSize: '0.95rem', lineHeight: '1.4' }}>{msg.content}</p>
                                <div className={`small text-end ${isMine ? 'text-white-50' : 'text-muted'}`} style={{ fontSize: '0.65rem' }}>
                                  {new Date(msg.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                </div>
                              </div>
                            </div>
                          );
                        })}
                        <div ref={chatEndRef} />
                      </div>
                    )}
                  </div>

                  <div className="card-footer bg-white border-top p-3">
                    <form onSubmit={handleSendMessage} className="d-flex gap-3 align-items-center">
                      <input 
                        type="text" 
                        className="form-control form-control-lg rounded-pill px-4 bg-light border-0 shadow-none" 
                        placeholder="Type your message here..." 
                        value={newMessage}
                        onChange={(e) => setNewMessage(e.target.value)}
                        style={{ fontSize: '0.95rem' }}
                      />
                      <button 
                        type="submit" 
                        className="btn rounded-pill px-4 fw-bold shadow-sm transition-all"
                        style={{ 
                            backgroundColor: newMessage.trim() ? '#104929' : '#e9ecef', 
                            color: newMessage.trim() ? '#ffffff' : '#6c757d',
                            border: 'none',
                            height: '50px'
                        }}
                        disabled={!newMessage.trim()}
                      >
                        Send
                      </button>
                    </form>
                  </div>
                </>
              ) : (
                <div className="h-100 d-flex flex-column align-items-center justify-content-center text-muted bg-light">
                  <div className="bg-white rounded-circle d-flex align-items-center justify-content-center mb-3 shadow-sm" style={{width: '80px', height: '80px'}}>
                     <span className="fs-1">👤</span>
                  </div>
                  <h4 className="fw-bold text-secondary">Select a Student</h4>
                  <p>Choose a student from the roster to view their progress and start chatting.</p>
                </div>
              )}
            </div>
          </div>

        </div>
      </div>

      {showPlanModal && (
        <div className="modal-overlay" onClick={() => setShowPlanModal(false)}>
          <div className="plan-modal shadow-lg" onClick={e => e.stopPropagation()}>
            <div className="d-flex justify-content-between align-items-center border-bottom pb-3 mb-4">
              <h3 className="fw-bold m-0" style={{ color: '#104929' }}>Student Plan Overview</h3>
              <button className="btn-close" onClick={() => setShowPlanModal(false)}></button>
            </div>
            
            <div className="overflow-auto custom-scrollbar" style={{ maxHeight: '60vh', paddingRight: '15px' }}>
                
                <h5 className="fw-bold mb-3 border-bottom pb-2 text-primary">Academic History</h5>
                {studentGrades.length > 0 ? (
                    <table className="table table-sm table-bordered">
                        <thead className="table-light">
                            <tr>
                                <th>Course</th>
                                <th>Name</th>
                                <th>Credits</th>
                                <th>Grade/Status</th>
                            </tr>
                        </thead>
                        <tbody>
                            {studentGrades.map((c, i) => (
                                <tr key={i}>
                                    <td className="fw-bold">{c.course_prefix}-{c.course_number}</td>
                                    <td>{c.course_name}</td>
                                    <td>{c.credits}</td>
                                    <td>
                                        {c.status === 'completed' ? <span className="badge bg-success">{c.grade}</span> : <span className="badge bg-primary">In Progress</span>}
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                ) : <p className="text-muted small">No history available.</p>}

                <h5 className="fw-bold mb-3 mt-5 border-bottom pb-2 text-warning">Upcoming Draft Plan</h5>
                {studentDraft && studentDraft.courses && studentDraft.courses.length > 0 ? (
                     <table className="table table-sm table-bordered">
                     <thead className="table-light">
                         <tr>
                             <th>Course</th>
                             <th>Name</th>
                             <th>Credits</th>
                         </tr>
                     </thead>
                     <tbody>
                         {studentDraft.courses.map((c, i) => (
                             <tr key={i}>
                                 <td className="fw-bold">{c.course_prefix}-{c.course_number}</td>
                                 <td>{c.course_name}</td>
                                 <td>{c.credits}</td>
                             </tr>
                         ))}
                     </tbody>
                 </table>
                ) : <p className="text-muted small">The student has not drafted any courses for the upcoming semester yet.</p>}

            </div>
            
            <div className="text-end pt-3 mt-3 border-top">
                <button className="btn btn-secondary px-4 fw-bold" onClick={() => setShowPlanModal(false)}>Close</button>
            </div>
          </div>
        </div>
      )}
      
      <style>{`
        .custom-scrollbar::-webkit-scrollbar { width: 6px; }
        .custom-scrollbar::-webkit-scrollbar-track { background: transparent; }
        .custom-scrollbar::-webkit-scrollbar-thumb { background-color: rgba(16, 73, 41, 0.2); border-radius: 10px; }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover { background-color: rgba(16, 73, 41, 0.4); }
        
        .hover-bg-light:hover { background-color: #f8f9fa !important; }
        
        .modal-overlay { position: fixed; top: 0; left: 0; width: 100%; height: 100%; background: rgba(0,0,0,0.6); z-index: 10000; display: flex; align-items: center; justify-content: center; backdrop-filter: blur(4px); }
        .plan-modal { background: white; padding: 40px; border-radius: 15px; width: 850px; max-height: 85vh; display: flex; flex-direction: column; }
      `}</style>
    </div>
  );
}

export default SupervisorDashboard;