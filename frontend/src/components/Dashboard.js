import { useCallback, useEffect, useRef, useState } from 'react';
import TopNavigation from './TopNavigation';
import FloatingActions from './FloatingActions';
import BackButton from './BackButton';
import IntroHero from './sections/IntroHero';
import AboutSection from './sections/AboutSection';
import ProjectsSection from './sections/ProjectsSection';
import ContactSection from './sections/ContactSection';
import ProjectListSection from './sections/ProjectListSection';
import PortfolioHubSection from './sections/PortfolioHubSection';
import ModelsSection from './sections/ModelsSection';
import FreeAssetsSection from './sections/FreeAssetsSection';
import AIChatbotSection from './sections/AIChatbotSection';
import AchievementsRecommendationsSection from './sections/AchievementsRecommendationsSection';
import BackgroundProfileHero from './sections/BackgroundProfileHero';
import TechstackPreviewSection from './sections/TechstackPreviewSection';
import TechstackSection from './sections/TechstackSection';
import ExperienceSection from './sections/ExperienceSection';
import EducationSection from './sections/EducationSection';
import SkillsSection from './sections/SkillsSection';
import ArcadeSection from './sections/ArcadeSection';
import GrappleGame from './grapple/GrappleGame';
import RecommendationSubmissionForm from './RecommendationSubmissionForm';
import RecommendationsGrid from './RecommendationsGrid';
import SiteFooter from './SiteFooter';
import BackToTop from './BackToTop';
import useActiveSection from '../hooks/useActiveSection';
import useDocumentTitle from '../hooks/useDocumentTitle';
import useScrollReveal from '../hooks/useScrollReveal';
import {
  assetSectionIds,
  backgroundSectionIds,
  homeSectionIds,
  modelSectionIds,
  portfolioSectionIds,
  projectListSectionIds,
  recommendationSectionIds,
  techstackSectionIds,
} from '../data/portfolio';

const subpageViews = new Set([
  'portfolio',
  'projectlist',
  'models',
  'assets',
  'background',
  'techstack',
  'recommendation',
]);
// Where a subpage's Back button goes when there is no history entry to
// return to (e.g. the page was opened directly from a link).
const subpageFallbacks = {
  portfolio: 'home',
  projectlist: 'portfolio',
  models: 'portfolio',
  assets: 'portfolio',
  background: 'portfolio',
  techstack: 'background',
  recommendation: 'home',
};
// Sections that are the top of their own view: navigating to them scrolls to
// the top of the page instead of to the element.
const viewTopSections = new Set([
  'portfolio',
  'models',
  'assets',
  'background',
  'moreinfos',
  'recommendation',
]);

function getScrollBehavior() {
  const prefersReducedMotion =
    typeof window.matchMedia === 'function' &&
    window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  return prefersReducedMotion ? 'auto' : 'smooth';
}

function getViewForSection(sectionId) {
  if (portfolioSectionIds.includes(sectionId)) {
    return 'portfolio';
  }
  if (sectionId === 'projectlist') {
    return 'projectlist';
  }
  if (sectionId === 'models') {
    return 'models';
  }
  if (assetSectionIds.includes(sectionId)) {
    return 'assets';
  }
  if (recommendationSectionIds.includes(sectionId)) {
    return 'recommendation';
  }
  if (techstackSectionIds.includes(sectionId)) {
    return 'techstack';
  }
  if (
    sectionId === 'background' ||
    sectionId === 'moreinfos' ||
    backgroundSectionIds.includes(sectionId)
  ) {
    return 'background';
  }
  return 'home';
}

function getViewFromHash() {
  return getViewForSection(window.location.hash.slice(1));
}

export default function Dashboard() {
  const [activeView, setActiveView] = useState(getViewFromHash);
  // GRAPPLE: mounted on first launch, then kept so leaving pauses the run.
  const [isGameOpen, setIsGameOpen] = useState(false);
  const [hasOpenedGame, setHasOpenedGame] = useState(false);
  // Browser tab title follows the current page (or the game while it's open).
  useDocumentTitle(isGameOpen ? 'game' : activeView);
  const openGame = () => {
    setHasOpenedGame(true);
    // Open on the next frame so the view fades in even on first launch.
    window.requestAnimationFrame(() => setIsGameOpen(true));
  };
  const pendingSection = useRef(null);
  const lastHandledHash = useRef(null);
  const activeSection = useActiveSection(
    activeView === 'background'
      ? backgroundSectionIds
      : activeView === 'portfolio'
        ? portfolioSectionIds
        : activeView === 'models'
          ? modelSectionIds
          : activeView === 'assets'
            ? assetSectionIds
          : activeView === 'projectlist'
        ? projectListSectionIds
        : activeView === 'recommendation'
          ? recommendationSectionIds
          : activeView === 'techstack'
            ? techstackSectionIds
            : homeSectionIds
  );
  useScrollReveal(activeView);

  const scrollToSection = useCallback((sectionId) => {
    if (viewTopSections.has(sectionId)) {
      window.scrollTo({ top: 0, behavior: getScrollBehavior() });
      return;
    }

    const section = document.getElementById(sectionId);
    if (!section) {
      console.error(`Cannot navigate to missing section "${sectionId}".`);
      return;
    }

    if (section.hasAttribute('data-reveal')) {
      section.classList.add('is-visible', 'is-navigation-target');
      window.requestAnimationFrame(() => {
        section.classList.remove('is-navigation-target');
      });
    }

    section.scrollIntoView({ behavior: getScrollBehavior(), block: 'start' });
  }, []);

  const navigateToSection = (sectionId, { replace = false } = {}) => {
    const nextView = getViewForSection(sectionId);
    const nextHash = `#${sectionId}`;
    const currentHash = window.location.hash;
    const originSection = activeSection || currentHash.slice(1) || 'home';
    const nextState = {
      ...(window.history.state || {}),
      portfolioView: nextView,
      portfolioOrigin: subpageViews.has(nextView)
        ? { sectionId: originSection, view: activeView }
        : null,
    };

    if (currentHash !== nextHash) {
      if (replace) {
        window.history.replaceState(nextState, '', nextHash);
      } else {
        window.history.pushState(nextState, '', nextHash);
      }
    }

    lastHandledHash.current = nextHash.slice(1);

    if (nextView === activeView) {
      scrollToSection(sectionId);
      return;
    }

    window.scrollTo({ top: 0, behavior: 'auto' });
    pendingSection.current = sectionId;
    setActiveView(nextView);
  };

  const handleSubpageBack = (fallbackSection) => {
    const origin = window.history.state?.portfolioOrigin;

    if (origin?.sectionId) {
      pendingSection.current = origin.sectionId;
      window.history.back();
      return;
    }

    navigateToSection(fallbackSection, { replace: true });
  };

  useEffect(() => {
    const handlePopState = () => {
      const hash = window.location.hash.slice(1) || 'home';

      if (lastHandledHash.current === hash) {
        return;
      }

      lastHandledHash.current = hash;

      const nextView = getViewFromHash();
      const sectionId = pendingSection.current || hash;
      pendingSection.current = null;

      if (nextView === activeView) {
        scrollToSection(sectionId);
        return;
      }

      window.scrollTo({ top: 0, behavior: 'auto' });
      pendingSection.current = sectionId;
      setActiveView(nextView);
    };

    window.addEventListener('popstate', handlePopState);
    window.addEventListener('hashchange', handlePopState);
    return () => {
      window.removeEventListener('popstate', handlePopState);
      window.removeEventListener('hashchange', handlePopState);
    };
  }, [activeView, scrollToSection]);

  useEffect(() => {
    if (!pendingSection.current) {
      return undefined;
    }

    const sectionId = pendingSection.current;
    pendingSection.current = null;
    const targetHash = `#${sectionId}`;

    if (window.location.hash !== targetHash) {
      window.history.replaceState(
        {
          ...(window.history.state || {}),
          portfolioView: activeView,
          portfolioOrigin: null,
        },
        '',
        targetHash
      );
    }

    lastHandledHash.current = sectionId;

    const frame = window.requestAnimationFrame(() => {
      scrollToSection(sectionId);
    });
    return () => window.cancelAnimationFrame(frame);
  }, [activeView, scrollToSection]);

  useEffect(() => {
    const previousScrollRestoration = window.history.scrollRestoration;
    window.history.scrollRestoration = 'manual';
    const sectionId = window.location.hash.slice(1);
    const frame = window.requestAnimationFrame(() => {
      if (sectionId) {
        scrollToSection(sectionId);
      } else {
        window.scrollTo({ top: 0, behavior: 'auto' });
      }
    });
    return () => {
      window.cancelAnimationFrame(frame);
      window.history.scrollRestoration = previousScrollRestoration;
    };
  }, [scrollToSection]);

  useEffect(() => {
    document.body.dataset.theme = 'dark';
  }, []);

  return (
    <div className="app-shell" data-theme="dark">
      <TopNavigation
        activeSection={activeSection}
        activeView={activeView}
        onNavigate={navigateToSection}
      />
      <main className="main">
        <div
          key={activeView}
          id={
            activeView === 'background'
              ? 'background'
              : activeView === 'recommendation'
                ? 'recommendation'
                : activeView === 'projectlist'
                  ? 'projectlist-page'
                  : undefined
          }
          className="page-view"
        >
          {activeView === 'portfolio' ? (
            <>
              <PortfolioHubSection
                onSelectCategory={navigateToSection}
              />
              <div className="portfolio-arcade">
                <ArcadeSection onPlay={openGame} />
              </div>
            </>
          ) : activeView === 'projectlist' ? (
            <ProjectListSection
              onBack={() => handleSubpageBack(subpageFallbacks.projectlist)}
            />
          ) : activeView === 'models' ? (
            <ModelsSection
              onBack={() => handleSubpageBack(subpageFallbacks.models)}
            />
          ) : activeView === 'assets' ? (
            <FreeAssetsSection
              onBack={() => handleSubpageBack(subpageFallbacks.assets)}
            />
          ) : activeView === 'background' ? (
            <div className="lower-sections more-page">
              <div className="lower-sections__inner">
                <div className="page-topbar">
                  <BackButton
                    onClick={() =>
                      handleSubpageBack(subpageFallbacks.background)
                    }
                  />
                </div>
                <BackgroundProfileHero
                  onViewSkills={() => navigateToSection('skills')}
                />
                <EducationSection />
                <AchievementsRecommendationsSection />
                <SkillsSection />
                <TechstackPreviewSection
                  onViewAll={() => navigateToSection('techstack')}
                />
                <ExperienceSection />
              </div>
            </div>
          ) : activeView === 'techstack' ? (
            <div className="lower-sections techstack-page">
              <div className="lower-sections__inner">
                <TechstackSection
                  onBack={() => handleSubpageBack(subpageFallbacks.techstack)}
                />
              </div>
            </div>
          ) : activeView === 'recommendation' ? (
            <div className="recommendation-page">
              <div className="page-topbar">
                <BackButton
                  onClick={() =>
                    handleSubpageBack(subpageFallbacks.recommendation)
                  }
                />
              </div>
              <div className="recommendation-page__content">
                <RecommendationSubmissionForm />
                <RecommendationsGrid />
              </div>
            </div>
          ) : (
            <>
              <IntroHero />

              <div className="main__inner">
                <AboutSection
                  onViewRecommendations={() =>
                    navigateToSection('recommendation')
                  }
                  onViewOverview={() => navigateToSection('background')}
                />
              </div>

              <div className="main__inner main__inner--projects">
                <ProjectsSection
                  onViewProjects={() => navigateToSection('projectlist')}
                />
              </div>
              <ContactSection
                onAskAssistant={() => navigateToSection('aichatbot')}
              />
              <AIChatbotSection />
              <BackToTop onClick={() => navigateToSection('home')} />
            </>
          )}
        </div>
      </main>
      <SiteFooter onNavigate={navigateToSection} />
      <FloatingActions
        onOpenChat={() => navigateToSection('aichatbot')}
        onOpenContact={() => navigateToSection('contact')}
      />
      {hasOpenedGame ? (
        <GrappleGame isOpen={isGameOpen} onExit={() => setIsGameOpen(false)} />
      ) : null}
    </div>
  );
}
