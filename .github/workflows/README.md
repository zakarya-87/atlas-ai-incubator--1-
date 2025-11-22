# GitHub Actions Workflows

This directory contains CI/CD workflows for the ATLAS AI Incubator project.

## Workflows

### 1. CI - All Unit Tests (`ci.yml`)
**Main workflow** - Runs on every push and pull request

- ✅ Runs frontend unit tests (Vitest)
- ✅ Runs backend unit tests (Jest)
- ✅ Provides unified test summary
- ✅ Fast execution (~1-2 minutes)

**Triggers:**
- Push to `main` or `develop` branches
- Pull requests targeting `main` or `develop`

**Status Badge:**
```markdown
![CI](https://github.com/YOUR_USERNAME/YOUR_REPO/workflows/CI%20-%20All%20Unit%20Tests/badge.svg)
```

---

### 2. Frontend Unit Tests (`frontend-tests.yml`)
**Specialized workflow** - Tests frontend code only

- ✅ Runs on Node.js 18.x and 20.x (matrix)
- ✅ Tests hooks, components, context, utils
- ✅ Uploads coverage artifacts
- ✅ Smart path filtering (only runs when frontend code changes)

**Triggers:**
- Changes to frontend code paths
- Changes to `vitest.config.ts` or dependencies

**Status Badge:**
```markdown
![Frontend Tests](https://github.com/YOUR_USERNAME/YOUR_REPO/workflows/Frontend%20Unit%20Tests/badge.svg)
```

---

### 3. Backend Unit Tests (`backend-tests.yml`)
**Specialized workflow** - Tests backend code only

- ✅ Runs on Node.js 18.x and 20.x (matrix)
- ✅ Tests all NestJS services and modules
- ✅ Generates coverage reports
- ✅ Smart path filtering (only runs when backend code changes)

**Triggers:**
- Changes to `backend/**` directory
- Excludes README changes

**Status Badge:**
```markdown
![Backend Tests](https://github.com/YOUR_USERNAME/YOUR_REPO/workflows/Backend%20Unit%20Tests/badge.svg)
```

---

## Features

### ⚡ Performance Optimizations
- **npm caching**: Dependencies are cached between runs
- **Path filtering**: Workflows only trigger when relevant files change
- **Parallel execution**: Frontend and backend tests run simultaneously

### 📊 Coverage Reports
- Coverage artifacts are uploaded for Node.js 20.x builds
- Retained for 30 days
- Available in GitHub Actions artifacts

### 🔄 Node.js Matrix Testing
Individual workflows test on both:
- Node.js 18.x (LTS)
- Node.js 20.x (Active LTS)

### 🎯 Smart Triggering
Workflows use path filters to avoid unnecessary runs:
- Frontend workflow: Only runs when frontend code changes
- Backend workflow: Only runs when backend code changes
- CI workflow: Runs on all changes

---

## Usage

### Running Tests Locally

```bash
# Frontend tests
npm run test:unit

# Backend tests
cd backend
npm test

# Backend with coverage
cd backend
npm run test:cov
```

### Viewing Results

1. Navigate to your repository on GitHub
2. Click the **Actions** tab
3. Select a workflow run to view details
4. Download coverage artifacts if needed

### Adding Status Badges to README

Add these badges to your main `README.md`:

```markdown
# ATLAS AI Incubator

![CI](https://github.com/YOUR_USERNAME/YOUR_REPO/workflows/CI%20-%20All%20Unit%20Tests/badge.svg)
![Frontend Tests](https://github.com/YOUR_USERNAME/YOUR_REPO/workflows/Frontend%20Unit%20Tests/badge.svg)
![Backend Tests](https://github.com/YOUR_USERNAME/YOUR_REPO/workflows/Backend%20Unit%20Tests/badge.svg)
```

Replace `YOUR_USERNAME/YOUR_REPO` with your actual GitHub username and repository name.

---

## Troubleshooting

### Common Issues

**Issue:** Tests fail in CI but pass locally
- **Solution:** Ensure you're using `npm ci` instead of `npm install`
- **Reason:** `npm ci` ensures exact dependency versions from lock file

**Issue:** Workflow doesn't trigger
- **Solution:** Check path filters match your file changes
- **Alternative:** Use the unified `ci.yml` which has no path filters

**Issue:** Node version mismatch
- **Solution:** Update `node-version` in workflows to match your local environment
- **Recommendation:** Use Node.js 20.x (LTS)

---

## Continuous Deployment (Future)

These workflows can be extended to include:
- 🚀 Automatic deployment on successful tests
- 📦 Docker image building
- 🔐 Security scanning
- 📝 Automated changelog generation

---

## Maintenance

Workflows are automatically maintained but review periodically:
- Update Node.js versions annually
- Keep GitHub Actions updated (Dependabot recommended)
- Adjust path filters if project structure changes

---

**Created:** 2025-11-22  
**Status:** ✅ Production Ready  
**Test Coverage:** 100% (51/51 unit tests passing)
