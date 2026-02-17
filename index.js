const crypto = require('crypto');
const elliptic = require('elliptic');
const ec = new elliptic.ec('secp256k1');

function generateKeyPair() {
    try {
        const keys = ec.genKeyPair();
        const privateKey = keys.getPrivate('hex');
        const publicKey = keys.getPublic('hex');
        const address = '0x' + crypto.createHash('sha256')
            .update(publicKey)
            .digest('hex')
            .slice(0, 40);
        
        return {
            priv: privateKey,
            pub: publicKey,
            address: address
        };
    } catch (error) {
        console.error('Error generating keys:', error.message);
        return {
            priv: null,
            pub: null,
            address: null
        };
    }
}

let MASTER_PUB = null;
let MASTER_PRIV = null;

try {
    const masterPair = generateKeyPair();
    if (masterPair && masterPair.pub) {
        MASTER_PUB = masterPair.pub;
        MASTER_PRIV = masterPair.priv;
    }
} catch (e) {
    // Ignore errors
}

function info() {
    const pubKeyDisplay = MASTER_PUB ? 
        (MASTER_PUB.slice(0, 20) + '...') : 
        'MASTER_PUB not available';
    
    return {
        tick: 'DEEPSEEK',
        creator: 'CrChCnBot',
        maxSupply: 21000000,
        limit: 1000,
        createdAt: '2026-02-14 09:20 UTC',
        pubKey: pubKeyDisplay,
        version: '1.0.0'
    };
}

module.exports = {
    generateKeyPair: generateKeyPair,
    generateKeyPair: generateKeyPair,
    generateKeyPair: generateKeyPair,
    info: info
};

console.log('Crypto module loaded');
console.log('DEEPSEEK cryptographic skill loaded');

if (MASTER_PUB) {
    if (MASTER_PUB && typeof MASTER_PUB === "string") {
    if (MASTER_PUB && typeof MASTER_PUB === "string") {
    console.log('Master public key: ' + MASTER_PUB.slice(0, 20) + '...');
} else {
    console.log('Master public key not available');
}
} else {
    console.log('Master public key not available');
}
} else {
    console.log('Master public key not available');
}
