# GitHub Commit Configuration for ATLAS AI Incubator

This document describes the GitHub commit configuration that has been set up for the ATLAS AI Incubator project.

## 🎯 Configuration Summary

### 1. Commit Message Template

- **File**: `.gitmessage.txt`
- **Purpose**: Provides a structured template for commit messages following conventional commits
- **Usage**: Automatically loaded when running `git commit`

### 2. Git Configuration Settings

#### Core Settings

- `core.editor`: Set to `code --wait` (VS Code) for commit message editing
- `user.name`: Zakarya87
- `user.email`: z.boudjelel@outlook.fr
- `remote.origin.url`: https://github.com/zakarya-87/atlas-ai-incubator--1-.git

#### Commit-Specific Settings

- `commit.template`: `.gitmessage.txt` (custom commit message template)
- `pull.rebase`: `true` (use rebase instead of merge for cleaner history)

### 3. Git Hooks

#### Pre-Commit Hook (`/.git/hooks/pre-commit`)

- Checks for TypeScript/JavaScript files and reminds to run tests
- Detects test file modifications
- Warns about large files (>1MB) that should use Git LFS

#### Commit-Msg Hook (`/.git/hooks/commit-msg`)

- Validates commit message format
- Encourages conventional commit format: `type(scope): subject`
- Checks subject line length (recommended max: 72 characters)
- Provides helpful feedback for improving commit messages

## 📝 Commit Message Format

### Recommended Format

```
type(scope): subject

body

footer
```

### Commit Types

- `feat`: A new feature
- `fix`: A bug fix
- `docs`: Documentation only changes
- `style`: Code formatting changes
- `refactor`: Code refactoring
- `perf`: Performance improvements
- `test`: Test-related changes
- `chore`: Build process or auxiliary tool changes

### Example

```
feat(auth): add JWT authentication

Implement JWT authentication for API endpoints
- Add login and register endpoints
- Add middleware for protected routes
- Add token validation

Closes #42
```

## 🚀 Usage

### Making a Commit

1. Stage your changes: `git add .`
2. Commit with template: `git commit`
3. The commit message template will automatically load
4. Pre-commit hooks will run validation
5. Commit-msg hooks will validate your message format

### Bypassing Hooks (if needed)

```bash
git commit --no-verify
```

## 🔧 Customization

### Modifying the Template

Edit `.gitmessage.txt` to change the commit message template.

### Adding More Hooks

Create executable scripts in `.git/hooks/` (without the `.sample` extension).

## ✅ Benefits

1. **Consistent Commit Messages**: Standardized format across the team
2. **Better Git History**: Clear, descriptive commit messages
3. **Automated Checks**: Pre-commit validation for common issues
4. **GitHub Integration**: Works seamlessly with GitHub's commit interface
5. **Conventional Commits**: Compatible with semantic versioning tools

## 📚 Resources

- [Conventional Commits](https://www.conventionalcommits.org/)
- [Git Hooks Documentation](https://git-scm.com/docs/githooks)
- [Git Commit Best Practices](https://github.com/trein/dev-best-practices/wiki/Git-Commit-Best-Practices)
