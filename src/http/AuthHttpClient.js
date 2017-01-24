import Crypto from "../Crypto";
import Util from "../Util";
import AuthHeader from "./AuthHeader";
import AuthContext from "./AuthContext"
import {urls, KeyLevel, transferTokenVersion, accessTokenVersion} from "../constants";
import VersionHeader from "./VersionHeader";
const stringify = require('json-stable-stringify');
const axios = require('axios');

/**
 * Authenticated client for making requests to the Token gateway
 */
class AuthHttpClient {
    constructor(env, memberId, keys){
        this._instance = axios.create({
            baseURL: urls[env]
        });
        this._memberId = memberId;
        this._keys = keys;
        this._context = new AuthContext();
        this._authHeader = new AuthHeader(urls[env], keys);
        this._resetInterceptor();
        this._addVersionHeader();
    }

    _resetInterceptor() {
        this._instance.interceptors.request.eject(this._interceptor);

        this._interceptor = this._instance.interceptors.request.use((config) => {
            this._authHeader.addAuthorizationHeaderMemberId(this._memberId, config, this._context);
            return config;
        })
    }

    _addVersionHeader() {
        this._versionHeader = new VersionHeader();
        this._instance.interceptors.request.use((config) => {
            this._versionHeader.addVersionHeader(config);
            return config;
        })
    }

    useAccessToken(accessTokenId) {
        this._context.onBehalfOf = accessTokenId;
        this._resetInterceptor();
    }

    clearAccessToken() {
        this._context.onBehalfOf = undefined;
        this._resetInterceptor();
    }

    subscribeToNotifications(target, platform) {
        const req = {
            target,
            platform
        };
        const config = {
            method: 'post',
            url: `/subscribers`,
            data: req
        };
        return this._instance(config);
    }

    getSubscribers() {
        const config = {
            method: 'get',
            url: `/subscribers`
        };
        return this._instance(config);
    }

    getSubscriber(subscriberId) {
        const config = {
            method: 'get',
            url: `/subscribers/${subscriberId}`
        };
        return this._instance(config);
    }

    getNotifications() {
        const config = {
            method: 'get',
            url: `/notifications`
        };
        return this._instance(config);
    }

    getNotification(notificationId) {
        const config = {
            method: 'get',
            url: `/notifications/${notificationId}`
        };
        return this._instance(config);
    }

    unsubscribeFromNotifications(subscriberId) {
        const config = {
            method: 'delete',
            url: `/subscribers/${subscriberId}`
        };
        return this._instance(config);
    }

    //
    // ADDRESSES
    //
    addAddress(name, address) {
        const req = {
            name,
            address,
            addressSignature: {
                memberId: this._memberId,
                keyId: this._keys.keyId,
                signature: Crypto.signJson(address, this._keys)
            }
        };
        const config = {
            method: 'post',
            url: `/addresses`,
            data: req
        };
        return this._instance(config);
    }

    getAddress(addressId) {
        const config = {
            method: 'get',
            url: `/addresses/${addressId}`
        };
        return this._instance(config);
    }

    getAddresses() {
        const config = {
            method: 'get',
            url: `/addresses`
        };
        return this._instance(config);
    }

    //
    // ACCOUNTS
    //
    linkAccounts(bankId, accountLinkPayloads) {
        const req = {
            bankId,
            accountLinkPayloads
        };
        const config = {
            method: 'post',
            url: `/accounts`,
            data: req
        };
        return this._instance(config);
    }

    getAccounts() {
        const config = {
            method: 'get',
            url: `/accounts`
        };
        return this._instance(config);
    }

    getAccount(accountId) {
        const config = {
            method: 'get',
            url: `/accounts/${accountId}`
        };
        return this._instance(config);
    }

    setAccountName(accountId, name) {
        const config = {
            method: 'patch',
            url: `/accounts/${accountId}?name=${name}`
        };
        return this._instance(config);
    }

    getBalance(accountId) {
        const config = {
            method: 'get',
            url: `/accounts/${accountId}/balance`
        };
        return this._instance(config);
    }

    getTransaction(accountId, transactionId) {
        const config = {
            method: 'get',
            url: `/accounts/${accountId}/transactions/${transactionId}`
        };
        return this._instance(config);
    }

    getTransactions(accountId, offset, limit) {
        const config = {
            method: 'get',
            url: `/accounts/${accountId}/transactions?offset=${offset}&limit=${limit}`
        };
        return this._instance(config);
    }

    getBanks() {
        const config = {
            method: 'get',
            url: `/banks`
        };
        return this._instance(config);
    }

    getBankInfo(bankId) {
        const config = {
            method: 'get',
            url: `/banks/${bankId}/info`
        };
        return this._instance(config);
    }

    //
    // Tokens
    //

    createTransferToken(
        memberId,
        accountId,
        lifetimeAmount,
        currency,
        username,
        description,
        amount) {

        const payload = {
            version: transferTokenVersion,
            nonce: Util.generateNonce(),
            from: {
                id: memberId,
            },
            transfer: {
                currency,
                lifetimeAmount: lifetimeAmount.toString(),
                instructions: {
                    source: {
                        accountId,
                    },
                },
                amount,
                redeemer: {
                    username,
                },
            },
            description: description,
        };
        const config = {
            method: 'post',
            url: `/tokens`,
            data: {
                payload,
            }
        };
        return this._instance(config);
    }

    createAccessToken(username, resources) {
        const payload = {
            from: {
                id: this._memberId,
            },
            to: {
                username,
             },
            access: {
                resources,
            },
            version: accessTokenVersion,
            nonce: Util.generateNonce(),
        };

        const config = {
            method: 'post',
            url: `/tokens`,
            data: {
                payload,
            }
        };
        return this._instance(config);
    }

    replaceToken(tokenToCancel, newResources) {
        const cancelTokenId = tokenToCancel.id;
        const cancelReq = this._tokenOperationRequest(tokenToCancel, 'cancelled');

        const createReq = {
            payload: {
                from: {
                    id: this._memberId,
                },
                to: tokenToCancel.payload.to,
                access: {
                    resources: newResources,
                },
                issuer: tokenToCancel.payload.issuer,
                version: accessTokenVersion,
                nonce: Util.generateNonce(),
            },
        };

        const config = {
            method: 'post',
            url: `/tokens/${cancelTokenId}/replace`,
            data: {
                cancel_token: cancelReq,
                create_token: createReq
            }
        };
        return this._instance(config);
    }

    replaceAndEndorseToken(tokenToCancel, newResources) {
        const cancelTokenId = tokenToCancel.id;
        const cancelReq = this._tokenOperationRequest(tokenToCancel, 'cancelled');

        const payload = {
            from: {
                id: this._memberId,
            },
            to: tokenToCancel.payload.to,
            access: {
                resources: newResources,
            },
            issuer: tokenToCancel.payload.issuer,
            version: accessTokenVersion,
            nonce: Util.generateNonce(),
        };

        const createReq = {
            payload,
            payload_signature: this._tokenOperationSignature(payload, 'endorsed')
        };

        const config = {
            method: 'post',
            url: `/tokens/${cancelTokenId}/replace`,
            data: {
                cancel_token: cancelReq,
                create_token: createReq
            }
        };
        return this._instance(config);
    }

    endorseToken(token) {
        return this._tokenOperation(
            token,
            'endorse',
            'endorsed');
    }

    cancelToken(transferToken) {
        return this._tokenOperation(
            transferToken,
            'cancel',
            'cancelled');
    }

    createTransfer(transferToken, amount, currency, description, destinations) {
        const payload = {
            nonce: Util.generateNonce(),
            tokenId: transferToken.id,
            amount: {
                value: amount.toString(),
                currency
            },
        };

        if (description) {
            payload.description = description;
        }

        if (destinations !== undefined && destinations.length > 0) {
            payload.destinations = destinations;
        }

        const req = {
            payload,
            payloadSignature: {
                memberId: this._memberId,
                keyId: this._keys.keyId,
                signature: Crypto.signJson(payload, this._keys)
            }
        };
        const config = {
            method: 'post',
            url: `/transfers`,
            data: req
        };
        return this._instance(config);
    }

    getToken(tokenId) {
        const config = {
            method: 'get',
            url: `/tokens/${tokenId}`
        };
        return this._instance(config);
    }

    getTokens(type, offset, limit) {
        const config = {
            method: 'get',
            url: `/tokens?type=${type}&offset=${offset}&limit=${limit}`
        };
        return this._instance(config);
    }

    _tokenOperation(token, operation, suffix) {
        const tokenId = token.id;
        const config = {
            method: 'put',
            url: `/tokens/${tokenId}/${operation}`,
            data: this._tokenOperationRequest(token, suffix)
        };
        return this._instance(config);
    }

    _tokenOperationRequest(token, suffix) {
        return {
            tokenId: token.id,
            signature: this._tokenOperationSignature(token.payload, suffix)
        };
    }

    _tokenOperationSignature(tokenPayload, suffix) {
        const payload = stringify(tokenPayload) + `.${suffix}`;
        return {
            memberId: this._memberId,
            keyId: this._keys.keyId,
            signature: Crypto.sign(payload, this._keys)
        };
    }

    //
    // Transfers
    //
    getTransfer(transferId) {
        const config = {
            method: 'get',
            url: `/transfers/${transferId}`
        };
        return this._instance(config);
    }

    getTransfers(tokenId, offset, limit) {
        const config = {
            method: 'get',
            url: `/transfers?tokenId=${tokenId}&offset=${offset}&limit=${limit}`
        };
        return this._instance(config);
    }

    //
    // Directory
    //
    getMember() {
        const config = {
            method: 'get',
            url: `/members`
        };
        return this._instance(config);
    }


    addKey(prevHash, key, level) {
        const update = {
            memberId: this._memberId,
            operations: [
                {
                    addKey: {
                        key: {
                            id: key.keyId,
                            publicKey: Crypto.strKey(key.publicKey),
                            level: level,
                            algorithm: key.algorithm
                        }
                    }
                }
            ]
        };

        return this._memberUpdate(update, prevHash);
    }

    removeKey(prevHash, keyId) {
        const update = {
            memberId: this._memberId,
            operations: [
                {
                    removeKey: {
                        keyId
                    }
                }
            ]
        };
        return this._memberUpdate(update, prevHash);
    }

    addUsername(prevHash, username) {
        const update = {
            memberId: this._memberId,
            operations: [
                {
                    addUsername: {
                        username
                    }
                }
            ]
        };
        return this._memberUpdate(update, prevHash);
    }

    removeUsername(prevHash, username) {
        const update = {
            memberId: this._memberId,
            operations: [
                {
                    removeUsername: {
                        username
                    }
                }
            ]
        };
        return this._memberUpdate(update, prevHash);
    }

    _memberUpdate(update, prevHash) {
        if (prevHash !== '') {
            update.prevHash = prevHash;
        }

        const req = {
            update,
            updateSignature: {
                memberId: this._memberId,
                keyId: this._keys.keyId,
                signature: Crypto.signJson(update, this._keys)
            }
        };
        const config = {
            method: 'post',
            url: `/members/${this._memberId}/updates`,
            data: req
        };
        return this._instance(config);
    }
}

export default AuthHttpClient;
