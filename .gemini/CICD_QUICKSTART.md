# 🚀 CI/CD Quick Start Guide

## Getting Started with GitHub Actions

### Step 1: Push Workflows to GitHub

```bash
# Navigate to your project
cd "c:\Users\zboud\OneDrive\Attachments\atlas-ai-incubator (1)"

# Stage the workflow files
git add .github/workflows/
git add README.md
git add .gemini/CICD_DEPLOYMENT.md

# Commit the changes
git commit -m "feat: Add CI/CD workflows for unit tests

- Added frontend unit tests workflow (Vitest)
- Added backend unit tests workflow (Jest)
- Added unified CI workflow
- Updated README with status badges
- Added workflow documentation

Tests: 51/51 passing (100%)"

# Push to GitHub
git push origin main
```

### Step 2: Verify Workflows

1. Go to your GitHub repository
2. Click on the **Actions** tab
3. You should see 3 workflows:
   - ✅ CI - All Unit Tests
   - ✅ Frontend Unit Tests
   - ✅ Backend Unit Tests

4. The workflows will automatically run on your next push

### Step 3: Update Status Badges

In `README.md`, replace:

```
YOUR_USERNAME/YOUR_REPO
```

With your actual values, for example:

```
zboud/atlas-ai-incubator
```

Then commit and push:

```bash
git add README.md
git commit -m "docs: Update CI/CD status badge URLs"
git push origin main
```

---

## Workflow Behavior

### On Every Push to `main` or `develop`:

```
┌─────────────────────────────────────┐
│  You push code to GitHub            │
└──────────────┬──────────────────────┘
               │
               ▼
┌─────────────────────────────────────┐
│  Workflows automatically trigger    │
└──────────────┬──────────────────────┘
               │
       ┌───────┴────────┐
       │                │
       ▼                ▼
┌─────────────┐  ┌─────────────┐
│  Frontend   │  │  Backend    │
│  Tests      │  │  Tests      │
│  (1-2 min)  │  │  (5-7 min)  │
└──────┬──────┘  └──────┬──────┘
       │                │
       └───────┬────────┘
               │
               ▼
┌─────────────────────────────────────┐
│  ✅ All tests passed!               │
│  or                                 │
│  ❌ Some tests failed - check logs  │
└─────────────────────────────────────┘
```

### On Pull Requests:

- Workflows run automatically
- Status checks appear on the PR
- Can't merge until tests pass (if branch protection enabled)

---

## Viewing Test Results

### Option 1: GitHub Actions Tab

1. Go to repository → **Actions**
2. Click on a workflow run
3. View logs for each job
4. Download coverage artifacts

### Option 2: Pull Request Checks

1. Open any PR
2. Scroll to "Checks" section
3. See ✅ or ❌ status for each workflow
4. Click "Details" to view logs

---

## Enabling Branch Protection

### Protect your `main` branch:

1. Go to: **Settings** → **Branches**
2. Click **Add rule**
3. Branch name pattern: `main`
4. Enable:
   - ✅ Require status checks to pass before merging
   - ✅ Require branches to be up to date before merging
   - Select: "CI - All Unit Tests" (or individual workflows)
5. Save changes

Now PRs must pass all tests before merging! 🛡️

---

## Testing the Workflows

### Manual Trigger (for testing):

1. Go to **Actions** tab
2. Select a workflow
3. Click **Run workflow**
4. Choose branch
5. Click green **Run workflow** button

---

## Troubleshooting

### ❌ Workflows don't appear

- **Check:** Did you push to GitHub?
- **Solution:** `git push origin main`

### ❌ Tests fail in CI but pass locally

- **Check:** Are you using exact dependency versions?
- **Solution:** Run `npm ci` instead of `npm install` locally

### ❌ Status badges show "unknown"

- **Check:** Have workflows run at least once?
- **Solution:** Push a commit to trigger workflows

### ❌ Workflow takes too long

- **Check:** Is npm cache working?
- **Solution:** Verify `cache: 'npm'` in workflow files

---

## Next Steps

### Optional Enhancements:

1. **Add Code Coverage Badge**
   - Use Codecov or Coveralls
   - Shows test coverage % in README

2. **Add Slack Notifications**

   ```yaml
   - name: Notify Slack
     if: failure()
     uses: slackapi/slack-github-action@v1
   ```

3. **Auto-Deploy on Success**

   ```yaml
   - name: Deploy to production
     if: github.ref == 'refs/heads/main'
     run: ./deploy.sh
   ```

4. **Add Security Scanning**
   ```yaml
   - name: Security audit
     run: npm audit --audit-level=moderate
   ```

---

## Current Status

✅ **Workflows Created:** 3  
✅ **Tests Covered:** 51/51 (100%)  
✅ **Node Versions:** 18.x, 20.x  
✅ **Coverage Upload:** Enabled  
✅ **Documentation:** Complete

**Ready to deploy:** YES! 🚀

---

## Quick Commands Reference

```bash
# View workflow status locally (requires GitHub CLI)
gh run list

# Watch workflow in real-time
gh run watch

# View logs for latest run
gh run view --log

# Re-run failed workflows
gh run rerun <run-id>
```

---

**Need Help?**

- 📖 Read `.github/workflows/README.md`
- 📄 Check `.gemini/CICD_DEPLOYMENT.md`
- 🔗 Visit [GitHub Actions Docs](https://docs.github.com/actions)
