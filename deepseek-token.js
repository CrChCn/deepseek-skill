const crypto = require('crypto');

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

    transfer(from, to, amount, privateKey) {
        if (!this.balances[from] || this.balances[from] < amount) {
            return { success: false, error: 'Insufficient balance' };
        }

        this.balances[from] -= amount;
        this.balances[to] = (this.balances[to] || 0) + amount;

        const signature = crypto.createHash('sha256')
            .update(from + to + amount + Date.now())
            .digest('hex');

        return {
            success: true,
            from: from,
            to: to,
            amount: amount,
            signature: signature,
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
