const crypto = require('crypto');
const elliptic = require('elliptic');
const bs58 = require('bs58');
const keccak256 = require('keccak256');

const ec = new elliptic.ec('secp256k1');

function generateKeyPair() {
    try {
        const keys = ec.genKeyPair();
        const privateKey = keys.getPrivate('hex');
        const publicKey = keys.getPublic('hex');
        
        // WIF (Wallet Import Format) - как в Bitcoin
        const extended = Buffer.concat([
            Buffer.from([0x80]),
            Buffer.from(privateKey, 'hex'),
            Buffer.from([0x01])
        ]);
        const sha256 = crypto.createHash('sha256').update(extended).digest();
        const sha256_2 = crypto.createHash('sha256').update(sha256).digest();
        const checksum = sha256_2.slice(0, 4);
        const wif = bs58.encode(Buffer.concat([extended, checksum]));
        
        // Ethereum адрес
        const publicKeyBuffer = Buffer.from(publicKey, 'hex');
        const addressBuffer = keccak256(publicKeyBuffer).slice(-20);
        const ethAddress = '0x' + addressBuffer.toString('hex');
        
        return {
            privateKey: {
                hex: privateKey,
                wif: wif
            },
            publicKey: publicKey,
            address: ethAddress
        };
    } catch (error) {
        console.error('Error generating keys:', error.message);
        return {
            privateKey: { hex: null, wif: null },
            publicKey: null,
            address: null
        };
    }
}

let MASTER_PUB = null;
let MASTER_PRIV = null;

try {
    const masterPair = generateKeyPair();
    if (masterPair && masterPair.publicKey) {
        MASTER_PUB = masterPair.publicKey;
        MASTER_PRIV = masterPair.privateKey.hex;
    }
} catch (e) {
    // Ignore errors
}

function info() {
    return {
        name: 'deepseek-skill',
        version: '1.0.0',
        curve: 'secp256k1',
        creator: 'CrChCnBot',
        maxSupply: 21000000
    };
}

console.log('Crypto module loaded');
console.log('DEEPSEEK cryptographic skill loaded');

if (MASTER_PUB) {
    console.log('Master public key:', MASTER_PUB);
} else {
    console.log('Master public key not available');
}

module.exports = {
    generateKeyPair,
    info,
    MASTER_PUB
};
