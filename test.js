// test.js - ПРОСТОЙ ТЕСТ
const skill = require('./index.js');

console.log('\n=== ТЕСТ DEEPSEEK TOKEN ===\n');

// 1. Информация
console.log('1. Информация:', skill.info());

// 2. Ключи
const keys = skill.crypto.generateKeyPair();
console.log('2. Ключи:');
if (keys && keys.priv) {
        console.log('   Приватный:', keys.priv.slice(0, 20) + '...');
    } else {
        console.log('   Приватный: [НЕДОСТУПЕН]');
    }
if (keys && keys.pub) {
        console.log('   Публичный:', keys.pub.slice(0, 20) + '...');
    } else {
        console.log('   Публичный: [НЕДОСТУПЕН]');
    }
console.log('   Адрес:', skill.crypto.pubKeyToAddress(keys.pub));

// 3. Подписи
const message = "Тест";
const sig = skill.crypto.signMessage(message, keys.priv);
console.log('3. Подпись:', sig.signature.slice(0, 30) + '...');
console.log('   Проверка:', skill.crypto.verifySignature(message, sig.signature, keys.pub) ? '✅' : '❌');

// 4. Комиссии
const receipt = skill.signFeeReceipt('0x123', 5);
console.log('4. Квитанция:', receipt.signature.slice(0, 30) + '...');
console.log('   Проверка:', skill.verifyFeeReceipt(receipt.message, receipt.signature, receipt.pubKey) ? '✅' : '❌');

// 5. Таймер
console.log('5. Таймер:', skill.nextMintTime(new Date().toISOString()));

console.log('\n✅ ТЕСТ ПРОЙДЕН\n');
