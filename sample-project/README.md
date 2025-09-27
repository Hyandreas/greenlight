# Sample Project for Greenlight Demo

This sample project demonstrates various non-Baseline web features to showcase Greenlight's detection capabilities.

## Features Demonstrated

### JavaScript/TypeScript Features
1. **Optional Chaining (`?.`)** - ES2020 feature
2. **Nullish Coalescing (`??`)** - ES2020 feature  
3. **Top-level Await** - ES2022 feature
4. **Private Class Fields** - ES2022 feature
5. **Array.prototype.at()** - ES2022 feature

### CSS Features
1. **CSS `:has()` Selector** - CSS Selectors Level 4
2. **CSS Container Queries** - CSS Containment Module Level 3
3. **CSS Cascade Layers (`@layer`)** - CSS Cascading Level 5
4. **CSS Subgrid** - CSS Grid Layout Level 2
5. **CSS `color-mix()` Function** - CSS Color Module Level 5

### Web APIs
1. **Clipboard API** - Write access limited support
2. **Intersection Observer v2** - Limited support
3. **Web Share API** - Limited to secure contexts
4. **Dialog Element** - Recently baseline
5. **CSS Typed OM** - Limited support

## Running Greenlight

### CLI Usage
```bash
# Check all files with console output
npx greenlight check src/**/*.{js,ts,css}

# Generate markdown report
npx greenlight check src/**/*.{js,ts,css} --format markdown --output report.md

# Generate SARIF for Code Scanning
npx greenlight check src/**/*.{js,ts,css} --format sarif --output results.sarif

# Strict mode - fail on any issues
npx greenlight check src/**/*.{js,ts,css} --fail-on any
```

### Configuration
The project includes a `greenlight.config.json` that demonstrates various configuration options:
- Custom baseline target (2024)
- Severity overrides for specific features
- File inclusion/exclusion patterns
- Feature-specific ignore rules

## Expected Results

When running Greenlight on this project, you should see:
- **5-7 JavaScript compatibility issues** (depending on baseline target)
- **4-6 CSS compatibility issues** (modern layout and styling features)
- **3-5 Web API issues** (newer browser APIs with limited support)

This provides a comprehensive demonstration of Greenlight's detection capabilities across different web technologies and compatibility scenarios.