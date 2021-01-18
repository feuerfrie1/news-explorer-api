const articleRouter = require('express').Router();
const { celebrate, Joi } = require('celebrate');

const linkValidation = /^((http|https):\/\/)(www\.)?([A-Za-z0-9.-]{1,256})\.[A-Za-z]{2,20}/;
const {
  getArticles,
  createArticle,
  deleteArticle,
} = require('../controllers/articles');

articleRouter.get('/', getArticles);
articleRouter.post('/', celebrate({
  body: Joi.object().keys({
    keyword: Joi.string().required(),
    title: Joi.string().required(),
    text: Joi.string().required(),
    date: Joi.string().required(),
    source: Joi.string().required(),
    link: Joi.string().pattern(linkValidation).required(),
    image: Joi.string().pattern(linkValidation).required(),
  }),
}), createArticle);
articleRouter.delete('/:articleId', celebrate({
  params: Joi.object().keys({
    articleId: Joi.string().alphanum().length(24).hex(),
  }),
}), deleteArticle);

module.exports = articleRouter;
