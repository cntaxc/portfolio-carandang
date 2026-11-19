import { useCallback, useState } from 'react';
import BackButton from '../BackButton';
import ImportGuide from '../ImportGuide';
import ThreeDModelViewer from '../ThreeDModelViewer';
import useAssetLikes from '../../hooks/useAssetLikes';
import { freeAssets } from '../../data/portfolio';

function LikeButton({ asset, likes }) {
  const isLiked = likes.liked.has(asset.id);
  const showCount = likes.status === 'online';
  const count = likes.counts[asset.id] || 0;
  return (
    <button
      type="button"
      className={`asset-card__like${isLiked ? ' is-liked' : ''}`}
      aria-pressed={isLiked}
      aria-label={`${isLiked ? 'Unlike' : 'Like'} ${asset.title}${
        showCount ? ` (${count} ${count === 1 ? 'like' : 'likes'})` : ''
      }`}
      disabled={likes.pending.has(asset.id)}
      onClick={() => likes.toggle(asset.id)}
    >
      <i className={isLiked ? 'ri-heart-3-fill' : 'ri-heart-3-line'} aria-hidden="true"></i>
      {showCount ? (
        <span className="asset-card__like-count">{count}</span>
      ) : (
        <span>{likes.status === 'loading' ? '–' : 'Like'}</span>
      )}
    </button>
  );
}

export default function FreeAssetsSection({ onBack }) {
  const likes = useAssetLikes();
  const [isGuideOpen, setIsGuideOpen] = useState(false);
  const closeGuide = useCallback(() => setIsGuideOpen(false), []);

  return (
    <div className="project-list-page assets-page">
      <section id="assets" className="section project-list assets-section" aria-labelledby="assets-title">
        <div className="project-list__content">
          <div className="page-topbar">
            <BackButton onClick={onBack} />
          </div>

          <header className="project-list__header models-section__header">
            <h2 id="assets-title">{freeAssets.title}</h2>
            <div className="project-list__divider"></div>
            <p>{freeAssets.subtitle}</p>
            <button
              type="button"
              className="assets-howto"
              onClick={() => setIsGuideOpen(true)}
              aria-haspopup="dialog"
            >
              <i className="ri-question-line" aria-hidden="true"></i>
              How to import?
            </button>
          </header>

          <ul className="asset-grid">
            {freeAssets.items.map((asset, index) => (
              <li className="asset-card" key={asset.id} style={{ '--card-index': index }}>
                <div className="asset-card__stage model-card__stage">
                  <ThreeDModelViewer
                    model={asset.model}
                    focus={asset.focus}
                    label={`${asset.title} 3D preview`}
                  />
                  <span className="model-card__hint" aria-hidden="true">
                    <i className="ri-drag-move-2-line"></i>
                    Drag to rotate
                  </span>
                </div>

                <div className="asset-card__body">
                  <div className="asset-card__tags">
                    <span className="asset-card__category">{asset.category}</span>
                    <span className="asset-card__badge" title="Native Blender file">
                      .{asset.format}
                    </span>
                  </div>
                  <h3 className="asset-card__title">{asset.title}</h3>
                  <p className="asset-card__description">{asset.description}</p>
                  <ul className="asset-card__includes" aria-label="Included">
                    {asset.includes.map((line) => (
                      <li key={line}>
                        <i className="ri-check-line" aria-hidden="true"></i>
                        {line}
                      </li>
                    ))}
                  </ul>

                  <p className="asset-card__file">
                    <i className="ri-file-3-line" aria-hidden="true"></i>
                    {asset.downloadName}
                    <span>
                      {asset.format}
                      {asset.size ? ` · ${asset.size}` : ''}
                    </span>
                  </p>

                  <div className="asset-card__actions">
                    <a
                      className="asset-card__download"
                      href={asset.download}
                      download={asset.downloadName}
                      aria-label={`Download ${asset.downloadName} (Blender file${asset.size ? `, ${asset.size}` : ''})`}
                    >
                      <i className="ri-download-2-line" aria-hidden="true"></i>
                      Download .{asset.format.toLowerCase()}
                    </a>
                    <LikeButton asset={asset} likes={likes} />
                  </div>
                </div>
              </li>
            ))}
          </ul>
        </div>
      </section>
      <ImportGuide isOpen={isGuideOpen} onClose={closeGuide} />
    </div>
  );
}
