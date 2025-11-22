import React from "react";

function Skills() {
  return (
    <div className="dashboard-container container my-5" id="skills">
      {/* Title */}
      <h2 className="skills-title mb-3">My Skills</h2>

      {/* Description */}
      <p className="skills-description mb-5">
        Some of my skills are not fully mastered yet. Most of them I am still learning,
        practicing, or only familiar with. But I continue improving and exploring new
        technologies to become fully skilled and confident in each area.
      </p>

      {/* FRONT-END SKILLS */}
      <div className="skill-big-card p-4 mb-4">
        <h4 className="category-title text-center mb-3">Front-End Skills</h4>
        <hr />

        {/* Header row */}
        <div className="skill-row header-row">
          <span className="name">Name</span>
          <span className="level">Level</span>
          <span className="usage">Usage</span>
        </div>
        <hr className="header-divider" />

        {/* Skill rows */}
        <div className="skill-row">
          <span className="name">HTML / CSS</span>
          <span className="level">Skilled</span>
          <span className="usage">● ● ● ○ ○</span>
        </div>
        <div className="skill-row">
          <span className="name">React</span>
          <span className="level">Learning</span>
          <span className="usage">● ● ○ ○ ○</span>
        </div>
        <div className="skill-row">
          <span className="name">Bootstrap</span>
          <span className="level">Learning</span>
          <span className="usage">● ● ○ ○ ○</span>
        </div>
        <div className="skill-row">
          <span className="name">JavaScript</span>
          <span className="level">Learning</span>
          <span className="usage">● ● ○ ○ ○</span>
        </div>
      </div>

      {/* BACK-END SKILLS */}
      <div className="skill-big-card p-4 mb-4">
        <h4 className="category-title text-center mb-3">Back-End Skills</h4>
        <hr />

        <div className="skill-row header-row">
          <span className="name">Name</span>
          <span className="level">Level</span>
          <span className="usage">Usage</span>
        </div>
        <hr className="header-divider" />

        <div className="skill-row">
          <span className="name">PHP</span>
          <span className="level">Learning</span>
          <span className="usage">● ● ○ ○ ○</span>
        </div>
        <div className="skill-row">
          <span className="name">Laravel</span>
          <span className="level">Learning</span>
          <span className="usage">● ● ○ ○ ○</span>
        </div>
        <div className="skill-row">
          <span className="name">MySQL</span>
          <span className="level">Learning</span>
          <span className="usage">● ● ○ ○ ○</span>
        </div>
      </div>

      {/* TOOLS SKILLS */}
      <div className="skill-big-card p-4 mb-4">
        <h4 className="category-title text-center mb-3">Tools Skills</h4>
        <hr />

        <div className="skill-row header-row">
          <span className="name">Name</span>
          <span className="level">Level</span>
          <span className="usage">Usage</span>
        </div>
        <hr className="header-divider" />

        <div className="skill-row">
          <span className="name">GitHub</span>
          <span className="level">Skilled</span>
          <span className="usage">● ● ● ○ ○</span>
        </div>
        <div className="skill-row">
          <span className="name">VS Code</span>
          <span className="level">Skilled</span>
          <span className="usage">● ● ● ○ ○</span>
        </div>
        <div className="skill-row">
          <span className="name">Figma</span>
          <span className="level">Mastery</span>
          <span className="usage">● ● ● ● ○</span>
        </div>
        <div className="skill-row">
          <span className="name">Blender</span>
          <span className="level">Skilled</span>
          <span className="usage">● ● ● ○ ○</span>
        </div>
        <div className="skill-row">
          <span className="name">Docker</span>
          <span className="level">Learning</span>
          <span className="usage">● ● ○ ○ ○</span>
        </div>
      </div>

      {/* GAME DEV SKILLS */}
      <div className="skill-big-card p-4 mb-4">
        <h4 className="category-title text-center mb-3">Game Development Skills</h4>
        <hr />

        <div className="skill-row header-row">
          <span className="name">Name</span>
          <span className="level">Level</span>
          <span className="usage">Usage</span>
        </div>
        <hr className="header-divider" />

        <div className="skill-row">
          <span className="name">Unity</span>
          <span className="level">Learning</span>
          <span className="usage">● ● ○ ○ ○</span>
        </div>
        <div className="skill-row">
          <span className="name">Lua Script</span>
          <span className="level">Learning</span>
          <span className="usage">● ● ○ ○ ○</span>
        </div>
      </div>

      {/* GAME DEV SKILLS */}
      <div className="skill-big-card p-4 mb-4">
        <h4 className="category-title text-center mb-3">Programming Language Skills</h4>
        <hr />

        <div className="skill-row header-row">
          <span className="name">Name</span>
          <span className="level">Level</span>
          <span className="usage">Usage</span>
        </div>
        <hr className="header-divider" />

        <div className="skill-row">
          <span className="name">Java Programming</span>
          <span className="level">Skilled</span>
          <span className="usage">● ● ● ○ ○</span>
        </div>
        <div className="skill-row">
          <span className="name">Phython</span>
          <span className="level">Learning</span>
          <span className="usage">● ● ○ ○ ○</span>
          </div>
        <div className="skill-row">
          <span className="name">C#</span>
          <span className="level">Learning</span>
          <span className="usage">● ● ○ ○ ○</span>
          </div>
      </div>
    </div>
  );
}

export default Skills;
