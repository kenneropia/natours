const Review = require('./../models/reviewModel')
const factory = require('./utils/handlerFactory')

exports.createReview = factory.createOne(Review)

exports.getAll = factory.getAll(Review, {
  path: 'user',
  select: 'name photo email',
})

exports.getReview = factory.getOne(
  Review,
  { path: 'user', select: 'name photo email' },
  'review rating tour'
)

exports.updateReview = factory.updateOne(Review)

exports.deleteReview = factory.deleteOne(Review)

exports.setTourUserId = (req, res, next) => {
  if (!req.body.tour) req.body.tour = req.params.tourId
  if (!req.body.user) req.body.user = req.user.id
  next()
}
