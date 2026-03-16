const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000/api';
const APP_BASE_URL = API_BASE_URL.replace(/\/api\/?$/, '');

const IMAGE_EXTENSIONS = ['.avif', '.jpg', '.jpeg', '.png', '.gif', '.webp', '.bmp', '.svg'];
const VIDEO_EXTENSIONS = ['.mp4', '.webm', '.ogg', '.mov', '.m4v'];
const KNOWN_IMAGE_HOSTS = [
  'images.unsplash.com',
  'source.unsplash.com',
  'images.pexels.com',
  'res.cloudinary.com',
  'i.imgur.com',
];

const hostMatches = (host, baseHost) => host === baseHost || host.endsWith(`.${baseHost}`);

const hasAnyExtension = (pathname, extensions) => {
  const lower = pathname.toLowerCase();
  return extensions.some((ext) => lower.endsWith(ext));
};

const toUrl = (value) => {
  try {
    return new URL(value, APP_BASE_URL);
  } catch {
    return null;
  }
};

export const resolveMediaUrl = (value) => {
  if (!value || typeof value !== 'string') return '';

  if (/^https?:\/\//i.test(value) || value.startsWith('blob:') || value.startsWith('data:')) {
    return value;
  }

  if (value.startsWith('/')) {
    return `${APP_BASE_URL}${value}`;
  }

  const normalized = value.startsWith('storage/') ? value : `storage/${value}`;
  return `${APP_BASE_URL}/${normalized}`;
};

export const isEmbedVideoUrl = (value) => {
  const resolved = resolveMediaUrl(value);
  if (!resolved) return false;

  const url = toUrl(resolved);
  if (!url) return false;

  const host = url.hostname.toLowerCase();
  const path = url.pathname.toLowerCase();

  return (
    (hostMatches(host, 'youtube.com') && path.startsWith('/embed/')) ||
    (hostMatches(host, 'vimeo.com') && path.startsWith('/video/')) ||
    hostMatches(host, 'player.vimeo.com')
  );
};

export const isLikelyImageUrl = (value) => {
  const resolved = resolveMediaUrl(value);
  if (!resolved) return false;

  if (resolved.startsWith('data:image/') || resolved.startsWith('blob:')) {
    return true;
  }

  if (resolved.includes('/storage/events/covers/') || resolved.includes('/storage/events/gallery/')) {
    return true;
  }

  const url = toUrl(resolved);
  if (!url) return false;

  const host = url.hostname.toLowerCase();
  const path = url.pathname.toLowerCase();

  if (KNOWN_IMAGE_HOSTS.some((knownHost) => hostMatches(host, knownHost))) {
    return true;
  }

  return hasAnyExtension(path, IMAGE_EXTENSIONS);
};

export const isLikelyDirectVideoUrl = (value) => {
  const resolved = resolveMediaUrl(value);
  if (!resolved) return false;

  if (resolved.startsWith('data:video/') || resolved.startsWith('blob:')) {
    return true;
  }

  if (resolved.includes('/storage/events/videos/')) {
    return true;
  }

  const url = toUrl(resolved);
  if (!url) return false;

  return hasAnyExtension(url.pathname.toLowerCase(), VIDEO_EXTENSIONS);
};
