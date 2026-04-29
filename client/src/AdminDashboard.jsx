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
  const [searchTerm, setSearchTerm] = useState('');

  // --- NEW: State & Data for Adding Classes ---
  const [allCourses, setAllCourses] = useState([]);
  const [showAddModal, setShowAddModal] = useState(false);
  
  // Pre-defined options based on your database seed
  const predefinedProfessors = [
    'Dr. Ahmad Mansour', 'Dr. Khaled Al-Sayed', 'Prof. Mustafa Osman',
    'Dr. Ibrahim Hassan', 'Dr. Omar Bakri', 'Dr. Sami Al-Qahtani',
    'Dr. Yahya Jameel', 'Prof. Nasser Idris', 'Dr. Suleiman Taha', 'Dr. Waleed Saeed'
  ];
  
  const predefinedRooms = [
    'Bldg 1-R106', 'Bldg 1-R114', 'Bldg 1-R116', 'Bldg 1-R118', 'Bldg 1-R133', 'Bldg 1-R135', 'Bldg 1-R141', 'Bldg 1-R147',
    'Bldg 2-R106', 'Bldg 2-R110', 'Bldg 2-R138', 'Bldg 2-R147',
    'Bldg 3-R100', 'Bldg 3-R101', 'Bldg 3-R106', 'Bldg 3-R112', 'Bldg 3-R119', 'Bldg 3-R122', 'Bldg 3-R126', 'Bldg 3-R130', 'Bldg 3-R138', 'Bldg 3-R139', 'Bldg 3-R149'
  ];

  // The custom time slots exactly as requested!
  const predefinedTimeSlots = [
    { label: 'Sun-Tue-Thu (08:00 AM - 09:20 AM)', days: 'Sun-Tue-Thu', start: '08:00:00', end: '09:20:00' },
    { label: 'Mon-Wed (08:00 AM - 09:20 AM)', days: 'Mon-Wed', start: '08:00:00', end: '09:20:00' },
    { label: 'Sun-Tue-Thu (10:00 AM - 11:00 AM)', days: 'Sun-Tue-Thu', start: '10:00:00', end: '11:00:00' },
    { label: 'Mon-Wed (10:00 AM - 11:20 AM)', days: 'Mon-Wed', start: '10:00:00', end: '11:20:00' },
    { label: 'Sun-Tue-Thu (01:00 PM - 02:20 PM)', days: 'Sun-Tue-Thu', start: '13:00:00', end: '14:20:00' },
    { label: 'Mon-Wed (01:00 PM - 02:20 PM)', days: 'Mon-Wed', start: '13:00:00', end: '14:20:00' }
  ];

  const [addFormData, setAddFormData] = useState({
      course_id: '',
      section_name: 'S3', // Defaults to S3 assuming S1 and S2 exist
      professor_name: predefinedProfessors[0],
      timeSlotIndex: 0,
      room_number: predefinedRooms[0],
      max_capacity: 30
  });

  useEffect(() => {
    fetchBoard();
    fetchSections();
    
    // Fetch all courses so the Admin can pick which course to add a section for
    fetch('http://localhost:5000/courses')
        .then(res => res.json())
        .then(data => {
            // Sort them nicely (e.g., CPIS-210, CPIS-220)
            const sorted = data.sort((a,b) => (a.course_prefix+a.course_number).localeCompare(b.course_prefix+b.course_number));
            setAllCourses(sorted);
            if(sorted.length > 0) {
                setAddFormData(prev => ({ ...prev, course_id: sorted[0].course_id }));
            }
        })
        .catch(err => console.error("Error fetching courses:", err));
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

  // --- NEW: Function to submit the new Class Section ---
  const handleAddNewSection = (e) => {
      e.preventDefault();
      
      const selectedTime = predefinedTimeSlots[addFormData.timeSlotIndex];
      
      const payload = {
          course_id: addFormData.course_id,
          section_name: addFormData.section_name,
          professor_name: addFormData.professor_name,
          days: selectedTime.days,
          start_time: selectedTime.start,
          end_time: selectedTime.end,
          room_number: addFormData.room_number,
          max_capacity: addFormData.max_capacity
      };

      fetch('http://localhost:5000/admin/sections', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload)
      })
      .then(res => res.json())
      .then(data => {
          if (data.success) {
              fetchSections(); // Refresh the table
              setShowAddModal(false); // Close the modal
              // Reset the section name to S4, S5 etc to make adding multiples easy
              setAddFormData(prev => ({ ...prev, section_name: 'S' + (parseInt(prev.section_name.replace('S', '')) + 1) }));
          } else {
              alert("Error adding section: " + data.error);
          }
      })
      .catch(err => console.error("Error adding section:", err));
  };

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

        {/* --- CAPACITY MANAGER WITH SEARCH BAR & ADD BUTTON --- */}
        <div className="w-100 mt-5 pt-4 border-top" style={{ maxWidth: '1400px', margin: '0 auto' }}>
            
            <div className="d-flex justify-content-between align-items-center mb-4">
                <h2 className="fw-bold m-0" style={{ color: '#104929' }}>Course Section Capacities</h2>
                
                <div className="d-flex gap-3 align-items-center">
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
                    
                    {/* NEW: Add Class Button */}
                    <button 
                        className="btn fw-bold shadow-sm d-flex align-items-center gap-2 px-4" 
                        style={{ backgroundColor: '#104929', color: 'white', borderRadius: '30px' }}
                        onClick={() => setShowAddModal(true)}
                    >
                        <i className="bi bi-plus-lg"></i> Add Section
                    </button>
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

      {/* --- ADD NEW SECTION MODAL --- */}
      {showAddModal && (
          <div className="modal-overlay">
             <div className="bg-white rounded text-start" style={{ width: '600px', padding: '40px', borderTop: '8px solid #104929', boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.5)', maxHeight: '90vh', overflowY: 'auto' }}>
                <h3 className="fw-bold mb-1" style={{ color: '#104929' }}>Add New Class Section</h3>
                <p className="text-muted mb-4 border-bottom pb-3">Open a new section for the upcoming semester.</p>

                <form onSubmit={handleAddNewSection}>
                    <div className="mb-3">
                        <label className="fw-bold mb-1">Select Course:</label>
                        <select 
                            className="form-select" 
                            value={addFormData.course_id}
                            onChange={(e) => setAddFormData({...addFormData, course_id: e.target.value})}
                            required
                        >
                            {allCourses.map(c => (
                                <option key={c.course_id} value={c.course_id}>
                                    {c.course_prefix}-{c.course_number}: {c.course_name}
                                </option>
                            ))}
                        </select>
                    </div>

                    <div className="row mb-3">
                        <div className="col-md-4">
                            <label className="fw-bold mb-1">Section ID:</label>
                            <input 
                                type="text" 
                                className="form-control fw-bold" 
                                value={addFormData.section_name}
                                onChange={(e) => setAddFormData({...addFormData, section_name: e.target.value})}
                                required
                            />
                        </div>
                        <div className="col-md-8">
                            <label className="fw-bold mb-1">Max Capacity:</label>
                            <input 
                                type="number" 
                                className="form-control fw-bold" 
                                min="1"
                                value={addFormData.max_capacity}
                                onChange={(e) => setAddFormData({...addFormData, max_capacity: parseInt(e.target.value)})}
                                required
                            />
                        </div>
                    </div>

                    <div className="mb-3">
                        <label className="fw-bold mb-1">Assign Professor:</label>
                        <select 
                            className="form-select" 
                            value={addFormData.professor_name}
                            onChange={(e) => setAddFormData({...addFormData, professor_name: e.target.value})}
                        >
                            {predefinedProfessors.map((p, i) => <option key={i} value={p}>{p}</option>)}
                        </select>
                    </div>

                    <div className="mb-3">
                        <label className="fw-bold mb-1">Days & Time Slot:</label>
                        <select 
                            className="form-select" 
                            value={addFormData.timeSlotIndex}
                            onChange={(e) => setAddFormData({...addFormData, timeSlotIndex: e.target.value})}
                        >
                            {predefinedTimeSlots.map((ts, i) => (
                                <option key={i} value={i}>{ts.label}</option>
                            ))}
                        </select>
                    </div>

                    <div className="mb-4">
                        <label className="fw-bold mb-1">Room Assignment:</label>
                        <select 
                            className="form-select" 
                            value={addFormData.room_number}
                            onChange={(e) => setAddFormData({...addFormData, room_number: e.target.value})}
                        >
                            {predefinedRooms.map((r, i) => <option key={i} value={r}>{r}</option>)}
                        </select>
                    </div>

                    <div className="d-flex justify-content-end gap-3 mt-4 pt-3 border-top">
                        <button type="button" className="btn btn-secondary fw-bold px-4 py-2" onClick={() => setShowAddModal(false)}>Cancel</button>
                        <button type="submit" className="btn fw-bold px-4 py-2" style={{ backgroundColor: '#104929', color: 'white' }}>Create Section</button>
                    </div>
                </form>
             </div>
          </div>
      )}

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