import { useRef, useState } from 'react';
import BackButton from '../BackButton';
import ThreeDModelViewer from '../ThreeDModelViewer';
import { modelShowcase, spriteShowcase } from '../../data/portfolio';

const ALL = 'All';

// "3D Projects" shows the interactive model viewers; "2D Projects" shows the
// sprites as static images. Each tab has its own filters and pages.
const MODES = [
  { id: '3d', label: '3D Projects', icon: 'ri-box-3-line', showcase: modelShowcase, noun: 'model' },
  { id: '2d', label: '2D Projects', icon: 'ri-image-line', showcase: spriteShowcase, noun: 'asset' },
];

export default function ModelsSection({ onBack }) {
  const [modeId, setModeId] = useState('3d');
  const [activeCategory, setActiveCategory] = useState(ALL);
  const [page, setPage] = useState(0);
  const filtersRef = useRef(null);
  const mode = MODES.find((option) => option.id === modeId);
  const showcase = mode.showcase;
  const is3d = mode.id === '3d';
  const FILTERS = [ALL, ...showcase.categories];
  const PAGE_SIZE = showcase.pageSize;
  const matchingItems =
    activeCategory === ALL
      ? showcase.items
      : showcase.items.filter((item) => item.category === activeCategory);
  // Nine cards (a 3 x 3 grid) per page. This also caps how many live 3D
  // viewers exist at once; browsers only allow a limited number of WebGL
  // contexts per page.
  const pageCount = Math.max(1, Math.ceil(matchingItems.length / PAGE_SIZE));
  const currentPage = Math.min(page, pageCount - 1);
  const visibleItems = matchingItems.slice(
    currentPage * PAGE_SIZE,
    currentPage * PAGE_SIZE + PAGE_SIZE
  );

  const selectCategory = (category) => {
    setActiveCategory(category);
    setPage(0);
  };

  const selectMode = (id) => {
    setModeId(id);
    setActiveCategory(ALL);
    setPage(0);
  };

  const goToPage = (nextPage) => {
    setPage(nextPage);
    filtersRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  };

  return (
    <div className="project-list-page models-page">
      <section
        id="models"
        className="section project-list models-section"
        aria-labelledby="models-title"
      >
        <div className="project-list__content">
          <div className="page-topbar">
            <BackButton onClick={onBack} />
          </div>

          <header className="project-list__header models-section__header">
            <h2 id="models-title">{showcase.title}</h2>
            <div className="project-list__divider"></div>
            <p>{showcase.subtitle}</p>
          </header>

          <div className="models-modes" role="group" aria-label="Choose 3D or 2D projects">
            {MODES.map((option) => {
              const isActive = option.id === modeId;
              return (
                <button
                  key={option.id}
                  type="button"
                  className={`models-mode${isActive ? ' is-active' : ''}`}
                  aria-pressed={isActive}
                  onClick={() => selectMode(option.id)}
                >
                  <i className={option.icon} aria-hidden="true"></i>
                  {option.label}
                  <span className="models-mode__count">
                    {String(option.showcase.items.length).padStart(2, '0')}
                  </span>
                </button>
              );
            })}
          </div>

          <div
            className="models-filters"
            ref={filtersRef}
            role="group"
            aria-label={`Filter ${is3d ? '3D models' : '2D assets'} by category`}
          >
            {FILTERS.map((category) => {
              const isActive = category === activeCategory;
              return (
                <button
                  key={category}
                  type="button"
                  className={`techstack-filter models-filter${
                    isActive ? ' is-active' : ''
                  }`}
                  aria-pressed={isActive}
                  onClick={() => selectCategory(category)}
                >
                  {category}
                </button>
              );
            })}
          </div>

          <p className="sr-only" role="status">
            Showing {visibleItems.length} of {matchingItems.length}{' '}
            {matchingItems.length === 1 ? mode.noun : `${mode.noun}s`}
            {activeCategory === ALL ? '' : ` in ${activeCategory}`}
            {pageCount > 1 ? `, page ${currentPage + 1} of ${pageCount}` : ''}.
          </p>

          {visibleItems.length ? (
            // Re-keyed per filter so the cards fade back in on every change.
            <ul className="models-grid" key={`${modeId}-${activeCategory}-${currentPage}`}>
              {visibleItems.map((item, index) => (
                <li
                  className="model-card"
                  key={item.id}
                  style={{ '--card-index': index }}
                >
                  {is3d ? (
                    <div className="model-card__stage">
                      <ThreeDModelViewer
                        model={item.model}
                        focus={item.focus}
                        label={`${item.title} 3D model`}
                      />
                      <span className="model-card__hint" aria-hidden="true">
                        <i className="ri-drag-move-2-line"></i>
                        Drag to rotate
                      </span>
                    </div>
                  ) : (
                    // 2D: a still image, no drag or rotation.
                    <div className="model-card__stage model-card__stage--sprite">
                      <img
                        className="model-card__sprite"
                        src={item.image}
                        alt={`${item.title} sprite`}
                        loading="lazy"
                        decoding="async"
                        draggable="false"
                      />
                    </div>
                  )}
                  <div className="model-card__info">
                    <span className="model-card__category">
                      {item.category}
                    </span>
                    <h3>{item.title}</h3>
                    <p>{item.description}</p>
                  </div>
                </li>
              ))}
            </ul>
          ) : (
            <p className="models-empty">No {mode.noun}s in this category yet.</p>
          )}

          {pageCount > 1 ? (
            <nav className="models-pagination" aria-label={`${is3d ? '3D model' : '2D asset'} pages`}>
              <button
                type="button"
                className="techstack-filter"
                onClick={() => goToPage(currentPage - 1)}
                disabled={currentPage === 0}
              >
                <i className="ri-arrow-left-s-line" aria-hidden="true"></i>
                Prev
              </button>
              {Array.from({ length: pageCount }, (_, index) => (
                <button
                  key={index}
                  type="button"
                  className={`techstack-filter models-pagination__page${
                    index === currentPage ? ' is-active' : ''
                  }`}
                  aria-label={`Page ${index + 1}`}
                  aria-current={index === currentPage ? 'page' : undefined}
                  onClick={() => goToPage(index)}
                >
                  {index + 1}
                </button>
              ))}
              <button
                type="button"
                className="techstack-filter"
                onClick={() => goToPage(currentPage + 1)}
                disabled={currentPage === pageCount - 1}
              >
                Next
                <i className="ri-arrow-right-s-line" aria-hidden="true"></i>
              </button>
            </nav>
          ) : null}
        </div>
      </section>
    </div>
  );
}
