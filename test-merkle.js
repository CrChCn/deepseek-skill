// test-merkle.js - Специальный тест для Merkle Tree
const crypto = require('./crypto.js');

console.log('\n=== ТЕСТ MERKLE TREE ===\n');

// Создаем тестовые балансы
const balances = [
  { address: '0x123...user1', amount: 1000 },
  { address: '0x456...user2', amount: 500 },
  { address: '0x789...user3', amount: 250 },
  { address: '0xabc...user4', amount: 750 },
  { address: '0xdef...user5', amount: 300 }
];

console.log('Балансы:');
balances.forEach(b => {
  console.log(`  ${b.address}: ${b.amount}`);
});
console.log();

// Строим дерево
console.log('Построение Merkle Tree...');
const { tree, root, leaves } = crypto.buildMerkleTree(balances);
console.log('Корень дерева:', root);
console.log('Листья:', leaves.map(l => l.slice(0, 20) + '...'));
console.log();

// Проверяем каждый лист
console.log('Проверка доказательств:');
balances.forEach((b, index) => {
  const leaf = crypto.createLeaf(b.address, b.amount);
  const proof = crypto.getProof(tree, b.address, b.amount);
  const isValid = crypto.verifyProof(proof, leaf, root);
  
  console.log(`\n  ${b.address}:`);
  console.log(`    Баланс: ${b.amount}`);
  console.log(`    Leaf: ${leaf.toString('hex').slice(0, 30)}...`);
  console.log(`    Proof length: ${proof.length}`);
  console.log(`    Валидно: ${isValid ? '✅ ДА' : '❌ НЕТ'}`);
  
  if (proof.length > 0) {
    console.log('    Proof элементы:');
    proof.forEach((p, i) => {
      console.log(`      [${i}] ${p.slice(0, 30)}...`);
    });
  }
});

// Проверяем неверный баланс
console.log('\nПроверка неверного баланса:');
const fakeLeaf = crypto.createLeaf('0x456...user2', 999);
const fakeProof = crypto.getProof(tree, '0x456...user2', 500); // Правильный proof для 500
const fakeValid = crypto.verifyProof(fakeProof, fakeLeaf, root);
console.log(`  Неверный баланс (500→999): ${fakeValid ? '❌ ПРОБЛЕМА' : '✅ НЕ ВАЛИДЕН (хорошо)'}`);

console.log('\n=== ТЕСТ ЗАВЕРШЕН ===\n');
