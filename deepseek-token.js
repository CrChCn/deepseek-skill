// deepseek-token.js - DEEPSEEK токен
const crypto = require('./working.js');

// Параметры токена
const TOKEN_CONFIG = {
    name: 'DEEPSEEK',
    symbol: 'DEEPSEEK',
    maxSupply: 21000000,
    mintLimit: 1000,
    creator: 'CrChCnBot'
};

// Балансы пользователей
const balances = new Map();

// Мастер-ключ токена
const masterKey = crypto.generateKeyPair();
console.log('Master public key:', masterKey.publicKey);

// Функции токена
const token = {
    // Информация о токене
    info: function() {
        return {
            name: TOKEN_CONFIG.name,
            symbol: TOKEN_CONFIG.symbol,
            maxSupply: TOKEN_CONFIG.maxSupply,
            mintLimit: TOKEN_CONFIG.mintLimit,
            creator: TOKEN_CONFIG.creator,
            masterPublicKey: masterKey.publicKey
        };
    },
    
    // Создать нового пользователя
    createUser: function(username) {
        const keys = crypto.generateKeyPair();
        const address = crypto.publicKeyToAddress(keys.publicKey);
        return {
            username: username,
            address: address,
            privateKey: keys.privateKey,
            publicKey: keys.publicKey
        };
    },
    
    // Получить баланс
    getBalance: function(address) {
        return balances.get(address) || 0;
    },
    
    // Майнинг
    mint: function(address, amount, signature) {
        if (amount > TOKEN_CONFIG.mintLimit) {
            return { success: false, error: 'Mint limit exceeded' };
        }
        
        const currentBalance = balances.get(address) || 0;
        const totalSupply = Array.from(balances.values()).reduce((a, b) => a + b, 0);
        
        if (totalSupply + amount > TOKEN_CONFIG.maxSupply) {
            return { success: false, error: 'Max supply exceeded' };
        }
        
        balances.set(address, currentBalance + amount);
        
        return {
            success: true,
            address: address,
            amount: amount,
            newBalance: currentBalance + amount
        };
    },
    
    // Перевод между пользователями
    transfer: function(fromAddress, toAddress, amount, privateKey) {
        const fromBalance = balances.get(fromAddress) || 0;
        
        if (fromBalance < amount) {
            return { success: false, error: 'Insufficient balance' };
        }
        
        // Подписываем транзакцию
        const message = `transfer:${fromAddress}:${toAddress}:${amount}`;
        const signature = crypto.signMessage(message, privateKey);
        
        balances.set(fromAddress, fromBalance - amount);
        balances.set(toAddress, (balances.get(toAddress) || 0) + amount);
        
        return {
            success: true,
            from: fromAddress,
            to: toAddress,
            amount: amount,
            signature: signature.signature,
            fromNewBalance: fromBalance - amount,
            toNewBalance: balances.get(toAddress)
        };
    },
    
    // Подписать сообщение
    sign: function(message, privateKey) {
        return crypto.signMessage(message, privateKey);
    },
    
    // Проверить подпись
    verify: function(message, signature, publicKey) {
        return crypto.verifySignature(message, signature, publicKey);
    },
    
    // Получить адрес из ключа
    getAddress: function(publicKey) {
        return crypto.publicKeyToAddress(publicKey);
    },
    
    // Получить все балансы
    getAllBalances: function() {
        const result = {};
        for (const [address, balance] of balances.entries()) {
            result[address] = balance;
        }
        return result;
    }, // <--- ЗАПЯТАЯ ДОБАВЛЕНА!
    
    // Merkle Tree функции
    generateMerkleTree: function() {
        // Собираем все балансы
        const leaves = [];
        for (const [address, balance] of balances.entries()) { // используем Map
            leaves.push(`${address}:${balance}`);
        }
        
        // Создаем дерево
        const MerkleTree = require('./MerkleTree'); // подключаем класс
        this.merkleTree = new MerkleTree(leaves);
        this.merkleRoot = this.merkleTree.getRootHex();
        
        return this.merkleRoot;
    },
    
    getMerkleRoot: function() {
        if (!this.merkleTree) {
            this.generateMerkleTree();
        }
        return this.merkleRoot;
    },
    
    getProof: function(address) {
        if (!this.merkleTree) {
            this.generateMerkleTree();
        }
        
        const balance = balances.get(address);
        if (balance === undefined) return null;
        
        const leaf = `${address}:${balance}`;
        const proof = this.merkleTree.getProof(leaf);
        
        return {
            address,
            balance,
            proof: proof.map(p => ({
                position: p.position,
                data: p.data.toString('hex')
            })),
            root: this.merkleRoot
        };
    },
    
    verifyProof: function(address, balance, proof, root) {
        const leaf = `${address}:${balance}`;
        const MerkleTree = require('./MerkleTree');
        const merkleTree = new MerkleTree([]); // временное дерево для verify
        
        // Конвертируем proof обратно в Buffer
        const proofBuffers = proof.map(p => ({
            position: p.position,
            data: Buffer.from(p.data, 'hex')
        }));
        
        const rootBuffer = Buffer.from(root, 'hex');
        
        return merkleTree.verifyProof(leaf, proofBuffers, rootBuffer);
    }
};

module.exports = token;
