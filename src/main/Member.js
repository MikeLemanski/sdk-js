import Crypto from '../Crypto';
import LocalStorage from '../LocalStorage';
import Account from './Account';
import AuthHttpClient from '../http/AuthHttpClient';
import {defaultNotificationProvider} from '../constants';

export default class Member {
  constructor(memberId, keys) {
    this._id = memberId;
    this._keys = keys;
  }

  get id() {
    return this._id;
  }

  get keys() {
    return this._keys;
  }
  saveToLocalStorage() {
    LocalStorage.saveMember(this);
  }

  approveKey(publicKey, level = 0, tags = []) {
    return this._getPreviousHash()
    .then(prevHash =>
        AuthHttpClient.addKey(this._keys, this._id,
          prevHash, Crypto.bufferKey(publicKey), level, tags)
      .then(res => undefined));
  }

  removeKey(keyId) {
    return this._getPreviousHash()
    .then(prevHash =>
      AuthHttpClient.removeKey(this._keys, this._id, prevHash, keyId)
      .then(res => undefined));
  }

  addAlias(alias) {
    return this._getPreviousHash()
    .then(prevHash =>
        AuthHttpClient.addAlias(this._keys, this._id, prevHash, alias)
        .then(res => undefined));
  }

  removeAlias(alias) {
    return this._getPreviousHash()
      .then(prevHash =>
        AuthHttpClient.removeAlias(this._keys, this._id, prevHash, alias)
        .then(res => undefined));
  }

  linkAccounts(bankId, accountLinkPayload) {
    return AuthHttpClient.linkAccounts(this._keys, this._id,
      bankId, accountLinkPayload)
    .then(res => {
      return res.data.accounts.map(acc => new Account(this, acc));
    });
  }

  lookupAccounts() {
    return AuthHttpClient.lookupAccounts(this._keys, this._id)
    .then(res => {
      return res.data.accounts.map(acc => new Account(this, acc));
    });
  }

  subscribeDevice(notificationUri, provider = defaultNotificationProvider,
        platform = "IOS", tags = []) {
    return AuthHttpClient.subscribeDevice(this._keys, this._id,
      notificationUri, provider, platform, tags);
  }

  // unsubscribeDevice(notificationUri, provider = defaultNotificationProvider) {
  //   return AuthHttpClient.unsubscribeDevice(this._keys, this._id,
  //     notificationUri, provider);
  // }

  createAddress(name, data) {
    return AuthHttpClient.createAddress(this._keys, this._id, name, data)
    .then(res => {
      console.log("res", res);
      return;
    });
  }

  getFirstAlias() {
    return this.getAllAliases().then(aliases => {
      if (aliases.length > 0) {
        return aliases[0];
      }
      return undefined;
    });
  }

  getAllAliases() {
    return this._getMember(this._keys, this._id)
    .then(member => member.aliases);
  }

  getPublicKeys() {
    return this._getMember(this._keys, this._id)
    .then(member => member.keys);
  }

  _getPreviousHash() {
    return this._getMember(this._keys, this._id)
    .then(member => member.lastHash);
  }

  _getMember() {
    return AuthHttpClient.getMember(this._keys, this._id)
    .then(res => {
      return res.data.member;
    });
  }
}
