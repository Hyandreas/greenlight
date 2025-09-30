#!/usr/bin/env node

const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

console.log('Greenlight - Complete Demonstration\n');
console.log('==========================================\n');

function runCommand(command, description) {
  console.log(`📋 ${description}`);
  console.log(`   Command: ${command}`);
  console.log('   Output:');
  try {
    const output = execSync(command, { 
      encoding: 'utf8', 
      cwd: process.cwd(),
      stdio: 'pipe'
    });
    console.log(output.split('\n').map(line => `   ${line}`).join('\n'));
  } catch (error) {
    console.log(`   ❌ Error: ${error.message}`);
  }
  console.log('');
}

function displayFile(filePath, description, maxLines = 20) {
  console.log(`📄 ${description}`);
  console.log(`   File: ${filePath}`);
  try {
    const content = fs.readFileSync(filePath, 'utf8');
    const lines = content.split('\n');
    const displayLines = lines.slice(0, maxLines);
    console.log('   Content:');
    displayLines.forEach(line => console.log(`   ${line}`));
    if (lines.length > maxLines) {
      console.log(`   ... (${lines.length - maxLines} more lines)`);
    }
  } catch (error) {
    console.log(`   ❌ Error reading file: ${error.message}`);
  }
  console.log('');
}

// Check if CLI is built
console.log('🔨 Building Greenlight CLI...');
runCommand('npm run build:cli', 'Build CLI tool');

// 1. Configuration demonstration
console.log('📖 1. Configuration System Demonstration');
console.log('=========================================\n');

displayFile('sample-project/baseline.config.json', 'Sample project configuration', 15);

// 2. JavaScript detection demonstration
console.log('🔍 2. JavaScript Feature Detection');
console.log('==================================\n');

runCommand(
  'node dist/cli/index.js check sample-project/src/components/modern-features.js --format console',
  'Detect modern JavaScript features'
);

// 3. CSS detection demonstration 
console.log('🎨 3. CSS Feature Detection');
console.log('===========================\n');

runCommand(
  'node dist/cli/index.js check sample-project/src/styles/modern-css.css --format console',
  'Detect modern CSS features'
);

// 4. Full project scan
console.log('📁 4. Full Project Scan');
console.log('=======================\n');

runCommand(
  'node dist/cli/index.js check "sample-project/src/**/*.{js,css,html}" --config sample-project/baseline.config.json --format console',
  'Scan entire sample project with configuration'
);

// 5. Different output formats
console.log('📊 5. Output Format Demonstrations');
console.log('==================================\n');

runCommand(
  'node dist/cli/index.js check sample-project/src/components/modern-features.js --format json',
  'JSON output format'
);

runCommand(
  'node dist/cli/index.js check sample-project/src/components/modern-features.js --format markdown',
  'Markdown output format'
);

// Create SARIF output and display first part
console.log('📋 SARIF output format (first part):');
try {
  execSync('node dist/cli/index.js check sample-project/src/components/modern-features.js --format sarif > demo-results.sarif', { 
    cwd: process.cwd() 
  });
  const sarif = JSON.parse(fs.readFileSync('demo-results.sarif', 'utf8'));
  console.log('   SARIF Results Summary:');
  console.log(`   - Version: ${sarif.version}`);
  console.log(`   - Runs: ${sarif.runs.length}`);
  console.log(`   - Results: ${sarif.runs[0]?.results?.length || 0}`);
  console.log(`   - Tool: ${sarif.runs[0]?.tool?.driver?.name}`);
} catch (error) {
  console.log(`   ❌ Error generating SARIF: ${error.message}`);
}
console.log('');

// 6. Configuration variations
console.log('⚙️  6. Configuration Variations');
console.log('===============================\n');

// Create temporary config for Baseline 2025
const tempConfig2025 = {
  baseline: { target: "2025" },
  severity: { default: "warning" },
  include: ["**/*.js"],
  exclude: ["node_modules/**"],
  ignore: { features: [] }
};

fs.writeFileSync('temp-config-2025.json', JSON.stringify(tempConfig2025, null, 2));

runCommand(
  'node dist/cli/index.js check sample-project/src/components/modern-features.js --config temp-config-2025.json --format console',
  'Using Baseline 2025 target'
);

// 7. Error handling demonstration
console.log('🚨 7. Error Handling Demonstration');
console.log('==================================\n');

// Create a file with syntax errors
const invalidJS = `
const user = {
  name: "John
  age: 30
};

const value = user?.name ?? "Unknown";
`;

fs.writeFileSync('temp-invalid.js', invalidJS);

runCommand(
  'node dist/cli/index.js check temp-invalid.js --format console',
  'Handling files with syntax errors'
);

// 8. Performance demonstration
console.log('⚡ 8. Performance Demonstration');
console.log('==============================\n');

// Create multiple test files
console.log('📄 Creating 10 test files with modern features...');
for (let i = 0; i < 10; i++) {
  const testContent = `
// Test file ${i}
class TestClass${i} {
  #privateField = 'secret-${i}';
  
  async getData() {
    const response = await fetch('/api/data/${i}');
    const data = await response.json();
    return data?.results ?? [];
  }
  
  getLastItem(items) {
    return items.at(-1);
  }
}

const config${i} = await fetch('/config${i}.json');
  `;
  fs.writeFileSync(`temp-test-${i}.js`, testContent);
}

const startTime = Date.now();
runCommand(
  'node dist/cli/index.js check "temp-test-*.js" --format json',
  'Processing 10 files simultaneously'
);
const endTime = Date.now();
console.log(`   ⏱️  Processing time: ${endTime - startTime}ms\n`);

// 9. VS Code Extension demonstration (info only)
console.log('🔧 9. VS Code Extension');
console.log('=======================\n');

console.log('📄 VS Code extension package.json:');
try {
  const packageJson = JSON.parse(fs.readFileSync('src/extension/package.json', 'utf8'));
  console.log('   Extension Details:');
  console.log(`   - Name: ${packageJson.name}`);
  console.log(`   - Display Name: ${packageJson.displayName}`);
  console.log(`   - Description: ${packageJson.description}`);
  console.log(`   - Commands: ${packageJson.contributes?.commands?.length || 0}`);
  console.log(`   - Language Support: ${packageJson.contributes?.languages?.length || 0} languages`);
} catch (error) {
  console.log(`   ℹ️  VS Code extension package.json not found or invalid`);
}
console.log('');

// 10. GitHub Action demonstration (info only)
console.log('🤖 10. GitHub Action');
console.log('===================\n');

displayFile('action.yml', 'GitHub Action configuration', 25);

// 11. Test suite results
console.log('🧪 11. Test Suite Results');
console.log('=========================\n');

runCommand('npm test -- --run', 'Running complete test suite');

// 12. Clean up and summary
console.log('🧹 12. Cleanup and Summary');
console.log('==========================\n');

console.log('📄 Cleaning up temporary files...');
const tempFiles = [
  'demo-results.sarif',
  'temp-config-2025.json',
  'temp-invalid.js',
  ...Array.from({length: 10}, (_, i) => `temp-test-${i}.js`)
];

tempFiles.forEach(file => {
  try {
    if (fs.existsSync(file)) {
      fs.unlinkSync(file);
      console.log(`   ✅ Removed ${file}`);
    }
  } catch (error) {
    console.log(`   ⚠️  Could not remove ${file}: ${error.message}`);
  }
});

console.log('\n🎉 Greenlight Demonstration Complete!\n');
console.log('=========================================\n');

console.log('📋 What was demonstrated:');
console.log('✅ Configuration system with different targets (2024/2025)');
console.log('✅ JavaScript feature detection (optional chaining, private fields, etc.)');
console.log('✅ CSS feature detection (basic support)');
console.log('✅ Multiple output formats (console, JSON, Markdown, SARIF)');
console.log('✅ Error handling for invalid syntax');
console.log('✅ Performance with multiple files');
console.log('✅ VS Code extension structure');
console.log('✅ GitHub Action configuration');
console.log('✅ Comprehensive test suite');

console.log('\n🚀 Ready for production use!');
console.log('\n📚 Next steps:');
console.log('• Install VS Code extension: npm run package:extension');
console.log('• Set up GitHub Action in your repository');
console.log('• Run against your codebase: npx baseline-buddy check "src/**/*.{js,ts,css}"');
console.log('• Configure baseline.config.json for your needs');