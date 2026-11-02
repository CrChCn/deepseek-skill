// test-token.js — smoke test of the DEEPSEEK token (MBC-20 emulation)
const assert = require('assert');
const { generateKeyPair } = require('./index.js');
const DeepseekToken = require('./deepseek-token.js');

const walletA = generateKeyPair();
const walletB = generateKeyPair();

const token = new DeepseekToken('DEEPSEEK', 'DEEPSEEK', 21000000);
console.log('Token info:', JSON.stringify(token.info()));

const mint = token.mint(walletA.address, 500);
console.log('Mint:', mint.success ? 'ok' : 'FAIL', JSON.stringify(mint));
assert.ok(mint.success, 'mint ok');

const tr = token.transfer(walletA.address, walletB.address, 300, walletA.privateKey.hex);
console.log('Transfer:', tr.success ? 'ok' : 'FAIL', JSON.stringify(tr));
assert.ok(tr.success, 'transfer with owning private key ok');

// чужой приватник не может тратить чужой адрес
const stranger = generateKeyPair();
const evil = token.transfer(walletA.address, walletB.address, 100, stranger.privateKey.hex);
console.log('Foreign-key transfer rejected:', !evil.success ? 'ok' : 'FAIL', evil.error || '');
assert.ok(!evil.success, 'foreign private key rejected');

console.log('Balances:', JSON.stringify(token.getAllBalances()));
const over = token.mint(walletA.address, 5000);
console.log('Over-limit mint rejected:', !over.success ? 'ok' : 'FAIL', over.error || '');
assert.ok(!over.success, 'over-limit mint rejected');

console.log('=== TEST OK ===');
