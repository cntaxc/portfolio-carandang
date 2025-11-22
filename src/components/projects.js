import React from "react";

function Projects() {
  const projectList = [
    {
      title: "Library Management System",
      purpose: "Learn how to implement PHP + Docker",
      term: "Prelim",
      activityType: "Group Project",
      courseCode: "CC112",
      submittedTo: "Prof. Joseph D. Cartagenas",
      dateSubmitted: "September 29, 2025",
      platformSubmitted: "Google Classroom",
      link: "https://github.com/CSselrahC/appdev-prelim-lab.git",
    },
    {
      title: "Task Management Application",
      purpose: "Learn how to implement React Functional Components + Bootstrap",
      term: "Midterm",
      activityType: "Group Project",
      courseCode: "CCS112",
      submittedTo: "Prof. Joseph D. Cartagenas",
      dateSubmitted: "October 6, 2025",
      platformSubmitted: "Google Classroom",
      link: "https://github.com/cntaxc/ReactGroupProject_TaskFlow.git",
    },
    {
      title: "E-commerce Task Management System",
      purpose: "Learn how to implement Laravel + React",
      term: "Midterm",
      activityType: "Group Project",
      courseCode: "CC112",
      submittedTo: "Prof. Joseph D. Cartagenas",
      dateSubmitted: "October 13, 2025",
      platformSubmitted: "Google Classroom",
      link: "https://github.com/CSselrahC/appdev-midterm-ecommerce.git",
    },
    {
      title: "DISASTRO - Educational Game",
      purpose: "Created to implement a storyboard and prototype.",
      term: "Midterm",
      activityType: "Individual",
      courseCode: "CSEG1",
      submittedTo: "Prof. Renzo F. Evangelista",
      dateSubmitted: "October 13, 2025",
      platformSubmitted: "Pinnacle",
      link: "https://www.figma.com/proto/NE740EQbitPrFPVNmf5hq9/DISASTRO",
    },
    {
      title: "Crafting Narrative & Player Experience",
      purpose: "Created to implement a storyboard in a game.",
      term: "Prelim",
      activityType: "Individual",
      courseCode: "CSEG1",
      submittedTo: "Prof. Renzo F. Evangelista",
      dateSubmitted: "August 15, 2025",
      platformSubmitted: "Pinnacle",
      link: "https://drive.google.com/file/d/1fptTo-cyGd7U3OrwsltTm_u6rLJ7Zpz_/view",
    },
  ];

  const selfProjects = [
    {
      title: "E-commerce Wireframe Design",
      purpose: "A wireframe to showcase my improvements and experience.",
      term: "Personal Project",
      activityType: "Self-Made",
      link: "https://www.figma.com/proto/18mz7qjGxntodqlnJj7cNG/CCS112-%7C-E-Commerce-%7C-Wireframe?node-id=2073-55&p=f&t=mSvMpqbx7tge0Cj3-0&scaling=contain&content-scaling=fixed&page-id=0%3A1&starting-point-node-id=2073%3A55",
    },
    {
      title: "3D Model E-commerce Wireframe",
      purpose: "A wireframe design of 3D Model products for 3D Sellers and Buyers.",
      term: "Personal Project",
      activityType: "Self-Made",
      link: "https://www.figma.com/proto/fg8rflcpCcjd2RIfYUgtMz/Untitled?node-id=17-9&t=GqcmrLFSJE7GxSAs-0&scaling=contain&content-scaling=fixed&page-id=0%3A1&starting-point-node-id=34%3A121",
    },
  ];

  return (
    <div className="container-fluid dashboard-container" id="projects">
      {/* My Projects Section */}
      <h2 className="section-title mb-4">My Projects</h2>
      <div className="content-section p-5">
        <div className="row g-4 justify-content-center">
          {projectList.map((proj, index) => (
            <div className="col-md-4" key={index}>
              <div className="project-card p-4 h-100">
                <h4 className="project-title">{proj.title}</h4>
                <p><span className="label">Purpose:</span> {proj.purpose}</p>
                <p><span className="label">Term:</span> {proj.term}</p>
                <p><span className="label">Activity Type:</span> {proj.activityType}</p>
                <p><span className="label">Course Code:</span> {proj.courseCode}</p>
                <p><span className="label">Submitted To:</span> {proj.submittedTo}</p>
                <p><span className="label">Date Submitted:</span> {proj.dateSubmitted}</p>
                <p><span className="label">Platform Submitted:</span> {proj.platformSubmitted}</p>
                <p>
                  <span className="label">Link:</span>
                  <a href={proj.link} target="_blank" rel="noopener noreferrer" className="project-link">
                    View Project
                  </a>
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Self Projects Section */}
      <h2 className="section-title mt-5 mb-4">Self Projects</h2>
      <div className="content-section p-5">
        <div className="row g-4 justify-content-center">
          {selfProjects.map((proj, index) => (
            <div className="col-md-4" key={index}>
              <div className="project-card p-4 h-100">
                <h4 className="project-title">{proj.title}</h4>
                <p><span className="label">Purpose:</span> {proj.purpose}</p>
                <p>
                  <span className="label">Link:</span>
                  <a href={proj.link} target="_blank" rel="noopener noreferrer" className="project-link">
                    View Project
                  </a>
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

export default Projects;
