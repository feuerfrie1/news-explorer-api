const Article = require('../models/article');
const BadRequestError = require('../errors/bad-request-err');
const ForbiddenError = require('../errors/forbidden-err');
const NotFoundError = require('../errors/not-found-err');

module.exports.getArticles = (req, res, next) => {
  const owner = req.user._id;
  Article.find({ owner })
    .then((articles) => res.send(articles))
    .catch(() => next(new BadRequestError('С запросом что-то не так')));
};

module.exports.createArticle = (req, res, next) => {
  const {
    keyword, title, text, date, source, link, image,
  } = req.body;
  const owner = req.user._id;
  Article.create({
    keyword, title, text, date, source, link, image, owner,
  })
    .then((article) => res.send(article))
    .catch(() => next(new BadRequestError('С запросом что-то не так')));
};

module.exports.deleteArticle = (req, res, next) => {
  const owner = req.user._id;
  Article.findOne({ _id: req.params.articleId }).select('+owner')
    .orFail(() => new NotFoundError('Статья не найдена'))
    .then((article) => {
      if (String(article.owner) !== owner) throw new ForbiddenError('Недостаточно прав для удаления');
      return Article.deleteOne(article);
    })
    .then(() => res.send({ message: 'Успешно' }))
    .catch(next);
};
