export interface NormalizedPath {
  bucket: string;
  path: string;
}

export function normalizeStoragePath(storagePath: string, defaultBucket: string): NormalizedPath {
  const safePath = (storagePath || '').replace(/^\/+/, '');
  if (!safePath) return { bucket: defaultBucket, path: '' };

  const prefix = `${defaultBucket}/`;
  if (safePath.startsWith(prefix)) {
    return { bucket: defaultBucket, path: safePath.slice(prefix.length) };
  }

  return { bucket: defaultBucket, path: safePath };
}
