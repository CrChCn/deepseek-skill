// full-test.js - ПОЛНОЕ ТЕСТИРОВАНИЕ
const skill = require('./index.js');

console.log('\nDEEPSEEK TOKEN - ПОЛНОЕ ТЕСТИРОВАНИЕ');
console.log('======================================\n');

// ТЕСТ 1: Информация
console.log('ТЕСТ 1: Информация о токене');
const tokenInfo = skill.info();
console.log('  Тикер: ' + tokenInfo.tick);
console.log('  Создатель: ' + tokenInfo.creator);
console.log('  Макс. предложение: ' + tokenInfo.maxSupply);
console.log('  Лимит на минт: ' + tokenInfo.limit);
console.log('  Версия: ' + tokenInfo.version);
console.log();

// ТЕСТ 2: Генерация ключей
console.log('ТЕСТ 2: Генерация ключей');
const keys = skill.crypto.generateKeyPair();
console.log('  Приватный ключ: ' + keys.priv.slice(0, 20) + '...');
console.log('  Публичный ключ: ' + keys.pub.slice(0, 20) + '...');
const address = skill.crypto.pubKeyToAddress(keys.pub);
console.log('  Адрес: ' + address);
console.log();

// ТЕСТ 3: Подписи
console.log('ТЕСТ 3: Подписи');
const message = 'Тестовое сообщение';
const signature = skill.crypto.signMessage(message, keys.priv);
console.log('  Сообщение: ' + message);
console.log('  Подпись: ' + signature.signature.slice(0, 30) + '...');
const isValid = skill.crypto.verifySignature(message, signature.signature, keys.pub);
console.log('  Верификация: ' + (isValid ? 'УСПЕШНО' : 'ОШИБКА'));

const fakeMessage = 'Поддельное сообщение';
const isFakeValid = skill.crypto.verifySignature(fakeMessage, signature.signature, keys.pub);
console.log('  Подделка: ' + (!isFakeValid ? 'УСПЕШНО (не прошла)' : 'ОШИБКА (прошла)'));
console.log();

// ТЕСТ 4: Merkle Tree
console.log('ТЕСТ 4: Merkle Tree');
const balances = [
    { address: '0x123...user1', amount: 1000 },
    { address: '0x456...user2', amount: 500 },
    { address: '0x789...user3', amount: 250 },
    { address: '0xabc...user4', amount: 750 },
    { address: '0xdef...user5', amount: 300 }
];

const merkleResult = skill.crypto.testMerkleTree(balances);
console.log();

// ТЕСТ 5: proveBalance
console.log('ТЕСТ 5: proveBalance');
const proof = skill.proveBalance('0x456...user2', 500);
console.log('  Адрес: ' + proof.address);
console.log('  Баланс: ' + proof.amount);
console.log('  Корень: ' + proof.root.slice(0, 30) + '...');
console.log('  Длина proof: ' + proof.proof.length);
console.log('  Валиден: ' + (proof.valid ? 'ДА' : 'НЕТ'));
console.log();

// ТЕСТ 6: Комиссии
console.log('ТЕСТ 6: Комиссии');
const receipt = skill.signFeeReceipt('0x123...user1', 5);
console.log('  Сообщение: ' + receipt.message);
console.log('  Подпись: ' + receipt.signature.slice(0, 30) + '...');
const receiptValid = skill.verifyFeeReceipt(receipt.message, receipt.signature, receipt.pubKey);
console.log('  Квитанция валидна: ' + (receiptValid ? 'ДА' : 'НЕТ'));
console.log();

// ТЕСТ 7: Приватные переводы
console.log('ТЕСТ 7: Приватные переводы');
const user2keys = skill.crypto.generateKeyPair();
const transfer = skill.preparePrivateTransfer(user2keys.pub, 100);
console.log('  Зашифровано: ' + transfer.encrypted.slice(0, 30) + '...');
const decrypted = skill.decryptPrivateTransfer(transfer, user2keys.priv);
console.log('  Расшифровано: ' + JSON.stringify(decrypted));
console.log();

// ТЕСТ 8: Таймер
console.log('ТЕСТ 8: Таймер минта');
const lastPost = new Date(Date.now() - 15 * 60000).toISOString();
console.log('  Последний пост: ' + lastPost);
console.log('  Статус: ' + skill.nextMintTime(lastPost));
console.log();

// ТЕСТ 9: Управление балансами
console.log('ТЕСТ 9: Управление балансами');
const initialBalance = skill.getBalance('0x123...user1');
console.log('  Начальный баланс: ' + initialBalance);

const mintResult = skill.mint('0x123...user1', 100, 'signature');
console.log('  Минт 100: ' + (mintResult.success ? 'УСПЕШНО' : 'ОШИБКА'));

const newBalance = skill.getBalance('0x123...user1');
console.log('  Новый баланс: ' + newBalance);
console.log();

// ТЕСТ 10: Валидация ключей
console.log('ТЕСТ 10: Валидация ключей');
console.log('  Публичный ключ валиден: ' + (skill.crypto.isValidPublicKey(keys.pub) ? 'ДА' : 'НЕТ'));
console.log('  Приватный ключ валиден: ' + (skill.crypto.isValidPrivateKey(keys.priv) ? 'ДА' : 'НЕТ'));
console.log('  Неверный ключ: ' + (skill.crypto.isValidPublicKey('invalid') ? 'ОШИБКА' : 'УСПЕШНО (не валиден)'));
console.log();

console.log('======================================');
console.log('ТЕСТИРОВАНИЕ ЗАВЕРШЕНО');
console.log('======================================\n');
