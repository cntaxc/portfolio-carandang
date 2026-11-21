export default function SectionHeading({ title, action, eyebrow }) {
  return (
    <div className="section-heading">
      <div className="section-heading__titles">
        {eyebrow}
        <h2>{title}</h2>
      </div>
      {action ? <div className="section-heading__action">{action}</div> : null}
    </div>
  );
}
