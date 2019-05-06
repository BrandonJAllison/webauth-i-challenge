const express = require('express');
const bcrypt = require('bcryptjs');

const db = require('./dbConfig.js');
const Users = require('./users/users-module.js');


const server = express();


server.use(express.json());


server.get('/', (req, res) => {
  res.send("Working");
});

server.post('/api/register', (req, res) => {
  let user = req.body;
  const hash = bcrypt.hashSync(user.password, 8);
  user.password = hash;
  Users.add(user)
    .then(saved => {
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
        res.status(200).json({ message: `Welcome ${user.username}!` });
      } else {
        res.status(401).json({ message: 'Invalid Credentials' });
      }
    });
});

function authenticate(req, res, next) {
  const { username, password } = req.headers;

  if (username && password) {
    Users.findBy({ username })
      .first()
      .then(user => {
        if (user && bcrypt.compareSync(password, user.password)) {
          next();
        } else {
          res.status(401).json({ message: 'The credetials are invalid' });
        }
      })
      .catch(err => {
        res.status(500).json({ message: ' Server Error' });
      });
  } else {
    res.status(400).json({ message: 'Cedentials not provided' });
  }
}

server.get('/api/users', authenticate, (req, res) => {
  Users.find()
    .then(users => {
      res.json(users);
    })
    .catch(err => res.send(err));
});
module.exports = server;