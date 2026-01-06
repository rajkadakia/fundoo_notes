import React, { useState } from 'react';
import { useNavigate, Outlet, Link, useLocation } from 'react-router-dom';
import { Menu, Lightbulb, Bell, Archive, Trash2, LogOut, Search, Tag, Edit2 } from 'lucide-react';
import EditLabelsModal from './EditLabelsModal';
import { useLabels } from '../context/LabelContext';
import { useSearch } from '../context/SearchContext';
import './Layout.css';

const Layout = () => {
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const { searchQuery, setSearchQuery } = useSearch();
  const navigate = useNavigate();
  const location = useLocation();

  const toggleSidebar = () => setSidebarOpen(!sidebarOpen);

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    navigate('/login');
  };

  const navItems = [
    { label: 'My Notes', icon: <Lightbulb size={20} />, path: '/dashboard' },
    { label: 'Create Note', icon: <div style={{fontSize: 20, fontWeight: 'bold'}}>+</div>, path: '/create-note' }, // Adding explicit create option request?
    { label: 'Reminders', icon: <Bell size={20} />, path: '/reminders' },
    { label: 'Archive', icon: <Archive size={20} />, path: '/archive' },
    { label: 'Trash', icon: <Trash2 size={20} />, path: '/trash' },
  ];

  const { labels, refreshLabels } = useLabels();
  const [showLabelModal, setShowLabelModal] = useState(false);

  React.useEffect(() => {
      refreshLabels();
  }, []);


  return (
    <div className="layout-container">
      {/* Header */}
      <header className="app-header">
        <div className="header-left">
          <button className="icon-btn" onClick={toggleSidebar}>
            <Menu size={24} />
          </button>
          <div className="logo-area">
            <img src="https://www.gstatic.com/images/branding/product/1x/keep_2020q4_48dp.png" alt="Logo" className="logo-img" />
            <span className="logo-text">Fundoo</span>
          </div>
        </div>
        
        <div className="header-search">
            <div className="search-box">
                <Search size={20} className="search-icon"/>
                <input 
                    type="text" 
                    placeholder="Search" 
                    className="search-input" 
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                />
            </div>
        </div>

        <div className="header-right">
          <button className="icon-btn" onClick={handleLogout} title="Logout">
            <LogOut size={24} />
          </button>
        </div>
      </header>

      <div className="main-area">
        {/* Sidebar */}
        <aside className={`sidebar ${sidebarOpen ? 'open' : 'closed'}`}>
          <nav className="sidebar-nav">
            {navItems.map((item) => (
              <Link 
                key={item.label} 
                to={item.path} 
                className={`nav-item ${location.pathname === item.path ? 'active' : ''}`}
              >
                <span className="nav-icon">{item.icon}</span>
                {sidebarOpen && <span className="nav-label">{item.label}</span>}
              </Link>
            ))}
          </nav>
          <div className="section-divider-sidebar labels-header">
              {sidebarOpen && (
                  <>
                    <span>LABELS</span>
                    <button className="edit-labels-btn" onClick={() => setShowLabelModal(true)} title="Edit labels">
                        <Edit2 size={14} />
                    </button>
                  </>
              )}
          </div>
          
          <nav className="sidebar-nav labels-nav">
              {labels.map(label => (
                   <div key={label._id} className="nav-item label-item-static">
                    <span className="nav-icon"><Tag size={18} /></span>
                    {sidebarOpen && <span className="nav-label">{label.name}</span>}
                  </div>
              ))}
          </nav>
        </aside>

        {showLabelModal && (
            <div className="modal-overlay" onClick={() => setShowLabelModal(false)}>
                <EditLabelsModal 
                    onClose={() => setShowLabelModal(false)}
                />
            </div>
        )}

        {/* Content */}
        <main className="content-area">
          <Outlet />
        </main>
      </div>
    </div>
  );
};

export default Layout;
