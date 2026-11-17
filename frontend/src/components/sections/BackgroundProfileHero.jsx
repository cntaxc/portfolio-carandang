import formalPortrait from '../../assets/images/profile/formal-portrait.png';

export default function BackgroundProfileHero() {
  return (
    <section
      className="background-profile"
      aria-labelledby="background-profile-name"
      data-reveal
    >
      <div className="background-profile__card">
        <div className="background-profile__portrait-frame">
          <img
            src={formalPortrait}
            alt="Formal portrait of Christian Raphael Carandang"
          />
        </div>
        <div className="background-profile__content">
          <p className="background-profile__eyebrow">
            <span>PROFILE / BACKGROUND</span>
            <span>01 — CHRISTIAN CARANDANG</span>
          </p>
          <h1 id="background-profile-name">
            <span>Christian Raphael</span>
            <span>Carandang</span>
          </h1>
          <p className="background-profile__roles">
            Front-End Developer <span aria-hidden="true">/</span> Game
            Developer <span aria-hidden="true">/</span> UI/UX Designer
          </p>
          <div className="background-profile__location">
            <i className="ri-map-pin-line" aria-hidden="true"></i>
            <span>Laguna, Philippines</span>
          </div>
        </div>
      </div>
    </section>
  );
}
