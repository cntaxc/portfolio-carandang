import { useEffect, useRef, useState } from 'react';
import * as THREE from 'three';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader';

const ROTATION_SPEED = 0.009;
const KEYBOARD_STEP = 0.18;
const IDLE_SPIN_SPEED = 0.16;
// Radius of the sphere every model is scaled to fit. Using the bounding
// sphere (not the longest side) keeps corners in frame at any rotation.
const MODEL_RADIUS = 1.5;

function disposeObject(object) {
  object.traverse((child) => {
    if (child.geometry) {
      child.geometry.dispose();
    }
    if (child.material) {
      const materials = Array.isArray(child.material)
        ? child.material
        : [child.material];
      materials.forEach((material) => material.dispose());
    }
  });
}

function createPlaceholderGeometry(type) {
  switch (type) {
    case 'icosahedron':
      return new THREE.IcosahedronGeometry(1.25, 0);
    case 'box':
      return new THREE.BoxGeometry(1.7, 1.7, 1.7);
    case 'torus':
      return new THREE.TorusGeometry(1, 0.38, 32, 96);
    case 'capsule':
      return new THREE.CapsuleGeometry(0.6, 1.2, 12, 32);
    case 'cone':
      return new THREE.ConeGeometry(1.1, 2, 6, 1);
    case 'cylinder':
      return new THREE.CylinderGeometry(0.9, 0.9, 1.4, 32);
    case 'torusKnot':
    default:
      return new THREE.TorusKnotGeometry(0.85, 0.28, 160, 24);
  }
}

function createPlaceholder(type, color) {
  const group = new THREE.Group();
  const geometry = createPlaceholderGeometry(type);
  const mesh = new THREE.Mesh(
    geometry,
    new THREE.MeshStandardMaterial({
      color,
      metalness: 0.35,
      roughness: 0.38,
      flatShading: type === 'icosahedron',
    })
  );
  const edges = new THREE.LineSegments(
    new THREE.EdgesGeometry(geometry, 30),
    new THREE.LineBasicMaterial({
      color: 0xf5f5f0,
      transparent: true,
      opacity: 0.22,
    })
  );
  group.add(mesh, edges);
  return group;
}

// Shows only the objects named in `focus`, for files that contain more than
// one asset (a whole scene, or several character variants on one rig).
// Names are matched anywhere in the hierarchy. Every mesh outside the matched
// objects is removed; non-mesh nodes (bones, empties) stay so skinned meshes
// keep their skeleton. Returns false when no name matched.
function applyFocus(root, focus) {
  const wanted = new Set(
    focus.map((name) => THREE.PropertyBinding.sanitizeNodeName(name))
  );
  // GLTFLoader may append "_1", "_2" to keep names unique.
  const matches = (name) =>
    wanted.has(name) || wanted.has(name.replace(/_\d+$/, ''));

  const focused = [];
  root.traverse((object) => {
    if (object !== root && matches(object.name)) {
      focused.push(object);
    }
  });
  if (!focused.length) {
    return false;
  }

  const isInsideFocus = (object) => {
    for (let current = object; current; current = current.parent) {
      if (focused.includes(current)) {
        return true;
      }
    }
    return false;
  };

  const unwanted = [];
  root.traverse((object) => {
    if (object.isMesh && !isInsideFocus(object)) {
      unwanted.push(object);
    }
  });
  unwanted.forEach((mesh) => {
    mesh.removeFromParent();
    mesh.geometry?.dispose();
    const materials = Array.isArray(mesh.material)
      ? mesh.material
      : [mesh.material];
    materials.forEach((material) => material?.dispose());
  });
  return true;
}

function fitToView(object) {
  const bounds = new THREE.Box3().setFromObject(object);
  const size = bounds.getSize(new THREE.Vector3());
  const center = bounds.getCenter(new THREE.Vector3());
  const radius = size.length() / 2;
  if (radius <= 0) {
    throw new Error('The model has no measurable geometry.');
  }

  const scale = MODEL_RADIUS / radius;
  object.scale.setScalar(scale);
  object.position.set(-center.x * scale, -center.y * scale, -center.z * scale);
}

/**
 * Interactive 3D viewer. Drag (mouse, pen or touch) to rotate the model on
 * the X and Y axes; arrow keys rotate it when the canvas is focused.
 * Zooming is intentionally disabled: there is no wheel/pinch handler that
 * scales the model, and pinch/ctrl+wheel gestures over the canvas are
 * blocked so the browser does not zoom the page either.
 *
 * Pass `model` (path to a .glb under /public) or `placeholder`
 * ('torusKnot' | 'icosahedron' | 'box' | 'torus' | 'capsule' | 'cone' |
 * 'cylinder'). Placeholders use a neutral silver material by default.
 */
export default function ThreeDModelViewer({
  model,
  focus,
  placeholder = 'torusKnot',
  color = '#b9b9b4',
  label = '3D model',
}) {
  const containerRef = useRef(null);
  const canvasRef = useRef(null);
  const [status, setStatus] = useState(model ? 'loading' : 'ready');
  // The renderer is only created (and the model only downloaded) once the
  // card is near the viewport, so a page of cards doesn't load everything.
  const [isNearViewport, setIsNearViewport] = useState(false);
  const focusKey = focus ? focus.join('|') : '';

  useEffect(() => {
    const container = containerRef.current;
    if (!container || isNearViewport) {
      return undefined;
    }
    if (typeof IntersectionObserver === 'undefined') {
      setIsNearViewport(true);
      return undefined;
    }
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsNearViewport(true);
          observer.disconnect();
        }
      },
      { rootMargin: '200px' }
    );
    observer.observe(container);
    return () => observer.disconnect();
  }, [isNearViewport]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas || !isNearViewport) {
      return undefined;
    }

    let active = true;
    let animationFrame = null;
    let isDragging = false;
    let isVisible = true;
    let previousPointer = { x: 0, y: 0 };
    let lastFrameTime = 0;
    let renderer;

    const prefersReducedMotion =
      typeof window.matchMedia === 'function' &&
      window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(36, 1, 0.1, 100);
    // Rotation is applied to these two nested groups so X (pitch) and
    // Y (yaw) rotations stay independent and intuitive while dragging.
    const pitchGroup = new THREE.Group();
    const yawGroup = new THREE.Group();
    pitchGroup.add(yawGroup);
    scene.add(pitchGroup);
    camera.position.set(0, 0.15, 5.4);
    camera.lookAt(0, 0, 0);

    scene.add(new THREE.HemisphereLight(0xc9e6ff, 0x17202b, 2.1));
    const keyLight = new THREE.DirectionalLight(0xffffff, 3.2);
    keyLight.position.set(3, 4, 5);
    scene.add(keyLight);
    const rimLight = new THREE.PointLight(0xf5f5f0, 14, 9);
    rimLight.position.set(-3, 1, -2);
    scene.add(rimLight);

    try {
      renderer = new THREE.WebGLRenderer({
        canvas,
        alpha: true,
        antialias: true,
      });
    } catch (error) {
      console.error(`Unable to initialize the 3D viewer for "${label}".`, error);
      setStatus('error');
      return undefined;
    }

    renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));
    renderer.outputColorSpace = THREE.SRGBColorSpace;
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.1;

    const renderFrame = (time) => {
      animationFrame = null;
      const delta = lastFrameTime ? (time - lastFrameTime) / 1000 : 0;
      lastFrameTime = time;
      if (!isDragging && !prefersReducedMotion) {
        yawGroup.rotation.y += delta * IDLE_SPIN_SPEED;
      }
      renderer.render(scene, camera);
      if (isVisible) {
        animationFrame = window.requestAnimationFrame(renderFrame);
      }
    };
    const startLoop = () => {
      if (animationFrame === null) {
        lastFrameTime = 0;
        animationFrame = window.requestAnimationFrame(renderFrame);
      }
    };
    const requestRender = () => {
      if (!isVisible) {
        renderer.render(scene, camera);
      }
    };

    const resizeObserver = new ResizeObserver(([entry]) => {
      const { width, height } = entry.contentRect;
      if (width <= 0 || height <= 0) {
        return;
      }
      camera.aspect = width / height;
      camera.updateProjectionMatrix();
      renderer.setSize(width, height, false);
      requestRender();
    });
    resizeObserver.observe(canvas.parentElement);

    // Only render while the viewer is on screen.
    const visibilityObserver = new IntersectionObserver(([entry]) => {
      isVisible = entry.isIntersecting;
      if (isVisible) {
        startLoop();
      }
    });
    visibilityObserver.observe(canvas);

    const rotateBy = (deltaX, deltaY) => {
      yawGroup.rotation.y += deltaX;
      pitchGroup.rotation.x += deltaY;
      requestRender();
    };

    const handlePointerDown = (event) => {
      if (event.button !== undefined && event.button !== 0) {
        return;
      }
      isDragging = true;
      previousPointer = { x: event.clientX, y: event.clientY };
      canvas.setPointerCapture(event.pointerId);
      canvas.classList.add('is-dragging');
    };
    const handlePointerMove = (event) => {
      if (!isDragging) {
        return;
      }
      rotateBy(
        (event.clientX - previousPointer.x) * ROTATION_SPEED,
        (event.clientY - previousPointer.y) * ROTATION_SPEED
      );
      previousPointer = { x: event.clientX, y: event.clientY };
    };
    const stopDragging = () => {
      isDragging = false;
      canvas.classList.remove('is-dragging');
    };
    const handleKeyDown = (event) => {
      const steps = {
        ArrowLeft: [-KEYBOARD_STEP, 0],
        ArrowRight: [KEYBOARD_STEP, 0],
        ArrowUp: [0, -KEYBOARD_STEP],
        ArrowDown: [0, KEYBOARD_STEP],
      };
      const step = steps[event.key];
      if (step) {
        event.preventDefault();
        rotateBy(step[0], step[1]);
      }
    };
    // Zoom is disabled. A plain wheel scrolls the page as usual; trackpad
    // pinch (reported as ctrl+wheel) and Safari gesture events are blocked
    // so neither the model nor the page is zoomed from the canvas.
    const blockZoomWheel = (event) => {
      if (event.ctrlKey || event.metaKey) {
        event.preventDefault();
      }
    };
    const blockGesture = (event) => event.preventDefault();

    canvas.addEventListener('pointerdown', handlePointerDown);
    canvas.addEventListener('pointermove', handlePointerMove);
    canvas.addEventListener('pointerup', stopDragging);
    canvas.addEventListener('pointercancel', stopDragging);
    canvas.addEventListener('lostpointercapture', stopDragging);
    canvas.addEventListener('keydown', handleKeyDown);
    canvas.addEventListener('wheel', blockZoomWheel, { passive: false });
    canvas.addEventListener('gesturestart', blockGesture);
    canvas.addEventListener('gesturechange', blockGesture);

    const loadModel = async () => {
      const modelUrl = `${process.env.PUBLIC_URL}/${model.replace(/^\/+/, '')}`;
      try {
        const response = await fetch(modelUrl);
        if (!response.ok) {
          throw new Error(
            `Request for ${modelUrl} failed with status ${response.status}.`
          );
        }

        const modelData = await response.arrayBuffer();
        const gltf = await new Promise((resolve, reject) => {
          new GLTFLoader().parse(modelData, '', resolve, reject);
        });

        if (!active) {
          disposeObject(gltf.scene);
          return;
        }

        if (focusKey && !applyFocus(gltf.scene, focusKey.split('|'))) {
          console.warn(
            `None of the focus objects were found in ${modelUrl}; showing the whole file.`
          );
        }
        fitToView(gltf.scene);
        yawGroup.add(gltf.scene);
        setStatus('ready');
        requestRender();
      } catch (error) {
        if (active) {
          console.error(`Unable to load the 3D model from ${modelUrl}.`, error);
          setStatus('error');
        }
      }
    };

    if (model) {
      loadModel();
    } else {
      const object = createPlaceholder(placeholder, color);
      fitToView(object);
      yawGroup.add(object);
    }

    // A slight initial tilt so the model reads as 3D before interaction.
    pitchGroup.rotation.x = 0.28;
    startLoop();

    return () => {
      active = false;
      if (animationFrame !== null) {
        window.cancelAnimationFrame(animationFrame);
      }
      resizeObserver.disconnect();
      visibilityObserver.disconnect();
      canvas.removeEventListener('pointerdown', handlePointerDown);
      canvas.removeEventListener('pointermove', handlePointerMove);
      canvas.removeEventListener('pointerup', stopDragging);
      canvas.removeEventListener('pointercancel', stopDragging);
      canvas.removeEventListener('lostpointercapture', stopDragging);
      canvas.removeEventListener('keydown', handleKeyDown);
      canvas.removeEventListener('wheel', blockZoomWheel);
      canvas.removeEventListener('gesturestart', blockGesture);
      canvas.removeEventListener('gesturechange', blockGesture);
      disposeObject(scene);
      renderer.dispose();
      // Release the WebGL context now instead of waiting for garbage
      // collection; browsers cap how many contexts a page may hold.
      renderer.forceContextLoss();
    };
  }, [isNearViewport, model, focusKey, placeholder, color, label]);

  return (
    <div className="model-viewer" data-status={status} ref={containerRef}>
      <canvas
        ref={canvasRef}
        tabIndex={0}
        role="img"
        aria-label={`${label}. Drag or use the arrow keys to rotate.`}
      ></canvas>
      {status === 'loading' ? (
        <span className="model-viewer__status" aria-live="polite">
          Loading model...
        </span>
      ) : null}
      {status === 'error' ? (
        <span className="model-viewer__status" role="alert">
          This model could not be loaded.
        </span>
      ) : null}
    </div>
  );
}
