// test-simple.js — smoke test of the core: keys, sign/verify, merkle, token
const assert = require('assert');
const { generateKeyPair, info, crypto } = require('./index.js');
const MerkleTree = require('./MerkleTree.js');
const DeepseekToken = require('./deepseek-token.js');

// 1) info
const meta = info();
assert.equal(meta.name, 'deepseek-skill', 'info.name');

// 2) wallet
const wallet = generateKeyPair();
assert.ok(wallet.privateKey.wif, 'wif present');
assert.ok(/^0x[0-9a-f]{40}$/.test(wallet.address), 'eth-like address');

// приватник выводится в тот же адрес (владение подтверждаемо)
const derived = crypto.privateKeyToAddress(wallet.privateKey.hex);
assert.equal(derived.address, wallet.address, 'privateKey -> same address');

// 3) sign / verify
const msg = 'deepseek-smoke-test';
const sig = crypto.signMessage(msg, wallet.privateKey.hex);
assert.ok(crypto.verifySignature(msg, sig.signature, wallet.publicKey), 'valid signature verifies');
assert.ok(!crypto.verifySignature('tampered', sig.signature, wallet.publicKey), 'tampered signature rejects');

// 4) merkle proof
const leaves = ['balance-alice-100', 'balance-bob-50', 'balance-carol-25'];
const tree = new MerkleTree(leaves);
const proof = tree.getProof(leaves[1]);
assert.ok(proof && proof.length > 0, 'proof built');
assert.ok(tree.verifyProof(leaves[1], proof, tree.getRoot()), 'valid proof verifies');
assert.ok(!tree.verifyProof('balance-mallory-999', proof, tree.getRoot()), 'foreign leaf rejects');

// 5) token
const token = new DeepseekToken('AGTDEEP', 'DEEP', 21000000);
assert.ok(token.mint(wallet.address, 500).success, 'mint ok');
assert.ok(!token.mint(wallet.address, 5000).success, 'over-limit mint rejected');

// настоящий приватник владельца: успех
assert.ok(token.transfer(wallet.address, 'bob', 300, wallet.privateKey.hex).success, 'transfer with owning key ok');
assert.equal(token.balanceOf(wallet.address), 200, 'alice balance');
assert.equal(token.balanceOf('bob'), 300, 'bob balance');

// чужой приватник не может тратить чужой адрес
const stranger = generateKeyPair();
assert.ok(!token.transfer(wallet.address, 'bob', 100, stranger.privateKey.hex).success, 'foreign-key transfer rejected');

// ноль/отрицательные суммы отклоняются
assert.ok(!token.transfer(wallet.address, 'bob', 0, wallet.privateKey.hex).success, 'zero amount rejected');
assert.ok(!token.transfer(wallet.address, 'bob', -1, wallet.privateKey.hex).success, 'negative amount rejected');

console.log('deepseek-skill core smoke: ALL OK');
