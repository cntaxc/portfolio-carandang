import Sidebar from "./components/sidebar";
import Dashboard from "./components/dashboard";
import Projects from "./components/projects";
import Skills from "./components/skills";
import './styles/sidebarStyle.css';
import "./styles/dbStyle.css";
import "./styles/projectStyle.css";
import "./styles/skillStyle.css"; 
import "./App.css";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";

function App() {
  return (
    <Router>
      <div className="d-flex">
        <Sidebar />

        <main className="main-content flex-grow-1">
          <Routes>
            <Route path="/" element={<Dashboard />} />
            <Route path="/projects" element={<Projects />} />
            <Route path="/skills" element={<Skills />} />
          </Routes>
        </main>
      </div>
    </Router>
  );
}

export default App;
