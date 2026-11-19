import { useEffect, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import '../styles/import-guide.css';

// "How to import?" guide for the free assets, which download as native
// Blender .blend files: a floating card with one tab per tool. Closes with the
// X button, Escape, or a click on the backdrop.

const THREE_SNIPPET = `import * as THREE from 'three';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';

// The .glb you exported from Blender, served from your public folder.
const loader = new GLTFLoader();
loader.load('/models/Lowpoly_Dummy.glb', (gltf) => {
  scene.add(gltf.scene);
});`;

const GUIDES = [
  {
    id: 'blender',
    label: 'Blender',
    icon: 'ri-shape-2-line',
    steps: [
      <>
        Open the downloaded <code>.blend</code> file with <kbd>File</kbd> ›{' '}
        <kbd>Open</kbd> (Blender 3.0 or newer). The dummy and, in the rigged
        version, its armature are ready to edit.
      </>,
      <>
        To add it to a scene you already have, use <kbd>File</kbd> ›{' '}
        <kbd>Append</kbd>, pick the <code>.blend</code> file, open its{' '}
        <code>Object</code> folder and select the dummy (plus{' '}
        <code>metarig</code> for the rigged version).
      </>,
      <>
        In the rigged version, select the armature and switch to{' '}
        <strong>Pose Mode</strong> to pose or animate the dummy.
      </>,
    ],
  },
  {
    id: 'unity',
    label: 'Unity',
    icon: 'ri-gamepad-line',
    steps: [
      <>
        Open the <code>.blend</code> file in Blender and export it with{' '}
        <kbd>File</kbd> › <kbd>Export</kbd> › <kbd>FBX (.fbx)</kbd>. Include the
        armature if you want the rig.
      </>,
      <>
        Drag the <code>.fbx</code> file into your project&apos;s{' '}
        <code>Assets</code> folder. For the rigged version, set{' '}
        <strong>Rig › Animation Type</strong> to <strong>Humanoid</strong> or{' '}
        <strong>Generic</strong> in the Inspector.
      </>,
      <>
        Drag the imported model into the Scene or Hierarchy. (Unity can also
        import a <code>.blend</code> directly when Blender is installed on the same
        computer.)
      </>,
    ],
  },
  {
    id: 'godot',
    label: 'Godot',
    icon: 'ri-robot-2-line',
    steps: [
      <>
        Godot 4 imports <code>.blend</code> files directly through Blender. Set the
        Blender path once in <kbd>Editor Settings</kbd> › <kbd>FileSystem</kbd> ›{' '}
        <kbd>Import</kbd>.
      </>,
      <>
        Copy the <code>.blend</code> file into your project folder (it shows up
        under <code>res://</code> in the FileSystem dock). Godot imports it as a 3D
        scene.
      </>,
      <>
        Drag it into your scene to instance it, or double-click it and choose{' '}
        <strong>New Inherited Scene</strong> to edit it. Without Blender installed,
        export a glTF from Blender first and import that instead.
      </>,
    ],
  },
  {
    id: 'threejs',
    label: 'Three.js',
    icon: 'ri-code-s-slash-line',
    steps: [
      <>
        Browsers can&apos;t read <code>.blend</code> files. Open it in Blender and
        export it with <kbd>File</kbd> › <kbd>Export</kbd> ›{' '}
        <kbd>glTF 2.0 (.glb/.gltf)</kbd>.
      </>,
      <>
        Put the <code>.glb</code> where your site can serve it (for example a{' '}
        <code>public/models</code> folder), then load it with{' '}
        <code>GLTFLoader</code>:
      </>,
    ],
    code: THREE_SNIPPET,
  },
];

function CopyButton({ text }) {
  const [copied, setCopied] = useState(false);
  useEffect(() => {
    if (!copied) return undefined;
    const timeout = window.setTimeout(() => setCopied(false), 1600);
    return () => window.clearTimeout(timeout);
  }, [copied]);

  return (
    <button
      type="button"
      className="import-guide__copy"
      onClick={() => {
        navigator.clipboard?.writeText(text).then(() => setCopied(true), () => {});
      }}
    >
      <i className={copied ? 'ri-check-line' : 'ri-file-copy-line'} aria-hidden="true"></i>
      {copied ? 'Copied' : 'Copy'}
    </button>
  );
}

export default function ImportGuide({ isOpen, onClose }) {
  const [activeId, setActiveId] = useState(GUIDES[0].id);
  const dialogRef = useRef(null);
  const tabRefs = useRef({});
  const active = GUIDES.find((guide) => guide.id === activeId) || GUIDES[0];

  // Escape to close, focus the dialog, keep Tab inside it, lock page scroll,
  // and return focus to the button that opened it.
  useEffect(() => {
    if (!isOpen) return undefined;
    const opener = document.activeElement;
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    tabRefs.current[activeId]?.focus();

    const onKeyDown = (event) => {
      if (event.key === 'Escape') {
        event.preventDefault();
        onClose();
        return;
      }
      if (event.key !== 'Tab' || !dialogRef.current) return;
      const focusable = dialogRef.current.querySelectorAll(
        'button:not([disabled]), a[href], [tabindex]:not([tabindex="-1"])'
      );
      const first = focusable[0];
      const last = focusable[focusable.length - 1];
      if (event.shiftKey && document.activeElement === first) {
        event.preventDefault();
        last.focus();
      } else if (!event.shiftKey && document.activeElement === last) {
        event.preventDefault();
        first.focus();
      }
    };
    document.addEventListener('keydown', onKeyDown);
    return () => {
      document.removeEventListener('keydown', onKeyDown);
      document.body.style.overflow = previousOverflow;
      opener?.focus?.({ preventScroll: true });
    };
    // Only on open/close; the active tab shouldn't re-run this.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  // Arrow keys move between tabs.
  const onTabKeyDown = (event) => {
    const index = GUIDES.findIndex((guide) => guide.id === activeId);
    const offset = { ArrowRight: 1, ArrowLeft: -1 }[event.key];
    if (!offset) return;
    event.preventDefault();
    const next = GUIDES[(index + offset + GUIDES.length) % GUIDES.length];
    setActiveId(next.id);
    tabRefs.current[next.id]?.focus();
  };

  // Rendered into <body> so it layers above the fixed navigation and menu
  // (the page wrapper creates its own stacking context).
  return createPortal(
    <div
      className="import-guide"
      onMouseDown={(event) => {
        if (event.target === event.currentTarget) onClose();
      }}
    >
      <div
        ref={dialogRef}
        className="import-guide__card"
        role="dialog"
        aria-modal="true"
        aria-labelledby="import-guide-title"
      >
        <header className="import-guide__header">
          <div>
            <p className="import-guide__eyebrow">
              <i className="ri-file-3-line" aria-hidden="true"></i>
              .blend assets
            </p>
            <h2 id="import-guide-title">How to import</h2>
          </div>
          <button
            type="button"
            className="import-guide__close"
            onClick={onClose}
            aria-label="Close import guide"
          >
            <i className="ri-close-line" aria-hidden="true"></i>
          </button>
        </header>

        <div className="import-guide__tabs" role="tablist" aria-label="Choose your tool">
          {GUIDES.map((guide) => {
            const isActive = guide.id === activeId;
            return (
              <button
                key={guide.id}
                ref={(element) => {
                  tabRefs.current[guide.id] = element;
                }}
                type="button"
                role="tab"
                id={`import-tab-${guide.id}`}
                aria-selected={isActive}
                aria-controls={`import-panel-${guide.id}`}
                tabIndex={isActive ? 0 : -1}
                className={`import-guide__tab${isActive ? ' is-active' : ''}`}
                onClick={() => setActiveId(guide.id)}
                onKeyDown={onTabKeyDown}
              >
                <i className={guide.icon} aria-hidden="true"></i>
                {guide.label}
              </button>
            );
          })}
        </div>

        <div
          className="import-guide__panel"
          role="tabpanel"
          id={`import-panel-${active.id}`}
          aria-labelledby={`import-tab-${active.id}`}
          key={active.id}
        >
          <ol className="import-guide__steps">
            {active.steps.map((step, index) => (
              <li key={index}>
                <span className="import-guide__step-number" aria-hidden="true">
                  {String(index + 1).padStart(2, '0')}
                </span>
                <p>{step}</p>
              </li>
            ))}
          </ol>
          {active.code ? (
            <div className="import-guide__code">
              <CopyButton text={active.code} />
              <pre>
                <code>{active.code}</code>
              </pre>
            </div>
          ) : null}
        </div>

        <p className="import-guide__footnote">
          Every download is a native Blender <code>.blend</code> file (saved
          compressed, so it needs Blender 3.0 or newer). The 3D previews on this
          page are glTF exports of the same models.
        </p>
      </div>
    </div>,
    document.body
  );
}
