import Crypto from "../Crypto";
import LocalStorage from "../LocalStorage";
import Account from "./Account";
import Subscriber from "./Subscriber";
import Address from "./Address";
import KeyLevel from "./KeyLevel";
import AuthHttpClient from "../http/AuthHttpClient";
import PagedResult from "./PagedResult";
import TransferToken from "./TransferToken";
import AccessToken from "./AccessToken";
import Transfer from "./Transfer";
import {defaultNotificationProvider} from "../constants";

/**
 * Member object. Allows member-wide actions. Some calls return a promise, and some return
 * objects
 */
export default class Member {

    /**
     * Represents a Member
     * @constructor
     * @param {string} memberId - The id of this memberId
     * @param {object} keys - An object representing the keypair of the user
     */
    constructor(env, memberId, keys) {
        this._id = memberId;
        this._keys = keys;
        this._client = new AuthHttpClient(env, memberId, keys);
    }

    /**
     * Gets the memberId
     * @return {string} memberId
     */
    get id() {
        return this._id;
    }

    /**
     * Returns the member's key pair
     * @return {object} keyPair
     */
    get keys() {
        return this._keys;
    }

    /**
     * Save the member to localStorage, to be loaded in the future. Only works on browsers
     */
    saveToLocalStorage() {
        LocalStorage.saveMember(this);
    }

    /**
     * Sets the access token id to be used with this client.
     *
     * @param {string} accessTokenId - the access token id
     */
    useAccessToken(accessTokenId) {
        this._client.useAccessToken(accessTokenId);
    }

    /**
     * Clears the access token id used with this client.
     */
    clearAccessToken() {
        this._client.clearAccessToken();
    }

    /**
     * Approves a new key for this member
     * @param {Buffer} publicKey - key to add
     * @param {string} keyLevel - Security level of this new key. PRIVILEGED is root security
     * @return {Promise} empty empty promise
     */
    approveKey(publicKey, keyLevel = KeyLevel.PRIVILEGED) {
        return this._getPreviousHash()
            .then(prevHash =>
                this._client
                    .addKey(prevHash, Crypto.bufferKey(publicKey), keyLevel)
                    .then(res => undefined))
            .catch(err => this._reject(this.approveKey, err));
    }

    /**
     * Removes a key from this member
     * @param {string} keyId - keyId to remove. Note, keyId is the hash of the pk
     * @return {Promise} empty empty promise
     */
    removeKey(keyId) {
        return this._getPreviousHash()
            .then(prevHash =>
                this._client
                    .removeKey(prevHash, keyId)
                    .then(res => undefined))
            .catch(err => this._reject(this.removeKey, err));
    }

    /**
     * Adds an username to this member
     * @param {string} username - username to add
     * @return {Promise} empty empty promise
     */
    addUsername(username) {
        return this._getPreviousHash()
            .then(prevHash =>
                this._client
                    .addUsername(prevHash, username)
                    .then(res => undefined))
            .catch(err => this._reject(this.addUsername, err));
    }

    /**
     * Removes an username from the memberId
     * @param {string} username - username to remove
     * @return {Promise} empty - empty promise
     */
    removeUsername(username) {
        return this
            ._getPreviousHash()
            .then(prevHash =>
                this._client
                    .removeUsername(prevHash, username)
                    .then(res => undefined))
            .catch(err => this._reject(this.removeUsername, err));
    }

    /**
     * Links bank accounts to the member
     * @param {string} bankId - bank to link
     * @param {string} accountsLinkPayload - accountLinkPayload obtained from bank
     * @return {Promise} accounts - Promise resolving the the Accounts linked
     */
    linkAccounts(bankId, accountsLinkPayload) {
        return this._client
            .linkAccounts(bankId, accountsLinkPayload)
            .then(res => {
                return res.data.accounts.map(acc => new Account(this, acc));
            })
            .catch(err => this._reject(this.linkAccounts, err));
    }

    /**
     * Looks up the member's accounts
     * @return {Promise} accounts - Promise resolving to the accounts
     */
    getAccounts() {
        return this._client
            .getAccounts()
            .then(res => {
                return res.data.accounts.map(acc => new Account(this, acc));
            })
            .catch(err => this._reject(this.getAccounts, err));
    }

    /**
     * Creates a subscriber to receive notifications of member events, such as step up auth,
     * new device requests, linking account requests, or transfer notifications
     * @param {string} target - the notification target for this device. (e.g iOS push token)
     * @param {string} provider - provider to send the notification (default Token)
     * @param {string} platform - platform of the devices (IOS, ANDROID, WEB, etc)
     * @return {Promise} subscriber - Subscriber object
     */
    subscribeToNotifications(
        target,
        provider = defaultNotificationProvider,
        platform = "IOS") {
        return this._client
            .subscribeToNotifications(target, provider, platform)
            .then(res => {
                return new Subscriber(res.data.subscriber);
            })
            .catch(err => this._reject(this.subscribeToNotifications, err));
    }

    /**
     * Gets all subscribers for this member
     *
     * @return {Promise} - subscribers
     */
    getSubscribers() {
        return this._client
            .getSubscribers()
            .then(res => {
                return res.data.subscribers.map(s => new Subscriber(s));
            })
            .catch(err => this._reject(this.getSubscribers, err));
    }

    /**
     * Gets a specific subscriber by Id
     *
     * @param {string} subscriberId - id of the subscriber
     * @return {Promise} - subscriber
     */
    getSubscriber(subscriberId) {
        return this._client
            .getSubscriber(subscriberId)
            .then(res => {
                return new Subscriber(res.data.subscriber);
            })
            .catch(err => this._reject(this.getSubscriber, err));
    }

    /**
     * Unsubscribes from notifications (removes a subscriber)
     * @param {string} subscriberId - subscriber to remove
     * @return {Promise} empty - empty promise
     */
    unsubscribeFromNotifications(subscriberId) {
        return this._client
            .unsubscribeFromNotifications(subscriberId)
            .catch(err => this._reject(this.unsubscribeFromNotifications, err));
    }

    /**
     * Creates an address for this member, and saves it
     * @param {string} name - name of the address (e.g 'Home')
     * @param {object} address - address
     * @return {Promise} empty - empty promise
     */
    addAddress(name, address) {
        return this._client
            .addAddress(name, address)
            .then(res => {
                return new Address(res.data.address);
            })
            .catch(err => this._reject(this.addAddress, err));
    }

    /**
     * Gets the member's addresse
     *
     * @param {string} addressId - the address id
     * @return {Promise} address - the address
     */
    getAddress(addressId) {
        return this._client
            .getAddress(addressId)
            .then(res => {
                return new Address(res.data.address);
            })
            .catch(err => this._reject(this.getAddress, err));
    }

    /**
     * Gets the member's addresses
     * @return {Promise} addresses - Addresses
     */
    getAddresses() {
        return this._client
            .getAddresses()
            .then(res => {
                return res.data.addresses
                    .map(address => new Address(address));
            })
            .catch(err => this._reject(this.getAddresses, err));
    }

    /**
     * Gets all of the member's usernames
     * @return {Promise} usernames - member's usernames
     */
    getAllUsernames() {
        return this
            ._getMember()
            .then(member => member.usernames)
            .catch(err => this._reject(this.getAllUsernames, err));
    }

    /**
     * Creates a new unendorsed Access Token
     *
     * @param {string} grantee - the username of the grantee
     * @param {object} resources - an array of resources
     * @return {Promise} token - promise of a created AccessToken
     */
    createAccessToken(grantee, resources) {
        const token = new AccessToken(undefined, this, grantee, resources);
        return this._client
            .createToken(token.json)
            .then(res => {
                return AccessToken.createFromToken(res.data.token);
            })
            .catch(err => this._reject(this.createAccessToken, err));
    }

    /**
     * Creates a new Address Access Token
     *
     * @param {string} grantee - the username of the grantee
     * @param {string} addressId - an optional addressId
     * @return {Promise} token - promise of a created AccessToken
     */
    createAddressAccessToken(grantee, addressId) {
        const token = AccessToken.addressAccessToken(this, grantee, addressId);
        return this._client
            .createToken(token.json)
            .then(res => {
                return AccessToken.createFromToken(res.data.token);
            })
            .catch(err => this._reject(this.createAddressAccessToken, err));
    }

    /**
     * Creates a new Account Access Token
     *
     * @param {string} grantee - the username of the grantee
     * @param {string} accountId - an optional accountId
     * @return {Promise} token - promise of a created AccessToken
     */
    createAccountAccessToken(grantee, accountId) {
        const token = AccessToken.accountAccessToken(this, grantee, accountId);
        return this._client
            .createToken(token.json)
            .then(res => {
                return AccessToken.createFromToken(res.data.token);
            })
            .catch(err => this._reject(this.createAccountAccessToken, err));
    }

    /**
     * Creates a new Transaction Access Token
     *
     * @param {string} grantee - the username of the grantee
     * @param {string} accountId - an optional accountId
     * @return {Promise} token - promise of a created AccessToken
     */
    createTransactionAccessToken(grantee, accountId) {
        const token = AccessToken.transactionAccessToken(this, grantee, accountId);
        return this._client
            .createToken(token.json)
            .then(res => {
                return AccessToken.createFromToken(res.data.token);
            })
            .catch(err => this._reject(this.createTransactionAccessToken, err));
    }

    /**
     * Creates an unendorsed Transfer Token
     *
     * @param {string} accountId - id of the source account
     * @param {double} amount - amount limit on the token
     * @param {string} currency - 3 letter currency code ('EUR', 'USD', etc)
     * @param {string} username - username of the redeemer of this token
     * @param {string} description - optional description for the token
     * @return {Promise} token - promise of a created TransferToken
     */
    createToken(accountId, amount, currency, username, description = undefined) {
        const token = TransferToken.create(this, accountId, amount,
            currency, username, description);
        return this._client
            .createToken(token.json)
            .then(res => {
                return TransferToken.createFromToken(res.data.token);
            })
            .catch(err => this._reject(this.createToken, err));
    }

    /**
     * Looks up a token by its Id
     * @param {string} tokenId - id of the token
     * @return {Promise} token - TransferToken
     */
    getToken(tokenId) {
        return this._client
            .getToken(tokenId)
            .then(res => {
                return TransferToken.createFromToken(res.data.token);
            })
            .catch(err => this._reject(this.getToken, err));
    }

    /**
     * Looks up all transfer tokens (not just for this account)
     * @param {string} offset - where to start looking
     * @param {int} limit - how many to look for
     * @return {TransferToken} tokens - returns a list of Transfer Tokens
     */
    getTransferTokens(offset, limit) {
        return this._client
            .getTokens('TRANSFER', offset, limit)
            .then(res => {
                return new PagedResult(
                    res.data.tokens === undefined
                        ? []
                        :res.data.tokens.map(tk => TransferToken.createFromToken(tk)),
                    res.data.offset);
            })
            .catch(err => this._reject(this.getTransferTokens, err));
    }

    /**
     * Looks up all access tokens (not just for this account)
     * @param {string} offset - where to start looking
     * @param {int} limit - how many to look for
     * @return {TransferToken} tokens - returns a list of Transfer Tokens
     */
    getAccessTokens(offset, limit) {
        return this._client
            .getTokens('ACCESS', offset, limit)
            .then(res => {
                return new PagedResult(
                    res.data.tokens === undefined
                        ? []
                        :res.data.tokens.map(tk => TransferToken.createFromToken(tk)),
                    res.data.offset);
            })
            .catch(err => this._reject(this.getAccessTokens, err));
    }

    /**
     * Endorses a token
     * @param {BankTransferToken} token - Transfer token to endorse. Can also be a {string} tokenId
     * @return {Promise} token - Promise of endorsed transfer token
     */
    endorseToken(token) {
        return this
            ._resolveToken(token)
            .then(finalToken => {
                return this._client
                    .endorseToken(finalToken)
                    .then(res => {
                        if (typeof token !== 'string' && !(token instanceof String)) {
                            token.payloadSignatures = res.data.token.payloadSignatures;
                        }
                    });
            })
            .catch(err => this._reject(this.endorseToken, err));
    }

    /**
     * Cancels a token. (Called by the payer or the redeemer)
     * @param {BankTransferToken} token - token to cancel. Can also be a {string} tokenId
     * @return {BankTransferToken} token - cancelled token
     */
    cancelToken(token) {
        return this
            ._resolveToken(token)
            .then(finalToken => {
                return this._client
                    .cancelToken(finalToken)
                    .then(res => {
                        if (typeof token !== 'string' && !(token instanceof String)) {
                            token.payloadSignatures = res.data.token.payloadSignatures;
                        }
                    });
            })
            .catch(err => this._reject(this.cancelToken, err));
    }

    /**
     * Redeems a token. (Called by the payee or redeemer)
     * @param {BankTransferToken} token - token to redeem. Can also be a {string} tokenId
     * @param {int} amount - amount to redeemer
     * @param {string} currency - currency to redeem
     * @return {Promise} transfer - Transfer created as a result of this redeem call
     */
    createTransfer(token, amount, currency) {
        return this
            ._resolveToken(token)
            .then(finalToken => {
                if (amount === undefined) {
                    amount = finalToken.payload.transfer.amount;
                }
                if (currency === undefined) {
                    currency = finalToken.payload.transfer.currency;
                }
                return this._client
                    .createTransfer(finalToken, amount, currency)
                    .then(res => {
                        return new Transfer(res.data.transfer);
                    });
            })
            .catch(err => this._reject(this.createTransfer, err));
    }

    /**
     * Looks up a transfer
     * @param {string} transferId - id to look up
     * @return {Transfer} transfer - transfer if found
     */
    getTransfer(transferId) {
        return this._client
            .getTransfer(transferId)
            .then(res => {
                return new Transfer(res.data.transfer);
            })
            .catch(err => this._reject(this.getTransfer, err));
    }

    /**
     * Looks up all of the member's transfers
     * @param {string} tokenId - token to use for lookup
     * @param {string} offset - where to start looking
     * @param {int} limit - how many to retrieve
     * @return {Promise} transfers - Transfers
     */
    getTransfers(tokenId, offset, limit) {
        return this._client
            .getTransfers(tokenId, offset, limit)
            .then(res => {
                return new PagedResult(
                    res.data.transfers.map(pt => new Transfer(pt)),
                    res.data.offset);
            })
            .catch(err => this._reject(this.getTransfers, err));
    }

    /**
     * Gets the member's public keys
     * @return {Promise} keys - keys objects
     */
    getPublicKeys() {
        return this
            ._getMember()
            .then(member => member.keys)
            .catch(err => this._reject(this.getPublicKeys, err));
    }

    _getPreviousHash() {
        return this
            ._getMember()
            .then(member => member.lastHash)
            .catch(err => this._reject(this._getPreviousHash, err));
    }

    _getMember() {
        return this._client
            .getMember()
            .then(res => {
                return res.data.member;
            })
            .catch(err => this._reject(this._getMember, err));
    }

    _resolveToken(token) {
        return new Promise((resolve, reject) => {
            if (typeof token === 'string' || token instanceof String) {
                this.getToken(token)
                    .then(lookedUp => resolve(lookedUp));
            } else {
                resolve(token);
            }
        });

    }
    _reject(method, err) {
        return Promise.reject({
            type: method.name,
            error: err,
            reason: (err.response.data !== undefined) ? err.response.data : "UNKNOWN"
        });
    }
}
