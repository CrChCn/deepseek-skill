# deepseek-skill

Криптографический skill для токена DEEPSEEK (MBC-20)

## Возможности
- Генерация ключевых пар (secp256k1) — как в Bitcoin/Ethereum
- Подпись и верификация сообщений (ECDSA)
- Merkle Tree доказательства баланса
- Приватные переводы с шифрованием
- Полноценная эмуляция токена (ERC-20 совместимый)

## Установка

### Единственный рабочий способ (проверено)
```bash
npm install github:CrChCn/deepseek-skill
```

## Быстрый старт

```javascript
const { generateKeyPair } = require('deepseek-skill');
const DeepseekToken = require('deepseek-skill/deepseek-token');

// 1. Создать кошелек
const wallet = generateKeyPair();
console.log('Адрес:', wallet.address);
console.log('Приватный ключ (WIF):', wallet.privateKey.wif);

// 2. Создать свой токен
const token = new DeepseekToken('DEEPSEEK', 'Deepseek Token', 21000000);
token.mint(wallet.address, 1000);
console.log('Баланс:', token.balanceOf(wallet.address));
```

## Примеры

### Перевод токенов между кошельками

```javascript
const token = new DeepseekToken('DEEPSEEK', 'Deepseek Token', 21000000);
const alice = generateKeyPair();
const bob = generateKeyPair();

// Майним токены
token.mint(alice.address, 5000);
token.mint(bob.address, 3000);

// Переводим
const tx = token.transfer(
  alice.address,
  bob.address,
  1000,
  alice.privateKey.hex
);

console.log('Хеш транзакции:', tx.txHash);
```

### Merkle Tree доказательство

```javascript
const crypto = require('crypto');
const leaves = ['addr1', 'addr2', 'addr3'].map(d => 
  crypto.createHash('sha256').update(d).digest('hex')
);
const tree = new MerkleTree(leaves);
const proof = tree.getProof(leaves[0]);
const isValid = tree.verify(proof, leaves[0], tree.getRoot());
console.log('Доказательство валидно:', isValid);
```

## Telegram бот

Этот скилл используется в Telegram боте @Buy_CrChCn_Bot

Команды:
- /wallet — создать кошелек
- /token DEEPSEEK DEEPSEEK 21000000 — создать токен
- /balance — проверить баланс
- /send — отправить токены

## Лицензия

MIT
