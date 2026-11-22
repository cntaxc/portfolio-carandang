import { useState } from 'react';

const DEFAULT_BADGE = 'ri-award-line';

/**
 * One certificate under the main achievement (`certificates.items` in
 * portfolio.js). With a `pdf`, the whole card is a link that opens it in a
 * new tab, like Resume: "View PDF" stretches over the card, so it's one tab
 * stop and one hover / click sound. Without a title it's a dashed placeholder.
 */
export default function CertificationCard({ certificate, number }) {
  const { title, type, issuer, date, badge, preview, pdf, pages, fileSize } = certificate;
  // The src that failed, so a corrected path gets a fresh attempt.
  const [failedPreview, setFailedPreview] = useState(null);
  const showPreview = Boolean(preview) && preview !== failedPreview;
  const slot = String(number).padStart(2, '0');
  const isFilled = Boolean(title);
  const canOpen = isFilled && Boolean(pdf);
  const badgeIsImage = Boolean(badge) && !badge.startsWith('ri-');

  return (
    <li className={`cert-card${isFilled ? '' : ' is-empty'}${canOpen ? ' is-openable' : ''}`}>
      <div className="cert-card__bar" aria-hidden="true">
        <span>
          cert_{slot}.{pdf ? 'pdf' : 'log'}
        </span>
        <span className="cert-card__squares">
          <span></span>
          <span></span>
          <span></span>
        </span>
      </div>

      <div className={`cert-card__preview${showPreview ? ' has-image' : ''}`}>
        {showPreview ? (
          <img
            src={preview}
            alt={title ? `Certificate: ${title}` : 'Certificate preview'}
            loading="lazy"
            decoding="async"
            onError={() => setFailedPreview(preview)}
          />
        ) : (
          <span className="cert-card__preview-empty" aria-hidden="true">
            <i className="ri-file-text-line"></i>
            <span>Certificate preview</span>
            <small>No image assigned</small>
          </span>
        )}
      </div>

      {pdf ? (
        <p className="cert-card__file">
          <span className="cert-card__format">PDF</span>
          {pages} {pages === 1 ? 'page' : 'pages'} · {fileSize}
        </p>
      ) : null}

      <div className="cert-card__body">
        <span className="cert-card__badge" aria-hidden="true">
          {badgeIsImage ? (
            <img src={badge} alt="" loading="lazy" />
          ) : (
            <i className={badge || DEFAULT_BADGE}></i>
          )}
        </span>
        <div className="cert-card__text">
          <span className="cert-card__tag">{type || 'Certification'}</span>
          <h3 className="cert-card__title">{title || 'Certification title'}</h3>
          <p className="cert-card__issuer">{issuer || 'Issuing organization / platform'}</p>
        </div>
      </div>

      <div className="cert-card__foot">
        <span className="cert-card__date">{date || 'YYYY'}</span>
        {canOpen ? (
          <a
            className="cert-card__link"
            href={pdf}
            target="_blank"
            rel="noopener noreferrer"
            aria-label={`View PDF: ${title} (opens in a new tab)`}
          >
            View PDF
            <i className="ri-arrow-right-up-line" aria-hidden="true"></i>
          </a>
        ) : null}
        {isFilled ? null : <span className="cert-card__open">Open slot</span>}
      </div>
    </li>
  );
}
