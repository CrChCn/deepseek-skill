// deepseek-token.js — DEEPSEEK токен (MBC-20 emulation)
const skillCrypto = require('./crypto.js');

class DeepseekToken {
    constructor(name = 'DEEPSEEK', symbol = 'DEEPSEEK', maxSupply = 21000000) {
        this.name = name;
        this.symbol = symbol;
        this.maxSupply = maxSupply;
        this.totalSupply = 0;
        this.balances = {};
        this.creator = 'CrChCnBot';
        this.mintLimit = 1000;
    }

    info() {
        return {
            name: this.name,
            symbol: this.symbol,
            maxSupply: this.maxSupply,
            totalSupply: this.totalSupply,
            mintLimit: this.mintLimit,
            creator: this.creator
        };
    }

    mint(address, amount) {
        if (!Number.isFinite(amount) || amount <= 0) {
            return { success: false, error: 'Invalid amount' };
        }
        if (amount > this.mintLimit) {
            return { success: false, error: 'Exceeds mint limit' };
        }
        if (this.totalSupply + amount > this.maxSupply) {
            return { success: false, error: 'Exceeds max supply' };
        }

        this.balances[address] = (this.balances[address] || 0) + amount;
        this.totalSupply += amount;

        return {
            success: true,
            address: address,
            amount: amount,
            newBalance: this.balances[address]
        };
    }

    // Перевод: только владелец адреса отправителя (приватник выводится и
    // сверяется с from), подпись настоящая ECDSA и проверяется до изменения балансов
    transfer(from, to, amount, privateKeyHex) {
        if (!Number.isFinite(amount) || amount <= 0) {
            return { success: false, error: 'Invalid amount' };
        }

        const derived = skillCrypto.privateKeyToAddress(privateKeyHex);
        if (!derived) {
            return { success: false, error: 'Invalid private key' };
        }
        if (derived.address !== from) {
            return { success: false, error: 'Unauthorized: private key does not own the from address' };
        }

        const fromBalance = this.balances[from] || 0;
        if (fromBalance < amount) {
            return { success: false, error: 'Insufficient balance' };
        }

        const message = 'MBC20:' + this.symbol + ':transfer:' + from + '->' + to + ':' + amount;
        const signed = skillCrypto.signMessage(message, privateKeyHex);
        if (!skillCrypto.verifySignature(message, signed.signature, derived.publicKey)) {
            return { success: false, error: 'Signature verification failed' };
        }

        this.balances[from] = fromBalance - amount;
        this.balances[to] = (this.balances[to] || 0) + amount;

        return {
            success: true,
            from: from,
            to: to,
            amount: amount,
            signature: signed.signature,
            publicKey: derived.publicKey,
            fromNewBalance: this.balances[from],
            toNewBalance: this.balances[to]
        };
    }

    balanceOf(address) {
        return this.balances[address] || 0;
    }

    getAllBalances() {
        return { ...this.balances };
    }
}

module.exports = DeepseekToken;
