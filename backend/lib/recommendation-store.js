import { mkdir, readFile, rename, rm, stat, writeFile } from 'node:fs/promises';
import path from 'node:path';

const DATA_VERSION = 2;

const RECORD_FIELDS = [
  'id',
  'author',
  'organization',
  'context',
  'message',
  'publishedAt',
];

// Returns a clean copy of a stored recommendation, or null when the record is
// malformed (any required field missing or empty). Malformed records are
// dropped when the data file is loaded.
function normalizeRecord(record) {
  if (!record || typeof record !== 'object' || Array.isArray(record)) {
    return null;
  }

  const normalized = {};
  for (const field of RECORD_FIELDS) {
    const value =
      typeof record[field] === 'string' ? record[field].trim() : '';
    if (!value) {
      return null;
    }
    normalized[field] = value;
  }
  return normalized;
}

function copyRecord(record) {
  return record ? { ...record } : record;
}

export function createRecommendationStore({ filePath }) {
  if (typeof filePath !== 'string' || !filePath.trim()) {
    throw new Error('Recommendation store file path is required.');
  }

  const resolvedFilePath = path.resolve(filePath);
  let records = null;
  let loadPromise = null;
  let writeQueue = Promise.resolve();
  // Modification time + size of the data file when it was last read or
  // written. If it changes (someone edited or replaced the file by hand, or
  // the management script ran), the file is re-read on the next request.
  let fileStamp = null;

  async function readStamp() {
    try {
      const info = await stat(resolvedFilePath);
      return `${info.mtimeMs}:${info.size}`;
    } catch (error) {
      if (error?.code === 'ENOENT') {
        return 'missing';
      }
      throw error;
    }
  }

  async function persist(nextRecords) {
    const directory = path.dirname(resolvedFilePath);
    await mkdir(directory, { recursive: true });

    const temporaryFilePath = `${resolvedFilePath}.${process.pid}.${Date.now()}.tmp`;
    const payload = `${JSON.stringify(
      { version: DATA_VERSION, recommendations: nextRecords },
      null,
      2
    )}\n`;

    try {
      await writeFile(temporaryFilePath, payload, { mode: 0o600 });
      try {
        await rename(temporaryFilePath, resolvedFilePath);
      } catch (error) {
        if (error?.code !== 'EEXIST' && error?.code !== 'EPERM') {
          throw error;
        }
        await rm(resolvedFilePath, { force: true });
        await rename(temporaryFilePath, resolvedFilePath);
      }
      fileStamp = await readStamp();
    } catch (error) {
      await rm(temporaryFilePath, { force: true }).catch(() => {});
      throw error;
    }
  }

  function enqueueWrite(task) {
    const operation = writeQueue.then(task, task);
    writeQueue = operation.then(
      () => undefined,
      () => undefined
    );
    return operation;
  }

  async function load() {
    if (records && !loadPromise) {
      const stamp = await readStamp();
      if (stamp === fileStamp) {
        return records;
      }
      // Changed outside this process: re-read it.
      loadPromise = reload(records);
    }
    if (loadPromise) {
      return loadPromise;
    }

    loadPromise = reload(null);
    return loadPromise;
  }

  // Reads the file into memory. When `previous` is set (a re-read after an
  // external change) and the file can't be parsed, the previous records are
  // kept and an error is logged, so a bad hand edit can't take the API down.
  function reload(previous) {
    return (async () => {
      try {
        const content = await readFile(resolvedFilePath, 'utf8');
        const parsed = JSON.parse(content);

        if (!parsed || !Array.isArray(parsed.recommendations)) {
          throw new Error(
            'Recommendation store must contain a recommendations array.'
          );
        }

        const normalized = parsed.recommendations.map(normalizeRecord);
        const nextRecords = normalized.filter(Boolean);
        // Rewrite the file if it is an older version or had to be cleaned.
        const requiresRewrite =
          parsed.version !== DATA_VERSION ||
          normalized.some(
            (record, index) =>
              !record ||
              JSON.stringify(record) !==
                JSON.stringify(parsed.recommendations[index])
          );

        records = nextRecords;

        if (requiresRewrite) {
          await persist(nextRecords);
        } else {
          fileStamp = await readStamp();
        }
      } catch (error) {
        if (error?.code === 'ENOENT') {
          records = [];
          await persist(records);
        } else if (previous) {
          console.error(
            `Recommendation data at ${resolvedFilePath} could not be re-read; keeping the previous data until it is fixed:`,
            error.message
          );
          records = previous;
          // Don't retry (and re-log) until the file changes again.
          fileStamp = await readStamp();
        } else {
          throw error;
        }
      } finally {
        loadPromise = null;
      }

      return records;
    })();
  }

  async function init() {
    await load();
  }

  async function create(record) {
    const normalized = normalizeRecord(record);

    if (!normalized) {
      throw new Error('Recommendation record is invalid.');
    }

    return enqueueWrite(async () => {
      await load();
      const nextRecords = [normalized, ...records];
      await persist(nextRecords);
      records = nextRecords;
      return copyRecord(normalized);
    });
  }

  // Deletes one recommendation by id. Returns the removed record, or null.
  async function remove(id) {
    return enqueueWrite(async () => {
      await load();
      const target = records.find((record) => record.id === id);
      if (!target) {
        return null;
      }
      const nextRecords = records.filter((record) => record.id !== id);
      await persist(nextRecords);
      records = nextRecords;
      return copyRecord(target);
    });
  }

  // Deletes every recommendation. Returns how many were removed.
  async function clear() {
    return enqueueWrite(async () => {
      await load();
      const count = records.length;
      await persist([]);
      records = [];
      return count;
    });
  }

  async function listPublished() {
    await load();
    return records
      .slice()
      .sort((first, second) =>
        String(second.publishedAt).localeCompare(String(first.publishedAt))
      )
      .map(copyRecord);
  }

  return {
    clear,
    create,
    filePath: resolvedFilePath,
    init,
    listPublished,
    remove,
  };
}
