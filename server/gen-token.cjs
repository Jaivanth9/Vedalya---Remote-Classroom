// gen-token.cjs
const jwt = require('jsonwebtoken');

const secret = process.env.JWT_SECRET || 'mydevsecret';
const userId = process.argv[2] || '650f123abc';

console.log(jwt.sign({ userId }, secret, { expiresIn: '7d' }));
