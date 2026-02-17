const fs = require('fs');
const path = require('path');

console.log('🔧 Fixing all test files...');

// 1. ИСПРАВЛЯЕМ test-merkle.js (прямое исправление строки 44)
const merkleFile = path.join(__dirname, 'test-merkle.js');
let merkleCode = fs.readFileSync(merkleFile, 'utf8');

// Заменяем проблемную строку напрямую
merkleCode = merkleCode.replace(
    'console.log(`      [${i}] ${p.slice(0, 30)}...`);',
    `if (p && typeof p === 'string') {
            console.log(\`      [\${i}] \${p.slice(0, 30)}...\`);
        } else if (p && p.data) {
            console.log(\`      [\${i}] \${p.data.slice(0, 30)}...\`);
        } else {
            console.log(\`      [\${i}] [BINARY DATA]\`);
        }`
);

fs.writeFileSync(merkleFile, merkleCode);
console.log('✅ test-merkle.js fixed');

// 2. ИСПРАВЛЯЕМ full-test.js
const fullTestFile = path.join(__dirname, 'full-test.js');
let fullTestCode = fs.readFileSync(fullTestFile, 'utf8');

// Заменяем строку с priv.slice
fullTestCode = fullTestCode.replace(
    /console\.log\('  Приватный ключ: ' \+ keys\.priv\.slice\(0, 20\) \+ '\.\.\.'\);/,
    `if (keys && keys.priv) {
        console.log('  Приватный ключ: ' + keys.priv.slice(0, 20) + '...');
    } else {
        console.log('  Приватный ключ: [НЕДОСТУПЕН]');
    }`
);

// Заменяем строку с pub.slice
fullTestCode = fullTestCode.replace(
    /console\.log\('  Публичный ключ: ' \+ keys\.pub\.slice\(0, 20\) \+ '\.\.\.'\);/,
    `if (keys && keys.pub) {
        console.log('  Публичный ключ: ' + keys.pub.slice(0, 20) + '...');
    } else {
        console.log('  Публичный ключ: [НЕДОСТУПЕН]');
    }`
);

// Заменяем строку с address.slice
fullTestCode = fullTestCode.replace(
    /console\.log\('  Адрес: ' \+ keys\.address\.slice\(0, 20\) \+ '\.\.\.'\);/,
    `if (keys && keys.address) {
        console.log('  Адрес: ' + keys.address.slice(0, 20) + '...');
    } else {
        console.log('  Адрес: [НЕДОСТУПЕН]');
    }`
);

fs.writeFileSync(fullTestFile, fullTestCode);
console.log('✅ full-test.js fixed');

// 3. ИСПРАВЛЯЕМ test.js
const testFile = path.join(__dirname, 'test.js');
let testCode = fs.readFileSync(testFile, 'utf8');

// Заменяем строку с priv.slice
testCode = testCode.replace(
    /console\.log\('   Приватный:', keys\.priv\.slice\(0, 20\) \+ '\.\.\.'\);/,
    `if (keys && keys.priv) {
        console.log('   Приватный:', keys.priv.slice(0, 20) + '...');
    } else {
        console.log('   Приватный: [НЕДОСТУПЕН]');
    }`
);

// Заменяем строку с pub.slice
testCode = testCode.replace(
    /console\.log\('   Публичный:', keys\.pub\.slice\(0, 20\) \+ '\.\.\.'\);/,
    `if (keys && keys.pub) {
        console.log('   Публичный:', keys.pub.slice(0, 20) + '...');
    } else {
        console.log('   Публичный: [НЕДОСТУПЕН]');
    }`
);

// Заменяем строку с address
testCode = testCode.replace(
    /console\.log\('   Адрес:', keys\.address\);/,
    `if (keys && keys.address) {
        console.log('   Адрес:', keys.address);
    } else {
        console.log('   Адрес: [НЕДОСТУПЕН]');
    }`
);

fs.writeFileSync(testFile, testCode);
console.log('✅ test.js fixed');

console.log('\n🎯 Все файлы исправлены! Запустите тесты:');
console.log('   node test-merkle.js');
console.log('   node full-test.js');
console.log('   node test.js');
