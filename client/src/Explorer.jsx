import { useEffect, useState } from 'react';

function Explorer() {
  const [view, setView] = useState('users'); 
  const [data, setData] = useState([]);
  
  // Full list of all tables matching your schema
  const tables = [
    'users', 'students', 'faculties', 'departments', 
    'programs', 'program_requirements', 'courses', 
    'prerequisites', 'semesters', 'semester_rules', 
    'sections', 'enrollments', 'build_semester'
  ];
 
  useEffect(() => {
    fetch(`http://localhost:5000/${view}`)
      .then(res => res.json())
      .then(json => {
        if (json.error) {
            console.error(json.error);
            setData([]);
        } else {
            setData(json);
        }
      })
      .catch(err => console.error("Error:", err));
  }, [view]);
 
  return (
    <div style={{ padding: '30px', backgroundColor: '#dee6e1', minHeight: '100vh', color: 'white', width: '100vw', marginLeft: 'calc(-50vw + 50%)' }}>
      <div className="container bg-white p-4 rounded shadow" style={{ maxWidth: '1200px', margin: '0 auto' }}>
        <h2 className="text-dark mb-4 border-bottom pb-2">🛠️ E-Advisor Database Explorer</h2>
        
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px', marginBottom: '25px' }}>
          {tables.map(table => (
            <button 
                key={table} 
                onClick={() => setView(table)} 
                className={`btn btn-sm ${view === table ? 'btn-success' : 'btn-outline-secondary'}`}
                style={{ textTransform: 'uppercase', fontSize: '0.75rem', fontWeight: 'bold' }}
            >
              {table.replace('_', ' ')}
            </button>
          ))}
        </div>

        <div style={{ background: '#f8f9fa', color: '#333', padding: '15px', borderRadius: '8px', overflowX: 'auto', border: '1px solid #ddd' }}>
          {data.length > 0 ? (
            <table className="table table-striped table-hover table-bordered small mb-0">
              <thead className="table-dark">
                <tr>
                  {Object.keys(data[0]).map(k => <th key={k} style={{ whiteSpace: 'nowrap' }}>{k}</th>)}
                </tr>
              </thead>
              <tbody>
                {data.map((item, i) => (
                  <tr key={i}>
                    {Object.values(item).map((v, j) => (
                        <td key={j}>
                            {typeof v === 'object' && v !== null ? JSON.stringify(v) : String(v)}
                        </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          ) : (
            <div className="text-center py-5 text-muted">
              <h5>No data found in {view.toUpperCase()}</h5>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default Explorer;