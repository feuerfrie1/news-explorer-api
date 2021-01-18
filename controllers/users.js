const jwt = require('jsonwebtoken');
const User = require('../models/user');
const ConflictDataError = require('../errors/conflict-data-err');
const LoginError = require('../errors/login-err');
const NotFoundError = require('../errors/not-found-err');
const BadRequestError = require('../errors/bad-request-err');

const { JWT_SECRET = 'dev-key' } = process.env;

module.exports.getUserInfo = (req, res, next) => {
  User.findById(req.user._id)
    .then((user) => {
      if (!user) throw new NotFoundError('Пользователь не найден');
      res.send(user);
    })
    .catch(next);
};

module.exports.createUser = (req, res, next) => {
  const {
    name, email, password,
  } = req.body;
  User.create({
    name,
    password,
    email,
  }).then((user) => res.status(201).send({
    _id: user._id,
    email: user.email,
  }))
    .catch((err) => {
      if (err.name === 'ValidationError') {
        const errorList = Object.keys(err.errors);
        const messages = errorList.map((item) => err.errors[item].message);
        return next(new BadRequestError({ message: `Ошибка валидации: ${messages.join(' ')}` }));
      } if (err.code === 11000) {
        return next(new ConflictDataError('Пользователь с таким email уже зарегистрирован'));
      }
      return next(err);
    });
};

module.exports.login = (req, res, next) => {
  const { email, password } = req.body;
  User.findUserByCredentials(email, password)
    .then((user) => {
      const token = jwt.sign(
        { _id: user._id },
        JWT_SECRET,
        { expiresIn: '7d' },
      );
      res.send({ token });
    })
    .catch((err) => next(new LoginError(err.message)));
};
