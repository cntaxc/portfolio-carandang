import formalPortrait from '../../assets/images/profile/formal-portrait.png';
import { education, profile } from '../../data/portfolio';

const ROLES = ['Front-End Developer', 'Game Developer', 'UI/UX Designer'];

// Split "Christian Raphael A. Carandang" into the given names and surname so
// the surname sits on its own line.
const nameParts = profile.name.trim().split(/\s+/);
const surname = nameParts.pop();
// A non-breaking space keeps the middle initial with the name before it, so a
// narrow screen wraps "Christian / Raphael A." instead of leaving "A." alone.
const givenNames = nameParts
  .map((part, index) => (index === 0 ? part : `${index === nameParts.length - 1 ? ' ' : ' '}${part}`))
  .join('');

const currentEducation = education.items[0];

// Key facts shown in the details grid; all values come from portfolio data.
const details = [
  {
    label: 'Location',
    icon: 'ri-map-pin-line',
    value: 'Laguna, Philippines',
  },
  {
    label: 'Education',
    icon: 'ri-graduation-cap-line',
    value: currentEducation.school,
    note: currentEducation.institutions.join(', '),
  },
  {
    label: 'Years',
    icon: 'ri-calendar-line',
    value: currentEducation.date,
  },
];

export default function BackgroundProfileHero() {
  return (
    <section
      className="background-profile"
      aria-labelledby="background-profile-name"
      data-reveal
    >
      <article className="profile-card">
        <header className="profile-card__bar">
          <span>Profile</span>
          <span>01 · Overview</span>
        </header>

        <div className="profile-card__body">
          <figure className="profile-card__portrait">
            <div className="profile-card__frame">
              <img
                src={formalPortrait}
                alt="Formal portrait of Christian Raphael Carandang"
              />
            </div>
          </figure>

          <div className="profile-card__content">
            <h1 id="background-profile-name" className="profile-card__name">
              <span>{givenNames}</span>
              <span>{surname}</span>
            </h1>

            <ul className="profile-card__roles" aria-label="Roles">
              {ROLES.map((role) => (
                <li key={role}>{role}</li>
              ))}
            </ul>

            <dl className="profile-card__details">
              {details.map((detail) => (
                <div className="profile-card__detail" key={detail.label}>
                  <dt>
                    <i className={detail.icon} aria-hidden="true"></i>
                    {detail.label}
                  </dt>
                  <dd>
                    {detail.value}
                    {detail.note ? <small>{detail.note}</small> : null}
                  </dd>
                </div>
              ))}
            </dl>
          </div>
        </div>
      </article>
    </section>
  );
}
