import SectionHeading from '../SectionHeading';
import { experiences } from '../../data/portfolio';

export default function ExperienceSection() {
  return (
    <section
      id="experiences"
      className="section section-panel section-panel--experiences"
      data-reveal
    >
      <SectionHeading title={experiences.title} />
      <div className="experience-timeline">
        {experiences.items.map((item, index) => (
          <article
            key={`${item.position}-${item.date}`}
            className={`experience-timeline__item${
              index % 2 === 0 ? ' is-left' : ' is-right'
            }`}
          >
            <div className="experience-timeline__card">
              <div className="experience-timeline__head">
                <h3>{item.position}</h3>
                <span>{item.date}</span>
              </div>
              <p className="experience-timeline__company">{item.company}</p>
              <p className="experience-timeline__summary">{item.summary}</p>
              <details className="experience-timeline__details">
                <summary>
                  VIEW DETAILS
                  <i className="ri-arrow-down-s-line" aria-hidden="true"></i>
                </summary>
                <div className="experience-timeline__more">
                  <p>{item.description}</p>
                  <span>{item.type}</span>
                </div>
              </details>
            </div>
          </article>
        ))}
      </div>
    </section>
  );
}
