const fs = require('fs');
const path = require('path');

console.log('FORCE FIX: АВТОМАТИЧЕСКОЕ ИСПРАВЛЕНИЕ ПРОЕКТА');
console.log('=============================================');

// 1. Создание SKILL.md
console.log('\n[1/3] Создание SKILL.md...');
const skillMd = `# deepseek-skill

Криптографический скилл для токена $DEEPSEEK (MBC-20)

## Возможности
- Генерация ключевых пар (secp256k1)
- Подпись и верификация сообщений
- Merkle Tree доказательства баланса
- Приватные переводы с шифрованием

## Установка
\`\`\`bash
npx skills add CrChCn/deepseek-skill
\`\`\`

## Использование
\`\`\`javascript
const { DeepseekToken } = require('./deepseek-token');
const token = new DeepseekToken();
\`\`\`
`;
fs.writeFileSync('SKILL.md', skillMd);
console.log('   SKILL.md создан');

// 2. Исправление index.js (только критическая ошибка)
console.log('\n[2/3] Исправление index.js...');
let indexCode = fs.readFileSync('index.js', 'utf8');

// Добавляем проверки для MASTER_PUB
indexCode = indexCode.replace(
    "console.log('Master public key: ' + MASTER_PUB.slice(0, 20) + '...');",
    "if (MASTER_PUB && typeof MASTER_PUB === 'string') {\n    console.log('Master public key: ' + MASTER_PUB.slice(0, 20) + '...');\n} else {\n    console.log('Master public key not available');\n}"
);

indexCode = indexCode.replace(
    "pubKey: MASTER_PUB.slice(0, 20) + '...',",
    "pubKey: (MASTER_PUB && typeof MASTER_PUB === 'string') ? MASTER_PUB.slice(0, 20) + '...' : 'MASTER_PUB not available',"
);

fs.writeFileSync('index.js', indexCode);
console.log('   index.js исправлен');

// 3. Создание run-all-tests.js
console.log('\n[3/3] Создание run-all-tests.js...');
const runTestsCode = `#!/usr/bin/env node
const { execSync } = require('child_process');

const tests = [
    'working.js',
    'test-merkle-integration.js',
    'test-token.js'
];

console.log('ЗАПУСК ТЕСТОВ');
console.log('=============\\n');

let passed = 0;

tests.forEach(test => {
    process.stdout.write('Запуск ' + test + '... ');
    try {
        execSync('node ' + test, { stdio: 'pipe', timeout: 5000 });
        console.log('УСПЕШНО');
        passed++;
    } catch (error) {
        console.log('ОШИБКА');
        console.log('   ' + error.message.split('\\n')[0]);
    }
});

console.log('\\nРезультаты: ' + passed + '/' + tests.length + ' тестов пройдено');
`;

fs.writeFileSync('run-all-tests.js', runTestsCode);
fs.chmodSync('run-all-tests.js', '755');
console.log('   run-all-tests.js создан');

console.log('\n=============================================');
console.log('ГОТОВО! Запустите тесты:');
console.log('   node run-all-tests.js');
console.log('=============================================');
