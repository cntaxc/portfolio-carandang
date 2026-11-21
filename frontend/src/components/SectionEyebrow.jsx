import { journeyIndex, sectionEyebrows } from '../data/portfolio';
import '../styles/section-eyebrow.css';

/**
 * Small "07 / TECHSTACK" label above a section title. The number is the
 * section's position in the Journey page's section index (journeyIndex), so
 * it always matches the numbered list on the left; the label comes from
 * sectionEyebrows in portfolio.js.
 */
export default function SectionEyebrow({ sectionId }) {
  const label = sectionEyebrows[sectionId];
  const position = journeyIndex.findIndex((section) => section.id === sectionId);
  if (!label || position === -1) return null;

  return (
    <p className="section-eyebrow">
      <span className="section-eyebrow__dot" aria-hidden="true"></span>
      <span>
        {String(position + 1).padStart(2, '0')} / {label}
      </span>
    </p>
  );
}
