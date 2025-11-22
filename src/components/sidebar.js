import React from "react";
import { Nav } from "react-bootstrap"; 

const Sidebar = () => {
  return (
    <aside className="sidebar-container">
      <div className="sidebar-name">PORTFOLIO</div>

      <Nav className="flex-column">
        <Nav.Item>
          <Nav.Link href="/" className="sidebar-link">
            <i className="ri-dashboard-line fs-5 me-2"></i> Home
          </Nav.Link>
        </Nav.Item>
        <Nav.Item>
          <Nav.Link href="/projects" className="sidebar-link">
            <i className="ri-folders-line fs-5 me-2"></i> Projects
          </Nav.Link>
        </Nav.Item>
        <Nav.Item>
          <Nav.Link href="/skills" className="sidebar-link">
            <i className="ri-settings-line fs-5 me-2"></i> Skills
          </Nav.Link>
        </Nav.Item>
      </Nav>

      <div className="sidebar-footer">&copy; 2025 Christian Carandang</div>
    </aside>
  );
};

export default Sidebar;
