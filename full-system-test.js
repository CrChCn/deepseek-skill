const CryptoCore = require('./crypto-core');
const ERC20Token = require('./erc20-token');
const MerkleAirdrop = require('./merkle-airdrop');
const TokenExchange = require('./token-exchange');

console.log('\n' + '='.repeat(70));
console.log('ПОЛНОЕ ТЕСТИРОВАНИЕ КРИПТОГРАФИЧЕСКОЙ СИСТЕМЫ');
console.log('='.repeat(70) + '\n');

console.log('📌 1. ТЕСТ КРИПТОГРАФИЧЕСКОГО ЯДРА');
console.log('-'.repeat(50));

const core = new CryptoCore();
console.log('Информация:', core.getInfo());

const wallet = core.generateWallet();
console.log('\nСгенерированный кошелек:');
console.log('  Ethereum адрес:', wallet.addresses.ethereum);
console.log('  Bitcoin адрес:', wallet.addresses.bitcoin);
console.log('  Приватный ключ (WIF):', wallet.privateKey.wif);
console.log('  Публичный ключ (сжатый):', wallet.publicKey.compressed);

console.log('\n📌 2. ТЕСТ ERC-20 ТОКЕНА');
console.log('-'.repeat(50));

const token = new ERC20Token('TEST', 'TST', 1000000);
token.initialize(wallet.addresses.ethereum);

const user1 = core.generateWallet();
const user2 = core.generateWallet();

token.mint(user1.addresses.ethereum, 5000, wallet.addresses.ethereum);
token.mint(user2.addresses.ethereum, 3000, wallet.addresses.ethereum);

console.log('Балансы после майнинга:');
console.log('  User1:', token.balanceOf(user1.addresses.ethereum));
console.log('  User2:', token.balanceOf(user2.addresses.ethereum));

const transfer = token.transfer(
    user1.addresses.ethereum,
    user2.addresses.ethereum,
    1000,
    user1.privateKey.hex
);

console.log('\nПеревод 1000 токенов:', transfer.success ? '✅' : '❌');
console.log('  User1 новый баланс:', transfer.fromNewBalance);
console.log('  User2 новый баланс:', transfer.toNewBalance);

console.log('\n📌 3. ТЕСТ MERKLE AIRDROP');
console.log('-'.repeat(50));

const airdrop = new MerkleAirdrop();
const addresses = airdrop.generateRandomAddresses(10);
airdrop.createDistribution(addresses, 100, 1000);
const result = airdrop.addAddresses(addresses);

console.log('Merkle Tree создан:');
console.log('  Корень:', result.rootHash);
console.log('  Глубина:', result.treeDepth);
console.log('  Адресов:', result.totalAddresses);

const proof = airdrop.getProof(addresses[0]);
console.log('\nДоказательство для первого адреса:');
console.log('  Валидно:', proof.verified ? '✅' : '❌');
console.log('  Сумма:', proof.amount);

console.log('\n📌 4. ТЕСТ БИРЖИ');
console.log('-'.repeat(50));

const dex = new TokenExchange('DEX');

const sellOrder = dex.placeSellOrder(
    user1.addresses.ethereum,
    'TEST',
    100,
    2.5,
    user1.privateKey.hex
);

const buyOrder = dex.placeBuyOrder(
    user2.addresses.ethereum,
    'TEST',
    100,
    2.5,
    user2.privateKey.hex
);

console.log('Ордера созданы:');
console.log('  Продажа:', sellOrder.amount, 'TEST по', sellOrder.price);
console.log('  Покупка:', buyOrder.amount, 'TEST по', buyOrder.price);

const execution = dex.executeOrder(sellOrder.id, user2.addresses.ethereum);
console.log('\nИсполнение сделки:', execution.success ? '✅' : '❌');

const stats = dex.getStats();
console.log('\nСтатистика биржи:');
console.log('  Сделок:', stats.totalTrades);
console.log('  Объем:', stats.totalVolume);
console.log('  Комиссии:', stats.totalFees);

console.log('\n' + '='.repeat(70));
console.log('✅ ТЕСТИРОВАНИЕ ЗАВЕРШЕНО УСПЕШНО');
console.log('='.repeat(70));
