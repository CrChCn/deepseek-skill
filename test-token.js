// test-token.js - Тест DEEPSEEK токена с полным выводом
const token = require('./deepseek-token.js');

console.log('\nDEEPSEEK TOKEN TEST');
console.log('===================\n');

// 1. Информация о токене
console.log('1. Token info:');
const info = token.info();
console.log('   name:', info.name);
console.log('   symbol:', info.symbol);
console.log('   maxSupply:', info.maxSupply);
console.log('   mintLimit:', info.mintLimit);
console.log('   creator:', info.creator);
console.log('   masterPublicKey:', info.masterPublicKey);
console.log();

// 2. Создаем пользователей
console.log('2. Creating users:');
const user1 = token.createUser('user1');
const user2 = token.createUser('user2');
console.log('   User1 address:', user1.address);
console.log('   User1 privateKey:', user1.privateKey);
console.log('   User1 publicKey:', user1.publicKey);
console.log('   User2 address:', user2.address);
console.log('   User2 privateKey:', user2.privateKey);
console.log('   User2 publicKey:', user2.publicKey);
console.log();

// 3. Майним токены для user1
console.log('3. Minting tokens for user1:');
const mintResult1 = token.mint(user1.address, 500, 'signature');
console.log('   Mint 500:', mintResult1);
console.log();

// 4. Майним токены для user2
console.log('4. Minting tokens for user2:');
const mintResult2 = token.mint(user2.address, 300, 'signature');
console.log('   Mint 300:', mintResult2);
console.log();

// 5. Проверяем балансы
console.log('5. Checking balances:');
console.log('   User1 balance:', token.getBalance(user1.address));
console.log('   User2 balance:', token.getBalance(user2.address));
console.log('   All balances:', token.getAllBalances());
console.log();

// 6. Перевод от user1 к user2
console.log('6. Transferring from user1 to user2:');
const transferResult = token.transfer(user1.address, user2.address, 200, user1.privateKey);
console.log('   Transfer 200:', JSON.stringify(transferResult, null, 2));
console.log();

// 7. Проверяем балансы после перевода
console.log('7. Balances after transfer:');
console.log('   User1 balance:', token.getBalance(user1.address));
console.log('   User2 balance:', token.getBalance(user2.address));
console.log('   All balances:', token.getAllBalances());
console.log();

// 8. Тест подписей
console.log('8. Signature test:');
const testMessage = 'Hello DEEPSEEK';
const testSignature = token.sign(testMessage, user1.privateKey);
const isValid = token.verify(testMessage, testSignature.signature, user1.publicKey);
console.log('   Message:', testMessage);
console.log('   Signature:', testSignature.signature);
console.log('   PublicKey used:', user1.publicKey);
console.log('   Signature valid:', isValid);
console.log();

// 9. Тест адреса
console.log('9. Address test:');
const address = token.getAddress(user1.publicKey);
console.log('   Public key:', user1.publicKey);
console.log('   Address from key:', address);
console.log('   Matches user address:', address === user1.address);
console.log();

console.log('Test completed successfully');
