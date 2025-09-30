# Greenlight

A comprehensive VS Code extension and GitHub Action that detects non-Baseline web features and provides compatibility warnings with quick fixes.

## Features

- **Real-time Detection**: Parses JavaScript/TypeScript and CSS to detect non-Baseline web features
- **Multiple Output Formats**: Console, JSON, Markdown, and SARIF for CI/CD integration
- **Flexible Configuration**: Support for Baseline 2024/2025 targets or custom browserslist
- **VS Code Integration**: Real-time diagnostics with MDN links and polyfill suggestions
- **GitHub Action**: Automated PR comments with compatibility reports
- **Code Scanning**: SARIF output for GitHub Advanced Security integration

## Quick Start

### CLI Usage

```bash
# Install globally
npm install -g @hyandreas/greenlight

# Check a single file
greenlight check src/components/modern-features.js

# Check multiple files with configuration
greenlight check "src/**/*.{js,ts,css}" --config greenlight.config.json

# Generate different output formats
greenlight check src/app.js --format json
greenlight check src/app.js --format markdown
greenlight check src/app.js --format sarif
```

### VS Code Extension

1. Install from VS Code Marketplace: "Greenlight"
2. Open a JavaScript/TypeScript/CSS file
3. See real-time diagnostics for non-Baseline features
4. Use quick fixes to add polyfills or alternative implementations

### GitHub Action

```yaml
name: Baseline Compatibility Check
on: [pull_request]

jobs:
  baseline-check:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: ./  # Use your greenlight action
        with:
          files: 'src/**/*.{js,ts,css}'
          baseline-target: '2024'
          output-format: 'markdown'
          comment-pr: true
```

## Configuration

Create `greenlight.config.json` in your project root:

```json
{
  "baseline": {
    "target": "2024"
  },
  "severity": {
    "default": "warning",
    "features": {
      "optional-chaining": "info",
      "css-has-selector": "error"
    }
  },
  "include": [
    "src/**/*.{js,jsx,ts,tsx,css,scss,less}"
  ],
  "exclude": [
    "**/node_modules/**",
    "**/dist/**"
  ],
  "ignore": {
    "features": []
  }
}
```

### Configuration Options

- **`baseline.target`**: `"2024"`, `"2025"`, or custom browserslist query
- **`severity.default`**: Default severity level (`"error"`, `"warning"`, `"info"`)
- **`severity.features`**: Override severity for specific features
- **`include`**: Glob patterns for files to check
- **`exclude`**: Glob patterns for files to ignore
- **`ignore.features`**: array of feature names to ignore

## 🔍 Detected Features

### JavaScript/TypeScript
- Optional chaining (`obj?.prop`)
- Nullish coalescing (`value ?? default`)
- Private class fields (`#privateField`)
- Top-level await
- Array.at() method
- Static class blocks
- And many more...

### CSS
- `:has()` selector
- Container queries (`@container`)
- Cascade layers (`@layer`)
- CSS subgrid
- `color-mix()` function
- Individual transform properties
- CSS nesting
- And many more...

### Web APIs
- Clipboard API
- Web Share API
- Dialog element
- Intersection Observer v2
- CSS Typed OM
- And many more...

## Output Formats

### Console (Human-readable)
```
Non-Baseline features detected:

src/components/modern-features.js
  Line 3:  Optional chaining (?.) - Limited support in older browsers
  Line 5:  Private class field (#field) - ES2022 feature with limited support
  Line 12: Top-level await - Requires modern module support

src/styles/modern.css
  Line 2:  :has() selector - Limited browser support
  Line 8:  Container queries - Experimental feature
```

### JSON (Machine-readable)
```json
{
  "results": [
    {
      "file": "src/app.js",
      "line": 3,
      "column": 12,
      "feature": "optional-chaining",
      "message": "Optional chaining (?.) requires modern browsers",
      "severity": "warning",
      "baseline": "unknown",
      "browserSupport": ["chrome", "firefox", "safari"]
    }
  ],
  "summary": {
    "totalFiles": 1,
    "totalIssues": 1,
    "byFeature": {
      "optional-chaining": 1
    }
  }
}
```

### SARIF (GitHub Code Scanning)
Full SARIF 2.1.0 format for integration with GitHub Advanced Security and other static analysis tools.

## Demo

Run the comprehensive demonstration:

```bash
node demo.js
```

This will showcase:
- Configuration system
- Feature detection across multiple file types
- All output formats
- Error handling
- Performance testing
- Integration capabilities

## Development

### Setup
```bash
git clone <repository>
cd greenlight
npm install
npm run build
```

### Testing
```bash
# Run all tests
npm test

# Run with coverage
npm run test:coverage

# Run specific test suites
npm test -- test/parsers/
npm test -- test/integration/
```

### Building
```bash
# Build CLI
npm run build:cli

# Build VS Code extension
npm run build:extension

# Package extension
npm run package:extension

# Build GitHub Action
npm run build:action
```

## Project Structure

```
greenlight/
├── src/
│   ├── cli/                 # Command-line interface
│   ├── core/                # Core detection logic
│   │   ├── parsers/         # JavaScript & CSS parsers
│   │   ├── config/          # Configuration system
│   │   └── output/          # Output formatters
│   ├── extension/           # VS Code extension
│   ├── action/              # GitHub Action
│   └── data/                # Web features dataset
├── test/                    # Test suites
├── sample-project/          # Demo project with modern features
└── docs/                    # Documentation
```

## Contributing

1. Fork the repository
2. Create a feature branch
3. Add tests for your changes
4. Ensure all tests pass
5. Submit a pull request

## License

MIT License - see LICENSE file for details.

## Links

- [VS Code Marketplace](https://marketplace.visualstudio.com/items?itemName=greenlight.greenlight)
- [GitHub Action Marketplace](https://github.com/marketplace/actions/greenlight)
- [Documentation](https://github.com/greenlight/greenlight/docs)
- [Issue Tracker](https://github.com/greenlight/greenlight/issues)

---

A tool to help developers create more compatible web applications.