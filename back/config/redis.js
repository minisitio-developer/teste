const redis = require('redis');

const redisUrl = process.env.REDIS_URL || 'redis://127.0.0.1:6379';
const redisClient = redis.createClient({ url: redisUrl });

redisClient.on('error', (err) => {
    console.error('Redis Error:', err.message);
});

redisClient.on('connect', () => {
    console.log('✓ Conectado ao Redis');
});

redisClient.connect().catch((e) => {
    console.error('Falha inicial ao conectar no Redis:', e.message);
});

module.exports = redisClient;
