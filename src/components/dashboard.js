import React, { useState, useEffect } from 'react';
import '../styles/dbStyle.css';
import '../styles/detailsStyle.css';
import ChatBot from './chatBot'; // IMPORT CHATBOT COMPONENT HERE

export default function Dashboard() {
  const [showCertificateModal, setShowCertificateModal] = useState(false);
  const [certificateIndex, setCertificateIndex] = useState(0);
  
  // Single global visibility state shared with child component
  const [showChatbot, setShowChatbot] = useState(false);

  // Theme state: defaults to light mode
  const [theme, setTheme] = useState('light');

  // Sync theme with wrapper element attribute
  useEffect(() => {
    const wrapper = document.querySelector('.main-wrapper');
    if (wrapper) {
      wrapper.setAttribute('data-theme', theme);
    }
  }, [theme]);

  const toggleTheme = () => {
    setTheme((prevTheme) => (prevTheme === 'light' ? 'dark' : 'light'));
  };

  // 1. Added the Wadhwani certificate data to your list
  const certificates = [
    { 
      id: 1, 
      name: 'Entrepreneurship & Soft Skills (Certificate 1)', 
      issuer: 'Wadhwani Foundation', 
      date: 'May 2, 2026',
      image: 'Wadhwani.jpg' 
    },
    { 
      id: 2, 
      name: 'Entrepreneurship & Soft Skills (Certificate 2)', 
      issuer: 'Wadhwani Foundation', 
      date: 'May 13, 2026',
      image: 'Wadhwani1.jpg' 
    },
    { 
      id: 3, 
      name: 'SIKAPTala 2026: Virtual Hackathon', 
      issuer: 'SIKAPTala', 
      date: '2026',
      image: 'Wadhwani1.jpg' 
    },
  ];

  const projects = [
    { id: 1, name: 'Portfolio Website', description: 'Personal portfolio showcasing projects' },
    { id: 2, name: '3D Game Project', description: 'Unity-based game development' },
  ];

  const handleNextCertificate = () => {
    setCertificateIndex((prevIndex) => (prevIndex + 1) % certificates.length);
  };

  const handlePrevCertificate = () => {
    setCertificateIndex((prevIndex) => (prevIndex - 1 + certificates.length) % certificates.length);
  };

  const currentCert = certificates[certificateIndex];

  return (
    <div className="main-wrapper" data-theme={theme}>
      <div className="dashboard-container">
        <div className="profile-left">
          <img
            src={require('./1x1 Formal.png')}
            alt="Profile"
            className="profile-image" />
        </div>

        <div className="profile-right">
          <div className="profile-name-container">
            <h1 className="profile-name">Christian Raphael A. Carandang</h1>
            
            {/* Custom Theme Toggle Switch */}
            <label className="theme-switch-wrapper" title={theme === 'light' ? "Switch to Dark Mode" : "Switch to Light Mode"}>
              <input 
                type="checkbox" 
                onChange={toggleTheme} 
                checked={theme === 'dark'} 
              />
              <div className="theme-switch-slider">
                <i className="ri-sun-line icon-sun"></i>
                <i className="ri-moon-line icon-moon"></i>
                <span className="theme-switch-ball"></span>
              </div>
            </label>
          </div>

          <p className="profile-location"><i className="ri-map-pin-line"></i> Cabuyao, Laguna, Philippines</p>
          <p className="profile-role">Front-End Developer | Game Developer | UI/UX Designer</p>

          <div className="button-group">
            <button className="emailBtn">Email Me</button>
            <a 
              href="https://github.com/cntaxc" 
              target="_blank" 
              rel="noopener noreferrer" 
              className="social-link-btn githubBtn"
            >
              <i className="ri-github-fill"></i>
            </a>
            <a 
              href="https://www.linkedin.com/in/christian-carandang-b30015334/" 
              target="_blank" 
              rel="noopener noreferrer" 
              className="social-link-btn linkedInBtn"
            >
              <i className="ri-linkedin-box-fill"></i>
            </a>
          </div>
        </div>
      </div>

      <div className="portfolio-grid-container">
        
        <div className="grid-stack-left">
          <div className="about-card">
            <h2 className="about-title">About Me</h2>
            <p className="about-content">
              Christian Raphael A. Carandang is a dedicated Bachelor of Science in Computer Science student at the 
              University of Cabuyao, with a strong passion for technology and digital creativity. He is committed 
              to continuously enhancing his expertise in C# programming, 3D modeling, animation, and visual design. 
              Through consistent practice and hands-on projects, he strives to deepen his understanding of software 
              development principles while also exploring creative approaches to problem-solving. 
            </p>
            <br />
            <p className="about-content">
              He actively seeks opportunities to apply his skills in real-world scenarios, aiming to build innovative 
              and user-centered applications. With a mindset focused on growth and adaptability, he is eager to learn 
              new tools, frameworks, and industry practices that can further strengthen his capabilities.
            </p>
          </div>

          <div className="tech-stack-card">
            <div className="tech-stack-header">
              <h2 className="tech-stack-title">Expertise</h2>
              <a href="#" className="view-all-link">View All <i className="ri-arrow-right-s-line"></i></a>
            </div>

            <div className="tech-category">
              <h3 className="category-title">Frontend</h3>
              <div className="tech-tags">
                <span className="tech-tag">C#</span>
                <span className="tech-tag">CSS</span>
                <span className="tech-tag">React</span>
                <span className="tech-tag">Java</span>
              </div>
            </div>

            <div className="tech-category">
              <h3 className="category-title">3D & Designs</h3>
              <div className="tech-tags">
                <span className="tech-tag">3D Modeling</span>
                <span className="tech-tag">3D Animation</span>
                <span className="tech-tag">Rigging</span>
                <span className="tech-tag">Game Design</span>
                <span className="tech-tag">UI/UX Design</span>
                <span className="tech-tag">Wireframing</span>
                <span className="tech-tag">Prototyping</span>
              </div>
            </div>

            <div className="tech-category">
              <h3 className="category-title">Software</h3>
              <div className="tech-tags">
                <span className="tech-tag">Unity Engine</span>
                <span className="tech-tag">VSCode Community</span>
                <span className="tech-tag">VSCode</span>
                <span className="tech-tag">Eclipse</span>
                <span className="tech-tag">Blender</span>
                <span className="tech-tag">Figma</span>
                <span className="tech-tag">Canva</span>
              </div>
            </div>
          </div>
        </div>

        <div className="education-card">
          <h2 className="education-title">Educations</h2>
          <div className="timeline">
            <div className="timeline-item">
              <div className="timeline-marker"></div>
              <div className="timeline-content">
                <span className="timeline-date">2023 – 2027</span>
                <h3 className="timeline-school">Bachelor of Science in Computer Science</h3>
                <p className="timeline-institution"><i className="ri-map-pin-line"></i> University of Cabuyao</p>
                <p className="timeline-institution">University of Cabuyao (Pamantasan ng Cabuyao) is one of the leading local colleges and universities in the Philippines</p>
              </div>
            </div>

            <div className="timeline-item">
              <div className="timeline-marker"></div>
              <div className="timeline-content">
                <span className="timeline-date">2021 - 2023</span>
                <h3 className="timeline-school">Science, Technology, Engineering, and Mathematics (STEM)</h3>
                <p className="timeline-institution"><i className="ri-map-pin-line"></i> Pamantasan ng Cabuyao</p>
                <p className="timeline-institution">Pamantasan ng Cabuyao (PnC) is one of the leading local colleges and universities in the Philippines</p>
              </div>
            </div>

            <div className="timeline-item">
              <div className="timeline-marker"></div>
              <div className="timeline-content">
                <span className="timeline-date">2016 – 2021</span>
                <h3 className="timeline-school">Junior High School</h3>
                <p className="timeline-institution"><i className="ri-map-pin-line"></i> Liceo De Cabuyao</p>
                <p className="timeline-institution"><i className="ri-map-pin-line"></i> Liceo De Calamba</p>
                <p className="timeline-institution">Liceo aims for holistic excellence of every learner. Excellence towards sanctity.</p>
              </div>
            </div>

            <div className="timeline-item">
              <div className="timeline-marker"></div>
              <div className="timeline-content">
                <span className="timeline-date">2011 – 2016</span>
                <h3 className="timeline-school">Elementary</h3>
                <p className="timeline-institution"><i className="ri-map-pin-line"></i> Liceo De Calamba</p>
                <p className="timeline-institution">Liceo aims for holistic excellence of every learner. Excellence towards sanctity.</p>
              </div>
            </div>
          </div>
        </div>

        <div className="experiences-card full-width-grid-item">
          <h2 className="experiences-title">Experiences</h2>
          <div className="experiences-grid-layout">
            <div className="experience-item">
              <div className="experience-header">
                <h3 className="experience-position">Logistics Director</h3>
                <span className="experience-date">2025</span>
              </div>
              <p className="experience-company"><i className="ri-map-pin-line"></i> Junior Blockchain Education Consortium of the Philippines - Laguna</p>
              <p className="experience-company"><i className="ri-signal-tower-line"></i> Organization</p>
              <p className="experience-description">I coordinated suppliers, managed inventory, and handled transportation to procure food, strengthening my organization and coordination skills.</p>
            </div>

            <div className="experience-item">
              <div className="experience-header">
                <h3 className="experience-position">Logistics Officer</h3>
                <span className="experience-date">2024 - 2025</span>
              </div>
              <p className="experience-company"><i className="ri-map-pin-line"></i> AWS Cloud Club - University of Cabuyao</p>
              <p className="experience-company"><i className="ri-signal-tower-line"></i> Organization</p>
              <p className="experience-description">I handled suppliers, managed inventory, and oversaw booth operations, improving my organization and coordination skills.</p>
            </div>

            <div className="experience-item">
              <div className="experience-header">
                <h3 className="experience-position">Volunteer</h3>
                <span className="experience-date">2024</span>
              </div>
              <p className="experience-company"><i className="ri-map-pin-line"></i> Junior Blockchain Education Consortium of the Philippines - Dangals</p>
              <p className="experience-company"><i className="ri-signal-tower-line"></i> Organization</p>
              <p className="experience-description">Volunteered as a booth assistant during event, improving communication, teamwork, and efficiency in fast-paced environments.</p>
            </div>

            <div className="experience-item">
              <div className="experience-header">
                <h3 className="experience-position">Data Encoder</h3>
                <span className="experience-date">2023</span>
              </div>
              <p className="experience-company"><i className="ri-map-pin-line"></i> CITECH: Cabuyao Institute of Technology</p>
              <p className="experience-company"><i className="ri-signal-tower-line"></i> Work Immersion</p>
              <p className="experience-description">Accurately encoded and managed student registrations and grades, ensuring data integrity and efficiency.</p>
            </div>

            <div className="experience-item">
              <div className="experience-header">
                <h3 className="experience-position">Volunteer</h3>
                <span className="experience-date">2026</span>
              </div>
              <p className="experience-company"><i className="ri-map-pin-line"></i> DEVCON Laguna</p>
              <p className="experience-company"><i className="ri-signal-tower-line"></i> Organization</p>
              <p className="experience-description">Volunteered as a Logistics, Registration, and Usher Staff, assisting in event coordination, attendee registration, crowd guidance, and ensuring smooth event operations throughout the program.</p>
            </div>

            <div className="experience-item">
              <div className="experience-header">
                <h3 className="experience-position">Virtual Hackathon</h3>
                <span className="experience-date">2026</span>
              </div>
              <p className="experience-company"><i className="ri-map-pin-line"></i> SIKAPTala</p>
              <p className="experience-company"><i className="ri-signal-tower-line"></i> Organization</p>
              <p className="experience-description">Front-end developer for a virtual hackathon, collaborating with a team to design and implement a responsive web application.</p>
            </div>
          </div>
        </div>

        <div className="bottom-split-row full-width-grid-item">
  <div className="certificate-card">
    
    {/* TITLE SECTION */}
    <div className="certificate-header">
      <h2 className="certificate-title">Certificates</h2>
    </div>

    {/* ONLY ONE IMAGE PREVIEW HERE */}
    <div className="certificate-img-preview">
      <img src={require(`./assets/Wadhwani/${currentCert.image}`)} alt={currentCert.name} />
    </div>

    <div className="certificate-content">
      <div className="certificate-item">
        <h3 className="certificate-name">{currentCert.name}</h3>
        <p className="certificate-issuer">{currentCert.issuer}</p>
        <p className="certificate-date">{currentCert.date}</p>

        {currentCert.image && (
          <div 
            className="gdrive-preview-trigger" 
            onClick={() => setShowCertificateModal(true)}
            title="View Full Certificate"
          >
            <i className="ri-image-line"></i> View Attached Document
          </div>
        )}
      </div>
    </div>
    
    <div className="certificate-controls">
      <button className="certificate-nav-btn" onClick={handlePrevCertificate}>
        <i className="ri-arrow-left-s-line"></i>
      </button>
      
      <span className="certificate-counter">{certificateIndex + 1} / {certificates.length}</span>
      
      <button className="certificate-nav-btn" onClick={handleNextCertificate}>
        <i className="ri-arrow-right-s-line"></i>
      </button>
    </div>
  </div>

          <div className="projects-card">
            <h2 className="projects-title">Personal Projects</h2>
            <div className="projects-list">
              {projects.map((project) => (
                <div key={project.id} className="project-item">
                  <h3 className="project-name">{project.name}</h3>
                  <p className="project-description">{project.description}</p>
                </div>
              ))}
            </div>
          </div>
        </div>

      </div>

      {showCertificateModal && currentCert.image && (
        <div className="gdrive-modal-overlay" onClick={() => setShowCertificateModal(false)}>
          <div className="gdrive-modal-top-bar">
            <div className="gdrive-modal-title">
              <i className="ri-image-fill"></i> {currentCert.name} - Verification Document
            </div>
            <button className="gdrive-close-btn" onClick={() => setShowCertificateModal(false)}>
              <i className="ri-close-line"></i>
            </button>
          </div>
          <div className="gdrive-modal-content" onClick={(e) => e.stopPropagation()}>
              <img 
                src={require(`./assets/Wadhwani/${currentCert.image}`)} 
                alt={currentCert.name} 
                className="gdrive-preview-img" 
              />
          </div>
        </div>
      )}

      <ChatBot showChatbot={showChatbot} setShowChatbot={setShowChatbot} />
    </div>
  );
}