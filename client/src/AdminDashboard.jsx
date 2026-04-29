import React, { useState, useEffect } from 'react';

function AdminDashboard() {
  const [buttons, setButtons] = useState([]);
  
  // State for our Date Picker Modal
  const [openPrompt, setOpenPrompt] = useState(null);
  const [closeDate, setCloseDate] = useState('');

  // State for Section Capacity Management
  const [sectionsList, setSectionsList] = useState([]);
  const [editCapacityPrompt, setEditCapacityPrompt] = useState(null);
  const [newCapacity, setNewCapacity] = useState('');
  
  // --- NEW: State for Search Functionality ---
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    fetchBoard();
    fetchSections();
  }, []);

  const fetchBoard = () => {
    fetch('http://localhost:5000/admin/semester-board')
      .then(res => res.json())
      .then(data => {
          if (data.error) alert(data.error);
          else setButtons(data);
      })
      .catch(err => console.error("Error fetching board:", err));
  };

  const fetchSections = () => {
      fetch('http://localhost:5000/admin/sections')
      .then(res => res.json())
      .then(data => {
          if (data.error) console.error(data.error);
          else setSectionsList(data);
      })
      .catch(err => console.error("Error fetching sections:", err));
  };

  const handleActionClick = (btn) => {
    if (btn.state === 'grey') return;

    if (btn.state === 'green') {
        setOpenPrompt(btn);
        setCloseDate('');
    } else {
        if (window.confirm(`Are you sure you want to CLOSE registration for ${btn.semester_name} and generate next year's?`)) {
            executeAction(btn.semester_id, 'close', btn.semester_name, null);
        }
    }
  };

  const confirmOpen = () => {
      if (!closeDate) return alert("Please select a closing date.");
      executeAction(openPrompt.semester_id, 'open', openPrompt.semester_name, closeDate);
      setOpenPrompt(null);
  };

  const executeAction = (semester_id, action, semester_name, close_date) => {
      fetch('http://localhost:5000/admin/semester-action', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ semester_id, action, semester_name, close_date })
      })
      .then(res => res.json())
      .then(data => {
          if (data.success) fetchBoard();
          else alert("Error processing action");
      });
  };

  const handleUpdateCapacity = () => {
      if (!newCapacity || isNaN(newCapacity) || newCapacity < 1) {
          return alert("Please enter a valid number greater than 0.");
      }

      fetch(`http://localhost:5000/admin/sections/${editCapacityPrompt.section_id}/capacity`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ max_capacity: newCapacity })
      })
      .then(res => res.json())
      .then(data => {
          if (data.success) {
              fetchSections(); 
              setEditCapacityPrompt(null); 
          } else {
              alert("Error updating capacity");
          }
      })
      .catch(err => console.error("Update error:", err));
  };

  // --- NEW: Filter the sections based on the search term ---
  const filteredSections = sectionsList.filter(sec => {
      const search = searchTerm.toLowerCase();
      const courseCode = `${sec.course_prefix}-${sec.course_number}`.toLowerCase();
      return (
          courseCode.includes(search) ||
          sec.course_name.toLowerCase().includes(search) ||
          sec.section_name.toLowerCase().includes(search)
      );
  });

  return (
    <div className="full-width-white-box pt-4">
      
      <style>{`
        .custom-green-date::-webkit-calendar-picker-indicator {
          filter: invert(21%) sepia(42%) saturate(526%) hue-rotate(103deg) brightness(95%) contrast(92%);
          cursor: pointer;
        }
        .modal-overlay { position: fixed; top: 0; left: 0; width: 100%; height: 100%; background: rgba(0,0,0,0.6); z-index: 10000; display: flex; align-items: center; justify-content: center; backdrop-filter: blur(4px); }
        .search-icon { position: absolute; left: 15px; top: 50%; transform: translateY(-50%); color: #6c757d; }
      `}</style>

      <div className="centered-content-container pb-5">
        
        <div className="text-center mb-5">
          <h1 className="fw-bold" style={{ color: '#104929' }}>Registration Period Controller</h1>
        </div>

        <div className="mb-5" style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '40px', width: '100%', maxWidth: '1400px' }}>
          {buttons.map((btn, idx) => (
            <div key={idx}>
              <div 
                className={`admin-big-btn ${btn.state} shadow-sm w-100`}
                onClick={() => handleActionClick(btn)}
              >
                <h2 className="fw-bold mb-4" style={{ letterSpacing: '0.5px' }}>{btn.semester_name}</h2>
                
                <div className="badge px-5 py-3 fs-5 rounded-pill shadow-sm" style={{ backgroundColor: 'rgba(255,255,255,0.9)', color: '#000000' }}>
                  {btn.state === 'green' && '🟢 CLICK TO OPEN'}
                  {btn.state === 'red' && '🔴 CLICK TO CLOSE'}
                  {btn.state === 'grey' && '🔒 LOCKED (WAITING TURN)'}
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* --- CAPACITY MANAGER WITH SEARCH BAR --- */}
        <div className="w-100 mt-5 pt-4 border-top" style={{ maxWidth: '1400px', margin: '0 auto' }}>
            
            <div className="d-flex justify-content-between align-items-center mb-4">
                <h2 className="fw-bold m-0" style={{ color: '#104929' }}>Course Section Capacities</h2>
                
                {/* --- NEW: Search Bar UI --- */}
                <div className="position-relative" style={{ width: '350px' }}>
                    <i className="bi bi-search search-icon"></i>
                    <input 
                        type="text" 
                        className="form-control rounded-pill shadow-sm" 
                        placeholder="Search by course code or name..." 
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        style={{ paddingLeft: '40px', border: '1px solid #ced4da' }}
                    />
                </div>
            </div>

            <div className="bg-white rounded shadow-sm border overflow-hidden">
                <table className="table table-hover align-middle mb-0">
                    <thead className="table-light">
                        <tr>
                            <th className="px-4 py-3">Course</th>
                            <th className="px-4 py-3">Name</th>
                            <th className="px-4 py-3 text-center">Section</th>
                            <th className="px-4 py-3 text-center">Enrollment / Capacity</th>
                            <th className="px-4 py-3 text-end">Action</th>
                        </tr>
                    </thead>
                    <tbody>
                        {filteredSections.length > 0 ? (
                            filteredSections.map((sec) => {
                                const isFull = sec.enrolled_count >= sec.max_capacity;
                                return (
                                    <tr key={sec.section_id}>
                                        <td className="px-4 fw-bold text-secondary">{sec.course_prefix}-{sec.course_number}</td>
                                        <td className="px-4">{sec.course_name}</td>
                                        <td className="px-4 text-center"><span className="badge bg-secondary">{sec.section_name}</span></td>
                                        <td className="px-4 text-center">
                                            <span className={`fw-bold ${isFull ? 'text-danger' : 'text-success'}`}>
                                                {sec.enrolled_count}
                                            </span>
                                            <span className="text-muted"> / {sec.max_capacity}</span>
                                        </td>
                                        <td className="px-4 text-end">
                                            <button 
                                                className="btn btn-sm btn-outline-dark fw-bold px-3"
                                                onClick={() => {
                                                    setEditCapacityPrompt(sec);
                                                    setNewCapacity(sec.max_capacity);
                                                }}
                                            >
                                                Adjust Limit
                                            </button>
                                        </td>
                                    </tr>
                                );
                            })
                        ) : (
                            <tr>
                                <td colSpan="5" className="text-center py-5 text-muted">
                                    No courses found matching "{searchTerm}"
                                </td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>
        </div>

      </div>

      {openPrompt && (
        <div className="modal-overlay">
            <div className="bg-white rounded text-start" style={{ width: '550px', padding: '50px', borderTop: '8px solid #1a9044', boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.5)' }}>
                <h3 className="fw-bold mb-3" style={{ color: '#104929' }}>Set Registration Deadline</h3>
                <p className="text-muted mb-4" style={{ fontSize: '1.05rem' }}>Set a deadline so students know when they must finalize their <strong>{openPrompt.semester_name}</strong> plan.</p>
                
                <label className="fw-bold mb-2" style={{ color: '#104929' }}>Approximate Closing Date:</label>
                <input 
                    type="date" 
                    className="form-control form-control-lg mb-4 custom-green-date" 
                    value={closeDate} 
                    onChange={e => setCloseDate(e.target.value)}
                    style={{ border: '2px solid #104929', cursor: 'pointer', color: '#104929' }}
                />
                
                <div className="d-flex justify-content-end gap-3 mt-4">
                    <button className="btn btn-secondary fw-bold px-4 py-2" onClick={() => setOpenPrompt(null)}>Cancel</button>
                    <button className="btn btn-success fw-bold px-4 py-2" onClick={confirmOpen} disabled={!closeDate} style={{ color: '#000000' }}>Confirm & Open</button>
                </div>
            </div>
        </div>
      )}

      {editCapacityPrompt && (
          <div className="modal-overlay">
             <div className="bg-white rounded text-start" style={{ width: '500px', padding: '40px', borderTop: '8px solid #1a9044', boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.5)' }}>
                <h4 className="fw-bold mb-1" style={{ color: '#104929' }}>Adjust Class Capacity</h4>
                <p className="text-muted mb-4 border-bottom pb-3">
                    {editCapacityPrompt.course_prefix}-{editCapacityPrompt.course_number} ({editCapacityPrompt.section_name})
                </p>

                <div className="mb-4">
                    <label className="fw-bold mb-2">Maximum Students Allowed:</label>
                    <input 
                        type="number" 
                        min="1"
                        className="form-control form-control-lg text-center fw-bold" 
                        value={newCapacity}
                        onChange={(e) => setNewCapacity(e.target.value)}
                        style={{ border: '2px solid #dee2e6', fontSize: '1.5rem' }}
                    />
                    <div className="form-text mt-2">
                        Currently enrolled: <strong>{editCapacityPrompt.enrolled_count}</strong> students.
                    </div>
                </div>

                <div className="d-flex justify-content-end gap-3 mt-4">
                    <button className="btn btn-secondary fw-bold px-4 py-2" onClick={() => setEditCapacityPrompt(null)}>Cancel</button>
                    <button className="btn btn-success fw-bold px-4 py-2" onClick={handleUpdateCapacity} style={{ color: '#000000' }}>Save Changes</button>
                </div>
             </div>
          </div>
      )}

    </div>
  );
}

export default AdminDashboard;