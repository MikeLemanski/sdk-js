import chai from 'chai';
const assert = chai.assert;
import 'babel-regenerator-runtime';

import HttpClient from "../../src/http/HttpClient";
import AuthHttpClient from "../../src/http/AuthHttpClient";
import MemoryCryptoEngine from "../../src/security/engines/MemoryCryptoEngine";
import Util from '../../src/Util';

const devKey = require("../../src/config.json").devKey[TEST_ENV];

describe('AuthHttpClient', () => {
    it('should add a second key', async () => {
        const unauthenticatedClient = new HttpClient(TEST_ENV, devKey);
        const res = await unauthenticatedClient.createMemberId();
        assert.isOk(res.data.memberId);
        const engine = new MemoryCryptoEngine(res.data.memberId);
        const pk1 = engine.generateKey('PRIVILEGED');
        const pk2 = engine.generateKey('STANDARD');
        const pk3 = engine.generateKey('LOW');
        const res2 = await unauthenticatedClient.approveFirstKeys(
            res.data.memberId,
            [pk1, pk2, pk3],
            engine);
        assert.isOk(res2.data.member);
        assert.isOk(res2.data.member.lastHash);
        assert.equal(res2.data.member.keys.length, 3);
    });

    it('should remove a key', async () => {
        const unauthenticatedClient = new HttpClient(TEST_ENV, devKey);
        const res = await unauthenticatedClient.createMemberId();
        assert.isOk(res.data.memberId);
        const engine = new MemoryCryptoEngine(res.data.memberId);
        const pk1 = engine.generateKey('PRIVILEGED');
        const pk2 = engine.generateKey('STANDARD');
        const pk3 = engine.generateKey('LOW');
        const client = new AuthHttpClient(TEST_ENV, res.data.memberId, engine, devKey);
        const res2 = await unauthenticatedClient.approveFirstKeys(
            res.data.memberId,
            [pk1, pk2, pk3],
            engine);
        return await client.removeKey(res2.data.member.lastHash, pk2.id);
    });

    it('should add aliases', async () => {
        const unauthenticatedClient = new HttpClient(TEST_ENV, devKey);
        const res = await unauthenticatedClient.createMemberId();
        const engine = new MemoryCryptoEngine(res.data.memberId);
        const pk1 = engine.generateKey('PRIVILEGED');
        const pk2 = engine.generateKey('STANDARD');
        const pk3 = engine.generateKey('LOW');
        const client = new AuthHttpClient(TEST_ENV, res.data.memberId, engine, devKey);
        assert.isOk(res.data.memberId);
        const res2 = await unauthenticatedClient.approveFirstKeys(
            res.data.memberId,
            [pk1, pk2, pk3],
            engine);
        await client.addAlias(
            res2.data.member.lastHash,
            Util.randomAlias());
        const res3 = await unauthenticatedClient.getMember(res2.data.member.id);
        assert.equal(res3.data.member.aliasHashes.length, 1);
        await client.addAlias(
            res3.data.member.lastHash,
            Util.randomAlias());
        const res4 = await unauthenticatedClient.getMember(res2.data.member.id);
        assert.equal(res4.data.member.aliasHashes.length, 2);
    });

    it('should remove aliases', async () => {
        const unauthenticatedClient = new HttpClient(TEST_ENV, devKey);
        const res = await unauthenticatedClient.createMemberId();
        assert.isOk(res.data.memberId);
        const engine = new MemoryCryptoEngine(res.data.memberId);
        const pk1 = engine.generateKey('PRIVILEGED');
        const pk2 = engine.generateKey('STANDARD');
        const pk3 = engine.generateKey('LOW');
        const client = new AuthHttpClient(TEST_ENV, res.data.memberId, engine, devKey);
        const res2 = await unauthenticatedClient.approveFirstKeys(
            res.data.memberId,
            [pk1, pk2, pk3],
            engine);
        await client.addAlias(
            res2.data.member.lastHash,
            Util.randomAlias());
        const res3 = await unauthenticatedClient.getMember(res2.data.member.id);
        assert.equal(res3.data.member.aliasHashes.length, 1);
        const secondAlias = Util.randomAlias();
        await client.addAlias(res3.data.member.lastHash, secondAlias);
        const res4 = await unauthenticatedClient.getMember(res2.data.member.id);
        assert.equal(res4.data.member.aliasHashes.length, 2);
        const res5 = await client.removeAlias(res4.data.member.lastHash, secondAlias);
        assert.equal(res5.data.member.aliasHashes.length, 1);
    });
});
