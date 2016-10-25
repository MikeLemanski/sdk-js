// Signature scheme to use
const signatureScheme = 'Token-Ed25519-SHA512';

// Hosts of the gateway
const urls = {
    local: 'http://localhost:8000',
    dev: 'http://dev.api.token.io',
    stg: 'http://stg.api.token.io',
    prd: 'http://prd.api.token.io',
}

// Scheme for transfer tokens
const transferTokenVersion = '1.0';

// Scheme for transfer tokens
const accessTokenVersion = '1.0';

// Default currency to use
const defaultCurrency = 'EUR';

export {
    signatureScheme,
    urls,
    transferTokenVersion,
    accessTokenVersion,
    defaultCurrency
};
