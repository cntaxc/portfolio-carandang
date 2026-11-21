import { useState } from 'react';
import SectionHeading from '../SectionHeading';
import SectionEyebrow from '../SectionEyebrow';
import { education } from '../../data/portfolio';

// Education on the Overview page: a featured card for the current college
// (photo, logos, school, program, description, years, location) beside a
// short list of other schools (name and years only). Content and image paths
// live in `education` in src/data/portfolio.js.

// "In progress" while the last year in the range hasn't finished yet.
function getStatus(dateRange) {
  const years = String(dateRange).match(/\d{4}/g) || [];
  const endYear = Number(years[years.length - 1]);
  if (!endYear) {
    return null;
  }
  return endYear >= new Date().getFullYear() ? 'In progress' : 'Completed';
}

// "University of Cabuyao" -> "UC"; used when a logo isn't set yet.
function initials(name) {
  return String(name)
    .split(/\s+/)
    .filter((word) => /^[A-Z]/.test(word))
    .map((word) => word[0])
    .join('')
    .slice(0, 3);
}

// Image value -> URL. Imported images (src/assets) already are full URLs; a
// public-folder path gets the site's base path (for subpath deployments).
function publicUrl(path) {
  const base = process.env.PUBLIC_URL || '';
  if (
    !path ||
    /^(https?:)?\/\//.test(path) ||
    /^(data|blob):/.test(path) ||
    path.startsWith(`${base}/static/`)
  ) {
    return path;
  }
  return `${base}/${path.replace(/^\/+/, '')}`;
}

// An image that falls back to `fallback` when it has no source or fails.
function ImageSlot({ src, alt, className, fallback }) {
  const [failedSrc, setFailedSrc] = useState(null);
  if (!src || failedSrc === src) return fallback;
  return (
    <img
      className={className}
      src={publicUrl(src)}
      alt={alt}
      loading="lazy"
      decoding="async"
      onError={() => setFailedSrc(src)}
    />
  );
}

function Logo({ src, name, label }) {
  return (
    <span className="edu-featured__logo" title={label}>
      <ImageSlot
        src={src}
        alt={label}
        fallback={
          <span className="edu-featured__logo-fallback" aria-hidden="true">
            {initials(name) || <i className="ri-building-line"></i>}
          </span>
        }
      />
    </span>
  );
}

// Map of the school's area: a keyless Google Maps embed in its standard
// style, with a location tag and an "Open in Google Maps" link. Drag to
// pan; Ctrl/⌘ + scroll (or pinch) to zoom without hijacking page scrolling.
function SchoolMap({ map, school }) {
  const query = encodeURIComponent(map.query);
  const embedUrl = `https://www.google.com/maps?q=${query}&z=${map.zoom || 15}&output=embed`;
  const openUrl = `https://www.google.com/maps/search/?api=1&query=${query}`;

  return (
    <figure className="edu-map">
      <iframe
        className="edu-map__frame"
        src={embedUrl}
        title={`Map of ${school}, ${map.label}`}
        loading="lazy"
        referrerPolicy="no-referrer-when-downgrade"
        allowFullScreen
      ></iframe>
      <div className="edu-map__bar">
        <figcaption className="edu-map__tag">
          <span className="edu-map__pin" aria-hidden="true"></span>
          {map.label}
        </figcaption>
        <a
          className="edu-map__open"
          href={openUrl}
          target="_blank"
          rel="noopener noreferrer"
          aria-label={`Open ${map.label} in Google Maps (new tab)`}
        >
          <i className="ri-external-link-line" aria-hidden="true"></i>
          Open in Google Maps
        </a>
      </div>
    </figure>
  );
}

export default function EducationSection() {
  const { featured, others } = education;
  const status = getStatus(featured.years);

  return (
    <section
      id="educations"
      className="section section-panel section-panel--educations"
      data-reveal
    >
      <SectionHeading
        title={education.title}
        eyebrow={<SectionEyebrow sectionId="educations" />}
      />

      <div className="edu-layout">
        <article className="edu-featured" aria-labelledby="edu-featured-school">
          <div className="edu-featured__media">
            <ImageSlot
              src={featured.photo}
              alt={`${featured.school} campus`}
              className="edu-featured__photo"
              fallback={
                <div className="edu-featured__photo-placeholder" aria-hidden="true">
                  <i className="ri-building-2-line"></i>
                </div>
              }
            />
          </div>

          <div className="edu-featured__body">
            <header className="edu-featured__header">
              <div className="edu-featured__logos">
                <Logo
                  src={featured.schoolLogo}
                  name={featured.school}
                  label={`${featured.school} logo`}
                />
                <Logo
                  src={featured.departmentLogo}
                  name={featured.department}
                  label={`${featured.department || 'Department'} logo`}
                />
              </div>

              <div className="edu-featured__heading">
                <div className="edu-featured__eyebrow">
                  <span>{featured.level}</span>
                  {status ? (
                    <span
                      className={`edu-featured__status${
                        status === 'In progress' ? ' is-current' : ''
                      }`}
                    >
                      <span className="edu-featured__status-dot" aria-hidden="true"></span>
                      {status}
                    </span>
                  ) : null}
                </div>
                <h3 id="edu-featured-school" className="edu-featured__school">
                  {featured.school}
                </h3>
                {featured.schoolLocalName ? (
                  <p className="edu-featured__local-name">{featured.schoolLocalName}</p>
                ) : null}
              </div>
            </header>

            <div className="edu-featured__program">
              <p className="edu-featured__program-name">{featured.program}</p>
              {featured.department ? (
                <p className="edu-featured__department">{featured.department}</p>
              ) : null}
            </div>

            {featured.description ? (
              <p className="edu-featured__desc">{featured.description}</p>
            ) : null}

            <dl className="edu-featured__facts">
              <div>
                <dt>
                  <i className="ri-calendar-line" aria-hidden="true"></i>
                  Year
                </dt>
                <dd>{featured.years}</dd>
              </div>
              {featured.location ? (
                <div>
                  <dt>
                    <i className="ri-map-pin-line" aria-hidden="true"></i>
                    Location
                  </dt>
                  <dd>{featured.location}</dd>
                </div>
              ) : null}
            </dl>
          </div>
        </article>

        <div className="edu-side">
          {others.length ? (
            <aside className="edu-others" aria-labelledby="edu-others-title">
              <h3 id="edu-others-title" className="edu-others__title">
                {education.othersTitle}
              </h3>
              <ol className="edu-others__list">
                {others.map((item) => (
                  <li className="edu-others__item" key={`${item.school}-${item.years}`}>
                    {item.level ? (
                      <span className="edu-others__level">{item.level}</span>
                    ) : null}
                    <span className="edu-others__school">{item.school}</span>
                    <span className="edu-others__years">{item.years}</span>
                  </li>
                ))}
              </ol>
            </aside>
          ) : null}

          {featured.map ? <SchoolMap map={featured.map} school={featured.school} /> : null}
        </div>
      </div>
    </section>
  );
}
