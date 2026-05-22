import React, { useState, useEffect } from 'react';
import '../styles/dbStyle.css';
import '../styles/detailsStyle.css';

export default function Dashboard() {
  const [showCertificateModal, setShowCertificateModal] = useState(false);
  const [philTime, setPhilTime] = useState('');
  const [temperature, setTemperature] = useState(28);
  const [certificateIndex, setCertificateIndex] = useState(0);

  const certificates = [
    { id: 1, name: 'React Fundamentals', issuer: 'Coursera', date: '2024' },
    { id: 2, name: 'Web Development', issuer: 'Udemy', date: '2024' },
    { id: 3, name: 'UI/UX Design', issuer: 'Figma Academy', date: '2023' },
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

  useEffect(() => {
    const updateTime = () => {
      const now = new Date();
      const philTimeString = now.toLocaleString('en-PH', {
        timeZone: 'Asia/Manila',
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit',
        hour12: true
      });
      setPhilTime(philTimeString);
    };

    updateTime();
    const interval = setInterval(updateTime, 1000);

    return () => clearInterval(interval);
  }, []);

  return (
    <><div className="dashboard-container">
          <div className="profile-left">
              <img
                  src={require('./1x1 Formal.png')}
                  alt="Profile"
                  className="profile-image" />
          </div>

          <div className="profile-right">
              <h1 className="profile-name">Christian Raphael A. Carandang</h1>
              <p className="profile-location"><i className="ri-map-pin-line"></i> Cabuyao, Laguna, Philippines</p>
              <p className="profile-role">Front-End Developer | Game Developer | UI/UX Designer</p>

              <div className="button-group">
                  <button className="emailBtn">Email Me</button>
                  <button className="chatBtn">Chat with Christian</button>
              </div>
          </div>

          <div className="time-temp-card">
              <div className="time-section">
                  <p className="time-label"><i className="ri-time-line"></i> Local Time</p>
                  <p className="time-display">{philTime}</p>
              </div>
              <div className="temp-section">
                  <p className="temp-label"><i className="ri-thermometer-2-line"></i> Temperature</p>
                  <p className="temp-display">{temperature}°C</p>
              </div>
          </div>
      </div><div className="cards-container">
              <div className="left-cards">
                  <div className="about-card">
                      <h2 className="about-title"><i class="ri-information-line"></i> About Me</h2>
                      <p className="about-content">
                          Christian Raphael A. Carandang is a dedicated Bachelor of Science in Computer Science student at the 
                          University of Cabuyao, with a strong passion for technology and digital creativity. He is committed 
                          to continuously enhancing his expertise in C# programming, 3D modeling, animation, and visual design. 
                          Through consistent practice and hands-on projects, he strives to deepen his understanding of software 
                          development principles while also exploring creative approaches to problem-solving. 
                      </p>
                      <br></br>
                      <p className="about-content">
                          He actively seeks opportunities to apply his skills in real-world scenarios, aiming to build innovative 
                          and user-centered applications. With a mindset focused on growth and adaptability, he is eager to learn 
                          new tools, frameworks, and industry practices that can further strengthen his capabilities. His goal is 
                          to contribute effectively to both technical and creative projects, collaborating with others to develop 
                          impactful and engaging digital solutions.
                      </p>
                  </div>

                  <div className="tech-stack-card">
                      <div className="tech-stack-header">
                          <h2 className="tech-stack-title"><i class="ri-settings-line"></i> Expertise</h2>
                          <a href="#" className="view-all-link">View All <i class="ri-arrow-right-s-line"></i></a>
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

                  <div className="experiences-card">
                      <h2 className="experiences-title"><i class="ri-suitcase-line"></i> Experiences</h2>
                      <div className="experiences-list">
                          <div className="experience-item">
                              <div className="experience-header">
                                  <h3 className="experience-position">Logistics Director</h3>
                                  <span className="experience-date">2025</span>
                              </div>
                              <p className="experience-company"><i className="ri-map-pin-line"></i> Junior Blockchain Education Consortium of the Philippines - Laguna</p>
                              <p className="experience-company"><i class="ri-signal-tower-line"></i> Organization</p>
                              <p className="experience-description">I coordinated suppliers, managed inventory, and handled transportation to procure food, strengthening my organization and coordination skills.</p>
                          </div>

                          <div className="experience-item">
                              <div className="experience-header">
                                  <h3 className="experience-position">Logistics Officer</h3>
                                  <span className="experience-date">2024 - 2025</span>
                              </div>
                              <p className="experience-company"><i className="ri-map-pin-line"></i> AWS Cloud Club - University of Cabuyao</p>
                              <p className="experience-company"><i class="ri-signal-tower-line"></i> Organization</p>
                              <p className="experience-description">I handled suppliers, managed inventory, and oversaw booth operations, improving my organization and coordination skills.</p>
                          </div>

                          <div className="experience-item">
                              <div className="experience-header">
                                  <h3 className="experience-position">Volunteer</h3>
                                  <span className="experience-date">2024</span>
                              </div>
                              <p className="experience-company"><i className="ri-map-pin-line"></i> Junior Blockchain Education Consortium of the Philippines - Dangals</p>
                              <p className="experience-company"><i class="ri-signal-tower-line"></i> Organization</p>
                              <p className="experience-description">Volunteered as a booth assistant during event, improving communication, teamwork, and efficiency in fast-paced environments.</p>
                          </div>
                          <div className="experience-item">
                              <div className="experience-header">
                                  <h3 className="experience-position">Data Encoder</h3>
                                  <span className="experience-date">2023</span>
                              </div>
                              <p className="experience-company"><i className="ri-map-pin-line"></i> CITECH: Cabuyao Institute of Technology</p>
                              <p className="experience-company"><i class="ri-signal-tower-line"></i> Work Immersion</p>
                              <p className="experience-description">Accurately encoded and managed student registrations and grades, ensuring data integrity and efficiency.</p>
                          </div>
                      </div>
                  </div>

                  <div className="cards-row">
                      <div className="certificate-card">
                          <div className="certificate-header">
                              <h2 className="certificate-title"><i class="ri-award-line"></i> Certificates</h2>
                          </div>
                          <div className="certificate-content">
                              <div className="certificate-item">
                                  <h3 className="certificate-name">{certificates[certificateIndex].name}</h3>
                                  <p className="certificate-issuer">{certificates[certificateIndex].issuer}</p>
                                  <p className="certificate-date">{certificates[certificateIndex].date}</p>
                              </div>
                          </div>
                          <div className="certificate-controls">
                              <button className="certificate-btn" onClick={handlePrevCertificate}><i class="ri-arrow-left-s-line"></i></button>
                              <span className="certificate-counter">{certificateIndex + 1} / {certificates.length}</span>
                              <button className="certificate-btn" onClick={handleNextCertificate}><i class="ri-arrow-right-s-line"></i></button>
                          </div>
                      </div>

                      <div className="projects-card">
                          <h2 className="projects-title"><i class="ri-lightbulb-line"></i> Personal Projects</h2>
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

              <div className="education-card">
                  <h2 className="education-title"><i class="ri-graduation-cap-line"></i> Educations</h2>
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
                  </div>
              </div>
          </div></>
  );
}
