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

  const [userName, setUserName] = useState(() => {
    return localStorage.getItem('3rd_mb_user_name') || 'Doctor';
  });

  const [darkMode, setDarkMode] = useState(() => {
    return localStorage.getItem('3rd_mb_theme') === 'dark';
  });

  const [customTopics, setCustomTopics] = useState(() => {
    const saved = localStorage.getItem('3rd_mb_custom_topics');
    return saved ? JSON.parse(saved) : [];
  });

  const [masterCode, setMasterCode] = useState(() => {
    return localStorage.getItem('3rd_mb_master_code') || 'UNTH2026';
  });

  const [activeTab, setActiveTab] = useState('home');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedDept, setSelectedDept] = useState('All');
  const [showTransferModal, setShowTransferModal] = useState(false);
  const [showCustomModal, setShowCustomModal] = useState(false);
  const [showResetModal, setShowResetModal] = useState(false);
  const [showBackupModal, setShowBackupModal] = useState(false);
  const [payerName, setPayerName] = useState('');
  const [copiedAccount, setCopiedAccount] = useState(false);
  const [adminTapCount, setAdminTapCount] = useState(0);

  const [newTopicTitle, setNewTopicTitle] = useState('');
  const [newTopicDept, setNewTopicDept] = useState('Pharmacology');
  const [newTopicSubDept, setNewTopicSubDept] = useState('General Pathology');
  const [newTopicBlock, setNewTopicBlock] = useState('Block One');
  const [newTopicUrl, setNewTopicUrl] = useState('');

  const [timerMinutes, setTimerMinutes] = useState(25);
  const [timerSeconds, setTimerSeconds] = useState(0);
  const [isTimerRunning, setIsTimerRunning] = useState(false);
  const [timerMode, setTimerMode] = useState('study');

  const [targetExamDate, setTargetExamDate] = useState(() => {
    const savedDate = localStorage.getItem('3rd_mb_exam_date');
    if (savedDate) return savedDate;
    const future = new Date();
    future.setDate(future.getDate() + 60);
    return future.toISOString().split('T')[0];
  });

  useEffect(() => {
    localStorage.setItem('3rd_mb_progress', JSON.stringify(userProgress));
  }, [userProgress]);

  useEffect(() => {
    localStorage.setItem('3rd_mb_is_premium', isPremium);
  }, [isPremium]);

  useEffect(() => {
    localStorage.setItem('3rd_mb_user_name', userName);
  }, [userName]);

  useEffect(() => {
    localStorage.setItem('3rd_mb_master_code', masterCode);
  }, [masterCode]);

  useEffect(() => {
    localStorage.setItem('3rd_mb_exam_date', targetExamDate);
  }, [targetExamDate]);

  useEffect(() => {
    localStorage.setItem('3rd_mb_theme', darkMode ? 'dark' : 'light');
    if (darkMode) {
      document.body.classList.add('dark-mode');
    } else {
      document.body.classList.remove('dark-mode');
    }
  }, [darkMode]);

  useEffect(() => {
    localStorage.setItem('3rd_mb_custom_topics', JSON.stringify(customTopics));
  }, [customTopics]);

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
          alert(timerMode === 'study' ? '🎉 Study session complete! Take a break.' : '⏰ Break finished! Ready for the next topic?');
        }
      }, 1000);
    } else {
      clearInterval(interval);
    }
    return () => clearInterval(interval);
  }, [isTimerRunning, timerMinutes, timerSeconds, timerMode]);

  const toggleTimer = () => setIsTimerRunning(!isTimerRunning);

  const resetTimer = (mode = 'study', mins = 25) => {
    setIsTimerRunning(false);
    setTimerMode(mode);
    setTimerMinutes(mins);
    setTimerSeconds(0);
  };

  const handleCopyAccount = () => {
    navigator.clipboard.writeText('8106624261');
    setCopiedAccount(true);
    setTimeout(() => setCopiedAccount(false), 2000);
  };

  const handleAdminTap = () => {
    const count = adminTapCount + 1;
    setAdminTapCount(count);
    if (count >= 3) {
      setAdminTapCount(0);
      const password = prompt("🔐 Enter Admin Password:");
      if (password === 'david2026') {
        const newCode = prompt(`Current Master Code is [${masterCode}]. Type a new active master code:`);
        if (newCode && newCode.trim()) {
          setMasterCode(newCode.trim().toUpperCase());
          alert(`✨ Active Master Code successfully updated to: ${newCode.trim().toUpperCase()}`);
        }
      } else if (password) {
        alert('❌ Incorrect admin password.');
      }
    }
  };

  const handleStatusChange = (topicId, status) => {
    const trackedCount = Object.values(userProgress).filter(p => p.status && p.status !== 'Not Started').length;
    const isCurrentlyTracked = userProgress[topicId]?.status && userProgress[topicId]?.status !== 'Not Started';

    if (!isPremium && !isCurrentlyTracked && trackedCount >= 10 && status !== 'Not Started') {
      alert('⚠️ Free Plan Limit Reached! You have used your 10 free tracked topics. Upgrade to Premium for ₦1,000 to unlock all topics!');
      setShowTransferModal(true);
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

  const handleLinkClick = (topic) => {
    if (!topic.driveUrl) return;

    const trackedCount = Object.values(userProgress).filter(p => p.status && p.status !== 'Not Started').length;
    const currentStatus = userProgress[topic.id]?.status || 'Not Started';

    if (!isPremium && trackedCount >= 10 && currentStatus === 'Not Started') {
      alert('⚠️ Free Plan Link Click Limit Reached (10 items). Upgrade to Premium for ₦1,000 to unlock all resources!');
      setShowTransferModal(true);
      return;
    }

    // Clicking ANY Drive link (folder or file) automatically shifts Not Started to In Progress
    if (currentStatus === 'Not Started') {
      handleStatusChange(topic.id, 'In Progress');
    }

    window.open(topic.driveUrl, '_blank');
  };

  const handleAddCustomTopic = (e) => {
    e.preventDefault();
    if (!newTopicTitle.trim()) return;

    if (!isPremium) {
      alert('🔒 Custom Topics are a Premium Feature! Upgrade for ₦1,000 to add unlimited personalized topics.');
      setShowCustomModal(false);
      setShowTransferModal(true);
      return;
    }

    const newTopic = {
      id: Date.now(),
      title: newTopicTitle,
      department: newTopicDept,
      subDept: newTopicDept === 'Morbid Anatomy' ? newTopicSubDept : 'General',
      block: newTopicBlock,
      code: 'CUSTOM',
      driveUrl: newTopicUrl.trim() || '',
      isCustom: true
    };

    setCustomTopics(prev => [newTopic, ...prev]);
    setNewTopicTitle('');
    setNewTopicUrl('');
    setShowCustomModal(false);
    alert('✨ Custom topic added successfully!');
  };

  const handleResetAll = (targetStatus) => {
    const confirmation = window.confirm(`Are you sure you want to reset all topic progress to "${targetStatus}"?`);
    if (!confirmation) return;

    const updated = {};
    const fullSyllabus = [...customTopics, ...OFFICIAL_SYLLABUS];
    fullSyllabus.forEach(t => {
      updated[t.id] = { status: targetStatus, lastUpdated: new Date().toISOString().split('T')[0] };
    });
    setUserProgress(updated);
    setShowResetModal(false);
    alert(`✨ All topics reset to "${targetStatus}" successfully!`);
  };

  const exportBackupJSON = () => {
    const backupData = {
      userProgress,
      customTopics,
      userName,
      isPremium,
      targetExamDate,
      exportDate: new Date().toISOString()
    };
    const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(backupData, null, 2));
    const downloadAnchor = document.createElement('a');
    downloadAnchor.setAttribute("href", dataStr);
    downloadAnchor.setAttribute("download", `3rd_mb_tracker_backup_${new Date().toISOString().split('T')[0]}.json`);
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
  };

  const importBackupJSON = (e) => {
    const fileReader = new FileReader();
    if (e.target.files[0]) {
      fileReader.readAsText(e.target.files[0], "UTF-8");
      fileReader.onload = (event) => {
        try {
          const parsed = JSON.parse(event.target.result);
          if (parsed.userProgress) setUserProgress(parsed.userProgress);
          if (parsed.customTopics) setCustomTopics(parsed.customTopics);
          if (parsed.userName) setUserName(parsed.userName);
          if (parsed.isPremium !== undefined) setIsPremium(parsed.isPremium);
          if (parsed.targetExamDate) setTargetExamDate(parsed.targetExamDate);
          alert("✨ Progress history successfully restored from backup file!");
          setShowBackupModal(false);
        } catch (err) {
          alert("❌ Invalid backup JSON file format.");
        }
      };
    }
  };

  const fullSyllabus = [...customTopics, ...OFFICIAL_SYLLABUS];
  const totalTopics = fullSyllabus.length;
  
  const getStatusCount = (status) => {
    return fullSyllabus.filter(t => (userProgress[t.id]?.status || 'Not Started') === status).length;
  };

  const doneCount = getStatusCount('Done');
  const inProgressCount = getStatusCount('In Progress');
  const notStartedCount = totalTopics - (doneCount + inProgressCount);
  const overallPercentage = Math.round((doneCount / totalTopics) * 100) || 0;

  const calcDaysRemaining = () => {
    const target = new Date(targetExamDate);
    const today = new Date();
    const diffTime = target - today;
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays > 0 ? diffDays : 0;
  };

  const examDaysLeft = calcDaysRemaining();
  const remainingTopics = totalTopics - doneCount;
  const requiredPacePerDay = (remainingTopics / Math.max(examDaysLeft, 1)).toFixed(1);

  const getDeptStats = (deptName) => {
    const deptTopics = fullSyllabus.filter(t => t.department === deptName);
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
  const continueTopic = fullSyllabus.find(t => t.id === lastStudiedId) || fullSyllabus[0];

  const filteredTopics = fullSyllabus.filter(topic => {
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
      <header className="app-header">
        <div className="header-brand">
          <h1>3rd MB Study Tracker</h1>
          <p onClick={handleAdminTap}>Welcome, Dr. {userName} • UNTH</p>
        </div>
        <div className="header-actions">
          <button className="theme-toggle-btn" onClick={() => setDarkMode(!darkMode)} title="Toggle Theme">
            {darkMode ? '☀️' : '🌙'}
          </button>
          {!isPremium ? (
            <button className="upgrade-btn" onClick={() => setShowTransferModal(true)}>
              👑 Upgrade ₦1,000
            </button>
          ) : (
            <span style={{ fontSize: '0.72rem', background: '#059669', color: 'white', padding: '5px 10px', borderRadius: '6px', fontWeight: '800' }}>
              ✨ Premium Active
            </span>
          )}
        </div>
      </header>

      {/* Backup & Recovery Modal */}
      {showBackupModal && (
        <div style={{
          position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
          backgroundColor: 'rgba(7, 13, 30, 0.88)', backdropFilter: 'blur(6px)', zIndex: 2000,
          display: 'flex', justifyContent: 'center', alignItems: 'center', padding: '16px'
        }}>
          <div style={{ backgroundColor: 'var(--card-bg)', padding: '24px', borderRadius: '18px', maxWidth: '380px', width: '100%', color: 'var(--text-dark)' }}>
            <h3 style={{ fontSize: '1.2rem', fontWeight: '800', marginBottom: '10px' }}>💾 Backup & Data Recovery</h3>
            <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginBottom: '16px', lineHeight: '1.4' }}>
              Export your JSON file regularly to ensure you never lose history when clearing cache or switching devices.
            </p>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', marginBottom: '16px' }}>
              <button onClick={exportBackupJSON} style={{ background: '#028090', color: 'white', border: 'none', padding: '11px', borderRadius: '8px', fontWeight: '800', cursor: 'pointer' }}>
                📥 Export Progress JSON
              </button>
              
              <div>
                <label style={{ fontSize: '0.75rem', fontWeight: '700', display: 'block', marginBottom: '4px' }}>📤 Import JSON Backup:</label>
                <input type="file" accept=".json" onChange={importBackupJSON} style={{ fontSize: '0.75rem', width: '100%' }} />
              </div>
            </div>

            <button onClick={() => setShowBackupModal(false)} style={{ width: '100%', background: 'var(--bg-main)', border: '1px solid var(--border-light)', padding: '10px', borderRadius: '8px', fontWeight: '700', cursor: 'pointer' }}>
              Close
            </button>
          </div>
        </div>
      )}

      {/* Dual Reset Modal */}
      {showResetModal && (
        <div style={{
          position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
          backgroundColor: 'rgba(7, 13, 30, 0.88)', backdropFilter: 'blur(6px)', zIndex: 2000,
          display: 'flex', justifyContent: 'center', alignItems: 'center', padding: '16px'
        }}>
          <div style={{ backgroundColor: 'var(--card-bg)', padding: '24px', borderRadius: '18px', maxWidth: '380px', width: '100%', color: 'var(--text-dark)' }}>
            <h3 style={{ fontSize: '1.2rem', fontWeight: '800', marginBottom: '10px' }}>🔄 Curriculum Reset Options</h3>
            <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginBottom: '16px', lineHeight: '1.4' }}>
              Choose how you would like to reset your study curriculum progress across all topics:
            </p>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', marginBottom: '16px' }}>
              <button onClick={() => handleResetAll('Not Started')} style={{ background: '#64748B', color: 'white', border: 'none', padding: '12px', borderRadius: '8px', fontWeight: '800', cursor: 'pointer' }}>
                Reset All to Not Started
              </button>
              <button onClick={() => handleResetAll('In Progress')} style={{ background: '#D97706', color: 'white', border: 'none', padding: '12px', borderRadius: '8px', fontWeight: '800', cursor: 'pointer' }}>
                Reset All to In Progress
              </button>
            </div>

            <button onClick={() => setShowResetModal(false)} style={{ width: '100%', background: 'var(--bg-main)', border: '1px solid var(--border-light)', padding: '10px', borderRadius: '8px', fontWeight: '700', cursor: 'pointer' }}>
              Cancel
            </button>
          </div>
        </div>
      )}

      {/* Transfer / Premium Modal */}
      {showTransferModal && (
        <div style={{
          position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
          backgroundColor: 'rgba(7, 13, 30, 0.88)', backdropFilter: 'blur(6px)', zIndex: 2000,
          display: 'flex', justifyContent: 'center', alignItems: 'center', padding: '16px'
        }}>
          <div style={{
            backgroundColor: 'var(--card-bg)', padding: '24px', borderRadius: '18px',
            maxWidth: '380px', width: '100%', color: 'var(--text-dark)', boxShadow: '0 20px 40px rgba(0,0,0,0.35)'
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px' }}>
              <h3 style={{ fontSize: '1.2rem', fontWeight: '800', color: 'var(--text-dark)' }}>
                👑 Unlock Premium Access
              </h3>
              <span style={{ background: '#FEF3C7', color: '#D97706', fontSize: '0.7rem', fontWeight: '800', padding: '3px 8px', borderRadius: '6px' }}>
                ₦1,000 ONE-TIME
              </span>
            </div>

            <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginBottom: '14px', lineHeight: '1.4' }}>
              Transfer <b>₦1,000</b> to the Palmpay account below, enter your doctor name, and click WhatsApp to activate your personalized greeting and unlimited curriculum!
            </p>

            <div style={{ background: 'var(--bg-main)', padding: '14px', borderRadius: '12px', marginBottom: '14px', border: '1px solid var(--border-light)' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '6px' }}>
                <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', fontWeight: '600' }}>Bank Name:</span>
                <span style={{ fontSize: '0.85rem', fontWeight: '800', color: 'var(--text-dark)' }}>Palmpay</span>
              </div>
              
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '6px' }}>
                <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', fontWeight: '600' }}>Account Number:</span>
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <span style={{ fontSize: '1.1rem', fontWeight: '800', color: '#00A896', letterSpacing: '0.5px' }}>8106624261</span>
                  <button 
                    onClick={handleCopyAccount}
                    style={{ background: '#E0F2FE', border: 'none', color: '#028090', padding: '3px 7px', borderRadius: '4px', fontSize: '0.68rem', fontWeight: '700', cursor: 'pointer' }}
                  >
                    {copiedAccount ? 'Copied!' : 'Copy'}
                  </button>
                </div>
              </div>
              
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', fontWeight: '600' }}>Account Name:</span>
                <span style={{ fontSize: '0.82rem', fontWeight: '800', color: 'var(--text-dark)' }}>Okonkwo David Ebuka</span>
              </div>
            </div>

            <div style={{ marginBottom: '14px' }}>
              <label style={{ fontSize: '0.75rem', fontWeight: '700', color: 'var(--text-muted)', display: 'block', marginBottom: '4px' }}>
                Your Doctor Name (for Welcome Header):
              </label>
              <input 
                type="text" 
                placeholder="e.g. Chiamaka Nwosu"
                value={payerName}
                onChange={(e) => setPayerName(e.target.value)}
                style={{
                  width: '100%', padding: '11px', borderRadius: '8px', border: '1px solid var(--border-light)',
                  fontSize: '0.85rem', outline: 'none', background: 'var(--bg-main)', color: 'var(--text-dark)'
                }}
              />
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
              <a 
                href={`https://wa.me/2348106624261?text=${encodeURIComponent(`Hello David, I have completed my ₦1,000 transfer to your Palmpay account for 3rd MB Study Tracker. Name: Dr. ${payerName || 'Doctor'}. Please send my activation code!`)}`}
                target="_blank" 
                rel="noopener noreferrer"
                style={{
                  background: '#25D366', color: 'white', textAlign: 'center', padding: '12px',
                  borderRadius: '10px', fontWeight: '800', textDecoration: 'none', fontSize: '0.85rem',
                  boxShadow: '0 4px 12px rgba(37, 211, 102, 0.35)'
                }}
              >
                💬 Send Proof on WhatsApp
              </a>

              <button 
                onClick={() => {
                  const codeInput = prompt("Enter your activation code:")?.trim().toUpperCase();
                  if (!codeInput) return;

                  if (codeInput === masterCode.toUpperCase()) {
                    setIsPremium(true);
                    if (payerName.trim()) setUserName(payerName.trim());
                    setShowTransferModal(false);
                    alert("✨ Premium features and personalized header unlocked successfully!");
                  } else {
                    alert("❌ Invalid activation code.");
                  }
                }}
                style={{
                  background: 'var(--bg-main)', border: '1px solid var(--border-light)', color: 'var(--text-dark)', padding: '10px',
                  borderRadius: '10px', fontWeight: '700', cursor: 'pointer', fontSize: '0.78rem'
                }}
              >
                🔑 Enter Activation Code
              </button>

              <button 
                onClick={() => setShowTransferModal(false)}
                style={{ background: 'none', border: 'none', color: 'var(--text-muted)', padding: '6px', fontWeight: '600', cursor: 'pointer', fontSize: '0.75rem' }}
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Advanced Custom Topic Modal */}
      {showCustomModal && (
        <div style={{
          position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
          backgroundColor: 'rgba(7, 13, 30, 0.88)', backdropFilter: 'blur(6px)', zIndex: 2000,
          display: 'flex', justifyContent: 'center', alignItems: 'center', padding: '16px'
        }}>
          <div style={{
            backgroundColor: 'var(--card-bg)', padding: '24px', borderRadius: '18px',
            maxWidth: '380px', width: '100%', color: 'var(--text-dark)', boxShadow: '0 20px 40px rgba(0,0,0,0.35)'
          }}>
            <h3 style={{ fontSize: '1.15rem', fontWeight: '800', marginBottom: '12px', display: 'flex', alignItems: 'center', gap: '8px' }}>
              ✨ Add Advanced Custom Topic
            </h3>
            <form onSubmit={handleAddCustomTopic}>
              <div style={{ marginBottom: '10px' }}>
                <label style={{ fontSize: '0.75rem', fontWeight: '700', display: 'block', marginBottom: '4px' }}>Topic Title:</label>
                <input 
                  type="text" 
                  placeholder="e.g. Advanced Pathology Seminar Notes"
                  value={newTopicTitle}
                  onChange={(e) => setNewTopicTitle(e.target.value)}
                  style={{ width: '100%', padding: '10px', borderRadius: '8px', border: '1px solid var(--border-light)', background: 'var(--bg-main)', color: 'var(--text-dark)' }}
                />
              </div>

              <div style={{ marginBottom: '10px' }}>
                <label style={{ fontSize: '0.75rem', fontWeight: '700', display: 'block', marginBottom: '4px' }}>Curriculum Block:</label>
                <select 
                  value={newTopicBlock} 
                  onChange={(e) => setNewTopicBlock(e.target.value)}
                  style={{ width: '100%', padding: '10px', borderRadius: '8px', border: '1px solid var(--border-light)', background: 'var(--bg-main)', color: 'var(--text-dark)' }}
                >
                  <option value="Block One">Block One</option>
                  <option value="Block Two">Block Two</option>
                </select>
              </div>

              <div style={{ marginBottom: '10px' }}>
                <label style={{ fontSize: '0.75rem', fontWeight: '700', display: 'block', marginBottom: '4px' }}>Subject / Department:</label>
                <select 
                  value={newTopicDept} 
                  onChange={(e) => setNewTopicDept(e.target.value)}
                  style={{ width: '100%', padding: '10px', borderRadius: '8px', border: '1px solid var(--border-light)', background: 'var(--bg-main)', color: 'var(--text-dark)' }}
                >
                  <option value="Morbid Anatomy">Morbid Anatomy</option>
                  <option value="Chemical Pathology">Chemical Pathology</option>
                  <option value="Medical Microbiology">Medical Microbiology</option>
                  <option value="Haematology">Haematology</option>
                  <option value="Pharmacology">Pharmacology</option>
                </select>
              </div>

              {newTopicDept === 'Morbid Anatomy' && (
                <div style={{ marginBottom: '10px' }}>
                  <label style={{ fontSize: '0.75rem', fontWeight: '700', display: 'block', marginBottom: '4px' }}>Pathology Sub-Subject:</label>
                  <select 
                    value={newTopicSubDept} 
                    onChange={(e) => setNewTopicSubDept(e.target.value)}
                    style={{ width: '100%', padding: '10px', borderRadius: '8px', border: '1px solid var(--border-light)', background: 'var(--bg-main)', color: 'var(--text-dark)' }}
                  >
                    <option value="General Pathology">General Pathology</option>
                    <option value="Systemic Pathology">Systemic Pathology</option>
                    <option value="Histopathology Techniques">Histopathology Techniques</option>
                    <option value="Forensic Pathology">Forensic Pathology</option>
                  </select>
                </div>
              )}

              <div style={{ marginBottom: '16px' }}>
                <label style={{ fontSize: '0.75rem', fontWeight: '700', display: 'block', marginBottom: '4px' }}>Google Drive Link (Optional):</label>
                <input 
                  type="text" 
                  placeholder="https://drive.google.com/..."
                  value={newTopicUrl}
                  onChange={(e) => setNewTopicUrl(e.target.value)}
                  style={{ width: '100%', padding: '10px', borderRadius: '8px', border: '1px solid var(--border-light)', background: 'var(--bg-main)', color: 'var(--text-dark)' }}
                />
              </div>

              <div style={{ display: 'flex', gap: '8px' }}>
                <button type="submit" style={{ flex: 1, background: 'var(--teal-primary)', color: 'white', padding: '11px', border: 'none', borderRadius: '8px', fontWeight: '800', cursor: 'pointer' }}>
                  Add Topic ✨
                </button>
                <button type="button" onClick={() => setShowCustomModal(false)} style={{ background: 'var(--bg-main)', border: '1px solid var(--border-light)', padding: '11px', borderRadius: '8px', color: 'var(--text-dark)', fontWeight: '700', cursor: 'pointer' }}>
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      <main className="dashboard-container">
        {activeTab === 'home' && (
          <div>
            <div className="welcome-card">
              <h2>Welcome, Dr. {userName}!</h2>
              <p>Master all {totalTopics} Third MBBS curriculum topics seamlessly across Block One and Block Two with intelligent live velocity tracking.</p>
              
              <div style={{ display: 'flex', gap: '8px', marginTop: '14px', flexWrap: 'wrap' }}>
                <button onClick={() => setShowResetModal(true)} style={{ background: 'rgba(255,255,255,0.15)', border: '1px solid rgba(255,255,255,0.2)', color: 'white', padding: '6px 12px', borderRadius: '6px', fontSize: '0.72rem', fontWeight: '700', cursor: 'pointer' }}>
                  🔄 Reset Progress
                </button>
                <button onClick={() => setShowBackupModal(true)} style={{ background: 'rgba(255,255,255,0.15)', border: '1px solid rgba(255,255,255,0.2)', color: 'white', padding: '6px 12px', borderRadius: '6px', fontSize: '0.72rem', fontWeight: '700', cursor: 'pointer' }}>
                  💾 Backup & Restore
                </button>
              </div>
            </div>

            {/* Exam Velocity & Countdown Widget */}
            <div className="widget-card">
              <span className="continue-label" style={{ marginBottom: '8px' }}>📅 3rd MB Exam Date & Active Velocity</span>
              
              {!isPremium ? (
                <div className="teaser-locked-overlay">
                  <div className="teaser-blur">
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
                      <span>Days Remaining: <b>60 Days</b></span>
                      <span>Required Pace: <b>7.5 Topics/Day</b></span>
                    </div>
                    <div className="progress-bar-bg"><div className="progress-bar-fill" style={{ width: '45%' }}></div></div>
                  </div>
                  <button className="teaser-lock-badge" onClick={() => setShowTransferModal(true)}>
                    🔒 Unlock Live Exam Velocity (₦1,000)
                  </button>
                </div>
              ) : (
                <div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
                    <div>
                      <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)', fontWeight: '700', display: 'block' }}>Required Daily Pace:</span>
                      <span style={{ fontSize: '1.4rem', fontWeight: '800', color: '#00A896' }}>{requiredPacePerDay} Topics / Day</span>
                    </div>
                    <div style={{ textAlign: 'right' }}>
                      <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)', fontWeight: '700', display: 'block', marginBottom: '2px' }}>Exam Target Date:</span>
                      <input 
                        type="date" 
                        value={targetExamDate} 
                        onChange={(e) => setTargetExamDate(e.target.value)}
                        style={{ padding: '6px 8px', borderRadius: '8px', border: '1px solid var(--border-light)', fontSize: '0.78rem', fontWeight: '700', background: 'var(--bg-main)', color: 'var(--text-dark)', outline: 'none' }}
                      />
                    </div>
                  </div>
                  <p style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>
                    ⏳ <b>{examDaysLeft} Days Remaining</b> calculated dynamically across your <b>{remainingTopics} remaining uncompleted topics</b>!
                  </p>
                </div>
              )}
            </div>

            {/* Pomodoro Timer */}
            <div className="widget-card" style={{ textAlign: 'center' }}>
              <span className="continue-label" style={{ justifyContent: 'center' }}>⏱️ Flexible Pomodoro Focus Timer</span>
              <div style={{ fontSize: '2.4rem', fontWeight: '800', color: 'var(--text-dark)', margin: '4px 0', letterSpacing: '-1px' }}>
                {String(timerMinutes).padStart(2, '0')}:{String(timerSeconds).padStart(2, '0')}
              </div>
              
              <div style={{ display: 'flex', justifyContent: 'center', gap: '6px', marginBottom: '10px', flexWrap: 'wrap' }}>
                <button onClick={() => resetTimer('study', 25)} style={{ background: 'var(--bg-main)', border: '1px solid var(--border-light)', padding: '4px 8px', borderRadius: '6px', fontSize: '0.7rem', fontWeight: '700', color: 'var(--text-dark)', cursor: 'pointer' }}>25m Study</button>
                <button onClick={() => resetTimer('study', 45)} style={{ background: 'var(--bg-main)', border: '1px solid var(--border-light)', padding: '4px 8px', borderRadius: '6px', fontSize: '0.7rem', fontWeight: '700', color: 'var(--text-dark)', cursor: 'pointer' }}>45m Study</button>
                <button onClick={() => resetTimer('study', 60)} style={{ background: 'var(--bg-main)', border: '1px solid var(--border-light)', padding: '4px 8px', borderRadius: '6px', fontSize: '0.7rem', fontWeight: '700', color: 'var(--text-dark)', cursor: 'pointer' }}>60m Study</button>
                <button onClick={() => resetTimer('break', 5)} style={{ background: 'var(--bg-main)', border: '1px solid var(--border-light)', padding: '4px 8px', borderRadius: '6px', fontSize: '0.7rem', fontWeight: '700', color: 'var(--text-dark)', cursor: 'pointer' }}>5m Break</button>
                <button onClick={() => resetTimer('break', 15)} style={{ background: 'var(--bg-main)', border: '1px solid var(--border-light)', padding: '4px 8px', borderRadius: '6px', fontSize: '0.7rem', fontWeight: '700', color: 'var(--text-dark)', cursor: 'pointer' }}>15m Break</button>
              </div>

              <button 
                onClick={toggleTimer}
                style={{ background: isTimerRunning ? '#EF4444' : '#00A896', color: 'white', border: 'none', padding: '9px 24px', borderRadius: '8px', fontWeight: '800', cursor: 'pointer', fontSize: '0.85rem' }}
              >
                {isTimerRunning ? 'Pause Timer' : 'Start Focus Session'}
              </button>
            </div>

            <div className="continue-study-card">
              <span className="continue-label">Continue Study</span>
              <div className="continue-title">{continueTopic.title}</div>
              <p style={{fontSize: '0.75rem', color: '#94A3B8', marginBottom: '14px', fontWeight: '500'}}>
                {continueTopic.block} • {continueTopic.department} ({continueTopic.code})
              </p>
              <button 
                className="continue-btn"
                onClick={() => setActiveTab(continueTopic.block === 'Block One' ? 'block1' : 'block2')}
              >
                Go to Topic →
              </button>
            </div>

            <div className="widget-card">
              <div className="progress-header">
                <span className="progress-title">Overall Curriculum Completion</span>
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

            <div className="widget-card">
              <span className="progress-title" style={{ display: 'block', marginBottom: '14px' }}>📊 Department Mastery Breakdown</span>
              {[
                { name: 'Morbid Anatomy', data: getDeptStats('Morbid Anatomy') },
                { name: 'Chemical Pathology', data: getDeptStats('Chemical Pathology') },
                { name: 'Medical Microbiology', data: getDeptStats('Medical Microbiology') },
                { name: 'Haematology', data: getDeptStats('Haematology') },
                { name: 'Pharmacology', data: getDeptStats('Pharmacology') },
              ].map((dept, idx) => (
                <div key={idx} style={{ marginBottom: '12px' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.78rem', fontWeight: '700', marginBottom: '4px' }}>
                    <span>{dept.name}</span>
                    <span style={{ color: '#028090' }}>{dept.data.done}/{dept.data.count} ({dept.data.percent}%)</span>
                  </div>
                  <div className="progress-bar-bg" style={{ height: '7px', marginBottom: 0 }}>
                    <div className="progress-bar-fill" style={{ width: `${dept.data.percent}%` }}></div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {activeTab !== 'home' && (
          <div>
            <div style={{display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '14px'}}>
              <h2 style={{fontSize: '1.15rem', fontWeight: '800'}}>
                {activeTab === 'block1' && 'Block One Curriculum'}
                {activeTab === 'block2' && 'Block Two Curriculum'}
              </h2>
              
              <button 
                onClick={() => setShowCustomModal(true)}
                style={{
                  background: 'linear-gradient(135deg, #00A896 0%, #028090 100%)',
                  color: 'white', border: 'none', padding: '8px 14px', borderRadius: '10px',
                  fontSize: '0.75rem', fontWeight: '800', cursor: 'pointer',
                  boxShadow: '0 4px 12px rgba(0, 168, 150, 0.35)', display: 'flex', alignItems: 'center', gap: '4px'
                }}
              >
                ✨ Add Custom Topic
              </button>
            </div>

            <div style={{ display: 'flex', gap: '6px', overflowX: 'auto', paddingBottom: '8px', marginBottom: '12px' }}>
              {['All', 'Morbid Anatomy', 'Chemical Pathology', 'Medical Microbiology', 'Haematology', 'Pharmacology'].map(dept => (
                <button
                  key={dept}
                  onClick={() => setSelectedDept(dept)}
                  style={{
                    padding: '7px 14px',
                    borderRadius: '20px',
                    border: '1px solid var(--border-light)',
                    fontSize: '0.75rem',
                    fontWeight: '700',
                    whiteSpace: 'nowrap',
                    background: selectedDept === dept ? 'var(--navy-dark)' : 'var(--card-bg)',
                    color: selectedDept === dept ? '#FFFFFF' : 'var(--text-muted)',
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
                padding: '12px 14px',
                borderRadius: '12px',
                border: '1px solid var(--border-light)',
                marginBottom: '14px',
                fontSize: '0.88rem',
                backgroundColor: 'var(--card-bg)',
                color: 'var(--text-dark)',
                outline: 'none'
              }}
            />

            <div>
              {filteredTopics.length === 0 ? (
                <p style={{textAlign: 'center', color: 'var(--text-muted)', padding: '40px 20px', fontWeight: '600'}}>No topics found matching your filter.</p>
              ) : (
                filteredTopics.map(topic => {
                  const currentStatus = userProgress[topic.id]?.status || 'Not Started';
                  
                  return (
                    <div key={topic.id} className="topic-card">
                      <div className="topic-meta">
                        <span className="dept-badge">{topic.department}</span>
                        <span className="topic-code">{topic.code}</span>
                      </div>
                      <div className="topic-name">
                        {topic.title}
                        {topic.isCustom && <span style={{ marginLeft: '6px', fontSize: '0.65rem', background: '#E0F2FE', color: '#028090', padding: '2px 6px', borderRadius: '4px' }}>Custom</span>}
                      </div>
                      
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
                        <button onClick={() => handleLinkClick(topic)} className="drive-link-btn" style={{ background: '#EFF6FF', color: '#2563EB', border: 'none', cursor: 'pointer', borderRadius: '8px', padding: '7px 12px', fontWeight: '700', fontSize: '0.75rem', display: 'flex', alignItems: 'center', gap: '6px', marginTop: '10px' }}>
                          📁 Open Google Drive Resource Folder
                        </button>
                      )}
                    </div>
                  );
                })
              )}
            </div>
          </div>
        )}
      </main>

      <nav className="bottom-nav">
        <button 
          onClick={() => setActiveTab('home')} 
          className="nav-item-btn"
          style={{ color: activeTab === 'home' ? '#00A896' : 'var(--text-muted)' }}
        >
          <span>🏠</span>
          <span>Home</span>
        </button>
        <button 
          onClick={() => setActiveTab('block1')} 
          className="nav-item-btn"
          style={{ color: activeTab === 'block1' ? '#00A896' : 'var(--text-muted)' }}
        >
          <span>📖</span>
          <span>Block 1</span>
        </button>
        <button 
          onClick={() => setActiveTab('block2')} 
          className="nav-item-btn"
          style={{ color: activeTab === 'block2' ? '#00A896' : 'var::text-muted)' }}
        >
          <span>📚</span>
          <span>Block 2</span>
        </button>
      </nav>
    </div>
  );
}
