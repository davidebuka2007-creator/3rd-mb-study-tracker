import React, { useState, useEffect } from 'react';
import { OFFICIAL_SYLLABUS } from './data/syllabus';

export default function App() {
  // State management for user progress stored locally (or synced)
  const [userProgress, setUserProgress] = useState(() => {
    const saved = localStorage.getItem('3rd_mb_progress');
    return saved ? JSON.parse(saved) : {};
  });

  const [activeTab, setActiveTab] = useState('home'); // 'home', 'block1', 'block2', 'saved'
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedDept, setSelectedDept] = useState('All');

  // Save progress changes to localStorage
  useEffect(() => {
    localStorage.setItem('3rd_mb_progress', JSON.stringify(userProgress));
  }, [userProgress]);

  // Handle status changes ('Not Started' | 'In Progress' | 'Done')
  const handleStatusChange = (topicId, status) => {
    setUserProgress(prev => ({
      ...prev,
      [topicId]: {
        ...(prev[topicId] || {}),
        status,
        lastUpdated: new Date().toLocaleDateString()
      }
    }));
  };

  // Calculations for Progress Percentages
  const totalTopics = OFFICIAL_SYLLABUS.length;
  
  const getStatusCount = (status) => {
    return OFFICIAL_SYLLABUS.filter(t => (userProgress[t.id]?.status || 'Not Started') === status).length;
  };

  const doneCount = getStatusCount('Done');
  const inProgressCount = getStatusCount('In Progress');
  const notStartedCount = totalTopics - (doneCount + inProgressCount);
  
  const overallPercentage = Math.round((doneCount / totalTopics) * 100) || 0;

  // Find most recently updated topic for "Continue Study"
  const trackedTopicsArray = Object.keys(userProgress).map(id => ({
    id: Number(id),
    ...userProgress[id]
  })).sort((a, b) => new Date(b.lastUpdated) - new Date(a.lastUpdated));

  const lastStudiedId = trackedTopicsArray.length > 0 ? trackedTopicsArray[0].id : null;
  const continueTopic = OFFICIAL_SYLLABUS.find(t => t.id === lastStudiedId) || OFFICIAL_SYLLABUS[0];

  // Filter topics based on active tab, search, and department
  const filteredTopics = OFFICIAL_SYLLABUS.filter(topic => {
    const matchesTab = 
      activeTab === 'home' ||
      (activeTab === 'block1' && topic.block === 'Block One') ||
      (activeTab === 'block2' && topic.block === 'Block Two') ||
      (activeTab === 'saved' && userProgress[topic.id]?.saved);

    const matchesDept = selectedDept === 'All' || topic.department === selectedDept;
    
    const matchesSearch = 
      topic.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      topic.code.toLowerCase().includes(searchQuery.toLowerCase()) ||
      topic.department.toLowerCase().includes(searchQuery.toLowerCase());

    return matchesTab && matchesDept && matchesSearch;
  });

  return (
    <div className="app-wrapper">
      {/* Professional Navy Header */}
      <header className="app-header">
        <div className="header-brand">
          <h1>3rd MB Study Tracker</h1>
          <p>Third MBBS Curriculum • UNTH</p>
        </div>
        <button className="upgrade-btn" onClick={() => alert('Paystack Premium Integration Coming Up!')}>
          👑 Upgrade ₦1,000
        </button>
      </header>

      {/* Main Container */}
      <main className="dashboard-container">
        
        {/* HOME / DASHBOARD VIEW */}
        {activeTab === 'home' && (
          <div>
            {/* Welcome Card */}
            <div className="welcome-card">
              <h2>Welcome back, Doctor!</h2>
              <p>Master all 490 official Third MBBS curriculum topics seamlessly across Block One (258) and Block Two (232).</p>
            </div>

            {/* Continue Study Section */}
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

            {/* Overall Progress Card */}
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

            {/* Quick Navigation Buttons */}
            <div style={{display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px', marginTop: '16px'}}>
              <button 
                onClick={() => setActiveTab('block1')} 
                style={{padding: '14px', borderRadius: '12px', border: '1px solid #E2E8F0', background: 'white', fontWeight: '700', cursor: 'pointer'}}
              >
                📖 Block One (258 Topics)
              </button>
              <button 
                onClick={() => setActiveTab('block2')} 
                style={{padding: '14px', borderRadius: '12px', border: '1px solid #E2E8F0', background: 'white', fontWeight: '700', cursor: 'pointer'}}
              >
                📚 Block Two (232 Topics)
              </button>
            </div>
          </div>
        )}

        {/* CURRICULUM LIST VIEW (Block One / Block Two / Saved) */}
        {activeTab !== 'home' && (
          <div>
            <div style={{display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '14px'}}>
              <h2 style={{fontSize: '1.2rem', fontWeight: '700'}}>
                {activeTab === 'block1' && 'Block One Curriculum (258 Topics)'}
                {activeTab === 'block2' && 'Block Two Curriculum (232 Topics)'}
                {activeTab === 'saved' && 'Saved Topics'}
              </h2>
              <button 
                onClick={() => setActiveTab('home')}
                style={{background: 'none', border: 'none', color: '#00A896', fontWeight: '600', cursor: 'pointer'}}
              >
                ← Back to Home
              </button>
            </div>

            {/* Search Input */}
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
                fontSize: '0.9rem',
                backgroundColor: 'white'
              }}
            />

            {/* Topic Cards List */}
            <div>
              {filteredTopics.length === 0 ? (
                <p style={{textAlign: 'center', color: '#64748B', padding: '30px'}}>No topics found matching your search.</p>
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
                      
                      {/* Segmented Status Controls */}
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

                      {/* Google Drive Folder Link Button */}
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

      {/* Bottom Navigation Bar */}
      <nav style={{
        position: 'fixed',
        bottom: 0,
        left: 0,
        right: 0,
        backgroundColor: 'white',
        borderTop: '1px solid #E2E8F0',
        display: 'flex',
        justifyContent: 'space-around',
        padding: '10px 0',
        zIndex: 1000
      }}>
        <button 
          onClick={() => setActiveTab('home')} 
          style={{background: 'none', border: 'none', fontSize: '0.75rem', fontWeight: activeTab === 'home' ? '700' : '400', color: activeTab === 'home' ? '#00A896' : '#64748B', cursor: 'pointer'}}
        >
          🏠 Home
        </button>
        <button 
          onClick={() => setActiveTab('block1')} 
          style={{background: 'none', border: 'none', fontSize: '0.75rem', fontWeight: activeTab === 'block1' ? '700' : '400', color: activeTab === 'block1' ? '#00A896' : '#64748B', cursor: 'pointer'}}
        >
          📖 Block 1
        </button>
        <button 
          onClick={() => setActiveTab('block2')} 
          style={{background: 'none', border: 'none', fontSize: '0.75rem', fontWeight: activeTab === 'block2' ? '700' : '400', color: activeTab === 'block2' ? '#00A896' : '#64748B', cursor: 'pointer'}}
        >
          📚 Block 2
        </button>
      </nav>
    </div>
  );
}
