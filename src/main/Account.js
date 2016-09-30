import AuthHttpClient from '../http/AuthHttpClient';
import Transaction from './Transaction';

/**
 * Account class. Allows the member to make account specific operations, move money, etc
 */
export default class Account {
  /**
   * Represents the account
   * @constructor
   * @param {Member} member - member that owns this account
   * @param {object} acc - accoun json object retrieved from server
   */
  constructor(member, acc) {
    this._member = member;
    this._id = acc.id;
    this._name = acc.name;
  }

  /**
   * return the member
   * @return {Member} member - member
   */
  get member() {
    return this._member;
  }

  /**
   * return the account Id
   * @return {string} accountId - accountId
   */
  get id() {
    return this._id;
  }

  /**
   * return the name of the account
   * @return {string} accountName - name
   */
  get name() {
    return this._name;
  }

  /**
   * Sets the account name
   * @param {string} name - accountName
   * @return {Promise} empty - empty promise
   */
  setAccountName(name) {
    return AuthHttpClient.setAccountName(this._member._keys, this._member.id,
          this._id, name)
    .then(res => {
      this._name = name;
    });
  }

  /**
   * Looks up the balance of the account
   * @return {Promise} balance - Promise of balance object
   */
  lookupBalance() {
    return AuthHttpClient.lookupBalance(this._member._keys, this._member.id,
      this._id)
    .then(res => {
      return res.data;
    });
  }

  // /**
  //  * Looks up a transaction for the account
  //  * @param {string} transactionId - which transaction to look up
  //  * @return {Promise} transaction - the Transaction
  //  */
  // lookupTransaction(transactionId) {
  //   return AuthHttpClient.lookupTransaction(this._member.keys, this._member.id,
  //     this._id, transactionId)
  //   .then(res => {
  //     console.log(res);
  //     return new Transaction(res.data);
  //   });
  // }

  /**
   * Looks up all of the member's payments
   * @param {int} offset - where to start looking
   * @param {int} limit - how many to retrieve
   * @return {Promise} transactions - Transactions
   */
  lookupTransactions(offset = 0, limit = 100) {
    return AuthHttpClient.lookupTransactions(this._member.keys, this._member.id,
      this._id, offset, limit)
    .then(res => {
      return res.data.transactions.map(tr => new Transaction(tr));
    });
  }
}
