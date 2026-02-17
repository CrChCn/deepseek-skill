// test-merkle-integration.js - Тест Merkle Tree интеграции
const token = require('./deepseek-token');
const crypto = require('./working.js');

console.log('\n🦞=== ТЕСТ MERKLE TREE ИНТЕГРАЦИИ ===🦞\n');

// Создаем тестовых пользователей
console.log('Создаем тестовых пользователей...');
const user1 = { address: "0x" + "1".repeat(40) };
const user2 = // // // // token.createUser('Bob');
const user3 = // // // // token.createUser('Charlie');
const user4 = // // // // token.createUser('Dave');

console.log(`  Alice: ${user1.address}`);
console.log(`  Bob: ${user2.address}`);
console.log(`  Charlie: ${user3.address}`);
console.log(`  Dave: ${user4.address}`);

// Майним токены для пользователей
console.log('\nМайним токены...');
token.mint(user1.address, 1000);
token.mint(user2.address, 500);
token.mint(user3.address, 250);
token.mint(user4.address, 750);

// Показываем все балансы
console.log('\nБалансы после майнинга:');
const balances = token.getAllBalances();
for (const [addr, bal] of Object.entries(balances)) {
    console.log(`  ${addr}: ${bal}`);
}

// Генерируем Merkle Tree
console.log('\nГенерируем Merkle Tree...');
const merkleRoot = token.generateMerkleTree();
console.log('Корень Merkle Tree:', merkleRoot);

// Получаем доказательство для Alice
console.log('\nПолучаем доказательство для Alice:');
const proofAlice = token.getProof(user1.address);
console.log(`  Адрес: ${proofAlice.address}`);
console.log(`  Баланс: ${proofAlice.balance}`);
console.log(`  Кол-во шагов доказательства: ${proofAlice.proof.length}`);
console.log(`  Корень: ${proofAlice.root}`);

// Проверяем доказательство для Alice
console.log('\nПроверяем доказательство для Alice:');
const isValidAlice = token.verifyProof(
    proofAlice.address,
    proofAlice.balance,
    proofAlice.proof,
    proofAlice.root
);
console.log(`  Результат: ${isValidAlice ? '✅ ВЕРНО' : '❌ ОШИБКА'}`);

// Проверяем с неправильным балансом (должно быть false)
console.log('\nПроверяем с НЕПРАВИЛЬНЫМ балансом:');
const isFakeAlice = token.verifyProof(
    proofAlice.address,
    9999, // неправильный баланс
    proofAlice.proof,
    proofAlice.root
);
console.log(`  Результат: ${isFakeAlice ? '❌ ДОЛЖНО БЫТЬ FALSE' : '✅ ВЕРНО (ошибка как и ожидалось)'}`);

// Получаем доказательство для Bob
console.log('\nПолучаем доказательство для Bob:');
const proofBob = token.getProof(user2.address);
console.log(`  Адрес: ${proofBob.address}`);
console.log(`  Баланс: ${proofBob.balance}`);
console.log(`  Кол-во шагов: ${proofBob.proof.length}`);

// Проверяем доказательство для Bob
const isValidBob = token.verifyProof(
    proofBob.address,
    proofBob.balance,
    proofBob.proof,
    proofBob.root
);
console.log(`  Проверка: ${isValidBob ? '✅ ВЕРНО' : '❌ ОШИБКА'}`);

// Пробуем получить доказательство для несуществующего адреса
console.log('\nПробуем получить доказательство для несуществующего адреса:');
const fakeProof = token.getProof('0x0000000000000000000000000000000000000000');
console.log(`  Результат: ${fakeProof === null ? '✅ null (как и ожидалось)' : '❌ ДОЛЖЕН БЫТЬ NULL'}`);

// Тест с передачей токенов
console.log('\n=== ТЕСТ ПОСЛЕ ТРАНЗАКЦИИ ===');
console.log('Переводим 300 токенов от Alice к Bob...');

const transfer = token.transfer(
    user1.address,
    user2.address,
    300,
    user1.privateKey
);
console.log(`  Статус: ${transfer.success ? '✅ Успешно' : '❌ Ошибка'}`);

// Обновляем Merkle Tree после транзакции
console.log('\nОбновляем Merkle Tree...');
const newMerkleRoot = token.generateMerkleTree();
console.log('Новый корень Merkle Tree:', newMerkleRoot);
console.log('Корень изменился?', merkleRoot !== newMerkleRoot ? '✅ Да' : '❌ Нет');

// Проверяем новое доказательство для Alice
const newProofAlice = token.getProof(user1.address);
console.log('\nНовый баланс Alice:', newProofAlice.balance);
console.log('Новое доказательство валидно?', 
    token.verifyProof(
        newProofAlice.address,
        newProofAlice.balance,
        newProofAlice.proof,
        newProofAlice.root
    ) ? '✅ Да' : '❌ Нет'
);

console.log('\n🦞=== ТЕСТ ЗАВЕРШЕН УСПЕШНО ===🦞\n');
