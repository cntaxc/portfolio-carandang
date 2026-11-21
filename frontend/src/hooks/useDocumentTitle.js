import { useEffect } from 'react';

// Browser tab title per page: just the page name (e.g. "Homepage").
export const SITE_TITLE = 'Carandang Portfolio'; // fallback for unknown pages

export const PAGE_TITLES = {
  home: 'Homepage',
  background: 'Overview',
  portfolio: 'Portfolio',
  projectlist: 'Developed Software',
  models: '3D Model Projects',
  assets: 'Free Assets',
  techstack: 'Techstack',
  recommendation: 'Recommendations',
  game: 'GRAPPLE',
};

export function titleFor(page) {
  return PAGE_TITLES[page] || SITE_TITLE;
}

export default function useDocumentTitle(page) {
  useEffect(() => {
    document.title = titleFor(page);
  }, [page]);
}
