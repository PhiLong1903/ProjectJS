exports.RSS_FEED_SOURCES = {
    vnexpress: {
        label: "VnExpress - Sức khỏe",
        url: "https://vnexpress.net/rss/suc-khoe.rss",
    },
    tuoitre: {
        label: "Tuổi Trẻ - Sức khỏe",
        url: "https://tuoitre.vn/rss/suc-khoe.rss",
    },
    thanhnien: {
        label: "Thanh Niên - Sức khỏe",
        url: "https://thanhnien.vn/rss/suc-khoe.rss",
    },
    dantri: {
        label: "Dân Trí - Sức khỏe",
        url: "https://dantri.com.vn/rss/suc-khoe.rss",
    },
    suckhoedoisong: {
        label: "Sức khỏe & Đời sống",
        url: "https://suckhoedoisong.vn/rss/home.rss",
    },
};
const DEFAULT_RSS_SOURCE = "vnexpress";
const CACHE_TTL_MS = 5 * 60 * 1000;
const REQUEST_TIMEOUT_MS = 8000;
const cacheBySource = {};
const isSupportedRssSource = (source) => source !== undefined && Object.prototype.hasOwnProperty.call(exports.RSS_FEED_SOURCES, source);
exports.isSupportedRssSource = isSupportedRssSource;
const normalizeRssSource = (source) => exports.isSupportedRssSource(source) ? source : DEFAULT_RSS_SOURCE;
exports.normalizeRssSource = normalizeRssSource;
const extractTagValue = (source, tagName) => {
    const pattern = new RegExp(`<${tagName}[^>]*>([\\s\\S]*?)<\\/${tagName}>`, "i");
    const match = source.match(pattern);
    return match?.[1]?.trim() ?? "";
};
const extractTagAttribute = (source, tagName, attributeName) => {
    const pattern = new RegExp(`<${tagName}\\b[^>]*\\b${attributeName}=["']([^"']+)["'][^>]*>`, "i");
    const match = source.match(pattern);
    return match?.[1]?.trim() ?? "";
};
const decodeXmlEntities = (value) => value
    .replace(/<!\[CDATA\[([\s\S]*?)\]\]>/g, "$1")
    .replace(/&amp;/g, "&")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&quot;/g, '"')
    .replace(/&apos;/g, "'")
    .replace(/&#39;/g, "'")
    .replace(/&#(\d+);/g, (_match, num) => String.fromCharCode(Number(num)));
const extractImageFromHtml = (html) => {
    if (!html) {
        return "";
    }
    const match = html.match(/<img\b[^>]*\bsrc=["']([^"']+)["'][^>]*>/i);
    return match?.[1]?.trim() ?? "";
};
const toAbsoluteUrl = (rawUrl, referenceUrl) => {
    if (!rawUrl) {
        return "";
    }
    const cleaned = decodeXmlEntities(rawUrl).trim();
    if (!cleaned) {
        return "";
    }
    if (/^https?:\/\//i.test(cleaned)) {
        return cleaned;
    }
    if (cleaned.startsWith("//")) {
        return `https:${cleaned}`;
    }
    if (!referenceUrl) {
        return "";
    }
    try {
        return new URL(cleaned, referenceUrl).toString();
    }
    catch {
        return "";
    }
};
const extractImageFromEnclosure = (itemRaw) => {
    const enclosureTags = itemRaw.match(/<enclosure\b[^>]*>/gi) ?? [];
    for (const enclosureTag of enclosureTags) {
        const url = extractTagAttribute(enclosureTag, "enclosure", "url");
        if (!url) {
            continue;
        }
        const type = (extractTagAttribute(enclosureTag, "enclosure", "type") || "").toLowerCase();
        if (type.startsWith("image/")) {
            return url;
        }
        if (/\.(jpg|jpeg|png|webp|gif)(\?|$)/i.test(url)) {
            return url;
        }
    }
    return "";
};
const extractImageUrlFromItem = (itemRaw, description, link) => {
    const contentEncoded = decodeXmlEntities(extractTagValue(itemRaw, "content:encoded"));
    const candidates = [
        extractTagAttribute(itemRaw, "media:content", "url"),
        extractTagAttribute(itemRaw, "media:thumbnail", "url"),
        extractImageFromEnclosure(itemRaw),
        extractImageFromHtml(contentEncoded),
        extractImageFromHtml(description),
    ];
    for (const candidate of candidates) {
        const absoluteUrl = toAbsoluteUrl(candidate, link);
        if (absoluteUrl) {
            return absoluteUrl;
        }
    }
    return null;
};
const parseRssXml = (xml) => {
    const itemBlocks = xml.match(/<item[\s\S]*?<\/item>/gi) ?? [];
    return itemBlocks
        .map((itemRaw) => {
        const title = decodeXmlEntities(extractTagValue(itemRaw, "title"));
        const link = decodeXmlEntities(extractTagValue(itemRaw, "link"));
        const description = decodeXmlEntities(extractTagValue(itemRaw, "description"));
        const pubDate = decodeXmlEntities(extractTagValue(itemRaw, "pubDate")) || null;
        const imageUrl = extractImageUrlFromItem(itemRaw, description, link);
        return {
            title,
            link,
            description,
            pubDate,
            imageUrl,
        };
    })
        .filter((item) => item.title && item.link);
};
const fetchRssNews = async (source) => {
    const feedUrl = exports.RSS_FEED_SOURCES[source].url;
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), REQUEST_TIMEOUT_MS);
    try {
        const response = await fetch(feedUrl, {
            headers: {
                "User-Agent": "Hospital-EHealth/1.0",
                Accept: "application/rss+xml, application/xml, text/xml",
            },
            signal: controller.signal,
        });
        if (!response.ok) {
            throw new Error(`Không thể tải RSS feed (${source}). Status: ${response.status}`);
        }
        const xml = await response.text();
        return parseRssXml(xml);
    }
    finally {
        clearTimeout(timeout);
    }
};
const getRssNews = async (limit, source = DEFAULT_RSS_SOURCE) => {
    const now = Date.now();
    const cached = cacheBySource[source];
    if (cached && cached.expiresAt > now) {
        return cached.items.slice(0, limit);
    }
    try {
        const items = await fetchRssNews(source);
        cacheBySource[source] = {
            items,
            expiresAt: now + CACHE_TTL_MS,
        };
        return items.slice(0, limit);
    }
    catch (error) {
        const message = error instanceof Error ? error.message : "Unknown error";
        console.warn(`[RSS] Nguồn ${source} tạm thời không truy cập được: ${message}`);
        if (cached?.items?.length) {
            return cached.items.slice(0, limit);
        }
        return [];
    }
};
exports.getRssNews = getRssNews;
