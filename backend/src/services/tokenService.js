const jwt = require('jsonwebtoken');
const env = require('../config/env');

function signToken(user) {
  return jwt.sign({ sub: user.email, uid: user.id, admin: user.is_admin }, env.jwtSecret, {
    expiresIn: env.jwtExpiresIn
  });
}

function authResponse(user) {
  return {
    access_token: signToken(user),
    token_type: 'bearer',
    user
  };
}

module.exports = { signToken, authResponse };
