import ProjectAccordion from '../ProjectAccordion';
import { showcaseProjects } from '../../data/portfolio';

export default function ProjectsSection({ onViewProjects }) {
  return (
    <section id="projects" className="section game-projects" data-reveal>
      <div className="game-projects__head">
        <div>
          <p className="game-projects__eyebrow">{showcaseProjects.eyebrow}</p>
          <h2 className="game-projects__title">{showcaseProjects.title}</h2>
        </div>
        <a
          className="game-projects__view"
          href="#projectlist"
          onClick={(event) => {
            event.preventDefault();
            onViewProjects();
          }}
        >
          <span>View Projects</span>
          <i className="ri-arrow-down-line" aria-hidden="true"></i>
        </a>
      </div>
      <ProjectAccordion projects={showcaseProjects.items} />
    </section>
  );
}
