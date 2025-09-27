# Deployment Guide

This guide covers how to deploy the For Fox Sake Org Chart application to various hosting platforms.

## Prerequisites

- Node.js 18 or higher
- npm or yarn package manager
- Git repository

## Environment Variables

This application does not require any environment variables for deployment. All data is mocked using MirageJS during development and production.

## Build Process

The application uses Vite for building and bundling:

```bash
npm run build
```

This will:

1. Run TypeScript compiler checks
2. Bundle the application using Vite
3. Generate optimized static files in the `dist/` directory

## Deployment Options

### Option 1: Netlify

#### Automatic Deployment (Recommended)

1. Connect your GitHub repository to Netlify
2. Set build command: `npm run build`
3. Set publish directory: `dist`
4. Deploy automatically on push to main branch

The `netlify.toml` configuration file handles:

- SPA routing redirects
- Asset caching headers
- Security headers
- Gzip compression

#### Manual Deployment

```bash
# Install Netlify CLI
npm install -g netlify-cli

# Build and deploy
npm run deploy:netlify
```

### Option 2: Vercel

#### Automatic Deployment (Recommended)

1. Connect your GitHub repository to Vercel
2. Framework preset: Vite
3. Build command: `npm run build`
4. Output directory: `dist`

The `vercel.json` configuration file handles:

- SPA routing rewrites
- Asset caching headers
- Security headers

#### Manual Deployment

```bash
# Install Vercel CLI
npm install -g vercel

# Build and deploy
npm run deploy:vercel
```

### Option 3: GitHub Pages

1. Enable GitHub Pages in repository settings
2. Add GitHub Actions workflow:

```yaml
# .github/workflows/deploy.yml
name: Deploy to GitHub Pages

on:
  push:
    branches: [main]

jobs:
  deploy:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
        with:
          node-version: '18'
      - run: npm ci
      - run: npm run build
      - uses: peaceiris/actions-gh-pages@v3
        with:
          github_token: ${{ secrets.GITHUB_TOKEN }}
          publish_dir: ./dist
```

### Option 4: AWS S3 + CloudFront

1. Create S3 bucket for static website hosting
2. Create CloudFront distribution
3. Deploy using AWS CLI:

```bash
# Build the application
npm run build

# Upload to S3
aws s3 sync dist/ s3://your-bucket-name --delete

# Invalidate CloudFront cache
aws cloudfront create-invalidation --distribution-id YOUR_DISTRIBUTION_ID --paths "/*"
```

## Performance Optimizations

The build includes several optimizations:

1. **Code Splitting**: Automatic route-based splitting
2. **Asset Optimization**: Image compression and lazy loading
3. **Caching**: Long-term caching for static assets
4. **Compression**: Gzip/Brotli compression enabled
5. **Tree Shaking**: Unused code elimination

## Post-Deployment Checklist

- [ ] Verify application loads correctly
- [ ] Test responsive design on mobile/tablet
- [ ] Check browser console for errors
- [ ] Verify animations and interactions work
- [ ] Test accessibility features (keyboard navigation)
- [ ] Validate lazy loading of images
- [ ] Check performance scores (Lighthouse)

## Troubleshooting

### Common Issues

1. **404 errors on refresh**: Ensure SPA routing is configured
2. **Assets not loading**: Check base URL configuration
3. **Performance issues**: Verify asset caching headers
4. **Mobile layout issues**: Test responsive breakpoints

### Debug Commands

```bash
# Local production preview
npm run preview

# Build with debug info
npm run build -- --mode development

# Analyze bundle size
npm run build -- --analyze
```

## Monitoring

Consider setting up monitoring for:

- Application errors (Sentry)
- Performance metrics (Lighthouse CI)
- Uptime monitoring
- Analytics (Google Analytics, Plausible)
