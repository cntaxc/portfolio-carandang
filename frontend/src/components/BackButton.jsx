export default function BackButton({ onClick, className = '' }) {
  return (
    <button
      type="button"
      className={`back-button${className ? ` ${className}` : ''}`}
      onClick={onClick}
    >
      <i className="ri-arrow-left-s-line" aria-hidden="true"></i>
      <span>Back</span>
    </button>
  );
}
