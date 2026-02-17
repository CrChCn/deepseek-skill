// index.js - ПОЛНАЯ РАБОЧАЯ ВЕРСИЯ DEEPSEEK токена
const crypto = require('./crypto.js');

// Мастер-ключ токена
const MASTER_KEY = crypto.generateKeyPair();
const MASTER_PUB = MASTER_KEY.pub;

// База данных балансов (в памяти)
const balances = new Map();
balances.set('0x123...user1', 1000);
balances.set('0x456...user2', 500);
balances.set('0x789...user3', 250);
balances.set('0xabc...user4', 750);
balances.set('0xdef...user5', 300);

// ========== ИНФОРМАЦИЯ О ТОКЕНЕ ==========
function info() {
    return {
        tick: 'DEEPSEEK',
        creator: 'CrChCnBot',
        maxSupply: 21000000,
        limit: 1000,
        createdAt: '2026-02-14 09:20 UTC',
        pubKey: (MASTER_PUB && typeof MASTER_PUB.slice === 'function') 
        ? (MASTER_PUB && typeof MASTER_PUB.slice === "function" ? MASTER_PUB.slice(0, 20) : "N/A") + "..." 
        : 'MASTER_PUB not available',
        version: '1.0.0'
    };
}

function getBalance(address) {
    const balance = balances.get(address);
    if (balance === undefined) {
        return 0;
    }
    return balance;
}

// ========== MERKLE PROOF ==========
function proveBalance(address, amount) {
    const balanceData = [];
    
    for (const [addr, bal] of balances.entries()) {
        balanceData.push({
            address: addr,
            amount: bal
        });
    }
    
    const result = crypto.buildMerkleTree(balanceData);
    const tree = result.tree;
    const root = result.root;
    
    const proof = crypto.getProof(tree, address, amount);
    const isValid = crypto.verifyBalance(address, amount, proof, root);
    
    return {
        address: address,
        amount: amount,
        root: root,
        proof: proof,
        leaf: crypto.createLeaf(address, amount).toString('hex'),
        timestamp: Date.now(),
        valid: isValid
    };
}

// ========== КОМИССИИ ==========
function signFeeReceipt(address, amount) {
    const message = JSON.stringify({
        type: 'fee_receipt',
        address: address,
        amount: amount,
        timestamp: new Date().toISOString(),
        token: 'DEEPSEEK'
    });
    
    return crypto.signMessage(message, MASTER_KEY.priv);
}

function verifyFeeReceipt(message, signature, pubKey) {
    if (pubKey !== MASTER_PUB) {
        return false;
    }
    return crypto.verifySignature(message, signature, pubKey);
}

// ========== ПРИВАТНЫЕ ПЕРЕВОДЫ ==========
function preparePrivateTransfer(toPubKey, amount) {
    const transferData = {
        type: 'private_transfer',
        amount: amount,
        token: 'DEEPSEEK',
        timestamp: Date.now()
    };
    
    return crypto.encryptMessage(JSON.stringify(transferData), toPubKey);
}

function decryptPrivateTransfer(encryptedData, privateKey) {
    const decrypted = crypto.decryptMessage(encryptedData, privateKey);
    try {
        return JSON.parse(decrypted);
    } catch (e) {
        return { error: 'Invalid transfer data', raw: decrypted };
    }
}

// ========== ТАЙМЕР МИНТА ==========
function nextMintTime(lastPostTime) {
    const last = new Date(lastPostTime);
    const next = new Date(last.getTime() + 30 * 60000);
    const now = new Date();
    const diff = next - now;
    
    if (diff <= 0) {
        return 'Можно минтить сейчас';
    }
    
    const minutes = Math.floor(diff / 60000);
    const seconds = Math.floor((diff % 60000) / 1000);
    
    return 'Следующий минт через ' + minutes + ' мин ' + seconds + ' сек';
}

// ========== УПРАВЛЕНИЕ БАЛАНСАМИ ==========
function mint(address, amount, signature) {
    if (amount > 1000) {
        return { success: false, error: 'Mint limit exceeded' };
    }
    
    const currentBalance = getBalance(address);
    balances.set(address, currentBalance + amount);
    
    return {
        success: true,
        address: address,
        amount: amount,
        newBalance: currentBalance + amount,
        timestamp: Date.now()
    };
}

function transfer(from, to, amount, signature) {
    const fromBalance = getBalance(from);
    
    if (fromBalance < amount) {
        return { success: false, error: 'Insufficient balance' };
    }
    
    balances.set(from, fromBalance - amount);
    balances.set(to, getBalance(to) + amount);
    
    return {
        success: true,
        from: from,
        to: to,
        amount: amount,
        fromNewBalance: fromBalance - amount,
        toNewBalance: getBalance(to) + amount,
        timestamp: Date.now()
    };
}

// ========== ЭКСПОРТ ==========
module.exports = {
    info: info,
    getBalance: getBalance,
    nextMintTime: nextMintTime,
    proveBalance: proveBalance,
    signFeeReceipt: signFeeReceipt,
    verifyFeeReceipt: verifyFeeReceipt,
    preparePrivateTransfer: preparePrivateTransfer,
    decryptPrivateTransfer: decryptPrivateTransfer,
    mint: mint,
    transfer: transfer,
    crypto: {
        generateKeyPair: crypto.generateKeyPair,
        signMessage: crypto.signMessage,
        verifySignature: crypto.verifySignature,
        encryptMessage: crypto.encryptMessage,
        decryptMessage: crypto.decryptMessage,
        hash: crypto.hash,
        pubKeyToAddress: crypto.pubKeyToAddress,
        isValidPublicKey: crypto.isValidPublicKey,
        isValidPrivateKey: crypto.isValidPrivateKey,
        testMerkleTree: crypto.testMerkleTree
    },
    MASTER_PUB: MASTER_PUB,
    VERSION: '1.0.0'
};

console.log('DEEPSEEK cryptographic skill loaded');
if (MASTER_PUB && typeof MASTER_PUB.slice === 'function') {
    console.log('Master public key: ' + (MASTER_PUB && typeof MASTER_PUB.slice === "function" ? MASTER_PUB.slice(0, 20) : "N/A") + "...");
} else {
    console.log('Master public key not available (using: ' + MASTER_PUB + ')');
}
