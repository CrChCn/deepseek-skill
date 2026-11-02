// test-token.js — smoke test of the DEEPSEEK token (MBC-20 emulation)
const DeepseekToken = require('./deepseek-token.js');

const token = new DeepseekToken('DEEPSEEK', 'DEEPSEEK', 21000000);
console.log('Token info:', JSON.stringify(token.info()));

const mint = token.mint('addr-alice', 500);
console.log('Mint:', mint.success ? 'ok' : 'FAIL', mint);

const tr = token.transfer('addr-alice', 'addr-bob', 300, 'privkey-sim');
console.log('Transfer:', tr.success ? 'ok' : 'FAIL', { from: tr.from, to: tr.to, amount: tr.amount });

console.log('Balances:', token.getAllBalances());

const over = token.mint('addr-alice', 5000);
console.log('Over-limit mint rejected:', !over.success ? 'ok' : 'FAIL', over.error);

console.log(!mint.success || !tr.success || over.success ? '=== TEST FAIL ===' : '=== TEST OK ===');
process.exit(mint.success && tr.success && !over.success ? 0 : 1);
