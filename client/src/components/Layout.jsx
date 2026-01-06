import React, { useState } from 'react';
import { useNavigate, Outlet, Link, useLocation } from 'react-router-dom';
import { Navbar, Nav, Container, Form, InputGroup, Button, Offcanvas } from 'react-bootstrap';
import { Menu, Lightbulb, Bell, Archive, Trash2, LogOut, Search, Tag, Edit2 } from 'lucide-react';
import EditLabelsModal from './EditLabelsModal';
import { useLabels } from '../context/LabelContext';
import { useSearch } from '../context/SearchContext';

const Layout = () => {
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const { searchQuery, setSearchQuery } = useSearch();
  const navigate = useNavigate();
  const location = useLocation();
  const [showLabelModal, setShowLabelModal] = useState(false);
  const { labels, refreshLabels } = useLabels();

  const toggleSidebar = () => setSidebarOpen(!sidebarOpen);

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    navigate('/login');
  };

  const navItems = [
    { label: 'Notes', icon: <Lightbulb size={20} />, path: '/dashboard' },
    { label: 'Create Note', icon: <Edit2 size={20} />, path: '/create-note' },
    { label: 'Reminders', icon: <Bell size={20} />, path: '/reminders' },
    { label: 'Archive', icon: <Archive size={20} />, path: '/archive' },
    { label: 'Trash', icon: <Trash2 size={20} />, path: '/trash' },
  ];

  React.useEffect(() => {
    refreshLabels();
  }, []);

  return (
    <div className="layout-wrapper" style={{ height: '100vh', display: 'flex', flexDirection: 'column' }}>
      {/* Navbar */}
      <Navbar bg="white" className="border-bottom px-3 py-2 sticky-top bg-white">
        <div className="d-flex align-items-center me-auto">
          <Button variant="light" className="rounded-circle p-2 me-3" onClick={toggleSidebar}>
            <Menu size={24} />
          </Button>
          <Navbar.Brand as={Link} to="/dashboard" className="d-flex align-items-center">
            <img
              src="https://www.gstatic.com/images/branding/product/1x/keep_2020q4_48dp.png"
              alt="Logo"
              width="40"
              height="40"
              className="me-2"
            />
            <span className="fs-4 text-secondary d-none d-sm-inline">Fundoo</span>
          </Navbar.Brand>
        </div>

        <Form className="d-none d-md-flex mx-auto" style={{ maxWidth: '720px', width: '100%' }}>
          <InputGroup className="bg-light rounded-pill border-0 px-3">
            <InputGroup.Text className="bg-transparent border-0 text-muted">
              <Search size={20} />
            </InputGroup.Text>
            <Form.Control
              type="text"
              placeholder="Search"
              className="bg-transparent border-0 shadow-none py-2"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </InputGroup>
        </Form>

        <div className="ms-auto d-flex align-items-center">
          <Button variant="light" className="rounded-circle p-2 ms-2 d-md-none">
            <Search size={24} />
          </Button>
          <Button variant="light" className="rounded-circle p-2 ms-2" onClick={handleLogout} title="Logout">
            <LogOut size={24} />
          </Button>
        </div>
      </Navbar>

      <div className="d-flex flex-grow-1 overflow-hidden">
        {/* Sidebar */}
        <aside 
          className={`bg-white transition-all py-3 ${sidebarOpen ? 'sidebar-expanded' : 'sidebar-collapsed'}`}
          style={{ width: sidebarOpen ? '280px' : '80px', transition: 'width 0.2s ease-in-out' }}
        >
          <Nav className="flex-column px-2">
            {navItems.map((item) => (
              <Nav.Link
                key={item.label}
                as={Link}
                to={item.path}
                className={`nav-item-bootstrap d-flex align-items-center rounded-pill mb-1 px-4 py-2 text-dark ${
                  location.pathname === item.path ? 'active-bg bg-warning-subtle fw-bold' : ''
                }`}
              >
                <span className="me-4">{item.icon}</span>
                {sidebarOpen && <span>{item.label}</span>}
              </Nav.Link>
            ))}

            <div className="border-top my-3 mx-3"></div>
            
            <div className="px-4 mb-2 d-flex justify-content-between align-items-center text-muted small fw-bold letter-spacing-1">
              {sidebarOpen && <span>LABELS</span>}
              {sidebarOpen && (
                <Button variant="link" className="p-0 text-muted" onClick={() => setShowLabelModal(true)}>
                  <Edit2 size={14} />
                </Button>
              )}
            </div>

            {labels.map(label => (
              <Nav.Link
                key={label._id}
                className="nav-item-bootstrap d-flex align-items-center rounded-pill mb-1 px-4 py-2 text-dark"
              >
                <span className="me-4"><Tag size={18} /></span>
                {sidebarOpen && <span>{label.name}</span>}
              </Nav.Link>
            ))}
          </Nav>
        </aside>

        {/* Content Area */}
        <main className="flex-grow-1 overflow-auto bg-light p-4">
          <Container fluid>
            <Outlet />
          </Container>
        </main>
      </div>

      {showLabelModal && (
        <EditLabelsModal onClose={() => setShowLabelModal(false)} />
      )}
    </div>
  );
};

export default Layout;
