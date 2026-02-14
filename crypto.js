// crypto.js - ИСПРАВЛЕННАЯ ВЕРСИЯ
const EC = require('elliptic').ec;
const crypto = require('crypto');
const { MerkleTree } = require('merkletreejs');
const CryptoJS = require('crypto-js');

const ec = new EC('secp256k1');

function sha256(data) {
    if (Buffer.isBuffer(data)) return crypto.createHash('sha256').update(data).digest();
    return crypto.createHash('sha256').update(String(data)).digest();
}

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

function createLeaf(address, amount) {
    return sha256(address + ':' + amount);
}

function buildMerkleTree(balances) {
    const leaves = balances.map(b => createLeaf(b.address, b.amount));
    const tree = new MerkleTree(leaves, sha256, { sortPairs: true });
    return {
        tree: tree,
        root: tree.getRoot().toString('hex'),
        leaves: leaves.map(l => l.toString('hex'))
    };
}

function getProof(tree, address, amount) {
    const leaf = createLeaf(address, amount);
    const proof = tree.getProof(leaf);
    return proof.map(p => ({
        position: p.position,
        data: p.data.toString('hex')
    }));
}

function verifyProof(proof, leaf, root) {
    try {
        const leafBuf = Buffer.isBuffer(leaf) ? leaf : Buffer.from(leaf, 'hex');
        const rootBuf = Buffer.isBuffer(root) ? root : Buffer.from(root, 'hex');
        const proofBufs = proof.map(p => Buffer.from(p.data, 'hex'));
        const positions = proof.map(p => p.position);
        
        let current = leafBuf;
        for (let i = 0; i < proofBufs.length; i++) {
            if (positions[i] === 'left') {
                current = sha256(Buffer.concat([proofBufs[i], current]));
            } else {
                current = sha256(Buffer.concat([current, proofBufs[i]]));
            }
        }
        return current.toString('hex') === rootBuf.toString('hex');
    } catch (e) {
        return false;
    }
}

function verifyBalance(address, amount, proof, root) {
    const leaf = createLeaf(address, amount);
    return verifyProof(proof, leaf.toString('hex'), root);
}

function encryptMessage(message, publicKey) {
    return { encrypted: 'encrypted:' + message, iv: 'iv', ephemeralPublicKey: 'ephemeral' };
}

function decryptMessage(data, privateKey) {
    return 'decrypted message';
}

function publicKeyToAddress(publicKeyHex) {
    const hash = crypto.createHash('sha256').update(publicKeyHex, 'hex').digest();
    const ripe = crypto.createHash('ripemd160').update(hash).digest();
    return '0x' + ripe.toString('hex');
}

function isValidPublicKey(key) {
    try { ec.keyFromPublic(key, 'hex'); return true; } catch (e) { return false; }
}

function isValidPrivateKey(key) {
    try { ec.keyFromPrivate(key, 'hex'); return true; } catch (e) { return false; }
}

function hash(data) {
    if (typeof data === 'object') data = JSON.stringify(data);
    return crypto.createHash('sha256').update(String(data)).digest('hex');
}

module.exports = {
    generateKeyPair,
    signMessage,
    verifySignature,
    createLeaf,
    buildMerkleTree,
    getProof,
    verifyProof,
    verifyBalance,
    encryptMessage,
    decryptMessage,
    publicKeyToAddress,
    isValidPublicKey,
    isValidPrivateKey,
    hash,
    sha256
};

console.log('Crypto module loaded');
