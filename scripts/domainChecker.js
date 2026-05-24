const fs = require('fs');
const path = require('path');

const DISCORD_WEBHOOK_URL = process.env.DISCORD_WEBHOOK_URL;

const REDIRECT_STATUS_CODES = [301, 302, 303, 307, 308];

const UNKNOWN_STATUS_CODES = [
  401, 403, 408, 409, 418, 421, 425, 429,
  500, 502, 503, 504,
  520, 521, 522, 523, 524, 525, 526, 530,
];

const FETCH_TIMEOUT_MS = 20000;
const MAX_REDIRECTS = 10;
const MAX_HTML_LENGTH = 250000;

function hasProtocol(input) {
  return input.startsWith('http://') || input.startsWith('https://');
}

function normalizeUrl(input) {
  const value = input.trim();

  if (hasProtocol(value)) {
    return value;
  }

  return 'https://' + value;
}

function buildCandidateUrls(input) {
  const value = input.trim();

  if (hasProtocol(value)) {
    return [value];
  }

  return [
    'https://' + value,
    'http://' + value,
  ];
}

function getDomain(url) {
  return new URL(url).hostname.replace(/^www\./, '').toLowerCase();
}

function isRedirectStatus(status) {
  return REDIRECT_STATUS_CODES.includes(status);
}

function isUnknownStatus(status) {
  return UNKNOWN_STATUS_CODES.includes(status);
}

function uniqueArray(arr) {
  return Array.from(new Set(arr));
}

function loadSourceUrls() {
  const possiblePaths = [
    path.join(__dirname, 'plugin.json'),
    path.join(__dirname, '..', 'plugin.json'),
    path.join(process.cwd(), 'plugin.json'),
  ];

  const pluginPath = possiblePaths.find((p) => fs.existsSync(p));

  if (!pluginPath) {
    throw new Error('Không tìm thấy plugin.json');
  }

  const raw = fs.readFileSync(pluginPath, 'utf8');
  const json = JSON.parse(raw);

  const items = Array.isArray(json.data) ? json.data : [];

  const sources = items
    .map((item) => item && item.source)
    .filter((source) => typeof source === 'string' && source.trim().length > 0)
    .map((source) => source.trim());

  return uniqueArray(sources);
}

async function fetchWithTimeout(url, options = {}) {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), FETCH_TIMEOUT_MS);

  try {
    return await fetch(url, {
      ...options,
      signal: controller.signal,
    });
  } finally {
    clearTimeout(timeout);
  }
}

async function resolveRedirect(url, maxRedirects = MAX_REDIRECTS) {
  let currentUrl = normalizeUrl(url);

  const chain = [currentUrl];
  const statuses = [];

  let html = '';

  for (let i = 0; i < maxRedirects; i++) {
    const res = await fetchWithTimeout(currentUrl, {
      method: 'GET',
      redirect: 'manual',
      headers: {
        'User-Agent':
          'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 Chrome/120 Safari/537.36',
        Accept:
          'text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,*/*;q=0.8',
        'Accept-Language': 'vi-VN,vi;q=0.9,en-US;q=0.8,en;q=0.7',
        'Cache-Control': 'no-cache',
        Pragma: 'no-cache',
      },
    });

    statuses.push(res.status);

    if (!isRedirectStatus(res.status)) {
      const contentType = res.headers.get('content-type') || '';

      if (contentType.includes('text/html') || res.status === 200) {
        try {
          const text = await res.text();
          html = text.slice(0, MAX_HTML_LENGTH);
        } catch {
          html = '';
        }
      }

      return {
        finalUrl: currentUrl,
        finalStatus: res.status,
        chain,
        statuses,
        html,
      };
    }

    const location = res.headers.get('location');

    if (!location) {
      return {
        finalUrl: currentUrl,
        finalStatus: res.status,
        chain,
        statuses,
        html: '',
      };
    }

    currentUrl = new URL(location, currentUrl).toString();
    chain.push(currentUrl);
  }

  return {
    finalUrl: currentUrl,
    finalStatus: 0,
    chain,
    statuses,
    html: '',
  };
}

function extractHtmlCandidate(html, baseUrl, originalDomain) {
  if (!html) return null;

  const candidates = [];

  const patterns = [
    /http-equiv=["']refresh["'][^>]*content=["'][^"']*url=([^"'>\s]+)[^"']*["']/gi,

    /<link[^>]+rel=["']canonical["'][^>]+href=["']([^"']+)["']/gi,
    /<link[^>]+href=["']([^"']+)["'][^>]+rel=["']canonical["']/gi,

    /<meta[^>]+property=["']og:url["'][^>]+content=["']([^"']+)["']/gi,
    /<meta[^>]+content=["']([^"']+)["'][^>]+property=["']og:url["']/gi,

    /(?:window\.)?location\.href\s*=\s*["']([^"']+)["']/gi,
    /(?:window\.)?location\.replace\s*\(\s*["']([^"']+)["']\s*\)/gi,
    /(?:window\.)?location\.assign\s*\(\s*["']([^"']+)["']\s*\)/gi,
  ];

  for (const pattern of patterns) {
    let match;

    while ((match = pattern.exec(html)) !== null) {
      const rawUrl = match[1];

      try {
        const absoluteUrl = new URL(rawUrl, baseUrl).toString();
        const domain = getDomain(absoluteUrl);

        if (domain !== originalDomain) {
          candidates.push({
            domain,
            url: absoluteUrl,
          });
        }
      } catch {
        // ignore invalid URL
      }
    }
  }

  if (candidates.length === 0) {
    return null;
  }

  return candidates[0];
}

async function checkCandidateUrl(rawUrl, candidateUrl) {
  const result = await resolveRedirect(candidateUrl);

  const originalDomain = getDomain(candidateUrl);
  const finalDomain = getDomain(result.finalUrl);

  const httpRedirected = originalDomain !== finalDomain;

  const htmlCandidate = extractHtmlCandidate(
    result.html,
    result.finalUrl,
    originalDomain
  );

  if (httpRedirected) {
    return {
      type: 'redirect',
      rawUrl,
      checkUrl: candidateUrl,
      originalDomain,
      finalDomain,
      finalUrl: result.finalUrl,
      finalStatus: result.finalStatus,
      chain: result.chain,
      statuses: result.statuses,
    };
  }

  if (htmlCandidate) {
    return {
      type: 'html_detected',
      rawUrl,
      checkUrl: candidateUrl,
      originalDomain,
      finalDomain: htmlCandidate.domain,
      finalUrl: htmlCandidate.url,
      finalStatus: result.finalStatus,
      chain: result.chain,
      statuses: result.statuses,
    };
  }

  if (isUnknownStatus(result.finalStatus)) {
    return {
      type: 'unknown',
      rawUrl,
      checkUrl: candidateUrl,
      originalDomain,
      finalDomain,
      finalUrl: result.finalUrl,
      finalStatus: result.finalStatus,
      chain: result.chain,
      statuses: result.statuses,
    };
  }

  return {
    type: 'normal',
    rawUrl,
    checkUrl: candidateUrl,
    originalDomain,
    finalDomain,
    finalUrl: result.finalUrl,
    finalStatus: result.finalStatus,
    chain: result.chain,
    statuses: result.statuses,
  };
}

async function checkOneUrl(rawUrl) {
  const candidates = buildCandidateUrls(rawUrl);
  const results = [];

  for (const candidateUrl of candidates) {
    try {
      const result = await checkCandidateUrl(rawUrl, candidateUrl);
      results.push(result);
    } catch (err) {
      results.push({
        type: 'error',
        rawUrl,
        checkUrl: candidateUrl,
        error: String(err),
      });
    }
  }

  const redirected = results.find((r) => r.type === 'redirect');
  if (redirected) return redirected;

  const htmlDetected = results.find((r) => r.type === 'html_detected');
  if (htmlDetected) return htmlDetected;

  const normal = results.find((r) => r.type === 'normal');
  if (normal) return normal;

  const unknown = results.find((r) => r.type === 'unknown');
  if (unknown) return unknown;

  return {
    type: 'error',
    rawUrl,
    error: results
      .map((r) => `${r.checkUrl || rawUrl}: ${r.error || 'Unknown error'}`)
      .join('\n'),
  };
}

function formatChain(chain) {
  if (!chain || chain.length === 0) return 'Không có chain';
  return chain.map((u) => `-> ${u}`).join('\n');
}

function chunkBlocks(blocks, maxLength = 3800) {
  const chunks = [];
  let current = '';

  for (const block of blocks) {
    const next = current ? `${current}\n\n${block}` : block;

    if (next.length > maxLength) {
      if (current) chunks.push(current);
      current = block;
    } else {
      current = next;
    }
  }

  if (current) chunks.push(current);

  return chunks;
}

function buildEmbedsFromBlocks(title, color, blocks) {
  const descriptions = chunkBlocks(blocks);

  if (descriptions.length === 0) return [];

  return descriptions.map((description, index) => ({
    title: descriptions.length > 1 ? `${title} (${index + 1}/${descriptions.length})` : title,
    color,
    description,
  }));
}

function chunkEmbeds(embeds, maxPerRequest = 10) {
  const chunks = [];
  for (let i = 0; i < embeds.length; i += maxPerRequest) {
    chunks.push(embeds.slice(i, i + maxPerRequest));
  }
  return chunks;
}

async function sendDiscord({ content = '', embeds = [] }) {
  if (!DISCORD_WEBHOOK_URL) {
    console.log('Missing DISCORD_WEBHOOK_URL');
    return;
  }

  const embedChunks = chunkEmbeds(embeds.length > 0 ? embeds : []);
  const requests = embedChunks.length > 0 ? embedChunks : [[]];

  for (let i = 0; i < requests.length; i += 1) {
    const payload = {
      content: i === 0 ? content : '',
      username: 'Domain Checker',
      embeds: requests[i],
    };

    await fetchWithTimeout(DISCORD_WEBHOOK_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(payload),
    });
  }
}

async function main() {
  const CHECK_URLS = loadSourceUrls();

  const changedResults = [];
  const htmlDetectedResults = [];
  const unknownResults = [];
  const normalResults = [];
  const errorResults = [];

  if (CHECK_URLS.length === 0) {
    console.log('ERR: Không có URL để kiểm tra từ plugin.json');
    return;
  }

  console.log(
    `Đã tải ${CHECK_URLS.length} URL nguồn từ plugin.json để kiểm tra.`
  );

  for (const rawUrl of CHECK_URLS) {
    const result = await checkOneUrl(rawUrl);

    if (result.type === 'redirect') {
      changedResults.push(
        `**[ALERT] ${result.originalDomain} -> ${result.finalDomain}**\n` +
          `Loại: HTTP redirect\n` +
          `Trạng thái cuối: \`${result.finalStatus}\`\n` +
          `URL kiểm tra: ${result.checkUrl}\n` +
          `URL cuối: ${result.finalUrl}\n` +
          `Chuỗi redirect:\n\
\`\`\`\n${formatChain(result.chain)}\n\`\`\``
      );

      continue;
    }

    if (result.type === 'html_detected') {
      htmlDetectedResults.push(
        `**[WARN] ${result.originalDomain} có dấu hiệu trỏ sang ${result.finalDomain}**\n` +
          `Loại: HTML/meta/canonical/JS detect\n` +
          `Trạng thái: \`${result.finalStatus}\`\n` +
          `URL kiểm tra: ${result.checkUrl}\n` +
          `URL phát hiện: ${result.finalUrl}\n` +
          `Chuỗi redirect:\n\
\`\`\`\n${formatChain(result.chain)}\n\`\`\``
      );

      continue;
    }

    if (result.type === 'unknown') {
      unknownResults.push(
        `**[UNKNOWN] ${result.rawUrl}**\n` +
          `Trạng thái: \`${result.finalStatus}\`\n` +
          `URL kiểm tra: ${result.checkUrl}\n` +
          `URL cuối: ${result.finalUrl}\n` +
          `Gợi ý: Server/CDN có thể chặn request hoặc trả kết quả khác trình duyệt.`
      );

      continue;
    }

    if (result.type === 'normal') {
      normalResults.push(
        `OK: ${result.originalDomain} không thấy redirect, trạng thái ${result.finalStatus}`
      );

      continue;
    }

    errorResults.push(
      `ERR: ${result.rawUrl}: ${result.error || 'Unknown error'}`
    );
  }

  const hasIssues =
    changedResults.length > 0 ||
    htmlDetectedResults.length > 0 ||
    unknownResults.length > 0 ||
    errorResults.length > 0;

  if (!hasIssues) {
    console.log('OK: Không phát hiện domain redirect sang domain khác.');
    return;
  }

  const embeds = [];

  embeds.push(
    ...buildEmbedsFromBlocks(
      '[ALERT] HTTP redirect sang domain khác',
      0xe74c3c,
      changedResults
    )
  );

  embeds.push(
    ...buildEmbedsFromBlocks(
      '[WARN] Dấu hiệu domain mới trong HTML',
      0xf39c12,
      htmlDetectedResults
    )
  );

  embeds.push(
    ...buildEmbedsFromBlocks(
      '[UNKNOWN] Không xác định được',
      0xf1c40f,
      unknownResults
    )
  );

  embeds.push(
    ...buildEmbedsFromBlocks(
      '[ERR] Lỗi khi kiểm tra',
      0xc0392b,
      errorResults
    )
  );

  console.log('Đã gửi báo cáo dạng embed lên Discord.');
  await sendDiscord({ embeds });
}

main().catch(async (err) => {
  const message = `ERR: Script failed\n\`${String(err)}\``;
  console.error(message);
  await sendDiscord({ content: message });
  process.exit(1);
});