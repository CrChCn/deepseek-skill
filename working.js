// working.js - ПРОСТОЙ РАБОЧИЙ КОД С ЭКСПОРТОМ
const EC = require('elliptic').ec;
const crypto = require('crypto');

const ec = new EC('secp256k1');

function generateKeyPair() {
    const key = ec.genKeyPair();
    return {
        privateKey: key.getPrivate('hex'),
        publicKey: key.getPublic('hex')
    };
}

function signMessage(message, privateKeyHex) {
    const key = ec.keyFromPrivate(privateKeyHex, 'hex');
    const msgHash = crypto.createHash('sha256').update(message).digest('hex');
    const signature = key.sign(msgHash);
    return {
        signature: signature.toDER('hex'),
        message: message,
        publicKey: key.getPublic('hex')
    };
}

function verifySignature(message, signatureHex, publicKeyHex) {
    try {
        const key = ec.keyFromPublic(publicKeyHex, 'hex');
        const msgHash = crypto.createHash('sha256').update(message).digest('hex');
        return key.verify(msgHash, signatureHex);
    } catch (e) {
        return false;
    }
}

function publicKeyToAddress(publicKeyHex) {
    const hash = crypto.createHash('sha256').update(publicKeyHex, 'hex').digest();
    const ripe = crypto.createHash('ripemd160').update(hash).digest();
    return '0x' + ripe.toString('hex');
}

// ЭКСПОРТИРУЕМ ВСЕ ФУНКЦИИ
module.exports = {
    generateKeyPair: generateKeyPair,
    signMessage: signMessage,
    verifySignature: verifySignature,
    publicKeyToAddress: publicKeyToAddress
};

// Для теста при прямом запуске
if (require.main === module) {
    const keys = generateKeyPair();
    console.log('Private key:', keys.privateKey);
    console.log('Public key:', keys.publicKey);
    console.log('Address:', publicKeyToAddress(keys.publicKey));
    
    const sig = signMessage('test', keys.privateKey);
    console.log('Signature valid:', verifySignature('test', sig.signature, keys.publicKey));
}
