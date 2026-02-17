const crypto = require('crypto');
const { MerkleTree } = require('merkletreejs');

class MerkleAirdrop {
    constructor() {
        this.tree = null;
        this.leaves = [];
        this.leafHashes = [];
        this.addressToLeaf = new Map();
        this.distribution = new Map();
    }

    hash(data) {
        return crypto.createHash('sha256').update(data).digest();
    }

    addAddresses(addresses, amounts = null) {
        this.leaves = addresses;
        
        this.leafHashes = addresses.map(addr => {
            const leaf = this.hash(Buffer.from(addr));
            this.addressToLeaf.set(addr, leaf);
            return leaf;
        });

        this.tree = new MerkleTree(this.leafHashes, this.hash);

        if (amounts && amounts.length === addresses.length) {
            addresses.forEach((addr, i) => {
                this.distribution.set(addr, amounts[i]);
            });
        }

        return {
            totalAddresses: addresses.length,
            rootHash: this.getRoot(),
            treeDepth: this.tree.getDepth(),
            leafCount: this.leafHashes.length
        };
    }

    getRoot() {
        return this.tree ? this.tree.getRoot().toString('hex') : null;
    }

    getProof(address) {
        const leaf = this.addressToLeaf.get(address);
        if (!leaf) {
            return {
                success: false,
                error: 'Address not found in airdrop'
            };
        }

        const proof = this.tree.getProof(leaf);
        const proofHex = proof.map(p => ({
            position: p.position,
            data: p.data.toString('hex')
        }));

        return {
            success: true,
            address: address,
            leaf: leaf.toString('hex'),
            proof: proofHex,
            verified: this.verifyProof(address, proof),
            amount: this.distribution.get(address) || null
        };
    }

    verifyProof(address, proof) {
        const leaf = this.addressToLeaf.get(address);
        if (!leaf) return false;
        return this.tree.verify(proof, leaf, this.tree.getRoot());
    }

    claim(address, proof) {
        if (!this.verifyProof(address, proof)) {
            return {
                success: false,
                error: 'Invalid proof'
            };
        }

        const amount = this.distribution.get(address) || 100;
        return {
            success: true,
            address: address,
            amount: amount,
            timestamp: Date.now()
        };
    }

    generateRandomAddresses(count) {
        const addresses = [];
        for (let i = 0; i < count; i++) {
            const randomBytes = crypto.randomBytes(20).toString('hex');
            addresses.push('0x' + randomBytes);
        }
        return addresses;
    }

    createDistribution(addresses, minAmount = 10, maxAmount = 1000) {
        const amounts = addresses.map(() =>
            Math.floor(Math.random() * (maxAmount - minAmount + 1)) + minAmount
        );

        addresses.forEach((addr, i) => {
            this.distribution.set(addr, amounts[i]);
        });

        return amounts;
    }

    getStats() {
        const totalAmount = Array.from(this.distribution.values())
            .reduce((sum, val) => sum + val, 0);

        return {
            totalAddresses: this.leaves.length,
            rootHash: this.getRoot(),
            treeDepth: this.tree ? this.tree.getDepth() : 0,
            totalDistribution: totalAmount,
            averageAmount: totalAmount / this.leaves.length || 0,
            uniqueAddresses: this.addressToLeaf.size,
            timestamp: Date.now()
        };
    }

    exportAirdropData() {
        const claims = [];
        for (const [address, amount] of this.distribution) {
            const proof = this.getProof(address);
            claims.push({
                address: address,
                amount: amount,
                proof: proof.proof,
                leaf: proof.leaf
            });
        }

        return {
            rootHash: this.getRoot(),
            totalAddresses: this.leaves.length,
            totalAmount: Array.from(this.distribution.values()).reduce((a, b) => a + b, 0),
            claims: claims
        };
    }
}

module.exports = MerkleAirdrop;
