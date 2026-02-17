const fs = require('fs');
const path = require('path');

console.log('🔧 Applying final fixes...');

// 1. ИСПРАВЛЯЕМ index.js - все случаи slice
const indexFile = path.join(__dirname, 'index.js');
let indexCode = fs.readFileSync(indexFile, 'utf8');

// Исправляем строку 24 (info.pubKey)
indexCode = indexCode.replace(
    /pubKey: MASTER_PUB\.slice\(0, 20\) \+ '\.\.\.',/,
    `pubKey: (MASTER_PUB && typeof MASTER_PUB.slice === 'function') 
        ? MASTER_PUB.slice(0, 20) + '...' 
        : 'MASTER_PUB not available',`
);

// Исправляем все остальные возможные slice на MASTER_PUB
indexCode = indexCode.replace(
    /MASTER_PUB\.slice\(/g,
    '(MASTER_PUB && typeof MASTER_PUB.slice === "function" ? MASTER_PUB.slice('
);

indexCode = indexCode.replace(
    /\) \+ '\.\.\.'/g,
    ') : "N/A") + "..."'
);

fs.writeFileSync(indexFile, indexCode);
console.log('✅ index.js fixed (all slice calls)');

// 2. ИСПРАВЛЯЕМ test-merkle.js - другая стратегия
const merkleFile = path.join(__dirname, 'test-merkle.js');
let merkleCode = fs.readFileSync(merkleFile, 'utf8');

// Полностью переписываем проблемный участок
const proofDisplayCode = `
    console.log('    Proof elements:');
    if (proof && Array.isArray(proof)) {
        proof.forEach((p, i) => {
            try {
                if (typeof p === 'string') {
                    console.log(\`      [\${i}] \${p.slice(0, 30)}...\`);
                } else if (p && p.toString) {
                    const str = p.toString();
                    console.log(\`      [\${i}] \${str.slice(0, 30)}...\`);
                } else {
                    console.log(\`      [\${i}] [BINARY DATA]\`);
                }
            } catch (err) {
                console.log(\`      [\${i}] [ERROR: \${err.message}]\`);
            }
        });
    } else {
        console.log('    No proof elements to display');
    }
`;

// Заменяем старый блок с forEach
merkleCode = merkleCode.replace(
    /console\.log\('    Proof elements:'\);\s+proof\.forEach\(\(p, i\) => \{\s+console\.log\(`      \[\${i}\] \${p\.slice\(0, 30\)}\.\.\.`\);\s+\}\);/s,
    proofDisplayCode
);

fs.writeFileSync(merkleFile, merkleCode);
console.log('✅ test-merkle.js fixed (proof display)');

// 3. СОЗДАЕМ временный фикс для тестов
console.log('\n🎯 Run these commands to test:');
console.log('   node test-merkle.js');
console.log('   node full-test.js');
console.log('   node test.js');
