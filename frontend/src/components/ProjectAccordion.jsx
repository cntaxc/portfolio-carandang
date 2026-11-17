import { useState } from 'react';

export default function ProjectAccordion({ projects }) {
  const [activeId, setActiveId] = useState(projects[0]?.id ?? null);

  if (!projects.length) {
    return null;
  }

  return (
    <div className="game-projects__rail">
      {projects.map((project, index) => {
        const isActive = project.id === activeId;

        return (
          <article
            key={project.id}
            className={`game-project${isActive ? ' is-active' : ''}`}
            style={{
              '--tool-count': project.tools.length,
            }}
            onClick={() => setActiveId(project.id)}
            onKeyDown={(event) => {
              if (event.key === 'Enter' || event.key === ' ') {
                event.preventDefault();
                setActiveId(project.id);
              }
            }}
            role="button"
            tabIndex={0}
            aria-expanded={isActive}
            aria-label={`${project.title}, ${project.role}`}
          >
            <div className="game-project__art" aria-hidden="true"></div>
            {project.image ? (
              <img
                className="game-project__image"
                src={project.image}
                alt=""
                aria-hidden="true"
              />
            ) : null}
            <div className="game-project__shade" aria-hidden="true"></div>

            <div className="game-project__content">
              <span className="game-project__index">
                {String(index + 1).padStart(2, '0')}
              </span>
              <div className="game-project__meta">
                <span className="game-project__role">{project.role}</span>
                <span className="game-project__badge">
                  {project.badge || 'SCHOOL PROJECT'}
                </span>
                {(project.platforms || ['PC']).map((platform) => (
                  <span
                    key={platform}
                    className="game-project__platform"
                    title={platform}
                    aria-label={platform}
                  >
                    <i
                      className={
                        platform === 'Mobile'
                          ? 'ri-tablet-line'
                          : 'ri-computer-line'
                      }
                      aria-hidden="true"
                    ></i>
                  </span>
                ))}
              </div>
              <h3 className="game-project__title">{project.title}</h3>
              <p className="game-project__desc">{project.description}</p>
            </div>

            <span className="game-project__rail-title" aria-hidden="true">
              {project.title}
            </span>

            <div className="game-project__tools">
              {project.tools.map((tool) => (
                <span
                  key={tool.label}
                  className="game-project__tool"
                  title={tool.label}
                >
                  <i className={tool.icon} aria-hidden="true"></i>
                  <span className="game-project__tool-label">{tool.label}</span>
                </span>
              ))}
            </div>
          </article>
        );
      })}
    </div>
  );
}
