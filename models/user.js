/* eslint-disable no-unused-expressions */
const mongoose = require('mongoose');
const validator = require('validator');
const bcrypt = require('bcryptjs');

const userSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    default: 'Жак-Ив Кусто',
    minlength: 2,
    maxlength: 30,
  },
  email: {
    type: String,
    required: true,
    unique: true,
    validate: {
      validator(email) {
        return validator.isEmail(email);
      },
      message: 'Введите корректный email!',
    },
  },
  password: {
    type: String,
    required: true,
    minlength: 6,
    maxlength: 500,
    select: false,
  },
});

userSchema.pre('save', function hashPassword(next) {
  if (!this.isModified('password')) return next();
  return bcrypt.hash(this.password, 10)
    .then((hash) => {
      this.password = hash;
      next();
    })
    .catch((err) => {
      next(err);
    });
});

userSchema.statics.findUserByCredentials = function findUser(email, password) {
  return this.findOne({ email }).select('+password')
    .then((user) => {
      if (!user) {
        return Promise.reject(new Error('Почта или пароль введены неверно!'));
      }
      return bcrypt.compare(password, user.password)
        .then((matched) => {
          if (!matched) {
            return Promise.reject(new Error('Почта или пароль введены неверно!'));
          }
          return user;
        });
    });
};

module.exports = mongoose.model('user', userSchema);
