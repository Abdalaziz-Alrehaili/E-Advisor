import React, { useState, useEffect } from 'react';

function AdminDashboard() {
  const [buttons, setButtons] = useState([]);
  
  // State for our Date Picker Modal
  const [openPrompt, setOpenPrompt] = useState(null);
  const [closeDate, setCloseDate] = useState('');

  useEffect(() => {
    fetchBoard();
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

  return (
    <div className="full-width-white-box pt-4">
      
      {/* INJECTED CSS: This physically tints the browser's native calendar icon to match #104929 */}
      <style>{`
        .custom-green-date::-webkit-calendar-picker-indicator {
          filter: invert(21%) sepia(42%) saturate(526%) hue-rotate(103deg) brightness(95%) contrast(92%);
          cursor: pointer;
        }
      `}</style>

      <div className="centered-content-container">
        
        <div className="text-center mb-5">
          <h1 className="fw-bold" style={{ color: '#104929' }}>Registration Period Controller</h1>
        </div>

        {/* --- THE 3 BIG BUTTONS --- */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '40px', width: '100%', maxWidth: '1400px' }}>
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

      </div>

      {/* --- DATE PICKER MODAL --- */}
      {openPrompt && (
        <div 
            className="bg-white rounded text-start" 
            style={{ 
                position: 'fixed', 
                top: '50%', 
                left: '50%', 
                transform: 'translate(-50%, -50%)', 
                zIndex: 9999, 
                width: '550px', 
                padding: '50px', 
                borderTop: '8px solid #1a9044',
                borderLeft: '1px solid #ddd',
                borderRight: '1px solid #ddd',
                borderBottom: '1px solid #ddd',
                boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.5)'
            }}
        >
            <h3 className="fw-bold mb-3" style={{ color: '#104929' }}>Set Registration Deadline</h3>
            
            <p className="text-muted mb-4" style={{ fontSize: '1.05rem' }}>
                Set a deadline so students know when they must finalize their <strong>{openPrompt.semester_name}</strong> plan.
            </p>
            
            <label className="fw-bold mb-2" style={{ color: '#104929' }}>Approximate Closing Date:</label>
            <input 
                type="date" 
                /* Added the custom-green-date class right here! */
                className="form-control form-control-lg mb-4 custom-green-date" 
                value={closeDate} 
                onChange={e => setCloseDate(e.target.value)}
                style={{ border: '2px solid #104929', cursor: 'pointer', color: '#104929', colorScheme: 'light' }}
            />
            
            <div className="d-flex justify-content-end gap-3 mt-4">
                <button 
                  className="btn btn-secondary fw-bold px-4 py-2" 
                  onClick={() => setOpenPrompt(null)}
                  style={{ color: '#ffffff' }}
                >
                  Cancel
                </button>
                <button 
                  className="btn btn-success fw-bold px-4 py-2" 
                  onClick={confirmOpen} 
                  disabled={!closeDate}
                  style={{ color: '#000000' }}
                >
                  Confirm & Open
                </button>
            </div>
        </div>
      )}
    </div>
  );
}

export default AdminDashboard;