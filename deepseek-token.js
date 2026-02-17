const crypto = require('crypto');
const skill = require('./index.js');

class DeepseekToken {
    constructor(name, symbol, totalSupply, decimals = 18) {
        this.name = name;
        this.symbol = symbol;
        this.totalSupply = totalSupply;
        this.decimals = decimals;
        this.balances = new Map();
        this.allowances = new Map();
        this.transactions = [];
        this.owner = null;
        this.transactionCounter = 0;
    }

    initialize(ownerAddress) {
        this.owner = ownerAddress;
        this.balances.set(ownerAddress, this.totalSupply);
        return { success: true, owner: ownerAddress, totalSupply: this.totalSupply };
    }

    balanceOf(address) {
        return this.balances.get(address) || 0;
    }

    mint(to, amount, minter) {
        if (minter !== this.owner) {
            return { success: false, error: 'Only owner can mint' };
        }
        this.totalSupply += amount;
        this.balances.set(to, (this.balances.get(to) || 0) + amount);
        return { success: true, newBalance: this.balanceOf(to) };
    }

    transfer(from, to, amount, privateKey) {
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

    info() {
        return {
            name: this.name,
            symbol: this.symbol,
            totalSupply: this.totalSupply,
            decimals: this.decimals,
            owner: this.owner,
            transactionCount: this.transactions.length,
            holderCount: this.balances.size
        };
    }
}

module.exports = DeepseekToken;
