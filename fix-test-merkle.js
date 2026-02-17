const fs = require('fs');
const path = require('path');

console.log('🔧 Fixing test-merkle.js...');

const filePath = path.join(__dirname, 'test-merkle.js');
let code = fs.readFileSync(filePath, 'utf8');

// Исправляем проблемную строку 44
code = code.replace(
    /console\.log\(`      \[$\{i\}\] $\{p\.slice\(0, 30\)}\.\.\.`\);/,
    `if (p && typeof p === 'string') {
      console.log(\`      [\${i}] \${p.slice(0, 30)}...\`);
    } else if (p && p.data) {
      // Если это объект с data
      console.log(\`      [\${i}] \${p.data.slice(0, 30)}...\`);
    } else {
      console.log(\`      [\${i}] [BINARY DATA]\`);
    }`
);

fs.writeFileSync(filePath, code);
console.log('✅ test-merkle.js fixed successfully!');
