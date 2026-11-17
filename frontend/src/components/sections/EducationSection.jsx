import SectionHeading from '../SectionHeading';
import { education } from '../../data/portfolio';

export default function EducationSection() {
  return (
    <section
      id="educations"
      className="section section-panel section-panel--educations"
      data-reveal
    >
      <SectionHeading title={education.title} />
      <div className="timeline">
        {education.items.map((item) => (
          <div key={`${item.school}-${item.date}`} className="timeline-item">
            <article className="timeline-card">
              <div className="timeline-card__head">
                <h3 className="timeline-card__title">{item.school}</h3>
                <span className="timeline-card__date">{item.date}</span>
              </div>
              <div className="timeline-card__meta">
                {item.institutions.map((institution) => (
                  <p key={institution}>
                    <i className="ri-map-pin-line" aria-hidden="true"></i>
                    {institution}
                  </p>
                ))}
              </div>
              <p className="timeline-card__desc">{item.description}</p>
            </article>
          </div>
        ))}
      </div>
    </section>
  );
}
