import React, { useState, useEffect } from 'react';
import { OFFICIAL_SYLLABUS } from './data/syllabus';

export default function App() {
  const [userProgress, setUserProgress] = useState(() => {
    const saved = localStorage.getItem('3rd_mb_progress');
    return saved ? JSON.parse(saved) : {};
  });

  const [isPremium, setIsPremium] = useState(() => {
    return localStorage.getItem('3rd_mb_is_premium') === 'true';
  });

  const [activeTab, setActiveTab] = useState('home');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedDept, setSelectedDept] = useState('All');
  const [showTransferModal, setShowTransferModal] = useState(false);
  const [payerName, setPayerName] = useState('');

  // Pomodoro Timer State
  const [timerMinutes, setTimerMinutes] = useState(25);
  const [timerSeconds, setTimerSeconds] = useState(0);
  const [isTimerRunning, setIsTimerRunning] = useState(false);
  const [timerMode, setTimerMode] = useState('study');

  useEffect(() => {
    localStorage.setItem('3rd_mb_progress', JSON.stringify(userProgress));
  }, [userProgress]);

  useEffect(() => {
    localStorage.setItem('3rd_mb_is_premium', isPremium);
  }, [isPremium]);

  // Pomodoro Timer Engine
  useEffect(() => {
    let interval = null;
    if (isTimerRunning) {
      interval = setInterval(() => {
        if (timerSeconds > 0) {
          setTimerSeconds(timerSeconds - 1);
        } else if (timerMinutes > 0) {
          setTimerMinutes(timerMinutes - 1);
          setTimerSeconds(59);
        } else {
          setIsTimerRunning(false);
          alert(timerMode === 'study' ? '🎉 Study session complete! Take a 5-minute break.' : '⏰ Break finished! Ready to tackle more topics?');
        }
      }, 1000);
    } else {
      clearInterval(interval);
    }
    return () => clearInterval(interval);
  }, [isTimerRunning, timerMinutes, timerSeconds, timerMode]);

  const toggleTimer = () => setIsTimerRunning(!isTimerRunning);

  const resetTimer = (mode = 'study') => {
    setIsTimerRunning(false);
    setTimerMode(mode);
    setTimerMinutes(mode === 'study' ? 25 : 5);
    setTimerSeconds(0);
  };

  // Handle status changes ('Not Started' | 'In Progress' | 'Done')
  const handleStatusChange = (topicId, status) => {
    const trackedCount = Object.values(userProgress).filter(p => p.status && p.status !== 'Not Started').length;
    const isCurrentlyTracked = userProgress[topicId]?.status && userProgress[topicId]?.status !== 'Not Started';

    if (!isPremium && !isCurrentlyTracked && trackedCount >= 10 && status !== 'Not Started') {
      alert('⚠️ Free Plan Limit Reached! You can track up to 10 topics. Upgrade to Premium for ₦1,000 to unlock all 490 topics.');
      return;
    }

    const today = new Date().toISOString().split('T')[0];
    setUserProgress(prev => ({
      ...prev,
      [topicId]: {
        ...(prev[topicId] || {}),
        status,
        lastUpdated: today
      }
    }));
  };

  // Calculations for Progress & Percentages
  const totalTopics = OFFICIAL_SYLLABUS.length;
  
  const getStatusCount = (status) => {
    return OFFICIAL_SYLLABUS.filter(t => (userProgress[t.id]?.status || 'Not Started') === status).length;
  };

  const doneCount = getStatusCount('Done');
  const inProgressCount = getStatusCount('In Progress');
  const notStartedCount = totalTopics - (doneCount + inProgressCount);
  const overallPercentage = Math.round((doneCount / totalTopics) * 100) || 0;

  const getDeptStats = (deptName) => {
    const deptTopics = OFFICIAL_SYLLABUS.filter(t => t.department === deptName);
    if (deptTopics.length === 0) return { count: 0, done: 0, percent: 0 };
    const done = deptTopics.filter(t => userProgress[t.id]?.status === 'Done').length;
    return {
      count: deptTopics.length,
      done,
      percent: Math.round((done / deptTopics.length) * 100) || 0
    };
  };

  const trackedTopicsArray = Object.keys(userProgress).map(id => ({
    id: Number(id),
    ...userProgress[id]
  })).sort((a, b) => new Date(b.lastUpdated) - new Date(a.lastUpdated));

  const lastStudiedId = trackedTopicsArray.length > 0 ? trackedTopicsArray[0].id : null;
  const continueTopic = OFFICIAL_SYLLABUS.find(t => t.id === lastStudiedId) || OFFICIAL_SYLLABUS[0];

  const filteredTopics = OFFICIAL_SYLLABUS.filter(topic => {
    const matchesTab = 
      activeTab === 'home' ||
      (activeTab === 'block1' && topic.block === 'Block One') ||
      (activeTab === 'block2' && topic.block === 'Block Two');

    const matchesDept = selectedDept === 'All' || topic.department === selectedDept;
    
    const matchesSearch = 
      topic.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      topic.code.toLowerCase().includes(searchQuery.toLowerCase()) ||
      topic.department.toLowerCase().includes(searchQuery.toLowerCase());

    return matchesTab && matchesDept && matchesSearch;
  });

  return (
    <div className="app-wrapper">
      {/* Dark Navy Header */}
      <header className="app-header">
        <div className="header-brand">
          <h1>3rd MB Study Tracker</h1>
          <p>Third MBBS Curriculum • UNTH</p>
        </div>
        {!isPremium ? (
          <button className="upgrade-btn" onClick={() => setShowTransferModal(true)}>
            👑 Upgrade ₦1,000
          </button>
        ) : (
          <span style={{ fontSize: '0.75rem', background: '#059669', color: 'white', padding: '4px 8px', borderRadius: '6px', fontWeight: '700' }}>
            ✨ Premium Active
          </span>
        )}
      </header>

      {/* PALMPAY BANK TRANSFER MODAL */}
      {showTransferModal && (
        <div style={{
          position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
          backgroundColor: 'rgba(11, 19, 43, 0.85)', zIndex: 2000,
          display: 'flex', justifyContent: 'center', alignItems: 'center', padding: '16px'
        }}>
          <div style={{
            backgroundColor: 'white', padding: '24px', borderRadius: '16px',
            maxWidth: '380px', width: '100%', color: '#1E293B', boxShadow: '0 15px 30px rgba(0,0,0,0.3)'
          }}>
            <h3 style={{ fontSize: '1.15rem', fontWeight: '700', marginBottom: '8px', color: '#0B132B' }}>
              💳 Instant PalmPay Transfer (₦1,000)
            </h3>
            <p style={{ fontSize: '0.8rem', color: '#64748B', marginBottom: '14px', lineHeight: '1.4' }}>
              Transfer <b>₦1,000</b> from your bank app balance, enter your name below, and tap WhatsApp to send proof for instant activation!
            </p>

            <div style={{ background: '#F8F9FA', padding: '12px', borderRadius: '10px', marginBottom: '12px', border: '1px solid #E2E8F0' }}>
              <p style={{ fontSize: '0.75rem', color: '#64748B' }}>Bank Name:</p>
              <p style={{ fontSize: '0.9rem', fontWeight: '700', marginBottom: '6px' }}>Palmpay</p>
              
              <p style={{ fontSize: '0.75rem', color: '#64748B' }}>Account Number:</p>
              <p style={{ fontSize: '1.15rem', fontWeight: '800', color: '#00A896', marginBottom: '6px', letterSpacing: '0.5px' }}>8106624261</p>
              
              <p style={{ fontSize: '0.75rem', color: '#64748B' }}>Account Name:</p>
              <p style={{ fontSize: '0.85rem', fontWeight: '700' }}>Okonkwo David Chukwuebuka</p>
            </div>

            {/* Input for user name */}
            <div style={{ marginBottom: '14px' }}>
              <label style={{ fontSize: '0.75rem', fontWeight: '600', color: '#475569', display: 'block', marginBottom: '4px' }}>
                Your Full Name / Email:
              </label>
              <input 
                type="text" 
                placeholder="e.g. Dr. Chiamaka"
                value={payerName}
                onChange={(e) => setPayerName(e.target.value)}
                style={{
                  width: '100%', padding: '10px', borderRadius: '8px', border: '1px solid #CBD5E1',
                  fontSize: '0.85rem'
                }}
              />
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
              <a 
                href={`https://wa.me/2348106624261?text=${encodeURIComponent(`Hello David, I have made my ₦1,000 transfer to your Palmpay account for the 3rd MB Study Tracker. Here is my name: ${payerName || 'Student'}. Please send my activation code!`)}`}
                target="_blank" 
                rel="noopener noreferrer"
                style={{
                  background: '#25D366', color: 'white', textAlign: 'center', padding: '12px',
                  borderRadius: '8px', fontWeight: '700', textDecoration: 'none', fontSize: '0.85rem',
                  boxShadow: '0 4px 10px rgba(37, 211, 102, 0.3)'
                }}
              >
                💬 Send Proof & Get Code on WhatsApp
              </a>

              <button 
                onClick={() => {
                  const code = prompt("Enter your activation code from David:");
                  if (code === "unth2026") {
                    setIsPremium(true);
                    setShowTransferModal(false);
                    alert("✨ Premium unlocked successfully!");
                  } else if (code) {
                    alert("❌ Invalid activation code.");
                  }
                }}
                style={{
                  background: '#F1F5F9', border: '1px solid #CBD5E1', color: '#334155', padding: '10px',
                  borderRadius: '8px', fontWeight: '600', cursor: 'pointer', fontSize: '0.8rem'
                }}
              >
                🔑 Have an activation code? Enter it
              </button>

              <button 
                onClick={() => setShowTransferModal(false)}
                style={{
                  background: 'none', border: 'none', color: '#64748B', padding: '8px',
                  fontWeight: '600', cursor: 'pointer', fontSize: '0.75rem'
                }}
              >
                Close Window
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Main Content Area */}
      <main className="dashboard-container">
        
        {activeTab === 'home' && (
          <div>
            <div className="welcome-card">
              <h2>Welcome back, Doctor!</h2>
              <p>Master all 490 official Third MBBS curriculum topics seamlessly across Block One (258) and Block Two (232).</p>
              {isPremium && <p style={{ color: '#34D399', fontWeight: '600', marginTop: '6px' }}>✓ Full Unlimited Access Unlocked</p>}
            </div>

            {/* Pomodoro Timer Widget */}
            <div className="progress-card" style={{ textAlign: 'center', marginBottom: '16px' }}>
              <span className="continue-label" style={{ marginBottom: '6px' }}>⏱️ Pomodoro Study Timer</span>
              <div style={{ fontSize: '2.2rem', fontWeight: '800', color: '#0B132B', margin: '4px 0' }}>
                {String(timerMinutes).padStart(2, '0')}:{String(timerSeconds).padStart(2, '0')}
              </div>
              <div style={{ display: 'flex', justifyContent: 'center', gap: '8px', marginTop: '10px' }}>
                <button 
                  onClick={toggleTimer}
                  style={{ background: isTimerRunning ? '#EF4444' : '#00A896', color: 'white', border: 'none', padding: '8px 16px', borderRadius: '8px', fontWeight: '700', cursor: 'pointer' }}
                >
                  {isTimerRunning ? 'Pause' : 'Start Session'}
                </button>
                <button 
                  onClick={() => resetTimer('study')}
                  style={{ background: '#E2E8F0', color: '#334155', border: 'none', padding: '8px 12px', borderRadius: '8px', fontWeight: '600', cursor: 'pointer' }}
                >
                  25m Study
                </button>
                <button 
                  onClick={() => resetTimer('break')}
                  style={{ background: '#E2E8F0', color: '#334155', border: 'none', padding: '8px 12px', borderRadius: '8px', fontWeight: '600', cursor: 'pointer' }}
                >
                  5m Break
                </button>
              </div>
            </div>

            {/* Continue Study Card */}
            <div className="continue-study-card">
              <span className="continue-label">Continue Study</span>
              <div className="continue-title">{continueTopic.title}</div>
              <p style={{fontSize: '0.75rem', color: '#94A3B8', marginBottom: '12px'}}>
                {continueTopic.block} • {continueTopic.department} ({continueTopic.code})
              </p>
              <button 
                className="continue-btn"
                onClick={() => setActiveTab(continueTopic.block === 'Block One' ? 'block1' : 'block2')}
              >
                Go to Topic →
              </button>
            </div>

            {/* Overall Progress */}
            <div className="progress-card">
              <div className="progress-header">
                <span className="progress-title">Overall Curriculum Progress</span>
                <span className="progress-percentage">{overallPercentage}%</span>
              </div>
              <div className="progress-bar-bg">
                <div className="progress-bar-fill" style={{ width: `${overallPercentage}%` }}></div>
              </div>
              <div className="progress-stats-grid">
                <div className="stat-box">
                  <span className="stat-num" style={{color: '#059669'}}>{doneCount}</span>
                  <span className="stat-label">Done</span>
                </div>
                <div className="stat-box">
                  <span className="stat-num" style={{color: '#D97706'}}>{inProgressCount}</span>
                  <span className="stat-label">In Progress</span>
                </div>
                <div className="stat-box">
                  <span className="stat-num" style={{color: '#64748B'}}>{notStartedCount}</span>
                  <span className="stat-label">Not Started</span>
                </div>
              </div>
            </div>

            {/* Departmental Analytics */}
            <div className="progress-card" style={{ marginTop: '16px' }}>
              <span className="progress-title" style={{ display: 'block', marginBottom: '12px' }}>📊 Department Mastery Breakdown</span>
              {[
                { name: 'Morbid Anatomy', data: getDeptStats('Morbid Anatomy') },
                { name: 'Chemical Pathology', data: getDeptStats('Chemical Pathology') },
                { name: 'Medical Microbiology', data: getDeptStats('Medical Microbiology') },
                { name: 'Haematology', data: getDeptStats('Haematology') },
                { name: 'Pharmacology', data: getDeptStats('Pharmacology') },
              ].map((dept, idx) => (
                <div key={idx} style={{ marginBottom: '10px' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.75rem', fontWeight: '600', marginBottom: '4px' }}>
                    <span>{dept.name}</span>
                    <span>{dept.data.done}/{dept.data.count} ({dept.data.percent}%)</span>
                  </div>
                  <div className="progress-bar-bg" style={{ height: '6px' }}>
                    <div className="progress-bar-fill" style={{ width: `${dept.data.percent}%`, backgroundColor: '#028090' }}></div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {activeTab !== 'home' && (
          <div>
            <div style={{display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '14px'}}>
              <h2 style={{fontSize: '1.1rem', fontWeight: '700'}}>
                {activeTab === 'block1' && 'Block One (258 Topics)'}
                {activeTab === 'block2' && 'Block Two (232 Topics)'}
              </h2>
              <button 
                onClick={() => setActiveTab('home')}
                style={{background: 'none', border: 'none', color: '#00A896', fontWeight: '600', cursor: 'pointer'}}
              >
                ← Home
              </button>
            </div>

            <div style={{ display: 'flex', gap: '6px', overflowX: 'auto', paddingBottom: '10px', marginBottom: '10px' }}>
              {['All', 'Morbid Anatomy', 'Chemical Pathology', 'Medical Microbiology', 'Haematology', 'Pharmacology'].map(dept => (
                <button
                  key={dept}
                  onClick={() => setSelectedDept(dept)}
                  style={{
                    padding: '6px 12px',
                    borderRadius: '20px',
                    border: '1px solid #CBD5E1',
                    fontSize: '0.75rem',
                    fontWeight: '600',
                    whiteSpace: 'nowrap',
                    background: selectedDept === dept ? '#0B132B' : 'white',
                    color: selectedDept === dept ? 'white' : '#475569',
                    cursor: 'pointer'
                  }}
                >
                  {dept}
                </button>
              ))}
            </div>

            <input 
              type="text" 
              placeholder="Search by topic title or code..." 
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              style={{
                width: '100%',
                padding: '12px',
                borderRadius: '10px',
                border: '1px solid #CBD5E1',
                marginBottom: '14px',
                fontSize: '0.85rem',
                backgroundColor: 'white'
              }}
            />

            <div>
              {filteredTopics.length === 0 ? (
                <p style={{textAlign: 'center', color: '#64748B', padding: '30px'}}>No topics found.</p>
              ) : (
                filteredTopics.map(topic => {
                  const currentStatus = userProgress[topic.id]?.status || 'Not Started';
                  
                  return (
                    <div key={topic.id} className="topic-card">
                      <div className="topic-meta">
                        <span className="dept-badge">{topic.department}</span>
                        <span className="topic-code">{topic.code}</span>
                      </div>
                      <div className="topic-name">{topic.title}</div>
                      
                      <div className="status-segments">
                        <button 
                          className={`status-segment-btn ${currentStatus === 'Not Started' ? 'active-not-started' : ''}`}
                          onClick={() => handleStatusChange(topic.id, 'Not Started')}
                        >
                          Not Started
                        </button>
                        <button 
                          className={`status-segment-btn ${currentStatus === 'In Progress' ? 'active-in-progress' : ''}`}
                          onClick={() => handleStatusChange(topic.id, 'In Progress')}
                        >
                          In Progress
                        </button>
                        <button 
                          className={`status-segment-btn ${currentStatus === 'Done' ? 'active-done' : ''}`}
                          onClick={() => handleStatusChange(topic.id, 'Done')}
                        >
                          Done
                        </button>
                      </div>

                      {topic.driveUrl && (
                        <a href={topic.driveUrl} target="_blank" rel="noopener noreferrer" className="drive-link-btn">
                          📁 Open Class Drive Folder
                        </a>
                      )}
                    </div>
                  );
                })
              )}
            </div>
          </div>
        )}

      </main>

      <nav style={{
    
