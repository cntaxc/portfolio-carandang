import { useEffect, useMemo, useRef, useState } from 'react';
import { showcaseProjects } from '../../data/portfolio';
import '../../styles/projects-desk.css';

const pad2 = (value) => String(value).padStart(2, '0');
const isRealLink = (url) => typeof url === 'string' && /^https?:\/\//.test(url);
const platformIcon = (platform) => (platform === 'Mobile' ? 'ri-smartphone-line' : 'ri-computer-line');

/**
 * Projects: a master-detail "work desk".
 *   left  - the selected project: framed preview, status, title, case file,
 *           tools and links
 *   right - the selectable title list (filter tabs on top); ↑ / ↓ cycles
 * On narrow screens the list becomes a scrollable strip above the showcase.
 */
export default function ProjectsSection({ onViewProjects }) {
  const { items, filters = [], eyebrow, title } = showcaseProjects;
  const [filter, setFilter] = useState('all');
  const [selectedId, setSelectedId] = useState(items[0]?.id ?? null);
  const listRef = useRef(null);

  const visible = useMemo(
    () => (filter === 'all' ? items : items.filter((item) => item.type === filter)),
    [filter, items]
  );
  // Keep a visible project selected when the filter hides the current one.
  const selected = visible.find((item) => item.id === selectedId) || visible[0];

  // Keep the active title in view inside the (scrollable) list, without
  // scrolling the page.
  useEffect(() => {
    const list = listRef.current;
    const active = list?.querySelector('.project-desk__item.is-active');
    if (!list || !active) return;
    const top = active.offsetTop - list.offsetTop;
    const bottom = top + active.offsetHeight;
    if (top < list.scrollTop) list.scrollTop = top;
    else if (bottom > list.scrollTop + list.clientHeight) list.scrollTop = bottom - list.clientHeight;
  }, [selected?.id, filter]);

  if (!selected) return null;

  const position = items.indexOf(selected) + 1;
  const visibleIndex = visible.indexOf(selected);
  const hasLink = isRealLink(selected.url);
  const platforms = selected.platforms || ['PC'];

  const choose = (id, { focus = false } = {}) => {
    setSelectedId(id);
    if (focus) {
      listRef.current?.querySelector(`[data-project="${id}"]`)?.focus();
    }
  };

  // ↑ / ↓ (and ← / → on the strip) move through the visible titles.
  const onListKeyDown = (event) => {
    const step = { ArrowDown: 1, ArrowRight: 1, ArrowUp: -1, ArrowLeft: -1 }[event.key];
    if (!step) return;
    event.preventDefault();
    const next = visible[(visibleIndex + step + visible.length) % visible.length];
    choose(next.id, { focus: true });
  };

  const changeFilter = (id) => {
    setFilter(id);
    const nextVisible = id === 'all' ? items : items.filter((item) => item.type === id);
    if (!nextVisible.some((item) => item.id === selectedId) && nextVisible[0]) {
      setSelectedId(nextVisible[0].id);
    }
  };

  return (
    <section id="projects" className="section project-desk" data-reveal>
      {/* ---- Header ------------------------------------------------------ */}
      <header className="project-desk__head">
        <p className="project-desk__meta">
          <span className="project-desk__meta-dot" aria-hidden="true"></span>
          {eyebrow} <span aria-hidden="true">—</span> {pad2(items.length)} titles
        </p>
        <h2 className="project-desk__title">{title}</h2>

        <div className="project-desk__toolbar">
          <span className="project-desk__hint" aria-hidden="true">
            <i className="ri-arrow-up-line"></i>
            <i className="ri-arrow-down-line"></i>
            to cycle titles
          </span>
        </div>

        {/* Filter tabs on the left, View all projects on the right. */}
        <div className="project-desk__filter-row">
          {filters.length ? (
            <div className="project-desk__filters" role="group" aria-label="Filter projects">
              {filters.map((option) => (
                <button
                  key={option.id}
                  type="button"
                  className={`project-desk__filter${filter === option.id ? ' is-active' : ''}`}
                  aria-pressed={filter === option.id}
                  onClick={() => changeFilter(option.id)}
                >
                  {option.label}
                </button>
              ))}
            </div>
          ) : null}
          <a
            className="project-desk__button"
            href="#projectlist"
            onClick={(event) => {
              event.preventDefault();
              onViewProjects();
            }}
          >
            View all projects
            <i className="ri-arrow-right-line" aria-hidden="true"></i>
          </a>
        </div>
      </header>

      <div className="project-desk__body">
        {/* ---- Showcase (left) ------------------------------------------- */}
        <article className="project-desk__showcase" aria-live="polite">
          <div className="project-desk__frame" key={selected.id}>
            {selected.image ? (
              <img className="project-desk__image" src={selected.image} alt="" />
            ) : null}
            <span className="project-desk__shade" aria-hidden="true"></span>
            <span className="project-desk__corner project-desk__corner--tl" aria-hidden="true"></span>
            <span className="project-desk__corner project-desk__corner--tr" aria-hidden="true"></span>
            <span className="project-desk__corner project-desk__corner--bl" aria-hidden="true"></span>
            <span className="project-desk__corner project-desk__corner--br" aria-hidden="true"></span>

            <div className="project-desk__frame-top">
              <span>
                Title {pad2(position)} / {pad2(items.length)}
              </span>
              <span className="project-desk__frame-sub">{selected.category}</span>
            </div>

            <div className="project-desk__frame-bottom">
              <div className="project-desk__tags">
                <span className={`project-desk__status${selected.published ? ' is-live' : ''}`}>
                  <span className="project-desk__status-dot" aria-hidden="true"></span>
                  {selected.status || (selected.published ? 'Live' : 'Private build')}
                </span>
                {selected.badge && selected.badge !== selected.category ? (
                  <span className="project-desk__tag">{selected.badge}</span>
                ) : null}
              </div>
              <h3 className="project-desk__name">
                {selected.logo ? (
                  <img className="project-desk__logo" src={selected.logo} alt="" />
                ) : null}
                {selected.title}
              </h3>
              <span className="project-desk__platforms">
                {platforms.map((platform) => (
                  <span key={platform}>
                    <i className={platformIcon(platform)} aria-hidden="true"></i>
                    {platform}
                  </span>
                ))}
              </span>
            </div>
          </div>

          <div className="project-desk__details">
            <div className="project-desk__case">
              <h4 className="project-desk__label">Case file</h4>
              <p className="project-desk__role">
                <span>Role</span> {selected.role}
              </p>
              <p className="project-desk__desc">{selected.description}</p>
              <ul className="project-desk__tools" aria-label="Tools">
                {selected.tools.map((tool) => (
                  <li key={tool.label}>
                    <i className={tool.icon} aria-hidden="true"></i>
                    {tool.label}
                  </li>
                ))}
              </ul>
            </div>

            <div className="project-desk__links">
              <h4 className="project-desk__label">Links</h4>
              {hasLink ? (
                <a
                  className="project-desk__link"
                  href={selected.url}
                  target="_blank"
                  rel="noreferrer"
                >
                  <span>01 · {selected.linkLabel || 'Open project'}</span>
                  <i className="ri-arrow-right-up-line" aria-hidden="true"></i>
                </a>
              ) : (
                <span className="project-desk__link is-disabled">
                  <span>01 · {selected.pendingLabel || 'Not public yet'}</span>
                  <i className="ri-lock-line" aria-hidden="true"></i>
                </span>
              )}
              <a
                className="project-desk__link"
                href="#projectlist"
                onClick={(event) => {
                  event.preventDefault();
                  onViewProjects();
                }}
              >
                <span>02 · All projects</span>
                <i className="ri-arrow-right-line" aria-hidden="true"></i>
              </a>
            </div>
          </div>
        </article>

        {/* ---- Title list (right) ----------------------------------------- */}
        <aside className="project-desk__list" aria-label="Select a project">
          {/* Fills the panel, which stretches to the showcase's height; the
              titles scroll inside it when there are more than fit. */}
          <div className="project-desk__list-inner">
            <div className="project-desk__list-head">
              <span>Select</span>
              <span>{pad2(visibleIndex + 1)} / {pad2(visible.length)}</span>
            </div>
            <ul ref={listRef} className="project-desk__items" onKeyDown={onListKeyDown}>
              {visible.map((item) => {
                const isActive = item.id === selected.id;
                return (
                  <li key={item.id}>
                    <button
                      type="button"
                      data-project={item.id}
                      className={`project-desk__item${isActive ? ' is-active' : ''}`}
                      aria-pressed={isActive}
                      tabIndex={isActive ? 0 : -1}
                      onClick={() => choose(item.id)}
                    >
                      <span className="project-desk__item-title">
                        <span className="project-desk__item-dash" aria-hidden="true"></span>
                        {item.title}
                      </span>
                      <span className="project-desk__item-sub">{item.role}</span>
                    </button>
                  </li>
                );
              })}
            </ul>
          </div>
        </aside>
      </div>
    </section>
  );
}
