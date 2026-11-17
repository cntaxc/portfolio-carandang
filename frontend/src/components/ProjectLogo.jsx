import { useEffect, useState } from 'react';

// Fraction of the trimmed artwork kept as breathing room on each side.
const MARGIN = 0.04;
// Logos are analysed on a small copy for speed; the crop itself is taken
// from the full-resolution image so the result stays crisp.
const SAMPLE_SIZE = 160;
// How far (summed RGB difference) a pixel may be from the corner colour and
// still count as background.
const BACKGROUND_TOLERANCE = 36;

// Finds the visible artwork inside a logo image: everything that isn't
// transparent and doesn't match the solid background colour sampled from
// the top-left corner. Returns the crop box in natural pixels, plus the
// background colour when the logo has an opaque one.
function measureLogo(image) {
  const { naturalWidth: width, naturalHeight: height } = image;
  const scale = Math.min(1, SAMPLE_SIZE / Math.max(width, height));
  const sampleWidth = Math.max(1, Math.round(width * scale));
  const sampleHeight = Math.max(1, Math.round(height * scale));

  const canvas = document.createElement('canvas');
  canvas.width = sampleWidth;
  canvas.height = sampleHeight;
  const context = canvas.getContext('2d', { willReadFrequently: true });
  context.drawImage(image, 0, 0, sampleWidth, sampleHeight);
  const { data } = context.getImageData(0, 0, sampleWidth, sampleHeight);

  const [bgRed, bgGreen, bgBlue, bgAlpha] = data;
  const hasSolidBackground = bgAlpha > 200;
  let minX = sampleWidth;
  let minY = sampleHeight;
  let maxX = -1;
  let maxY = -1;

  for (let y = 0; y < sampleHeight; y += 1) {
    for (let x = 0; x < sampleWidth; x += 1) {
      const index = (y * sampleWidth + x) * 4;
      const alpha = data[index + 3];
      const isBackground =
        alpha < 16 ||
        (hasSolidBackground &&
          Math.abs(data[index] - bgRed) +
            Math.abs(data[index + 1] - bgGreen) +
            Math.abs(data[index + 2] - bgBlue) <
            BACKGROUND_TOLERANCE);
      if (!isBackground) {
        minX = Math.min(minX, x);
        maxX = Math.max(maxX, x);
        minY = Math.min(minY, y);
        maxY = Math.max(maxY, y);
      }
    }
  }

  if (maxX < 0) {
    return null;
  }

  const boxWidth = (maxX - minX + 1) / scale;
  const boxHeight = (maxY - minY + 1) / scale;
  const margin = Math.max(boxWidth, boxHeight) * MARGIN;
  const left = Math.max(0, minX / scale - margin);
  const top = Math.max(0, minY / scale - margin);

  return {
    left,
    top,
    width: Math.min(width - left, boxWidth + margin * 2),
    height: Math.min(height - top, boxHeight + margin * 2),
    background: hasSolidBackground
      ? `rgb(${bgRed}, ${bgGreen}, ${bgBlue})`
      : null,
  };
}

/**
 * Project logo that fills its wrapper: built-in padding in the image file is
 * trimmed so the artwork itself is scaled to the full wrapper (object-fit:
 * contain, so nothing is cut off). Logos drawn on a solid colour get a
 * matching wrapper background, so there is no visible box edge.
 * Falls back to the original image if it can't be analysed.
 */
export default function ProjectLogo({ src, alt }) {
  const [display, setDisplay] = useState({ src, background: null });

  useEffect(() => {
    let cancelled = false;
    setDisplay({ src, background: null });

    const image = new Image();
    image.decoding = 'async';
    image.onload = () => {
      if (cancelled) {
        return;
      }
      try {
        const crop = measureLogo(image);
        if (!crop) {
          return;
        }
        const canvas = document.createElement('canvas');
        canvas.width = Math.round(crop.width);
        canvas.height = Math.round(crop.height);
        canvas
          .getContext('2d')
          .drawImage(
            image,
            crop.left,
            crop.top,
            crop.width,
            crop.height,
            0,
            0,
            canvas.width,
            canvas.height
          );
        setDisplay({
          src: canvas.toDataURL('image/png'),
          background: crop.background,
        });
      } catch (error) {
        // e.g. a cross-origin image that taints the canvas: keep the original.
        console.warn(`Could not trim the logo "${alt}".`, error);
      }
    };
    image.src = src;

    return () => {
      cancelled = true;
    };
  }, [src, alt]);

  return (
    <span
      className="project-logo"
      style={display.background ? { backgroundColor: display.background } : undefined}
    >
      <img src={display.src} alt={alt} decoding="async" />
    </span>
  );
}
