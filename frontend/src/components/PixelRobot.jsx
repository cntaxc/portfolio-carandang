// Pixel-art TV-head robot, 19 x 21 pixels (traced from the sprite pixel by
// pixel). Drawn as SVG squares, so it stays sharp at any size and has a
// transparent background.
// A outline, B body, C highlight, D screen shadow, E screen, F body shadow,
// G face, . empty

export const ROBOT_COLORS = {
  A: '#030000',
  B: '#aaa27e',
  C: '#fdfecc',
  D: '#054a40',
  E: '#3e7d71',
  F: '#655e45',
  G: '#f4f880',
};

export const ROBOT_PIXELS = [
  '..AAAAAAAAAAAAAAAA.',
  '.ABBBCCCCCCCCCCCCCA',
  '.ABBBCDDDDDDDDDDDCA',
  '.ABBBCEEEEEEEEEEDCA',
  '.ABBBCEEEEEEEEEEDCA',
  'AFFCBCEEEEEEEEEEDCA',
  'AFFCBCEGEEEEEEEGDCA',
  'AFFCBCEEEGEEEGEEDCA',
  '.ABBBCEEEGGGGGEEDCA',
  '.ABBBCEEEEEEEEEEDCA',
  '.ABBBCEEEEEEEEEEDCA',
  '.ABBBCCCCCCCCCCCCCA',
  '..AAAFFFFFFFFFFAAA.',
  '.....AFBBBBBBBA....',
  '.....AFBFCCCCBA....',
  '.....AFBFCCCCBA....',
  '.....AFBFCCCCBA....',
  '.....AFBBBBBBBA....',
  '......ABAAAABA.....',
  '......ACA..ACA.....',
  '.......A....A......',
];

export default function PixelRobot({ className }) {
  const pixels = [];
  ROBOT_PIXELS.forEach((row, y) => {
    [...row].forEach((key, x) => {
      if (ROBOT_COLORS[key]) {
        pixels.push(
          <rect key={`${x}-${y}`} x={x} y={y} width="1" height="1" fill={ROBOT_COLORS[key]} />
        );
      }
    });
  });
  return (
    <svg
      className={className}
      viewBox={`0 0 ${ROBOT_PIXELS[0].length} ${ROBOT_PIXELS.length}`}
      shapeRendering="crispEdges"
      aria-hidden="true"
    >
      {pixels}
    </svg>
  );
}
