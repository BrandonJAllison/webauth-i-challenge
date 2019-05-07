const express = require('express');
const bcrypt = require('bcryptjs');
const session = require('express-session');
const KnexSessionStore = require('connect-session-knex')(session);
const db = require('./dbConfig.js');
const Users = require('./users/users-module.js');
const server = express();
const { authenticate } = require('./Auth/authenitcate');

const sessionConfig = {
    name: 'Session ',
    secret: 'Its a secret',
    cookie: {
      maxAge: 1000 * 60 * 60, // in ms
      secure: false, // used over https only
    },
    httpOnly: true, // cannot access the cookie from js using document.cookie
    resave: false,
    saveUninitialized: false, // GDPR laws against setting cookies automatically
  
    store: new KnexSessionStore({
      knex: db,
      tablename: 'sessions',
      sidfieldname: 'sid',
      createtable: true,
      clearInterval: 1000 * 60 * 60, // in ms
    }),
  };


server.use(express.json());
server.use(session(sessionConfig));
server.use (authenticate);
server.get('/', (req, res) => {
  res.send("Working");
});

server.post('/api/register', (req, res) => {
  let user = req.body;
  const hash = bcrypt.hashSync(user.password, 8);
  user.password = hash;
  Users.add(user)
    .then(saved => {
      req.session.user = saved;
      res.status(201).json(saved);
    })
    .catch(err => {
      res.status(500).json(error);
    });
});

server.post('/api/login', (req, res) => {
  let { username, password } = req.body;
  Users.findBy({ username })
    .first()
    .then(user => {
      if (user && bcrypt.compareSync(password, user.password)) {
        req.session.user = user;
        res.status(200).json({ message: `Welcome ${user.username}!` });
      } else {
        res.status(401).json({ message: 'Invalid Credentials' });
      }
    });
});

// function authenticate(req, res, next) {
//     if (req.session && req.session.user) {
//       next();
//     } else {
//       res.status(401).json({ message: 'You shall not pass!' });
//     }
//   }

server.get('/api/users', authenticate, (req, res) => {
  Users.find()
    .then(users => {
      res.json(users);
    })
    .catch(err => res.send(err));
});
module.exports = server;