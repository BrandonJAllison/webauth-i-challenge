const User = require('../users/users-module');
const bcrypt = require('bcryptjs');

module.exports = {
  authenticate
};

function authenticate(req, res, next) {
  if (req.session && req.session.user) {
    next();
  } else {
    res.status(401).json({ message: 'Not allowed to do that' });
  }
}