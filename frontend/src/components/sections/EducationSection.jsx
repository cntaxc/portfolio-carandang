import SectionHeading from '../SectionHeading';
import { education } from '../../data/portfolio';

// "In progress" while the last year in the range hasn't finished yet.
function getStatus(dateRange) {
  const years = String(dateRange).match(/\d{4}/g) || [];
  const endYear = Number(years[years.length - 1]);
  if (!endYear) {
    return null;
  }
  return endYear >= new Date().getFullYear() ? 'In progress' : 'Completed';
}

export default function EducationSection() {
  return (
    <section
      id="educations"
      className="section section-panel section-panel--educations"
      data-reveal
    >
      <SectionHeading title={education.title} />

      <ol className="edu-record" aria-label="Education history">
        {education.items.map((item, index) => {
          const status = getStatus(item.date);
          const showLevel = item.level && item.level !== item.school;

          return (
            <li className="edu-record__row" key={`${item.school}-${item.date}`}>
              <span className="edu-record__index" aria-hidden="true">
                {String(index + 1).padStart(2, '0')}
              </span>

              <div className="edu-record__period">
                <span className="edu-record__years">{item.date}</span>
                {status ? (
                  <span
                    className={`edu-record__status${
                      status === 'In progress' ? ' is-current' : ''
                    }`}
                  >
                    <span className="edu-record__status-dot" aria-hidden="true"></span>
                    {status}
                  </span>
                ) : null}
              </div>

              <div className="edu-record__main">
                {showLevel ? (
                  <span className="edu-record__level">{item.level}</span>
                ) : null}
                <h3 className="edu-record__title">{item.school}</h3>
                <ul className="edu-record__institutions">
                  {item.institutions.map((institution) => (
                    <li key={institution}>
                      <i className="ri-building-line" aria-hidden="true"></i>
                      {institution}
                    </li>
                  ))}
                </ul>
                {item.description ? (
                  <p className="edu-record__desc">{item.description}</p>
                ) : null}
              </div>
            </li>
          );
        })}
      </ol>
    </section>
  );
}
