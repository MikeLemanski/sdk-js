# Token-io SDK

A javascript SDK for interacting with the Token System. Visit Token at http://token.io.

### Installation

Dillinger requires a recent version of npm to run.

Install the npm package:

```sh
$ npm install token-io
```

To use in a browser:

```sh
$ var Token = require("token-io")
```

Works in a node as well, but have to directly require the node file from dist.

To build:
```sh
$ npm run build
```

To test in the browser:
```sh
$ npm run testBrowser
```

To test in node:
```sh
$ npm run testNode
```

### API

#### Token
```
static Token.createMember(alias) => Promise(Member)
static Token.loginMember(memberId, keys) => Member
static Token.loginMemberFromLocalStorage() => Member
static Token.requestLinkAccounts(alias) => Promise(accountAuthorizationPayload)
```

#### Member
```
member.approveKey(publicKey, level=0, tags=[])
  => Promise()
member.removeKey(keyId)
  => Promise()
member.addAlias(alias) => Promise()
member.removeAlias(alias) => Promise()
member.linkAccounts(bankId, accountLinkPayload)
  => Promise(Accounts)
member.lookupAccounts() => Promise(Accounts)
(X) member.subscribeDevice(notificationUri, provider=“Token”,
     platform=“IOS”, tags=[]) =>  Promise()
(X) member.notifyAddKey(alias, publicKey) => Promise()
(X) member.notifyLinkBank(alias, bankCode, accountLinkPayload) => Promise()
member.getAllAliases() => Promise(aliases)
member.getFirstAlias() => Promise(alias)
member.getPublicKeys() => Promise(keys)
member.saveToLocalStorage() => void
(X) member.isActive() => Promise()
(X) member.createAddress() => Promise()
(X) member.getAddresses() => Promise(addresses)
member.id => memberid
member.keys => keys
```

#### Account
```
(X) account.setAccountName(name) => Promise()
account.createToken(amount, currency, alias, description)
  => Promise(PaymentToken)
account.lookupToken(tokenId)
(X) account.lookupTokens()
account.endorseToken(token or tokenId) => Promise()
account.declineToken(token or tokenId) => Promise()
account.revokeToken(token or tokenId) => Promise()
account.redeemToken(tokenId, amount, currency) => Promise(Payment)
(X) account.redeemToken(tokenId, 'transactions') => Promise(Object)
```

#### PaymentToken
```
token.json => Json representation of token
token.id => token id
token.payer => payer
token.transfer => transfer
token.amount => amount
token.currency => currency
token.redeemer => redeemer
token.description => description
token.scheme => scheme
token.issuer => issuer
token.nonce => nonce
token.signatures => signatures
```
### Payment
```
payment.id => payment Id;
payment.referenceId => reference Id;
payment.payload => payload
payment.amount => amount
payment.currency => currency
payment.transfer => transfer
payment.signatures => signatures
```

## Sales Demo

### Bank
* ```Token.requestLinkAccounts(alias)```
* ```member.notifyAddKey (alias, publicKey)```
* ```member.isActive()```
* ```member.notifyLinkAccounts(alias, bank-id, accountsPayload)```
* ```member.persistInLocalStorage()```

### Merchant
* ```Token.loginMemberFromLocalStorage()```
* If fails:
* ```member.notifyAddKey(alias, publicKey)```


* ```member.isActive()```
* ```member.lookupAccounts()```
* ```account.createToken(amount, currency)```
* If fails:
* ```account.getTokens()``` (until you find the rightcorrect endorsed token)
* If succeeds:
* ```account.endorseToken(tokenId)```


* Either way: return tokenID to merchant, who does:
* ```account.redeemToken(token, 15, ‘EUR’)```

### AISP (Backend still in progres)
* ```Token.loginMemberFromLocalStorage()```
* If fails:
* ```member.notifyAddKey(alias, publicKey)```
* ```member.isActive()```(for seeing if we’re authenticated)
* ```member.getAddresses()```
* ```member.lookupAccounts()```
* ```account.createToken(acl list...)```
* If fails:
* ```getTokens(until you find the correct endorsed token)```
* If succeeds:
* ```endorseToken(tokenId)```


* Either way: return tokenID to merchant, who does:
* ```account.redeemToken(token, ‘transactions’)```
