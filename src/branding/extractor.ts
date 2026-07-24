import { Branding } from '../types/index';

// Private IP ranges to block
const PRIVATE_IP_PATTERNS = [
  /^localhost$/i,
  /^127\./,
  /^10\./,
  /^172\.(1[6-9]|2\d|3[01])\./,
  /^192\.168\./,
  /^169\.254\./, // Cloud metadata
  /\.local$/i,
  /\.internal$/i,
  /\.corp$/i,
  /\.lan$/i,
];

function isSafeUrl(url: string): boolean {
  try {
    const parsed = new URL(url);

    // Scheme check
    if (!['http:', 'https:'].includes(parsed.protocol)) {
      return false;
    }

    // Private IP check
    const hostname = parsed.hostname;
    for (const pattern of PRIVATE_IP_PATTERNS) {
      if (pattern.test(hostname)) {
        return false;
      }
    }

    return true;
  } catch {
    return false;
  }
}

function extractColors(html: string): { primary?: string; secondary?: string } {
  const colors: string[] = [];

  // Extract from meta theme-color
  const themeColorMatch = html.match(
    /<meta[^>]*name=["']theme-color["'][^>]*content=["']([^"']+)["']/i
  );
  if (themeColorMatch) {
    colors.push(themeColorMatch[1]);
  }

  // Extract from CSS custom properties
  const cssVarMatches = html.matchAll(
    /--(?:primary|brand|accent)[^:]*:\s*(#[0-9a-fA-F]{3,8}|rgb\([^)]+\)|hsl\([^)]+\))/gi
  );
  for (const match of cssVarMatches) {
    colors.push(match[1]);
  }

  // Extract from inline styles (background-color, color)
  const styleMatches = html.matchAll(
    /(?:background-color|color):\s*(#[0-9a-fA-F]{3,8}|rgb\([^)]+\)|hsl\([^)]+\))/gi
  );
  for (const match of styleMatches) {
    colors.push(match[1]);
  }

  // Extract from hex colors in style attributes
  const hexMatches = html.matchAll(/#[0-9a-fA-F]{6}/g);
  for (const match of hexMatches) {
    colors.push(match[0]);
  }

  // Deduplicate and return
  const uniqueColors = [...new Set(colors)];
  return {
    primary: uniqueColors[0],
    secondary: uniqueColors[1],
  };
}

function extractFont(html: string): string | undefined {
  // Extract from Google Fonts link
  const googleFontsMatch = html.match(
    /fonts\.googleapis\.com\/css2\?family=([^&"']+)/i
  );
  if (googleFontsMatch) {
    const fontFamily = googleFontsMatch[1].split(':')[0].replace(/\+/g, ' ');
    return fontFamily;
  }

  // Extract from font-family in CSS
  const fontFamilyMatch = html.match(
    /font-family:\s*['"]?([^'";\n]+)['"]?/i
  );
  if (fontFamilyMatch) {
    return fontFamilyMatch[1].split(',')[0].trim();
  }

  return undefined;
}

function extractLogo(html: string, baseUrl: string): string | undefined {
  // Extract from og:image meta tag
  const ogImageMatch = html.match(
    /<meta[^>]*property=["']og:image["'][^>]*content=["']([^"']+)["']/i
  );
  if (ogImageMatch) {
    return resolveUrl(ogImageMatch[1], baseUrl);
  }

  // Extract from logo class/id
  const logoMatch = html.match(
    /<img[^>]*(?:class|id)=["'][^"']*(?:logo|brand)[^"']*["'][^>]*src=["']([^"']+)["']/i
  );
  if (logoMatch) {
    return resolveUrl(logoMatch[1], baseUrl);
  }

  // Extract from first large image in header
  const headerMatch = html.match(
    /<header[^>]*>[\s\S]*?<img[^>]*src=["']([^"']+)["']/i
  );
  if (headerMatch) {
    return resolveUrl(headerMatch[1], baseUrl);
  }

  // Extract from favicon
  const faviconMatch = html.match(
    /<link[^>]*rel=["'](?:icon|shortcut icon)["'][^>]*href=["']([^"']+)["']/i
  );
  if (faviconMatch) {
    return resolveUrl(faviconMatch[1], baseUrl);
  }

  return undefined;
}

function resolveUrl(url: string, baseUrl: string): string {
  if (url.startsWith('http://') || url.startsWith('https://')) {
    return url;
  }

  if (url.startsWith('//')) {
    return `https:${url}`;
  }

  if (url.startsWith('/')) {
    const base = new URL(baseUrl);
    return `${base.protocol}//${base.host}${url}`;
  }

  return `${baseUrl}/${url}`;
}

function extractCompanyName(html: string): string | undefined {
  // Extract from og:site_name
  const siteNameMatch = html.match(
    /<meta[^>]*property=["']og:site_name["'][^>]*content=["']([^"']+)["']/i
  );
  if (siteNameMatch) {
    return siteNameMatch[1];
  }

  // Extract from title
  const titleMatch = html.match(/<title[^>]*>([^<]+)<\/title>/i);
  if (titleMatch) {
    const title = titleMatch[1].trim();
    // Try to extract company name before " | " or " - "
    const parts = title.split(/\s*[|\-–]\s*/);
    return parts[0]?.trim();
  }

  return undefined;
}

export async function extractBranding(website: string): Promise<{
  branding: Partial<Branding>;
  error?: string;
}> {
  // Ensure URL has protocol
  let url = website;
  if (!url.startsWith('http://') && !url.startsWith('https://')) {
    url = `https://${url}`;
  }

  // Validate URL safety
  if (!isSafeUrl(url)) {
    return {
      branding: {},
      error: 'Invalid or unsafe URL. Please provide a public website address.',
    };
  }

  try {
    // HEAD request first to check accessibility
    const headResponse = await fetch(url, {
      method: 'HEAD',
      signal: AbortSignal.timeout(5000),
      headers: {
        'User-Agent': 'DocuQueue-BrandingBot/1.0',
      },
    });

    if (!headResponse.ok) {
      return {
        branding: {},
        error: `Couldn't load ${website} — it may be blocking automated access.`,
      };
    }

    // GET request to fetch content
    const response = await fetch(url, {
      signal: AbortSignal.timeout(5000),
      headers: {
        'User-Agent': 'DocuQueue-BrandingBot/1.0',
      },
    });

    if (!response.ok) {
      return {
        branding: {},
        error: `Couldn't load ${website} — server returned ${response.status}.`,
      };
    }

    const html = await response.text();

    // Check if it's a SPA (empty body)
    if (!html.includes('<body') && !html.includes('<div')) {
      return {
        branding: {},
        error: `The site ${website} requires JavaScript to render. Let's set up your branding manually.`,
      };
    }

    // Extract branding elements
    const colors = extractColors(html);
    const font = extractFont(html);
    const logo = extractLogo(html, url);
    const companyName = extractCompanyName(html);

    return {
      branding: {
        website,
        company_name: companyName,
        primary_color: colors.primary,
        secondary_color: colors.secondary,
        font,
        logo_url: logo,
      },
    };
  } catch (error) {
    if (error instanceof Error) {
      if (error.name === 'TimeoutError') {
        return {
          branding: {},
          error: `Taking too long to load ${website}. Let's try a different approach.`,
        };
      }
    }

    return {
      branding: {},
      error: `Couldn't extract branding from ${website}. Let's set it up manually.`,
    };
  }
}
