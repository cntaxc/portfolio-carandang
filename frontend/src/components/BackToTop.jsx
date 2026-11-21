import '../styles/back-to-top.css';

// "Back to top" button at the bottom of the homepage, just above the footer.
// A round arrow button that widens into a white "Back to Top" pill on hover
// (adapted from Uiverse.io by vinodjangid07).
export default function BackToTop({ onClick }) {
  return (
    <div className="back-to-top">
      <button
        type="button"
        className="back-to-top__button"
        aria-label="Back to top"
        onClick={onClick}
      >
        <svg className="back-to-top__icon" viewBox="0 0 384 512" aria-hidden="true">
          <path d="M214.6 41.4c-12.5-12.5-32.8-12.5-45.3 0l-160 160c-12.5 12.5-12.5 32.8 0 45.3s32.8 12.5 45.3 0L160 141.2V448c0 17.7 14.3 32 32 32s32-14.3 32-32V141.2L329.4 246.6c12.5 12.5 32.8 12.5 45.3 0s12.5-32.8 0-45.3l-160-160z" />
        </svg>
      </button>
    </div>
  );
}
