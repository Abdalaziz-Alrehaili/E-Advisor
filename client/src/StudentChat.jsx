import React, { useState, useEffect, useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { io } from 'socket.io-client';

const socket = io('http://localhost:5000');

function StudentChat({ user }) {
  const navigate = useNavigate();
  const [supervisorInfo, setSupervisorInfo] = useState(null);
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  const [loading, setLoading] = useState(true);
  const chatEndRef = useRef(null);

  useEffect(() => {
    if (!user || user.role !== 'student') {
      navigate('/');
      return;
    }

    socket.emit('join_user_room', user.user_id);

    fetch(`http://localhost:5000/api/student/${user.user_id}/supervisor-info`)
      .then(res => res.json())
      .then(data => {
        setSupervisorInfo(data);
        setLoading(false);
      })
      .catch(err => {
        console.error("Error fetching supervisor info:", err);
        setLoading(false);
      });
  }, [user, navigate]);

  useEffect(() => {
    if (supervisorInfo && user) {
      fetch('http://localhost:5000/api/chat/mark-read', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ sender_id: supervisorInfo.supervisor_id, receiver_id: user.user_id })
      }).catch(err => console.error("Error marking messages read:", err));

      fetch(`http://localhost:5000/api/chat/history/${user.user_id}/${supervisorInfo.supervisor_id}`)
        .then(res => res.json())
        .then(data => setMessages(data))
        .catch(err => console.error("Error fetching chat history:", err));
    }
  }, [supervisorInfo, user]);

  useEffect(() => {
    const handleReceiveMessage = (message) => {
      if (supervisorInfo && (message.sender_id === supervisorInfo.supervisor_id || message.receiver_id === supervisorInfo.supervisor_id)) {
        setMessages((prev) => [...prev, message]);
        
        if (message.receiver_id === user.user_id) {
            fetch('http://localhost:5000/api/chat/mark-read', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ sender_id: supervisorInfo.supervisor_id, receiver_id: user.user_id })
            }).catch(e => console.error(e));
        }
      }
    };

    socket.on('receive_message', handleReceiveMessage);
    return () => socket.off('receive_message', handleReceiveMessage);
  }, [supervisorInfo, user]);

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const handleSendMessage = (e) => {
    e.preventDefault();
    if (!newMessage.trim() || !supervisorInfo || !user) return;

    const messageData = {
      sender_id: user.user_id,
      receiver_id: supervisorInfo.supervisor_id,
      content: newMessage.trim()
    };

    socket.emit('send_message', messageData);
    setNewMessage(''); 
  };

  if (loading) {
    return (
      <div className="min-vh-100 d-flex justify-content-center align-items-center bg-light">
        <div className="spinner-border text-success" role="status"></div>
      </div>
    );
  }

  if (!supervisorInfo) {
    return (
      <div className="container mt-5">
        <div className="alert alert-warning text-center p-5 shadow-sm rounded-4">
          <h4 className="fw-bold">No Supervisor Assigned</h4>
          <p>You currently do not have an academic supervisor assigned to your profile. Please contact administration.</p>
          <Link to="/profile" className="btn btn-outline-dark mt-3 fw-bold px-4">⬅ Back to Profile</Link>
        </div>
      </div>
    );
  }

  return (
    <div className="container-fluid bg-light py-4" style={{ minHeight: 'calc(100vh - 100px)' }}>
      <div className="container d-flex justify-content-center">
        <div className="card shadow-lg border-0 rounded-4 overflow-hidden d-flex flex-column w-100" style={{ maxWidth: '900px', height: '75vh' }}>
          
          <div className="card-header border-bottom py-3 px-4 d-flex align-items-center justify-content-between" style={{ backgroundColor: '#104929' }}>
            <div className="d-flex align-items-center gap-4">
              
              {/* FIXED: The "Back" Button */}
              <Link to="/profile" className="btn btn-sm btn-light rounded shadow-sm fw-bold px-3 d-flex align-items-center" style={{ color: '#104929' }}>
                &#8592; Back
              </Link>
              
              <div className="d-flex align-items-center gap-3">
                {/* FIXED: Supervisor Avatar Circle */}
                <div className="bg-white rounded-circle d-flex align-items-center justify-content-center shadow-sm" style={{ width: '45px', height: '45px', color: '#104929', fontSize: '1.2rem', fontWeight: 'bold' }}>
                  {supervisorInfo.first_name.charAt(0)}{supervisorInfo.last_name.charAt(0)}
                </div>
                <div>
                  <h5 className="fw-bold m-0 text-white">
                    {supervisorInfo.first_name} {supervisorInfo.last_name}
                  </h5>
                  <small className="text-white-50">Academic Supervisor</small>
                </div>
              </div>

            </div>
          </div>

          <div className="card-body overflow-auto p-4 custom-scrollbar flex-grow-1" style={{ backgroundColor: '#f0f4f1' }}>
            {messages.length === 0 ? (
              <div className="h-100 d-flex flex-column align-items-center justify-content-center text-muted">
                <div className="bg-white p-4 rounded-4 shadow-sm text-center border">
                  <h6 className="fw-bold text-dark">Start the conversation</h6>
                  <p className="small mb-0">Ask your supervisor about your study plan, course approvals, or graduation requirements.</p>
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
                          backgroundColor: isMine ? '#104929' : '#ffffff',
                          borderTopLeftRadius: '16px',
                          borderTopRightRadius: '16px',
                          borderBottomLeftRadius: isMine ? '16px' : '4px',
                          borderBottomRightRadius: isMine ? '4px' : '16px',
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
                placeholder="Type your message..." 
                value={newMessage}
                onChange={(e) => setNewMessage(e.target.value)}
                style={{ fontSize: '0.95rem' }}
              />
              
              {/* FIXED: The "Send" Button */}
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

        </div>
      </div>

      <style>{`
        .custom-scrollbar::-webkit-scrollbar { width: 6px; }
        .custom-scrollbar::-webkit-scrollbar-track { background: transparent; }
        .custom-scrollbar::-webkit-scrollbar-thumb { background-color: rgba(16, 73, 41, 0.2); border-radius: 10px; }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover { background-color: rgba(16, 73, 41, 0.4); }
      `}</style>
    </div>
  );
}

export default StudentChat;