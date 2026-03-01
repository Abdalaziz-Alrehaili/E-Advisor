import React, { useState, useEffect } from 'react';

function AdminDashboard() {
  const [semesters, setSemesters] = useState([]);
  const [pendingPlans, setPendingPlans] = useState([]);
  
  // State for toggling the creation form
  const [showCreateForm, setShowCreateForm] = useState(false);
  
  // State for the new semester form
  const [newTerm, setNewTerm] = useState('First Semester');
  const [newYear, setNewYear] = useState('2026-2027');
  const [newRuleId, setNewRuleId] = useState('1');

  useEffect(() => {
    fetchAdminData();
  }, []);

  const fetchAdminData = () => {
    fetch('http://localhost:5000/admin/semesters')
      .then(res => res.json())
      .then(data => setSemesters(data))
      .catch(err => console.error(err));

    fetch('http://localhost:5000/admin/plans')
      .then(res => res.json())
      .then(data => setPendingPlans(data))
      .catch(err => console.error(err));
  };

  const toggleRegistration = (semesterId, currentStatus) => {
    fetch(`http://localhost:5000/admin/semesters/${semesterId}/toggle`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ is_open: !currentStatus })
    })
    .then(res => res.json())
    .then(data => {
      if (data.success) fetchAdminData();
    });
  };

  const approvePlan = (buildId) => {
    fetch(`http://localhost:5000/admin/plans/${buildId}/approve`, {
      method: 'PUT'
    })
    .then(res => res.json())
    .then(data => {
      if (data.success) {
        alert("Plan approved successfully!");
        fetchAdminData();
      }
    });
  };

  // Handle changing the term dropdown to automatically suggest the right rule
  const handleTermChange = (e) => {
    const selectedTerm = e.target.value;
    setNewTerm(selectedTerm);
    if (selectedTerm === 'First Semester') setNewRuleId('1');
    if (selectedTerm === 'Second Semester') setNewRuleId('2');
    if (selectedTerm === 'Summer Semester') setNewRuleId('3');
  };

  const handleCreateSemester = (e) => {
    e.preventDefault();
    
    // Combine the term and year (e.g., "First Semester" + "2026-2027")
    const finalSemesterName = `${newTerm} ${newYear}`;

    fetch('http://localhost:5000/admin/semesters', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ semester_name: finalSemesterName, rule_id: newRuleId })
    })
    .then(res => res.json())
    .then(data => {
      if (data.success) {
        setShowCreateForm(false); // Hide the form on success
        setNewYear('2026-2027');  // Reset the year
        fetchAdminData();         // Refresh the table instantly
      } else {
        alert("Error: " + data.error);
      }
    })
    .catch(err => console.error(err));
  };

  return (
    <div className="container my-5 text-start">
      <h2 className="fw-bold mb-4" style={{ color: '#104929' }}>Admin Dashboard</h2>

      {/* Control Panel 1: Semester Registration Management */}
      <div className="card shadow-sm mb-5 border-0">
        <div className="card-header text-white d-flex justify-content-between align-items-center">
          
          <button 
            onClick={() => setShowCreateForm(!showCreateForm)} 
            className="btn btn-sm btn-outline-light fw-bold"
            style={{ borderRadius: '20px', backgroundColor: '#104929', borderColor: '#104929' }}
          >
            {showCreateForm ? 'Cancel ✖' : '+ Create a New Sem'}
          </button>
        </div>
        <br />
        {/* Toggleable Semester Creation Form */}
        {showCreateForm && (
          <div className="card-body bg-light border-bottom p-4">
            <form onSubmit={handleCreateSemester}>
              
              {/* Row 1: Term (Dropdown) and Year (Input) */}
              <div className="row g-3 mb-3">
                <div className="col-md-6">
                  <label className="form-label fw-bold small text-muted">Semester Term</label>
                  <select className="form-select" value={newTerm} onChange={handleTermChange}>
                    <option value="First Semester">First Semester</option>
                    <option value="Second Semester">Second Semester</option>
                    <option value="Summer Semester">Summer Semester</option>
                  </select>
                </div>
                <div className="col-md-6">
                  <label className="form-label fw-bold small text-muted">Academic Year</label>
                  <input 
                    type="text" 
                    className="form-control" 
                    placeholder="e.g., 2026-2027 or 2027"
                    value={newYear}
                    onChange={(e) => setNewYear(e.target.value)}
                    required
                  />
                </div>
              </div>

              {/* Row 2: Type/Rule (Dropdown) */}
              <div className="row g-3 mb-4">
                <div className="col-md-12">
                  <label className="form-label fw-bold small text-muted">Credit Limits (Rule Type)</label>
                  <select 
                    className="form-select" 
                    value={newRuleId}
                    onChange={(e) => setNewRuleId(e.target.value)}
                  >
                    <option value="1">Fall / First Semester Rules (12-18 Cr)</option>
                    <option value="2">Spring / Second Semester Rules (12-18 Cr)</option>
                    <option value="3">Summer Rules (2-9 Cr)</option>
                  </select>
                </div>
              </div>

              {/* Row 3: Submit Button */}
              <div className="text-end">
                <button type="submit" className="btn btn-primary px-4 fw-bold" style={{ backgroundColor: '#104929', borderColor: '#104929' }}>
                  Submit New Semester
                </button>
              </div>

            </form>
          </div>
        )}
<br />
        {/* Existing Table */}
        <div className="card-body p-0">
          <table className="table table-hover mb-0 align-middle">
            <thead className="table-light">
              <tr>
                <th className="px-4">Semester Name</th>
                <th>Rule Type</th>
                <th>Status</th>
                <th className="text-end px-4">Action</th>
              </tr>
            </thead>
            <tbody>
              {semesters.map(sem => (
                <tr key={sem.semester_id}>
                  <td className="px-4 fw-bold">{sem.semester_name}</td>
                  <td>
                    {sem.rule_id === 1 && 'Fall (Type 1)'}
                    {sem.rule_id === 2 && 'Spring (Type 2)'}
                    {sem.rule_id === 3 && 'Summer (Type 3)'}
                  </td>
                  <td>
                    <span className={`badge ${sem.is_registration_open ? 'bg-success' : 'bg-secondary'}`}>
                      {sem.is_registration_open ? 'OPEN' : 'CLOSED'}
                    </span>
                  </td>
                  <td className="text-end px-4">
                    <button 
                      onClick={() => toggleRegistration(sem.semester_id, sem.is_registration_open)}
                      className={`btn btn-sm ${sem.is_registration_open ? 'btn-danger' : 'btn-success'}`}
                      style={{ width: '120px', fontWeight: 'bold' }}
                    >
                      {sem.is_registration_open ? 'Close Window' : 'Open Window'}
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Control Panel 2: Pending Student Plans (Unchanged) */}
      <div className="card shadow-sm border-0">
        <div className="card-header text-dark" style={{ backgroundColor: '#b9915e' }}>
          <h5 className="mb-0 text-white">Pending Student Plans</h5>
        </div>
        <div className="card-body p-0">
          {pendingPlans.length > 0 ? (
            <table className="table table-hover mb-0 align-middle">
              <thead className="table-light">
                <tr>
                  <th className="px-4">Student Name</th>
                  <th>Target Semester</th>
                  <th>Course IDs</th>
                  <th className="text-end px-4">Action</th>
                </tr>
              </thead>
              <tbody>
                {pendingPlans.map(plan => (
                  <tr key={plan.build_id}>
                    <td className="px-4">
                      <strong>{plan.first_name} {plan.last_name}</strong><br/>
                      <span className="text-muted small">{plan.email}</span>
                    </td>
                    <td>{plan.semester_name}</td>
                    <td style={{ maxWidth: '200px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                      {plan.selected_courses_json}
                    </td>
                    <td className="text-end px-4">
                      <button 
                        onClick={() => approvePlan(plan.build_id)}
                        className="btn btn-success btn-sm fw-bold px-3"
                      >
                        Approve Plan
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          ) : (
            <div className="p-4 text-center text-muted">No pending plans to review.</div>
          )}
        </div>
      </div>
    </div>
  );
}

export default AdminDashboard;