// merkle-test.js - ОТДЕЛЬНЫЙ тест Merkle Tree
const { MerkleTree } = require('merkletreejs');
const crypto = require('crypto');

// Простая функция хеширования
function sha256(data) {
    return crypto.createHash('sha256').update(data).digest();
}

// Тестовые данные
const balances = [
    'user1:1000',
    'user2:500',
    'user3:250',
    'user4:750',
    'user5:300'
];

console.log('\n=== ТЕСТ MERKLE TREE ===\n');

// Создаем листья
const leaves = balances.map(b => sha256(b));
console.log('Листья созданы');

// Создаем дерево
const tree = new MerkleTree(leaves, sha256, {
    sortPairs: true,
    sortLeaves: true
});

const root = tree.getRoot().toString('hex');
console.log('Корень дерева:', root.slice(0, 30) + '...');

// Проверяем каждый лист
console.log('\nПроверка листьев:');
balances.forEach((b, i) => {
    const leaf = sha256(b);
    const proof = tree.getProof(leaf);
    const isValid = tree.verify(proof, leaf, tree.getRoot());
    
    console.log(`  ${b}: ${isValid ? '✅' : '❌'} (proof: ${proof.length})`);
});

console.log('\n✅ Тест завершен\n');
