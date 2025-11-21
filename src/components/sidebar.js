import React from 'react';
import { Nav } from 'react-bootstrap';
import './sidebarStyle.css';

const Sidebar = () => {
  return (
    <aside className="d-flex flex-column bg-dark p-4" style={{ minHeight: '100vh', width: '230px' }}>
      <div className="sidebar-name text-white fw-bold fs-4 mb-5 text-center" style={{ letterSpacing: '3px' }}>
        PORTFOLIO
      </div>
      <Nav className="flex-column gap-3">
        <Nav.Item>
          <Nav.Link href="#" className="d-flex align-items-center text-light px-4 py-3 rounded sidebar-link">
            <i className="ri-dashboard-line fs-5 me-3"></i> Home
          </Nav.Link>
        </Nav.Item>
        <Nav.Item>
          <Nav.Link href="#" className="d-flex align-items-center text-light px-4 py-3 rounded sidebar-link">
            <i className="ri-folders-line fs-5 me-3"></i> Projects
          </Nav.Link>
        </Nav.Item>
        <Nav.Item>
          <Nav.Link href="#" className="d-flex align-items-center text-light px-4 py-3 rounded sidebar-link">
            <i className="ri-settings-line fs-5 me-3"></i> Skills
          </Nav.Link>
        </Nav.Item>
      </Nav>
    </aside>
  );
};

export default Sidebar;
