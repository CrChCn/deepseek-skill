const crypto = require('crypto');
const elliptic = require('elliptic');
const bs58 = require('bs58').default;
const keccak256 = require('keccak256');

const ec = new elliptic.ec('secp256k1');

function generateKeyPair() {
    const keys = ec.genKeyPair();
    const privateKey = keys.getPrivate('hex');
    const publicKey = keys.getPublic('hex');

    // WIF (Wallet Import Format) - like in Bitcoin
    const extended = Buffer.concat([
        Buffer.from([0x80]),
        Buffer.from(privateKey, 'hex'),
        Buffer.from([0x01])
    ]);
    const sha256 = crypto.createHash('sha256').update(extended).digest();
    const sha256_2 = crypto.createHash('sha256').update(sha256).digest();
    const checksum = sha256_2.slice(0, 4);
    const wif = bs58.encode(Buffer.concat([extended, checksum]));

    // Ethereum address
    const publicKeyBuffer = Buffer.from(publicKey, 'hex');
    const addressBuffer = keccak256(publicKeyBuffer).slice(-20);
    const ethAddress = '0x' + addressBuffer.toString('hex');

    return {
        privateKey: { hex: privateKey, wif },
        publicKey,
        address: ethAddress
    };
}

function info() {
    return {
        name: 'deepseek-skill',
        version: '1.0.2',
        curve: 'secp256k1',
        creator: 'CrChCnBot',
        maxSupply: 21000000
    };
}

module.exports = { generateKeyPair, info, crypto: require('./crypto.js'), MerkleTree: require('./MerkleTree.js') };
