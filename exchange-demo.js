const CryptoCore = require('./crypto-core');
const ERC20Token = require('./erc20-token');
const TokenExchange = require('./token-exchange');

console.log('\n💰 ДЕМОНСТРАЦИЯ ОБМЕНА ТОКЕНАМИ');
console.log('='.repeat(60));

console.log('\n📋 1. СОЗДАНИЕ УЧАСТНИКОВ');
console.log('-'.repeat(40));

const core = new CryptoCore();
const participants = [];

for (let i = 0; i < 5; i++) {
    participants.push({
        id: i + 1,
        name: `Участник ${i + 1}`,
        wallet: core.generateWallet()
    });
    console.log(`${participants[i].name}: ${participants[i].wallet.addresses.ethereum}`);
}

console.log('\n📋 2. СОЗДАНИЕ ТОКЕНА');
console.log('-'.repeat(40));

const token = new ERC20Token('EXCH', 'Exchange Token', 1000000);
token.initialize(participants[0].wallet.addresses.ethereum);
console.log(`Токен создан: ${token.name} (${token.symbol})`);

console.log('\n📋 3. РАСПРЕДЕЛЕНИЕ ТОКЕНОВ');
console.log('-'.repeat(40));

participants.forEach((p, i) => {
    const amount = 1000 * (i + 1);
    token.mint(p.wallet.addresses.ethereum, amount, participants[0].wallet.addresses.ethereum);
    console.log(`${p.name}: +${amount} ${token.symbol} (баланс: ${token.balanceOf(p.wallet.addresses.ethereum)})`);
});

console.log('\n📋 4. СОЗДАНИЕ БИРЖИ');
console.log('-'.repeat(40));

const dex = new TokenExchange('DEX');
console.log('Биржа создана, комиссия:', dex.fee * 100 + '%');

console.log('\n📋 5. РАЗМЕЩЕНИЕ ОРДЕРОВ');
console.log('-'.repeat(40));

const orders = [];

orders.push(dex.placeSellOrder(
    participants[0].wallet.addresses.ethereum,
    'EXCH',
    500,
    2.0,
    participants[0].wallet.privateKey.hex
));

orders.push(dex.placeSellOrder(
    participants[1].wallet.addresses.ethereum,
    'EXCH',
    300,
    2.2,
    participants[1].wallet.privateKey.hex
));

orders.push(dex.placeBuyOrder(
    participants[2].wallet.addresses.ethereum,
    'EXCH',
    200,
    2.1,
    participants[2].wallet.privateKey.hex
));

orders.push(dex.placeBuyOrder(
    participants[3].wallet.addresses.ethereum,
    'EXCH',
    400,
    1.9,
    participants[3].wallet.privateKey.hex
));

orders.forEach((order, i) => {
    console.log(`Ордер ${i + 1}: ${order.type} ${order.amount} ${order.token} по ${order.price}`);
});

console.log('\n📋 6. СТАКАН ОРДЕРОВ');
console.log('-'.repeat(40));

const orderBook = dex.getOrderBook('EXCH');
console.log('ПРОДАЖА (ASK)');
orderBook.asks.forEach(o => {
    console.log(`  ${o.amount} ${o.token} @ ${o.price} = ${o.total}`);
});
console.log('ПОКУПКА (BID)');
orderBook.bids.forEach(o => {
    console.log(`  ${o.amount} ${o.token} @ ${o.price} = ${o.total}`);
});
console.log(`Спред: ${(orderBook.spread * 100).toFixed(2)}%`);

console.log('\n📋 7. ИСПОЛНЕНИЕ СДЕЛОК');
console.log('-'.repeat(40));

const execution = dex.executeOrder(orders[0].id, participants[2].wallet.addresses.ethereum);
console.log('Сделка 1:', execution.message);
console.log('  Продавец:', participants[0].name);
console.log('  Покупатель:', participants[2].name);
console.log('  Сумма:', execution.trade.total, 'комиссия:', execution.trade.fee);

console.log('\n📋 8. ИСТОРИЯ СДЕЛОК');
console.log('-'.repeat(40));

const trades = dex.getTradeHistory('EXCH');
trades.forEach((trade, i) => {
    console.log(`Сделка ${i + 1}:`);
    console.log(`  ${trade.amount} EXCH @ ${trade.price} = ${trade.total}`);
    console.log(`  ${trade.buyer.slice(0, 20)}... → ${trade.seller.slice(0, 20)}...`);
});

console.log('\n📋 9. ФИНАЛЬНЫЕ БАЛАНСЫ');
console.log('-'.repeat(40));

participants.forEach(p => {
    console.log(`${p.name}: ${token.balanceOf(p.wallet.addresses.ethereum)} EXCH`);
});

console.log('\n📋 10. СТАТИСТИКА');
console.log('-'.repeat(40));

const stats = dex.getStats();
console.log(`Всего сделок: ${stats.totalTrades}`);
console.log(`Объем торгов: ${stats.totalVolume}`);
console.log(`Собрано комиссий: ${stats.totalFees}`);
console.log(`Активных ордеров: ${stats.activeOrders}`);

console.log('\n' + '='.repeat(60));
console.log('✅ ДЕМОНСТРАЦИЯ ЗАВЕРШЕНА');
console.log('='.repeat(60));
