const Tour = require('./../models/tourModel')
const ApiError = require('./../utils/apiError')
const catchAsync = require('./../utils/catchAsync')

exports.getOverView = catchAsync(async (req, res) => {
  const tours = await Tour.find({})
  res.status(200).render('overview', {
    title: 'All Tours',
    tours,
  })
})

exports.getTour = catchAsync(async (req, res, next) => {
  const tour = await Tour.findOne({ slug: req.params.slug }).populate({
    path: 'reviews',
    fields: 'review rating user',
  })

  if (!tour) {
    return next(new ApiError('There is no tour with that name', 404))
  }

  res.status(200).render('tour', {
    title: `${tour.name} Tour`,
    tour,
  })
})

exports.getLoginForm = (req, res) => {
  res.status(200).render('login', {
    title: 'Log in into your account',
  })
}

exports.getProfile = (req, res) => {
  res.status(200).render('account', { title: 'My profile' })
}
