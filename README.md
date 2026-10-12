# Mohammad Jafariyan — Personal Website

A responsive navy-and-gold engineering portfolio. Content is drawn from the seven supplied resume PDFs, with project examples across fintech, telecom, healthcare, and industry.

## Run locally

Use Node.js 22 or later:

    npm ci --legacy-peer-deps
    npm start
    npm run build
    npm test -- --watchAll=false --runInBand

Run these commands from `react-frontend-dev-portfolio`. `npm start` serves the development site, normally at http://localhost:3000. If that port is occupied, accept the alternate port offered in the terminal, or use `$env:PORT='3107'; npm start` in PowerShell. Both start and build include the OpenSSL compatibility option needed by the legacy Create React App toolchain on modern Node.js. The generated `build` directory can also be served with a static HTTP server.

## Publish to GitHub Pages

The source project is this directory (`react-frontend-dev-portfolio`), not its parent folder. Create or use `Mohammadjafariyan/mohammadjafariyan.github.io` and place this directory's contents at the repository root. The current origin is the upstream template repository; replace it before pushing:

    git remote set-url origin https://github.com/Mohammadjafariyan/mohammadjafariyan.github.io.git

Push your reviewed changes to `main` or `master`. In repository Settings → Pages, choose **GitHub Actions** as the build source. The included workflow tests, builds, and deploys the website.

Public URL: https://mohammadjafariyan.github.io/ (GitHub Pages uses `.github.io`, not `.github.com`). No live deployment has been performed by this local update.

## Content and appearance

- `src/App.js`: introduction, selected work, capabilities, experience, contact, and resume links.
- `src/App.scss`: responsive layout and the colors from `color-palette.jpg`: navy #0D1B2A, ocean #1B365D, antique gold #C99A47, champagne #E6C17A, ivory #F5EBDD.
- `public/resumes`: seven supplied PDF resumes, publicly downloadable when the website is published.
- `public/index.html`: page title, description, canonical URL, and social metadata.

Experience dates and claims reflect the supplied September 2026 resumes. AI capabilities are presented separately from named client projects to avoid implying unverified AI deployments. Original template components and data remain in the source for reference but are not loaded by the redesigned site. The original MIT license is retained.

The hero uses the supplied mountaineering photo at public/images/profile.jpg. Responsive checks cover 320–1440px, including a collapsible mobile navigation, readable body text, and stacked tablet layouts.
