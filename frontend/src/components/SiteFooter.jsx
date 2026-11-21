import { about, floatingActions, profile, showcaseProjects } from '../data/portfolio';

const latestProjectIds = ['outrun', 'lunas', 'alalay-barangray', 'muted'];
const latestProjects = latestProjectIds.map((id) =>
  showcaseProjects.items.find((project) => project.id === id)
).filter(Boolean);
const socialLinks = floatingActions.actions.filter((action) =>
  ['github', 'linkedin'].includes(action.id)
);

function FooterLink({
  href,
  onClick,
  children,
  className = '',
  target,
  rel,
}) {
  return (
    <a
      className={className}
      href={href}
      onClick={onClick}
      target={target}
      rel={rel}
    >
      {children}
    </a>
  );
}

export default function SiteFooter({ onNavigate }) {
  const navigate = (event, sectionId) => {
    event.preventDefault();
    onNavigate(sectionId);
  };

  const internalLink = (sectionId, children, className) => (
    <FooterLink
      href={`#${sectionId}`}
      className={className}
      onClick={(event) => navigate(event, sectionId)}
    >
      {children}
    </FooterLink>
  );

  return (
    <footer className="site-footer">
      <div className="site-footer__inner">
        <div className="site-footer__contact-bar">
          <div className="site-footer__contact-item">
            <i className="ri-map-pin-line" aria-hidden="true"></i>
            <span>LAGUNA, PHILIPPINES</span>
          </div>
          <a
            className="site-footer__contact-item"
            href={`mailto:${about.mailUrl.replace(/^mailto:/, '')}`}
          >
            <i className="ri-mail-line" aria-hidden="true"></i>
            <span>carandangchristianra@gmail.com</span>
          </a>
        </div>

        <div className="site-footer__grid">
          <section className="site-footer__column site-footer__about">
            <h2>ABOUT ME</h2>
            <p>
              I&apos;m a UI Designer and 3D Artist with a Computer Science
              background, specializing in game development and interactive
              systems through thoughtful interfaces and 3D experiences.
            </p>
          </section>

          <nav className="site-footer__column" aria-label="Latest projects">
            <h2>LATEST PROJECTS</h2>
            {latestProjects.map((project) => (
              <FooterLink
                key={project.id}
                href={
                  project.url && project.url !== '#'
                    ? project.url
                    : '#projectlist'
                }
                target={
                  project.url && project.url !== '#' ? '_blank' : undefined
                }
                rel={
                  project.url && project.url !== '#' ? 'noreferrer' : undefined
                }
                onClick={
                  !project.url || project.url === '#'
                    ? (event) => navigate(event, 'projectlist')
                    : undefined
                }
              >
                {project.title}
              </FooterLink>
            ))}
          </nav>

          <nav className="site-footer__column" aria-label="Portfolio links">
            <h2>PORTFOLIO</h2>
            <FooterLink
              href="https://github.com/cntaxc"
              target="_blank"
              rel="noreferrer"
            >
              GitHub Repositories
            </FooterLink>
            {internalLink('projectlist', 'Developed Software')}
            {internalLink('models', '3D Models')}
            {internalLink('techstack', 'Techstack')}
          </nav>

          <nav className="site-footer__column" aria-label="Social networks">
            <h2>SOCIAL NETWORKS</h2>
            {socialLinks.map((link) => (
              <FooterLink
                key={link.id}
                href={link.url}
                target="_blank"
                rel="noreferrer"
              >
                <i className={link.icon} aria-hidden="true"></i>
                {link.label}
              </FooterLink>
            ))}
            {internalLink(
              'contact',
              <>
                <i className="ri-mail-line" aria-hidden="true"></i>
                Email / Contact
              </>
            )}
          </nav>

          <nav
            className="site-footer__column site-footer__brand"
            aria-label="Site navigation"
          >
            <a
              className="site-footer__wordmark"
              href="#home"
              onClick={(event) => navigate(event, 'home')}
            >
              Christian Carandang
            </a>
            <p>Designing digital experiences with purpose.</p>
            {internalLink('home', 'Home')}
            {internalLink('projects', 'Projects')}
            {internalLink('portfolio', 'Portfolio')}
            {internalLink('contact', 'Contact')}
          </nav>
        </div>

        <div className="site-footer__bottom">
          <nav
            className="site-footer__bottom-nav"
            aria-label="Footer navigation"
          >
            {internalLink('home', 'Home')}
            {internalLink('projects', 'Projects')}
            {internalLink('portfolio', 'Portfolio')}
            {internalLink('contact', 'Contact')}
          </nav>
          <div className="site-footer__social-icons" aria-label="Social links">
            {socialLinks.map((link) => (
              <FooterLink
                key={link.id}
                href={link.url}
                target="_blank"
                rel="noreferrer"
                className="site-footer__icon-link"
              >
                <i className={link.icon} aria-hidden="true"></i>
                <span className="sr-only">{link.label}</span>
              </FooterLink>
            ))}
            <FooterLink
              href={about.mailUrl}
              className="site-footer__icon-link"
            >
              <i className="ri-mail-line" aria-hidden="true"></i>
              <span className="sr-only">Email Christian</span>
            </FooterLink>
          </div>
          <p className="site-footer__copyright">
            © 2026 {profile.name}. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  );
}
