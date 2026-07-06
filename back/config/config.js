require('dotenv').config();

const required = ['API_SECRET', 'SECRET_KEY_WEBHOOK', 'MP_ACCESS_TOKEN'];
if (process.env.NODE_ENV === 'production') {
    required.push('MP_PUBLIC_KEY_PROD');
}
required.forEach(key => {
    if (!process.env[key]) throw new Error(`Missing required env var: ${key}`);
});

module.exports = {
    url: process.env.API_URL || 'http://localhost:3032/api',
    domain: process.env.FRONTEND_URL || 'http://localhost:3000',
    urlPublic: process.env.FRONTEND_URL || 'http://localhost:3000',
    apiSecret: process.env.API_SECRET,
    SECRET_KEY_WEBHOOK: process.env.SECRET_KEY_WEBHOOK,

    mp_public_key: process.env.NODE_ENV === 'production'
        ? process.env.MP_PUBLIC_KEY_PROD
        : process.env.MP_PUBLIC_KEY_SANDBOX || process.env.MP_PUBLIC_KEY_SANDBOX,

    // Mercado Pago — Sandbox (desenvolvimento)
    MP_PUBLIC_KEY_SANDBOX: process.env.MP_PUBLIC_KEY_SANDBOX,
    MP_ACCESS_TOKEN_SANDBOX: process.env.MP_ACCESS_TOKEN_SANDBOX,

    // Mercado Pago — Produção
    mp_prod: {
        publickey: process.env.MP_PUBLIC_KEY_PROD,
        AccessToken: process.env.MP_ACCESS_TOKEN_PROD,
        ClientID: process.env.MP_CLIENT_ID,
        ClientSecret: process.env.MP_CLIENT_SECRET,
    }
}
