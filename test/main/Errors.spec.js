const chai = require('chai');
const assert = chai.assert;
import 'babel-regenerator-runtime';

const tokenIo = require('../../src');
const Token = new tokenIo(TEST_ENV);

import Crypto from "../../src/Crypto";
import BankClient from "../sample/BankClient";

let member1 = {};
let username1 = '';
let account1 = {};

let member2 = {};
let username2 = '';

let token1 = {};

// Set up a first member
const setUp1 = async () => {
    username1 = Crypto.generateKeys().keyId;
    member1 = await Token.createMember(username1);
    const alp = await BankClient.requestLinkAccounts(username1, 100000, 'EUR');
    const accs = await member1.linkAccounts('iron', alp);
    account1 = accs[0];
};

// Set up a second member
const setUp2 = async () => {
    username2 = Crypto.generateKeys().keyId;
    member2 = await Token.createMember(username2);
    const alp = await BankClient.requestLinkAccounts(username2, 100000, 'EUR');
    await member2.linkAccounts('iron', alp);
};

// Set up an endorsed transfer token
const setUp3 = async () => {
    const token = await member1.createToken(account1.id, 38.71, 'EUR', username2);
    await member1.endorseToken(token.id);
    token1 = await member2.getToken(token.id);
};

describe('Error handling', () => {
    before(() => Promise.all([setUp1(), setUp2()]));
    beforeEach(setUp3);

    it('Promise should reject', async() => {
        try {
            const err = await member2.createTransfer(token1, 10000, 'EUR');
            return Promise.reject(new Error("Call should fail"));
        } catch (err) {
            assert.include(err.message, "createTransfer");
            assert.include(err.message, "PRECONDITION");
        }
    });
});
