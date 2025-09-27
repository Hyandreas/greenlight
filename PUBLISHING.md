# Publishing Greenlight

This guide explains how to publish Greenlight in its three forms: CLI, VS Code Extension, and GitHub Action.

## Prerequisites

1. **npm account** for CLI publishing
2. **VS Code publisher account** for extension publishing  
3. **GitHub repository** for GitHub Action

## 1. Publishing the CLI to npm

```bash
cd publishing/cli
npm install
npm run build
npm test
npm publish
```

**Installation for users:**
```bash
npm install -g greenlight-cli
greenlight check "src/**/*.{js,css}"
```

## 2. Publishing the VS Code Extension

**Setup (one-time):**
```bash
npm install -g @vscode/vsce
vsce create-publisher your-publisher-name
```

**Publish:**
```bash  
cd publishing/vscode-extension
npm install
npm run build
vsce package
vsce publish
```

**Installation for users:**
- Search "Greenlight" in VS Code Extensions marketplace
- Or install via command: `code --install-extension greenlight.greenlight`

## 3. Publishing the GitHub Action

**Setup:**
1. Create a new GitHub repository (e.g., `greenlight-action`)
2. Copy contents of `publishing/github-action/` to the repository root
3. Create a release with semantic versioning (e.g., v1.0.0)

**Publish:**
```bash
cd publishing/github-action
npm install
npm run build
git add .
git commit -m "Release v1.0.0"
git tag v1.0.0
git push && git push --tags
```

**Usage for users:**
```yaml
# .github/workflows/baseline-check.yml
name: Baseline Compatibility Check
on: [pull_request]

jobs:
  baseline-check:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: yourusername/greenlight-action@v1
        with:
          files: 'src/**/*.{js,ts,css}'
          comment-pr: true
```

## Repository URLs to Update

Update these in all package.json files:
- `https://github.com/yourusername/greenlight.git`
- `https://github.com/yourusername/greenlight/issues`
- `https://github.com/yourusername/greenlight#readme`

## Testing Before Publishing

```bash
# Test CLI
cd publishing/cli && npm run build && node dist/cli/index.js --help

# Test VS Code Extension  
cd publishing/vscode-extension && npm run build && code --extensionDevelopmentPath=.

# Test GitHub Action
cd publishing/github-action && npm run build && node dist/action/index.js
```