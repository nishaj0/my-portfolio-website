# SEO Setup Documentation

This document describes the SEO improvements that have been implemented for the portfolio website.

## What Was Added

### 1. Enhanced Metadata (src/app/layout.tsx)

The root layout now includes comprehensive SEO metadata:

- **Title**: "Nishaj M - Full Stack Developer & Designer Portfolio"
- **Description**: Detailed description mentioning Muhammed Nishaj M (nishaj0)
- **Keywords**: nishaj0, Nishaj M, Muhammed Nishaj M, plus relevant development keywords
- **Author Information**: Creator, publisher, and author metadata
- **OpenGraph Tags**: For better social media sharing (Facebook, LinkedIn, etc.)
- **Twitter Card**: For enhanced Twitter sharing
- **Robots Directives**: Configured to allow proper indexing by search engines

### 2. Structured Data (JSON-LD)

Added JSON-LD schema markup for:
- Person schema with name, job title, and alternative names
- Links to GitHub profile
- Skills and knowledge areas

This helps search engines better understand the website content.

### 3. Sitemap Generation

Implemented automatic sitemap generation using `next-sitemap`:

- **Configuration**: `next-sitemap.config.cjs`
- **Generated File**: `public/sitemap.xml`
- **Automatic Generation**: Runs after every build via postbuild script
- **Priority Settings**:
  - Homepage (/): Priority 1.0, daily updates
  - Projects page (/projects): Priority 0.9, weekly updates

### 4. Robots.txt

Created `public/robots.txt` with:
- Allows all crawlers
- References sitemap location
- Optimized for search engine discovery

### 5. Page-Specific Metadata

Added metadata for the projects page (src/app/projects/layout.tsx) with:
- Custom title and description
- OpenGraph and Twitter card overrides

## How to Verify the Changes

### 1. Build the Project

```bash
npm run build
```

This will:
- Build the Next.js application
- Automatically generate the sitemap via the postbuild script

### 2. Check Generated Files

After building, verify these files exist:
- `public/sitemap.xml` - Contains all your site URLs
- `public/robots.txt` - Directs search engines

### 3. Test Locally

```bash
npm run start
```

Then access:
- http://localhost:3000/ - Homepage with SEO tags
- http://localhost:3000/projects - Projects page with custom metadata
- http://localhost:3000/robots.txt - Robots file
- http://localhost:3000/sitemap.xml - Sitemap

### 4. Validate SEO

Use these tools to validate your SEO setup:

1. **Google Rich Results Test**: https://search.google.com/test/rich-results
   - Test your homepage URL to verify structured data

2. **Facebook Sharing Debugger**: https://developers.facebook.com/tools/debug/
   - Test OpenGraph tags

3. **Twitter Card Validator**: https://cards-dev.twitter.com/validator
   - Test Twitter card metadata

4. **Sitemap Validator**: https://www.xml-sitemaps.com/validate-xml-sitemap.html
   - Validate your sitemap.xml

## How to Submit to Google Search Console

1. **Sign in to Google Search Console**: https://search.google.com/search-console

2. **Add Your Property**:
   - Click "Add Property"
   - Enter your site URL: `https://nishaj0.github.io/my-portfolio-website`

3. **Verify Ownership**:
   - Choose "HTML tag" method
   - Copy the verification meta tag
   - Update `src/app/layout.tsx` line 73 with your verification code:
     ```typescript
     verification: {
       google: "your-verification-code-here",
     },
     ```
   - Rebuild and deploy
   - Click "Verify" in Google Search Console

4. **Submit Sitemap**:
   - In Google Search Console, go to "Sitemaps"
   - Enter: `sitemap.xml`
   - Click "Submit"

5. **Monitor Performance**:
   - Check the "Performance" tab to see how your site appears in search results
   - Use "URL Inspection" tool to test specific pages

## Configuration Updates

If you need to change the site URL (e.g., for a custom domain):

1. Update `next-sitemap.config.cjs`:
   ```javascript
   siteUrl: 'https://your-domain.com',
   ```

2. Update `src/app/layout.tsx`:
   ```typescript
   metadataBase: new URL("https://your-domain.com"),
   ```

3. Rebuild the project to regenerate the sitemap

## Additional Improvements You Can Make

1. **Add an OpenGraph Image**:
   - Create an image: `public/og-image.png` (1200x630px recommended)
   - This is already referenced in the metadata but needs to be created

2. **Add Favicon**:
   - Add `public/favicon.ico` for better branding

3. **Create Additional Pages**:
   - The sitemap will automatically include new pages you create

4. **Monitor and Iterate**:
   - Use Google Search Console insights to improve content
   - Add more keywords based on search queries
   - Update metadata as your portfolio evolves

## Installed Packages

- **next-sitemap** (^4.2.3): Automatic sitemap generation for Next.js

## Notes

- The sitemap is regenerated automatically after every build
- All metadata is server-side rendered for optimal SEO
- Structured data helps with Google's Knowledge Graph
- The site is configured to be fully indexable by search engines
