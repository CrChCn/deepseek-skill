// test-simple.js - Простой тест всех функций
const skill = require('./index.js');

console.log('\n=== ТЕСТИРОВАНИЕ DEEPSEEK TOKEN ===\n');

// 1. Информация
console.log('1. Информация о токене:');
console.log(skill.info());
console.log();

// 2. Генерация ключей
console.log('2. Генерация ключей:');
const keys = skill.crypto.generateKeyPair();
console.log('   Приватный ключ:', keys.priv.slice(0, 20) + '...');
console.log('   Публичный ключ: ', keys.pub.slice(0, 20) + '...');
console.log('   Адрес:          ', skill.crypto.pubKeyToAddress(keys.pub));
console.log();

// 3. Подпись сообщения
console.log('3. Подпись сообщения:');
const message = "Тестовое сообщение";
const signature = skill.crypto.signMessage(message, keys.priv);
console.log('   Сообщение:', message);
console.log('   Подпись:  ', signature.signature.slice(0, 30) + '...');
const isValid = skill.crypto.verifySignature(message, signature.signature, keys.pub);
console.log('   Валидно?  ', isValid ? '✅ ДА' : '❌ НЕТ');
console.log();

// 4. Merkle Tree
console.log('4. Merkle Tree доказательство:');
try {
  const proof = skill.proveBalance('0x456...user2', 500);
  console.log('   Адрес:    ', proof.address);
  console.log('   Баланс:   ', proof.amount);
  console.log('   Корень:   ', proof.root.slice(0, 20) + '...');
  console.log('   Длина proof:', proof.proof.length);
  console.log('   Proof валиден?', proof.valid ? '✅ ДА' : '❌ НЕТ');
} catch (e) {
  console.log('   ❌ Ошибка Merkle Tree:', e.message);
}
console.log();

// 5. Комиссии
console.log('5. Квитанция о комиссии:');
const receipt = skill.signFeeReceipt('0x123...user1', 5);
console.log('   Сообщение:', receipt.message);
console.log('   Подпись:  ', receipt.signature.slice(0, 30) + '...');
const receiptValid = skill.verifyFeeReceipt(receipt.message, receipt.signature, receipt.pubKey);
console.log('   Квитанция валидна?', receiptValid ? '✅ ДА' : '❌ НЕТ');
console.log();

// 6. Приватный перевод
console.log('6. Приватный перевод:');
const user2keys = skill.crypto.generateKeyPair();
const transfer = skill.preparePrivateTransfer(user2keys.pub, 100);
console.log('   Зашифровано:', transfer.encrypted.slice(0, 30) + '...');
console.log('   IV:         ', transfer.iv);
console.log('   Timestamp:  ', transfer.timestamp);
console.log();

// 7. Таймер
console.log('7. Таймер минта:');
const lastPost = new Date(Date.now() - 15 * 60000).toISOString();
console.log('   Последний пост:', lastPost);
console.log('   Статус:        ', skill.nextMintTime(lastPost));
console.log();

// 8. Проверка ключей
console.log('8. Валидация ключей:');
console.log('   Публичный ключ валиден?', skill.crypto.isValidPublicKey(keys.pub) ? '✅ ДА' : '❌ НЕТ');
console.log('   Приватный ключ валиден?', skill.crypto.isValidPrivateKey(keys.priv) ? '✅ ДА' : '❌ НЕТ');
console.log('   Неверный ключ валиден?', skill.crypto.isValidPublicKey('invalid_key') ? '❌ ПРОБЛЕМА' : '✅ НЕТ (хорошо)');
console.log();

console.log('=== ТЕСТ ЗАВЕРШЕН ===\n');
