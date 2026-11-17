import BackButton from '../BackButton';
import ProjectLogo from '../ProjectLogo';
import { showcaseProjects } from '../../data/portfolio';

const projectGroups = [
  { title: 'Published', isPublished: true },
  { title: 'Non-Published', isPublished: false },
];

export default function ProjectListSection({ onBack }) {
  return (
    <div className="project-list-page">
      <section id="projectlist" className="section project-list" data-reveal>
        <div className="project-list__content">
          <div className="page-topbar">
            <BackButton onClick={onBack} />
          </div>

          <header className="project-list__header">
            <h2>DEVELOPED SOFTWARE</h2>
            <div className="project-list__divider"></div>
            <p>Stay tuned with my latest updates.</p>
          </header>

          <div className="project-list__groups">
            {projectGroups.map((group) => {
              const projects = showcaseProjects.items.filter(
                (project) => project.published === group.isPublished
              );

              return (
                <section
                  className="project-list__group"
                  key={group.title}
                  aria-labelledby={`project-list-${group.title
                    .toLowerCase()
                    .replace('-', '')}`}
                >
                  <h3
                    className="project-list__group-title"
                    id={`project-list-${group.title
                      .toLowerCase()
                      .replace('-', '')}`}
                  >
                    {group.title}
                  </h3>
                  <div className="project-list__cards">
                    {projects.map((project) => {
                      const hasProjectLink = Boolean(
                        project.url && project.url !== '#'
                      );
                      const CardTag = hasProjectLink ? 'a' : 'article';

                      return (
                        <CardTag
                          className={`project-list-card${
                            hasProjectLink ? ' project-list-card--link' : ''
                          }`}
                          key={project.id}
                          {...(hasProjectLink
                            ? {
                                href: project.url,
                                target: '_blank',
                                rel: 'noreferrer',
                              }
                            : { tabIndex: 0 })}
                          aria-label={
                            hasProjectLink
                              ? `${project.title} project (opens in a new tab)`
                              : `${project.title} project details`
                          }
                        >
                        <div className="project-list-card__surface">
                          <div className="project-list-card__poster">
                            {project.image ? (
                              <img
                                className="project-list-card__image"
                                src={project.image}
                                alt=""
                                aria-hidden="true"
                              />
                            ) : (
                              <div
                                className="project-list-card__art"
                                aria-hidden="true"
                              ></div>
                            )}
                            <div
                              className="project-list-card__shade"
                              aria-hidden="true"
                            ></div>
                            <div className="project-list-card__topbar">
                              <span className="project-list-card__category">
                                {project.category}
                              </span>
                              <div className="project-list-card__indicators">
                                {(project.platforms || ['PC']).map((platform) => (
                                  <span
                                    className="project-list-card__platform"
                                    key={platform}
                                    title={platform}
                                    aria-label={platform}
                                  >
                                    <i
                                      className={
                                        platform === 'Mobile'
                                          ? 'ri-smartphone-line'
                                          : 'ri-computer-line'
                                      }
                                      aria-hidden="true"
                                    ></i>
                                  </span>
                                ))}
                              </div>
                            </div>
                            <div className="project-list-card__info-panel">
                              <div className="project-list-card__meta">
                                <span
                                  className="project-list-card__logo"
                                  aria-label={`${project.title} logo`}
                                >
                                  {project.logo ? (
                                    <ProjectLogo
                                      src={project.logo}
                                      alt={project.title}
                                    />
                                  ) : project.logoIcon ? (
                                    <i
                                      className={project.logoIcon}
                                      aria-hidden="true"
                                    ></i>
                                  ) : (
                                    project.title.slice(0, 1)
                                  )}
                                </span>
                                <div className="project-list-card__details">
                                  <h4>{project.title}</h4>
                                  <p>
                                    {project.timeline ||
                                      'TIMELINE NOT SPECIFIED'}
                                  </p>
                                </div>
                              </div>
                              <div className="project-list-card__expanded">
                                {project.role ? (
                                  <span className="project-list-card__role">
                                    {project.role}
                                  </span>
                                ) : null}
                                <div
                                  className="project-list-card__tools"
                                  aria-label="Project tools"
                                >
                                  {(project.tools || []).map((tool) => (
                                    <span
                                      className="project-list-card__tool"
                                      key={tool.label}
                                      title={tool.label}
                                    >
                                      <i
                                        className={tool.icon}
                                        aria-hidden="true"
                                      ></i>
                                      <span>{tool.label}</span>
                                    </span>
                                  ))}
                                </div>
                                <p className="project-list-card__description">
                                  {project.description}
                                </p>
                              </div>
                            </div>
                          </div>
                        </div>
                        </CardTag>
                      );
                    })}
                  </div>
                </section>
              );
            })}
          </div>
        </div>
      </section>
    </div>
  );
}
