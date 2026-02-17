const elliptic = require('elliptic');
const crypto = require('crypto');
const keccak256 = require('keccak256');
const bs58 = require('bs58');

const ec = new elliptic.ec('secp256k1');

class CryptoCore {
    constructor() {
        this.curve = 'secp256k1 (Bitcoin/Ethereum)';
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
                length: privateKey.length,
                wif: this.toWIF(privateKey)
            },
            publicKey: {
                uncompressed: publicKey,
                compressed: this.compressPublicKey(publicKey),
                length: publicKey.length
            },
            addresses: {
                ethereum: ethAddress,
                bitcoin: btcAddress
            },
            created: new Date().toISOString()
        };
    }

    toWIF(privateKey) {
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

    compressPublicKey(publicKey) {
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
            messageHash: msgHash,
            signature: {
                r: signature.r.toString('hex'),
                s: signature.s.toString('hex'),
                v: signature.recoveryParam,
                der: signature.toDER('hex')
            },
            timestamp: Date.now()
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

    isValidAddress(address) {
        return /^0x[a-fA-F0-9]{40}$/.test(address);
    }

    getInfo() {
        return {
            name: 'CryptoCore',
            version: this.version,
            curve: this.curve,
            algorithms: {
                signature: 'ECDSA',
                hash: 'SHA-256 / Keccak-256',
                keyDerivation: 'secp256k1'
            },
            features: [
                'secp256k1 keys',
                'ECDSA signatures',
                'Ethereum addresses',
                'Bitcoin WIF format',
                'Key compression',
                'Address validation'
            ]
        };
    }
}

module.exports = CryptoCore;
