// TuneCasa YouTube Utility Pattern
// Reference: https://developers.google.com/youtube/v3/docs/thumbnails

// YouTube URL patterns supported
const YOUTUBE_PATTERNS = Object.freeze([
    /(?:youtube\.com\/watch\?v=|youtube\.com\/watch\?.+&v=)([^&]+)/,
    /youtu\.be\/([^?]+)/,
    /youtube\.com\/embed\/([^?]+)/,
    /youtube\.com\/v\/([^?]+)/,
]);

// Thumbnail quality options
const THUMBNAIL_QUALITY = Object.freeze({
    DEFAULT: 'default.jpg',      // 120x90
    MQ: 'mqdefault.jpg',         // 320x180
    HQ: 'hqdefault.jpg',         // 480x360
    SD: 'sddefault.jpg',         // 640x480
    MAXRES: 'maxresdefault.jpg', // 1280x720
});

// Extract video ID from YouTube URL
export const getVideoId = (url) => {
    if (!url) return null;
    for (const pattern of YOUTUBE_PATTERNS) {
        const match = url.match(pattern);
        if (match) return match[1];
    }
    return null;
};

// Get thumbnail URL from YouTube video URL
export const getThumbnail = (url, quality = 'HQ') => {
    const videoId = getVideoId(url);
    if (!videoId) return null;
    const suffix = THUMBNAIL_QUALITY[quality] || THUMBNAIL_QUALITY.HQ;
    return `https://img.youtube.com/vi/${videoId}/${suffix}`;
};

export { YOUTUBE_PATTERNS, THUMBNAIL_QUALITY };
