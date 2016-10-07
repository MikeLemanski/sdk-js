const Token = require('../../src');
import Crypto from "../../src/Crypto";
import BankClient from "../sample/BankClient";

let member1 = {};
let alias1 = '';

// Set up a first member
const setUp1 = () => {
    alias1 = Crypto.generateKeys().keyId;
    return Token.createMember(alias1)
        .then(res => {
            member1 = res;
            return true;
        });
};

describe('Notifications', () => {
    beforeEach(() => {
        return Promise.all([setUp1()]);
    });
    it('should subscribe device', () => {
        const randomStr = Crypto.generateKeys().keyId;
        return member1.subscribeDevice(randomStr);
    });
    // it('should subscribe and unsubscribe device', () => {
    //   const randomStr = Crypto.generateKeys().keyId;
    //   return member1.subscribeDevice(randomStr)
    //   .then(() => {
    //     return member1.unsubscribeDevice(randomStr);
    //   });
    // });
    it('should send a push for linking accounts', () => {
        const randomStr = Crypto.generateKeys().keyId;
        return member1.subscribeDevice(randomStr)
            .then(() => BankClient.requestLinkAccounts(alias1, 100000, 'EUR'))
            .then(alp => Token.notifyLinkAccounts(alias1,
                'bank-id', alp));
    });

    it('should send a push for adding key', () => {
        const randomUri = Crypto.generateKeys().keyId;
        const keys = Crypto.generateKeys();
        return member1.subscribeDevice(randomUri)
            .then(alp => Token.notifyAddKey(alias1,
                keys.publicKey, ["tag"]));
    });

    it('should send a push for adding a key and linking accounts', () => {
        const randomStr = '36f21423d991dfe63fc2e4b4177409d29141fd4bcbdb5bff202a105355' +
            '81f97900000';
        const keys = Crypto.generateKeys();
        return member1.subscribeDevice(randomStr)
            .then(() => BankClient.requestLinkAccounts(alias1, 100000, 'EUR'))
            .then(alp => Token.notifyLinkAccountsAndAddKey(alias1, 'bank-id', alp,
                keys.publicKey, ["mytag"]));
    });

    it('should send an actual push to device', () => {
        return member1.subscribeDevice('36f21423d991dfe63fc2e4b4177409d29141fd4bcbdb5bff202a105355' +
            '81f97900000')
            .then(() => BankClient.requestLinkAccounts(alias1, 100000, 'EUR'))
            .then(alp => Token.notifyLinkAccounts(alias1, 'bank-id', alp));
    });
});
