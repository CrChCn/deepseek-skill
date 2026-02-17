const crypto = require('crypto');

class TokenExchange {
    constructor(name = 'DEX') {
        this.name = name;
        this.orders = [];
        this.trades = [];
        this.orderBooks = new Map();
        this.userBalances = new Map();
        this.fee = 0.001;
    }

    placeSellOrder(seller, token, amount, price, privateKey) {
        const orderId = this._generateOrderId();
        
        const order = {
            id: orderId,
            type: 'sell',
            user: seller,
            token: token,
            amount: amount,
            price: price,
            total: amount * price,
            signature: this._sign(orderId + seller + amount + price, privateKey),
            timestamp: Date.now(),
            status: 'active',
            filled: 0
        };

        this.orders.push(order);
        
        if (!this.orderBooks.has(token)) {
            this.orderBooks.set(token, { buys: [], sells: [] });
        }
        this.orderBooks.get(token).sells.push(order);

        return order;
    }

    placeBuyOrder(buyer, token, amount, price, privateKey) {
        const orderId = this._generateOrderId();
        
        const order = {
            id: orderId,
            type: 'buy',
            user: buyer,
            token: token,
            amount: amount,
            price: price,
            total: amount * price,
            signature: this._sign(orderId + buyer + amount + price, privateKey),
            timestamp: Date.now(),
            status: 'active',
            filled: 0
        };

        this.orders.push(order);
        
        if (!this.orderBooks.has(token)) {
            this.orderBooks.set(token, { buys: [], sells: [] });
        }
        this.orderBooks.get(token).buys.push(order);

        return order;
    }

    executeOrder(orderId, taker) {
        const order = this.orders.find(o => o.id === orderId && o.status === 'active');
        if (!order) {
            return { success: false, error: 'Order not found' };
        }

        const fee = order.total * this.fee;
        const amountAfterFee = order.total - fee;

        const trade = {
            id: this._generateOrderId(),
            orderId: orderId,
            buyer: order.type === 'sell' ? taker : order.user,
            seller: order.type === 'sell' ? order.user : taker,
            token: order.token,
            amount: order.amount,
            price: order.price,
            total: order.total,
            fee: fee,
            timestamp: Date.now()
        };

        this.trades.push(trade);
        order.status = 'completed';
        order.filled = order.amount;

        return {
            success: true,
            trade: trade,
            message: `Executed ${order.type} order for ${order.amount} ${order.token}`
        };
    }

    getOrderBook(token) {
        const book = this.orderBooks.get(token) || { buys: [], sells: [] };
        
        const sells = book.sells
            .filter(o => o.status === 'active')
            .sort((a, b) => a.price - b.price);
        
        const buys = book.buys
            .filter(o => o.status === 'active')
            .sort((a, b) => b.price - a.price);

        return {
            token: token,
            bids: buys.slice(0, 10),
            asks: sells.slice(0, 10),
            spread: sells.length && buys.length ? 
                (sells[0].price - buys[0].price) / buys[0].price : 0
        };
    }

    getTradeHistory(token, user = null) {
        let trades = this.trades.filter(t => t.token === token);

        if (user) {
            trades = trades.filter(t =>
                t.buyer === user || t.seller === user
            );
        }

        return trades.slice(-50);
    }

    cancelOrder(orderId, user) {
        const order = this.orders.find(o => o.id === orderId);
        if (!order) {
            return { success: false, error: 'Order not found' };
        }
        if (order.user !== user) {
            return { success: false, error: 'Not your order' };
        }

        order.status = 'cancelled';
        return { success: true, order: order };
    }

    getStats() {
        const activeOrders = this.orders.filter(o => o.status === 'active').length;
        const totalVolume = this.trades.reduce((sum, t) => sum + t.total, 0);
        const totalFees = this.trades.reduce((sum, t) => sum + t.fee, 0);

        return {
            exchange: this.name,
            activeOrders: activeOrders,
            totalTrades: this.trades.length,
            totalVolume: totalVolume,
            totalFees: totalFees,
            timestamp: Date.now()
        };
    }

    _generateOrderId() {
        return 'ord_' + crypto.randomBytes(16).toString('hex');
    }

    _sign(data, privateKey) {
        return crypto.createHash('sha256')
            .update(data + privateKey)
            .digest('hex');
    }
}

module.exports = TokenExchange;
