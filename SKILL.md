# deepseek-skill

Cryptographic skill for DEEPSEEK token with Merkle trees and ECDSA signatures

## Features
- Generate secp256k1 key pairs
- Sign and verify messages
- Merkle Tree balance proofs
- Private transfers with encryption

## Installation
```bash
npx skills add CrChCn/deepseek-skill
```

## Usage
```javascript
const { generateKeyPair, info } = require('deepseek-skill');
const DeepseekToken = require('deepseek-skill/deepseek-token');

// Generate wallet
const wallet = generateKeyPair();
console.log(wallet.address);

// Create token
const token = new DeepseekToken('GOLD', 'Gold Token', 1000000);
token.mint(wallet.address, 1000);
```