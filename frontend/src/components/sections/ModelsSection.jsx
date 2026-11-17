import { useRef, useState } from 'react';
import BackButton from '../BackButton';
import ThreeDModelViewer from '../ThreeDModelViewer';
import { modelShowcase } from '../../data/portfolio';

const ALL = 'All';
const FILTERS = [ALL, ...modelShowcase.categories];
const PAGE_SIZE = modelShowcase.pageSize;

export default function ModelsSection({ onBack }) {
  const [activeCategory, setActiveCategory] = useState(ALL);
  const [page, setPage] = useState(0);
  const filtersRef = useRef(null);
  const matchingItems =
    activeCategory === ALL
      ? modelShowcase.items
      : modelShowcase.items.filter((item) => item.category === activeCategory);
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
            <h2 id="models-title">{modelShowcase.title}</h2>
            <div className="project-list__divider"></div>
            <p>{modelShowcase.subtitle}</p>
          </header>

          <div
            className="models-filters"
            ref={filtersRef}
            role="group"
            aria-label="Filter 3D models by category"
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
            {matchingItems.length === 1 ? 'model' : 'models'}
            {activeCategory === ALL ? '' : ` in ${activeCategory}`}
            {pageCount > 1 ? `, page ${currentPage + 1} of ${pageCount}` : ''}.
          </p>

          {visibleItems.length ? (
            // Re-keyed per filter so the cards fade back in on every change.
            <ul className="models-grid" key={`${activeCategory}-${currentPage}`}>
              {visibleItems.map((item, index) => (
                <li
                  className="model-card"
                  key={item.id}
                  style={{ '--card-index': index }}
                >
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
            <p className="models-empty">No models in this category yet.</p>
          )}

          {pageCount > 1 ? (
            <nav className="models-pagination" aria-label="3D model pages">
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
