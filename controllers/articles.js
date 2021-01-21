const Article = require('../models/article');
const BadRequestError = require('../errors/bad-request-err');
const ForbiddenError = require('../errors/forbidden-err');
const NotFoundError = require('../errors/not-found-err');
const { notFoundId, forbiddenError, success } = require('../utils/const');

module.exports.getArticles = (req, res, next) => {
  const owner = req.user._id;
  Article.find({ owner })
    .then((articles) => res.send(articles))
    .catch((err) => next(new BadRequestError(err)));
};

module.exports.createArticle = (req, res, next) => {
  const owner = req.user._id;
  const {
    keyword, title, text, date, source, link, image,
  } = req.body;
  Article.create({
    keyword, title, text, date, source, link, image, owner,
  })
    .then((article) => res.send({
      _id: article.id,
      keyword: article.keyword,
      title: article.title,
      text: article.text,
      date: article.date,
      source: article.source,
      link: article.link,
      image: article.image,
    }))
    .catch((err) => next(new BadRequestError(err)));
};

module.exports.deleteArticle = (req, res, next) => {
  const owner = req.user._id;
  Article.findOne({ _id: req.params.articleId }).select('+owner')
    .orFail(() => new NotFoundError(notFoundId))
    .then((article) => {
      if (String(article.owner) !== owner) throw new ForbiddenError(forbiddenError);
      return Article.deleteOne(article);
    })
    .then(() => res.send({ message: success }))
    .catch(next);
};
