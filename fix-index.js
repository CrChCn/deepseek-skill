const fs = require('fs');
const path = require('path');

console.log('🔧 Fixing index.js...');

const filePath = path.join(__dirname, 'index.js');
let code = fs.readFileSync(filePath, 'utf8');

// Полная замена проблемного блока
const oldCode = `console.log('Crypto module loaded');
console.log('DEEPSEEK cryptographic skill loaded');

// Мастер-ключ для тестов
let MASTER_PUB, MASTER_PRIV;`;

const newCode = `console.log('Crypto module loaded');
console.log('DEEPSEEK cryptographic skill loaded');

// Мастер-ключ для тестов с защитой от ошибок
let MASTER_PUB = null;
let MASTER_PRIV = null;

try {
    // Пытаемся сгенерировать мастер-ключ
    const masterKeyPair = generateKeyPair();
    MASTER_PUB = masterKeyPair.publicKey;
    MASTER_PRIV = masterKeyPair.privateKey;
    console.log('✅ Master key pair generated successfully');
} catch (error) {
    console.log('⚠️ Could not generate master key pair:', error.message);
    console.log('⚠️ Using placeholder values for master keys');
    MASTER_PUB = '0x0000000000000000000000000000000000000000';
    MASTER_PRIV = '0x0000000000000000000000000000000000000000';
}`;

code = code.replace(oldCode, newCode);

// Исправляем строку с slice
code = code.replace(
    /console\.log\('Master public key: ' \+ MASTER_PUB\.slice\(0, 20\) \+ '\.\.\.'\);/,
    `if (MASTER_PUB && typeof MASTER_PUB.slice === 'function') {
    console.log('Master public key: ' + MASTER_PUB.slice(0, 20) + '...');
} else {
    console.log('Master public key not available (using: ' + MASTER_PUB + ')');
}`
);

fs.writeFileSync(filePath, code);
console.log('✅ index.js fixed successfully!');
