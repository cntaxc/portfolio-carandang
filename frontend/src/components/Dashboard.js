import { useCallback, useEffect, useRef, useState } from 'react';
import TopNavigation from './TopNavigation';
import FloatingActions from './FloatingActions';
import BackButton from './BackButton';
import HomeHero from './sections/HomeHero';
import JourneySection from './sections/JourneySection';
import ProjectsSection from './sections/ProjectsSection';
import ContactSection from './sections/ContactSection';
import ProjectListSection from './sections/ProjectListSection';
import PortfolioHubSection from './sections/PortfolioHubSection';
import ModelsSection from './sections/ModelsSection';
import FreeAssetsSection from './sections/FreeAssetsSection';
import AIChatbotSection from './sections/AIChatbotSection';
import AchievementsRecommendationsSection from './sections/AchievementsRecommendationsSection';
import TechstackPreviewSection from './sections/TechstackPreviewSection';
import TechstackSection from './sections/TechstackSection';
import ExperienceSection from './sections/ExperienceSection';
import EducationSection from './sections/EducationSection';
import GrappleGame from './grapple/GrappleGame';
import RecommendationSubmissionForm from './RecommendationSubmissionForm';
import RecommendationsGrid from './RecommendationsGrid';
import RecommendationsCarousel from './RecommendationsCarousel';
import SiteFooter from './SiteFooter';
import BackToTop from './BackToTop';
import SectionIndex from './SectionIndex';
import TerminalClock from './TerminalClock';
import useActiveSection from '../hooks/useActiveSection';
import useDocumentTitle from '../hooks/useDocumentTitle';
import useScrollReveal from '../hooks/useScrollReveal';
import '../styles/journey-polish.css';
import '../styles/typography.css';
import {
  aiSectionIds,
  assetSectionIds,
  contactSectionIds,
  homeSectionIds,
  journeyIndex,
  journeySectionIds,
  modelSectionIds,
  portfolioSectionIds,
  projectListSectionIds,
  recommendationSectionIds,
  sectionAliases,
  techstackSectionIds,
} from '../data/portfolio';

const subpageViews = new Set([
  'journey',
  'contact',
  'aichatbot',
  'portfolio',
  'projectlist',
  'models',
  'assets',
  'techstack',
  'recommendation',
]);
// Where a subpage's Back button goes when there is no history entry to
// return to (e.g. the page was opened directly from a link).
const subpageFallbacks = {
  journey: 'home',
  contact: 'home',
  aichatbot: 'home',
  portfolio: 'home',
  projectlist: 'portfolio',
  models: 'portfolio',
  assets: 'portfolio',
  techstack: 'techstack-preview',
  recommendation: 'home',
};
// Sections that are the top of their own view: navigating to them scrolls to
// the top of the page instead of to the element.
const viewTopSections = new Set([
  'journey',
  'contact',
  'aichatbot',
  'portfolio',
  'models',
  'assets',
  'recommendation',
]);

function getScrollBehavior() {
  const prefersReducedMotion =
    typeof window.matchMedia === 'function' &&
    window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  return prefersReducedMotion ? 'instant' : 'smooth';
}

// Old section ids (from removed pages) map to where that content lives now.
function resolveSection(sectionId) {
  return sectionAliases[sectionId] || sectionId;
}

function getViewForSection(rawSectionId) {
  const sectionId = resolveSection(rawSectionId);
  if (journeySectionIds.includes(sectionId)) {
    return 'journey';
  }
  if (contactSectionIds.includes(sectionId)) {
    return 'contact';
  }
  if (aiSectionIds.includes(sectionId)) {
    return 'aichatbot';
  }
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
  const navigateRef = useRef(null);
  const startJourney = useCallback(() => navigateRef.current?.('journey'), []);
  const goHome = useCallback(() => navigateRef.current?.('home'), []);
  const openGame = () => {
    setHasOpenedGame(true);
    // Open on the next frame so the view fades in even on first launch.
    window.requestAnimationFrame(() => setIsGameOpen(true));
  };
  const pendingSection = useRef(null);
  const lastHandledHash = useRef(null);
  const activeSection = useActiveSection(
    activeView === 'portfolio'
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
            : activeView === 'contact'
                ? contactSectionIds
                : activeView === 'aichatbot'
                  ? aiSectionIds
                  : activeView === 'journey'
                    ? journeySectionIds
                    : homeSectionIds
  );
  useScrollReveal(activeView);

  // Same page: smooth scroll straight to the section. Right after a page
  // switch (`instant`), jump there directly so the new page doesn't animate
  // down from the top.
  const scrollToSection = useCallback((sectionId, { instant = false } = {}) => {
    const behavior = instant ? 'instant' : getScrollBehavior();
    if (viewTopSections.has(sectionId)) {
      window.scrollTo({ top: 0, behavior });
      return;
    }

    const section = document.getElementById(resolveSection(sectionId));
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

    section.scrollIntoView({ behavior, block: 'start' });
  }, []);

  const navigateToSection = (rawSectionId, { replace = false } = {}) => {
    const sectionId = resolveSection(rawSectionId);
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

    window.scrollTo({ top: 0, behavior: 'instant' });
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

      window.scrollTo({ top: 0, behavior: 'instant' });
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
      scrollToSection(sectionId, { instant: true });
    });
    return () => window.cancelAnimationFrame(frame);
  }, [activeView, scrollToSection]);

  useEffect(() => {
    const previousScrollRestoration = window.history.scrollRestoration;
    window.history.scrollRestoration = 'manual';
    const sectionId = window.location.hash.slice(1);
    const frame = window.requestAnimationFrame(() => {
      if (sectionId) {
        scrollToSection(sectionId, { instant: true });
      } else {
        window.scrollTo({ top: 0, behavior: 'instant' });
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

  // Homepage "Press [Enter] to my journey" button / Enter key: open the
  // Journey level tree.
  // Stable callback (latest navigate function via a ref).
  navigateRef.current = navigateToSection;

  return (
    <div className="app-shell" data-theme="dark">
      {/* No navigation bar on the homepage: it's a distraction-free hero. */}
      {activeView !== 'home' ? (
        <TopNavigation
          activeSection={activeSection}
          activeView={activeView}
          onNavigate={navigateToSection}
        />
      ) : null}
      <main className="main">
        <div
          key={activeView}
          id={
            activeView === 'recommendation'
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
          ) : activeView === 'journey' ? (
            // My Journey: intro + level tree, then the About content below.
            <>
              <JourneySection onNavigate={navigateToSection} onHome={goHome} />
              <SectionIndex sections={journeyIndex} label="Journey page sections" />
              <TerminalClock />
              <div className="journey-about">
                <div className="main__inner main__inner--projects">
                  <ProjectsSection
                    onViewProjects={() => navigateToSection('projectlist')}
                  />
                </div>
                {/* Recommendations, directly below Projects. */}
                <div className="main__inner journey-recommendations">
                  <RecommendationsCarousel
                    onViewRecommendations={() => navigateToSection('recommendation')}
                  />
                </div>
                {/* From the Overview page: Education, Achievements, Techstack, Experiences. */}
                <div className="lower-sections__inner journey-overview">
                  <EducationSection />
                  <AchievementsRecommendationsSection />
                  <TechstackPreviewSection
                    onViewAll={() => navigateToSection('techstack')}
                  />
                  <ExperienceSection />
                </div>
                <BackToTop onClick={() => navigateToSection('journey')} />
              </div>
            </>
          ) : activeView === 'contact' ? (
            // Contact page.
            <div className="standalone-page">
              <div className="main__inner standalone-page__topbar">
                <div className="page-topbar">
                  <BackButton
                    onClick={() => handleSubpageBack(subpageFallbacks.contact)}
                  />
                </div>
              </div>
              <ContactSection
                onAskAssistant={() => navigateToSection('aichatbot')}
              />
            </div>
          ) : activeView === 'aichatbot' ? (
            // AI assistant page.
            <div className="standalone-page">
              <div className="main__inner standalone-page__topbar">
                <div className="page-topbar">
                  <BackButton
                    onClick={() => handleSubpageBack(subpageFallbacks.aichatbot)}
                  />
                </div>
              </div>
              <AIChatbotSection />
            </div>
          ) : (
            // Homepage: a single full-screen hero.
            <HomeHero
              onStartJourney={startJourney}
              onContact={() => navigateToSection('contact')}
            />
          )}
        </div>
      </main>
      {/* The homepage is a single screen, so it has no footer. */}
      {activeView !== 'home' ? <SiteFooter onNavigate={navigateToSection} /> : null}
      <FloatingActions
        onOpenChat={() => navigateToSection('aichatbot')}
        onOpenContact={() => navigateToSection('contact')}
        onPlayGame={openGame}
      />
      {hasOpenedGame ? (
        <GrappleGame isOpen={isGameOpen} onExit={() => setIsGameOpen(false)} />
      ) : null}
    </div>
  );
}
