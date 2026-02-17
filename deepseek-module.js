/**
 * DEEPSEEK CRYPTO MODULE
 * Единый модуль для всей криптографической системы
 */

const elliptic = require('elliptic');
const crypto = require('crypto');
const keccak256 = require('keccak256');
const bs58 = require('bs58');
const { MerkleTree } = require('merkletreejs');

const ec = new elliptic.ec('secp256k1');

// ============================================
// 1. КРИПТОГРАФИЧЕСКОЕ ЯДРО
// ============================================
class CryptoCore {
    constructor() {
        this.curve = 'secp256k1';
        this.version = '1.0.0';
    }

    generateWallet() {
        const keys = ec.genKeyPair();
        const privateKey = keys.getPrivate('hex');
        const publicKey = keys.getPublic('hex');
        
        const publicKeyBuffer = Buffer.from(publicKey, 'hex');
        const addressBuffer = keccak256(publicKeyBuffer).slice(-20);
        const ethAddress = '0x' + addressBuffer.toString('hex');
        
        const sha256 = crypto.createHash('sha256').update(publicKeyBuffer).digest();
        const ripemd160 = crypto.createHash('ripemd160').update(sha256).digest();
        const btcAddress = bs58.encode(Buffer.concat([
            Buffer.from([0x00]),
            ripemd160
        ]));

        return {
            privateKey: {
                hex: privateKey,
                wif: this._toWIF(privateKey)
            },
            publicKey: {
                uncompressed: publicKey,
                compressed: this._compressPublicKey(publicKey)
            },
            addresses: {
                ethereum: ethAddress,
                bitcoin: btcAddress
            }
        };
    }

    _toWIF(privateKey) {
        const extended = Buffer.concat([
            Buffer.from([0x80]),
            Buffer.from(privateKey, 'hex'),
            Buffer.from([0x01])
        ]);
        const sha256 = crypto.createHash('sha256').update(extended).digest();
        const sha256_2 = crypto.createHash('sha256').update(sha256).digest();
        const checksum = sha256_2.slice(0, 4);
        return bs58.encode(Buffer.concat([extended, checksum]));
    }

    _compressPublicKey(publicKey) {
        const x = publicKey.slice(2, 66);
        const y = publicKey.slice(66, 130);
        const prefix = (parseInt(y, 16) % 2 === 0) ? '02' : '03';
        return prefix + x;
    }

    signMessage(message, privateKeyHex) {
        const keyPair = ec.keyFromPrivate(privateKeyHex);
        const msgHash = crypto.createHash('sha256').update(message).digest('hex');
        const signature = keyPair.sign(msgHash);
        
        return {
            message: message,
            signature: signature.toDER('hex'),
            r: signature.r.toString('hex'),
            s: signature.s.toString('hex'),
            v: signature.recoveryParam
        };
    }

    verifySignature(message, signature, publicKeyHex) {
        try {
            const keyPair = ec.keyFromPublic(publicKeyHex, 'hex');
            const msgHash = crypto.createHash('sha256').update(message).digest('hex');
            return keyPair.verify(msgHash, signature);
        } catch (e) {
            return false;
        }
    }

    addressFromPrivate(privateKeyHex) {
        const keyPair = ec.keyFromPrivate(privateKeyHex);
        const publicKey = keyPair.getPublic('hex');
        const publicKeyBuffer = Buffer.from(publicKey, 'hex');
        const addressBuffer = keccak256(publicKeyBuffer).slice(-20);
        return '0x' + addressBuffer.toString('hex');
    }
}

// ============================================
// 2. ERC-20 ТОКЕН
// ============================================
class Token {
    constructor(name, symbol, totalSupply, decimals = 18) {
        this.name = name;
        this.symbol = symbol;
        this.totalSupply = totalSupply;
        this.decimals = decimals;
        this.balances = new Map();
        this.allowances = new Map();
        this.transactions = [];
        this.owner = null;
    }

    initialize(ownerAddress) {
        this.owner = ownerAddress;
        this.balances.set(ownerAddress, this.totalSupply);
        return { success: true, owner: ownerAddress, totalSupply: this.totalSupply };
    }

    balanceOf(address) {
        return this.balances.get(address) || 0;
    }

    transfer(from, to, amount) {
        const fromBalance = this.balanceOf(from);
        if (fromBalance < amount) {
            return { success: false, error: 'Insufficient balance' };
        }

        this.balances.set(from, fromBalance - amount);
        this.balances.set(to, (this.balances.get(to) || 0) + amount);

        const txHash = crypto.createHash('sha256')
            .update(`${from}${to}${amount}${Date.now()}`)
            .digest('hex');

        this.transactions.push({
            hash: txHash,
            from, to, amount,
            timestamp: Date.now()
        });

        return {
            success: true,
            fromNewBalance: this.balanceOf(from),
            toNewBalance: this.balanceOf(to),
            txHash
        };
    }

    mint(to, amount, minter) {
        if (minter !== this.owner) {
            return { success: false, error: 'Only owner can mint' };
        }
        this.totalSupply += amount;
        this.balances.set(to, (this.balances.get(to) || 0) + amount);
        return { success: true, newBalance: this.balanceOf(to) };
    }

    getInfo() {
        return {
            name: this.name,
            symbol: this.symbol,
            totalSupply: this.totalSupply,
            owner: this.owner,
            holders: this.balances.size,
            transactions: this.transactions.length
        };
    }
}

// ============================================
// 3. MERKLE TREE AIRDROP
// ============================================
class MerkleAirdrop {
    constructor() {
        this.tree = null;
        this.leaves = [];
        this.claims = new Map();
    }

    hash(data) {
        return crypto.createHash('sha256').update(data).digest();
    }

    createAirdrop(addresses, amounts = null) {
        this.leaves = addresses.map(addr => this.hash(Buffer.from(addr)));
        this.tree = new MerkleTree(this.leaves, this.hash);

        if (amounts) {
            addresses.forEach((addr, i) => {
                this.claims.set(addr, amounts[i]);
            });
        }

        return {
            root: this.getRoot(),
            addresses: addresses.length,
            depth: this.tree.getDepth()
        };
    }

    getRoot() {
        return this.tree ? this.tree.getRoot().toString('hex') : null;
    }

    getProof(address) {
        const leaf = this.hash(Buffer.from(address));
        const proof = this.tree.getProof(leaf);
        
        return {
            address,
            proof: proof.map(p => ({
                position: p.position,
                data: p.data.toString('hex')
            })),
            verified: this.verify(address, proof),
            amount: this.claims.get(address) || null
        };
    }

    verify(address, proof) {
        const leaf = this.hash(Buffer.from(address));
        return this.tree.verify(proof, leaf, this.tree.getRoot());
    }

    claim(address, proof) {
        if (!this.verify(address, proof)) {
            return { success: false, error: 'Invalid proof' };
        }
        return {
            success: true,
            address,
            amount: this.claims.get(address) || 100
        };
    }
}

// ============================================
// 4. ДЕЦЕНТРАЛИЗОВАННАЯ БИРЖА
// ============================================
class DEX {
    constructor(name = 'DEX', fee = 0.001) {
        this.name = name;
        this.fee = fee;
        this.orders = [];
        this.trades = [];
        this.orderBooks = new Map();
    }

    placeOrder(type, user, token, amount, price) {
        const order = {
            id: 'ord_' + crypto.randomBytes(8).toString('hex'),
            type, user, token, amount, price,
            total: amount * price,
            timestamp: Date.now(),
            status: 'active'
        };

        this.orders.push(order);

        if (!this.orderBooks.has(token)) {
            this.orderBooks.set(token, { buys: [], sells: [] });
        }
        
        const book = this.orderBooks.get(token);
        if (type === 'buy') {
            book.buys.push(order);
            book.buys.sort((a, b) => b.price - a.price);
        } else {
            book.sells.push(order);
            book.sells.sort((a, b) => a.price - b.price);
        }

        return order;
    }

    buy(user, token, amount, price) {
        return this.placeOrder('buy', user, token, amount, price);
    }

    sell(user, token, amount, price) {
        return this.placeOrder('sell', user, token, amount, price);
    }

    matchOrders(token) {
        const book = this.orderBooks.get(token);
        if (!book || !book.buys.length || !book.sells.length) return [];

        const matches = [];
        const buyOrders = [...book.buys];
        const sellOrders = [...book.sells];

        for (const buy of buyOrders) {
            if (buy.status !== 'active') continue;
            
            for (const sell of sellOrders) {
                if (sell.status !== 'active') continue;
                if (sell.price > buy.price) continue;

                const amount = Math.min(buy.amount, sell.amount);
                const price = (buy.price + sell.price) / 2;
                const fee = amount * price * this.fee;

                const trade = {
                    id: 'trade_' + crypto.randomBytes(8).toString('hex'),
                    token, amount, price,
                    buyer: buy.user,
                    seller: sell.user,
                    total: amount * price,
                    fee,
                    timestamp: Date.now()
                };

                this.trades.push(trade);
                
                buy.amount -= amount;
                sell.amount -= amount;
                if (buy.amount === 0) buy.status = 'completed';
                if (sell.amount === 0) sell.status = 'completed';

                matches.push(trade);
            }
        }

        return matches;
    }

    getOrderBook(token) {
        const book = this.orderBooks.get(token) || { buys: [], sells: [] };
        return {
            asks: book.sells.filter(o => o.status === 'active').slice(0, 10),
            bids: book.buys.filter(o => o.status === 'active').slice(0, 10)
        };
    }

    getTrades(token, limit = 50) {
        return this.trades.filter(t => t.token === token).slice(-limit);
    }

    getStats() {
        const volume = this.trades.reduce((sum, t) => sum + t.total, 0);
        const fees = this.trades.reduce((sum, t) => sum + t.fee, 0);
        return {
            exchange: this.name,
            trades: this.trades.length,
            volume,
            fees,
            activeOrders: this.orders.filter(o => o.status === 'active').length
        };
    }
}

// ============================================
// 5. ЕДИНЫЙ МОДУЛЬ
// ============================================
class DeepSeekModule {
    constructor() {
        this.crypto = new CryptoCore();
        this.tokens = new Map();
        this.airdrops = new Map();
        this.exchanges = new Map();
    }

    createWallet() {
        return this.crypto.generateWallet();
    }

    sign(message, privateKey) {
        return this.crypto.signMessage(message, privateKey);
    }

    verify(message, signature, publicKey) {
        return this.crypto.verifySignature(message, signature, publicKey);
    }

    createToken(name, symbol, supply, owner) {
        const token = new Token(name, symbol, supply);
        token.initialize(owner);
        this.tokens.set(symbol, token);
        return token;
    }

    getToken(symbol) {
        return this.tokens.get(symbol);
    }

    createAirdrop(name, addresses, amounts) {
        const airdrop = new MerkleAirdrop();
        const result = airdrop.createAirdrop(addresses, amounts);
        this.airdrops.set(name, airdrop);
        return result;
    }

    getAirdrop(name) {
        return this.airdrops.get(name);
    }

    createExchange(name, fee = 0.001) {
        const dex = new DEX(name, fee);
        this.exchanges.set(name, dex);
        return dex;
    }

    getExchange(name) {
        return this.exchanges.get(name);
    }

    getInfo() {
        return {
            name: 'DeepSeek Module',
            version: '2.0.0',
            components: {
                crypto: 'secp256k1, ECDSA',
                tokens: 'ERC-20 compatible',
                airdrops: 'Merkle Tree based',
                exchange: 'Order book DEX'
            },
            stats: {
                tokens: this.tokens.size,
                airdrops: this.airdrops.size,
                exchanges: this.exchanges.size
            }
        };
    }
}

module.exports = {
    DeepSeekModule,
    CryptoCore,
    Token,
    MerkleAirdrop,
    DEX,
    version: '2.0.0'
};
