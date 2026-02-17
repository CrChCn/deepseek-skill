const crypto = require('crypto');

class ERC20Token {
    constructor(name, symbol, totalSupply, decimals = 18) {
        this.name = name;
        this.symbol = symbol;
        this.totalSupply = totalSupply;
        this.decimals = decimals;
        this.balances = new Map();
        this.allowances = new Map();
        this.transactions = [];
        this.createdAt = Date.now();
        this.owner = null;
        this.transactionCounter = 0;
    }

    initialize(ownerAddress) {
        this.owner = ownerAddress;
        this.balances.set(ownerAddress, this.totalSupply);
        return {
            success: true,
            owner: ownerAddress,
            totalSupply: this.totalSupply,
            timestamp: Date.now()
        };
    }

    balanceOf(address) {
        return this.balances.get(address) || 0;
    }

    transfer(from, to, amount, privateKey) {
        if (!this.isValidAddress(from) || !this.isValidAddress(to)) {
            return { success: false, error: 'Invalid address' };
        }

        const fromBalance = this.balanceOf(from);
        if (fromBalance < amount) {
            return {
                success: false,
                error: 'Insufficient balance',
                required: amount,
                available: fromBalance
            };
        }

        this.balances.set(from, fromBalance - amount);
        this.balances.set(to, (this.balances.get(to) || 0) + amount);

        const signature = this._createSignature(from, to, amount, privateKey);
        const txHash = this._createTransactionHash(from, to, amount, signature);

        const transaction = {
            hash: txHash,
            blockNumber: ++this.transactionCounter,
            from: from,
            to: to,
            amount: amount,
            signature: signature,
            timestamp: Date.now(),
            status: 'confirmed'
        };

        this.transactions.push(transaction);

        return {
            success: true,
            transaction: transaction,
            fromNewBalance: this.balanceOf(from),
            toNewBalance: this.balanceOf(to),
            transactionHash: txHash
        };
    }

    approve(owner, spender, amount, privateKey) {
        const key = `${owner}:${spender}`;
        this.allowances.set(key, amount);
        return {
            success: true,
            owner: owner,
            spender: spender,
            amount: amount,
            timestamp: Date.now()
        };
    }

    transferFrom(sender, recipient, amount, spender) {
        const allowance = this.allowance(sender, spender);
        if (allowance < amount) {
            return { success: false, error: 'Insufficient allowance' };
        }

        const senderBalance = this.balanceOf(sender);
        if (senderBalance < amount) {
            return { success: false, error: 'Insufficient balance' };
        }

        const key = `${sender}:${spender}`;
        this.allowances.set(key, allowance - amount);

        this.balances.set(sender, senderBalance - amount);
        this.balances.set(recipient, (this.balances.get(recipient) || 0) + amount);

        return {
            success: true,
            from: sender,
            to: recipient,
            amount: amount,
            spender: spender
        };
    }

    allowance(owner, spender) {
        return this.allowances.get(`${owner}:${spender}`) || 0;
    }

    mint(to, amount, minter) {
        if (minter !== this.owner) {
            return { success: false, error: 'Only owner can mint' };
        }

        this.totalSupply += amount;
        this.balances.set(to, (this.balances.get(to) || 0) + amount);
        
        return {
            success: true,
            to: to,
            amount: amount,
            newTotalSupply: this.totalSupply,
            newBalance: this.balanceOf(to)
        };
    }

    burn(from, amount) {
        const fromBalance = this.balanceOf(from);
        if (fromBalance < amount) {
            return { success: false, error: 'Insufficient balance' };
        }

        this.balances.set(from, fromBalance - amount);
        this.totalSupply -= amount;
        
        return {
            success: true,
            from: from,
            amount: amount,
            newTotalSupply: this.totalSupply,
            newBalance: this.balanceOf(from)
        };
    }

    getTransactionHistory(address) {
        return this.transactions.filter(tx => 
            tx.from === address || tx.to === address
        ).map(tx => ({
            ...tx,
            type: tx.from === address ? 'outgoing' : 'incoming'
        }));
    }

    getAllTransactions() {
        return this.transactions;
    }

    getInfo() {
        return {
            name: this.name,
            symbol: this.symbol,
            totalSupply: this.totalSupply,
            decimals: this.decimals,
            owner: this.owner,
            createdAt: new Date(this.createdAt).toISOString(),
            transactionCount: this.transactions.length,
            holderCount: this.balances.size,
            circulatingSupply: this._getCirculatingSupply()
        };
    }

    getAllBalances() {
        const balances = {};
        for (const [address, balance] of this.balances) {
            if (balance > 0) {
                balances[address] = balance;
            }
        }
        return balances;
    }

    isValidAddress(address) {
        return /^0x[a-fA-F0-9]{40}$/.test(address);
    }

    _createSignature(from, to, amount, privateKey) {
        return crypto.createHash('sha256')
            .update(`${from}${to}${amount}${Date.now()}`)
            .digest('hex');
    }

    _createTransactionHash(from, to, amount, signature) {
        return crypto.createHash('sha256')
            .update(`${from}${to}${amount}${signature}`)
            .digest('hex');
    }

    _getCirculatingSupply() {
        let circulating = 0;
        for (const balance of this.balances.values()) {
            circulating += balance;
        }
        return circulating;
    }
}

module.exports = ERC20Token;
