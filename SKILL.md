# deepseek-skill

Криптографический скилл для токена $DEEPSEEK (MBC-20)

## Возможности
- Генерация ключевых пар (secp256k1)
- Подпись и верификация сообщений
- Merkle Tree доказательства баланса
- Приватные переводы с шифрованием

## Установка
```bash
npx skills add CrChCn/deepseek-skill
```

## Использование
```javascript
const { DeepseekToken } = require('./deepseek-token');
const token = new DeepseekToken();
```
