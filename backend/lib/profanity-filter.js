// NOTE: frontend/api/_lib/profanity-filter.mjs is an exact copy of this file,
// used by the Vercel serverless API (which can't import from backend/). Edit
// this file, then copy it over; a backend test fails if the two ever differ.
//
// Profanity filter for user-submitted recommendations.
//
// For every field the text is normalized and checked in several readings:
//   1. Lowercase and strip diacritics (NFKD), so "fúck" -> "fuck".
//   2. Map leetspeak to letters ("@" -> a, "0" -> o, "$" -> s, "4" -> a ...).
//      Ambiguous characters ("1", "!", "|") are read once as "i" and once as
//      "l", and both readings are checked.
//   3. Tokenize twice: once removing masking characters inside words
//      ("f.u.c.k", "f*ck", "f-u-c-k" -> one token) and once treating them as
//      separators ("hi,bobo" -> "hi", "bobo").
//   4. Re-join runs of single letters ("f u c k", "t a n g i n a").
//   5. Each token is compared as written and with repeated letters collapsed
//      ("fuuuuck" -> "fuck"). A token is blocked when it equals a listed word,
//      starts with a listed stem ("fucking", "tanginamo"), or contains one of
//      a few long, unambiguous roots ("youfuck").
//   6. Adjacent token pairs are joined to catch split words ("tang ina",
//      "putang ina", "as shole").
//
// Matching is token-based, not a blind substring search across the whole
// text, which avoids false positives such as "Scunthorpe", "assassin",
// "class", "magna cum laude", "BS Computer Science" or "batang inaasahan".

export const PROFANITY_REJECTION_MESSAGE =
  'Your submission contains inappropriate language and cannot be published.';

// Whole tokens (after normalization).
const BLOCKED_WORDS = [
  // English
  'fuck', 'fucking', 'fucker', 'fck', 'fuk', 'fak', 'fack', 'fvck',
  'fuq', 'phuck', 'phuk', 'fcking', 'fking', 'fukin', 'fuckin', 'fkn',
  'fckn', 'fcuk', 'shit', 'sht', 'shyt', 'shite', 'bullshit',
  'bitch', 'biatch', 'btch', 'bich', 'ass', 'arse', 'asshole', 'ashole',
  'arsehole', 'asswipe', 'jackass', 'dumbass', 'smartass',
  'bastard', 'dick', 'dik', 'dickhead', 'cock', 'cocksucker', 'cunt', 'kunt',
  'pussy', 'slut', 'whore', 'twat', 'wanker', 'prick', 'douche',
  'douchebag', 'motherfucker', 'mofo', 'wtf', 'stfu', 'gtfo', 'retard',
  'tard', 'nigger', 'nigga', 'niga', 'faggot', 'fag', 'fagot',
  'porn', 'porno', 'jizz', 'dildo', 'blowjob', 'handjob', 'boobs', 'tits',
  'titties', 'damnit', 'goddamn', 'goddamnit', 'scumbag',
  // Tagalog / Filipino (and common Visayan)
  'tangina', 'tanginamo', 'tangnamo', 'tangna', 'tngina', 'tnginamo',
  'tanginaka', 'tangamo', 'tangena', 'putangina', 'putanginamo', 'putang',
  'puta', 'pota', 'potangina', 'potaena', 'putaena', 'pucha', 'kingina',
  'kinginamo', 'kinangina', 'gago', 'gaga', 'gagu', 'gagong', 'gagi',
  'bobo', 'boba', 'bobong', 'tanga', 'tangang', 'ulol', 'ulul', 'olol',
  'tarantado', 'tarantada', 'pakyu', 'pakyo', 'pakshet', 'pakingshet',
  'punyeta', 'punyemas', 'kupal', 'pokpok', 'kantot', 'kantutan', 'iyot',
  'jakol', 'burat', 'titi', 'tite', 'pekpek', 'puke', 'puki', 'bayag',
  'inutil', 'hinayupak', 'shunga', 'engot', 'ungas', 'siraulo', 'leche',
  'lintik', 'bwisit', 'buwisit', 'yawa', 'pisti', 'bilat',
  // Spanish (common loan profanity)
  'mierda', 'pendejo', 'pendeja', 'cabron', 'cabrona', 'joder', 'chinga',
  'chingada', 'verga', 'culero', 'maricon',
];

// Multi-word phrases (matched on whole words).
const BLOCKED_PHRASES = ['hayop ka', 'animal ka', 'tang ina', 'puta ng ina'];

// Tokens starting with one of these stems are blocked
// ("fucking", "shitty", "tanginamo", "bitches").
const BLOCKED_STEMS = [
  'fuck', 'fvck', 'phuck', 'motherfuck', 'shit', 'bullshit', 'bitch',
  'asshole', 'arsehole', 'dickhead', 'cocksuck', 'cunt', 'pussy', 'slut',
  'whore', 'wank', 'douche', 'nigger', 'nigga', 'faggot', 'retard',
  'blowjob', 'dildo', 'porn', 'jizz', 'tangina', 'tngina', 'putangina',
  'kingina', 'kinangina', 'potangina', 'pakyu', 'pakshet', 'punyeta',
  'kantot', 'tarantad', 'hinayupak', 'pokpok', 'jakol', 'siraulo', 'mierda',
  'pendej', 'cabron', 'chingad', 'maricon',
];

// Long, unambiguous roots blocked anywhere inside a token ("youfuck").
const BLOCKED_ROOTS = [
  'fuck', 'motherfuck', 'tangina', 'putangina', 'kinangina', 'pakyu',
  'kantot', 'tarantado', 'cocksuck', 'nigger', 'faggot', 'bullshit',
  'asshole', 'punyeta', 'hinayupak',
];

// Legitimate words that would otherwise hit a stem (often after repeated
// letters are collapsed, e.g. "shiitake" -> "shitake").
const ALLOWED_WORDS = new Set([
  'shiitake', 'shitake', 'shitzu', 'cockpit', 'cockatoo', 'cocktail',
  'cockroach', 'peacock', 'hancock', 'scunthorpe', 'niggle', 'niggles',
  'niggling', 'pussycat', 'dickens', 'dickinson', 'dickson',
]);

// Only stems at least this long are tried on joined token pairs, so that
// e.g. "shi tzu" or "por nothing" are not flagged.
const MIN_PAIR_STEM_LENGTH = 6;
// Joined token pairs shorter than this are ignored ("ta nga" is not "tanga").
const MIN_PAIR_LENGTH = 6;
// Runs of single letters shorter than this are ignored (initials: "F. K.").
const MIN_LETTER_RUN = 3;

const LEET_MAP = {
  '4': 'a',
  '@': 'a',
  '^': 'a',
  '8': 'b',
  '(': 'c',
  '<': 'c',
  '3': 'e',
  '€': 'e',
  '6': 'g',
  '9': 'g',
  '#': 'h',
  '0': 'o',
  '5': 's',
  '$': 's',
  '7': 't',
  '+': 't',
};
const AMBIGUOUS_LEET = /[1!|]/g;

// Characters that commonly mask or separate letters inside one word.
const IN_WORD_MASK = /[*.\-_~'`"’,]/g;

const blockedWords = new Set(BLOCKED_WORDS);
const pairStems = BLOCKED_STEMS.filter(
  (stem) => stem.length >= MIN_PAIR_STEM_LENGTH
);

function collapseRepeats(value) {
  return value.replace(/(.)\1+/g, '$1');
}

const LEET_CHARACTERS = /[4@^8(<3€69#05$7+]/g;
const EDGE_SYMBOLS = /^[^\p{L}\p{N}]+|[^\p{L}\p{N}]+$/gu;

function stripDiacritics(text) {
  return text
    .toLowerCase()
    .normalize('NFKD')
    .replace(/[̀-ͯ]/g, '');
}

function toLeet(chunk, ambiguousAs) {
  return chunk
    .replace(LEET_CHARACTERS, (character) => LEET_MAP[character])
    .replace(AMBIGUOUS_LEET, ambiguousAs);
}

// Every reading of the text that is checked. Symbols are only meaningful as
// leetspeak inside a word, so each word is also read with its leading and
// trailing punctuation trimmed: "(f4ck)" -> "fack", "gago!" -> "gago".
function readingsOf(text) {
  const chunks = stripDiacritics(text).split(/\s+/).filter(Boolean);
  const trimmed = chunks.map((chunk) => chunk.replace(EDGE_SYMBOLS, ''));

  return [
    chunks.join(' '),
    chunks.map((chunk) => toLeet(chunk, 'i')).join(' '),
    chunks.map((chunk) => toLeet(chunk, 'l')).join(' '),
    trimmed.map((chunk) => toLeet(chunk, 'i')).join(' '),
    trimmed.map((chunk) => toLeet(chunk, 'l')).join(' '),
  ];
}

function joinSingleLetterRuns(tokens) {
  const runs = [];
  let run = '';
  for (const token of tokens) {
    if (token.length === 1) {
      run += token;
      continue;
    }
    if (run.length >= MIN_LETTER_RUN) {
      runs.push(run);
    }
    run = '';
  }
  if (run.length >= MIN_LETTER_RUN) {
    runs.push(run);
  }
  return runs;
}

function matchesToken(token, { allowRoots = true, stems = BLOCKED_STEMS } = {}) {
  if (!token || ALLOWED_WORDS.has(token)) {
    return false;
  }
  if (blockedWords.has(token)) {
    return true;
  }
  if (stems.some((stem) => token.startsWith(stem))) {
    return true;
  }
  return allowRoots && BLOCKED_ROOTS.some((root) => token.includes(root));
}

function tokenIsBlocked(token, options) {
  if (matchesToken(token, options)) {
    return true;
  }
  const collapsed = collapseRepeats(token);
  return collapsed !== token && matchesToken(collapsed, options);
}

function readingIsBlocked(reading) {
  const tokenSets = [
    reading.replace(IN_WORD_MASK, '').split(/[^a-z]+/).filter(Boolean),
    reading.split(/[^a-z]+/).filter(Boolean),
  ];

  for (const tokens of tokenSets) {
    const candidates = [...tokens, ...joinSingleLetterRuns(tokens)];
    if (candidates.some((token) => tokenIsBlocked(token))) {
      return true;
    }

    for (let index = 0; index < tokens.length - 1; index += 1) {
      const pair = tokens[index] + tokens[index + 1];
      if (
        pair.length >= MIN_PAIR_LENGTH &&
        tokenIsBlocked(pair, { allowRoots: false, stems: pairStems })
      ) {
        return true;
      }
    }

    const spaced = ` ${tokens.join(' ')} `;
    if (BLOCKED_PHRASES.some((phrase) => spaced.includes(` ${phrase} `))) {
      return true;
    }
  }

  return false;
}

/**
 * Returns true when the text contains profanity (English, Tagalog/Filipino
 * or Spanish), including leetspeak, masking and spacing evasions.
 */
export function containsProfanity(text) {
  if (typeof text !== 'string' || !text.trim()) {
    return false;
  }

  return readingsOf(text).some(readingIsBlocked);
}

/**
 * Checks several named fields. Returns the names of the fields that contain
 * profanity; an empty array means the submission is clean.
 */
export function findProfaneFields(fields) {
  return Object.entries(fields)
    .filter(([, value]) => containsProfanity(value))
    .map(([name]) => name);
}
