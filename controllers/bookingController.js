const stripe = require('stripe')(process.env.STRIPE_KEY)
const Tour = require('../models/tourModel')
const Booking = require('../models/bookingModel')
const ApiError = require('../utils/apiError')
const factory = require('./utils/handlerFactory')
const catchAsync = require('../utils/catchAsync')

exports.getCheckoutSessions = catchAsync(async (req, res, next) => {
  const tour = await Tour.findById(req.params.tourId)
 
  const session = await stripe.checkout.sessions.create({
    payment_method_types: ['card'],
    success_url: `${req.protocol}://${req.get('host')}/?tour=${
      req.params.tourId
    }&user=${req.user.id}&price=${tour.price}`,
    cancel_url: `${req.protocol}://${req.get('host')}/tour/${tour.slug}`,
    customer_email: req.user.email,
    client_reference_id: req.params.tourId,
    line_items: [
      {
        name: `${tour.name} Tour`,
        description: tour.summary,
        images: [`https://www.natours.dev/img/tours/${tour.imageCover}`],
        amount: tour.price * 100,
        currency: 'usd',
        quantity: 1,
      },
    ],
  })
  res.status(200).json({
    status: 'success',
    session,
  })
})

exports.createBookingCheckout = catchAsync(async (req, res, next) => {
  const { tour, user, price } = req.query

  if (!tour && !user && !price) return next()

  await Booking.create({ tour, user, price })

  res.redirect(req.originalUrl.split('?')[0])
})

exports.getMyTours = catchAsync(async (req, res, next) => {
  const bookings = await Booking.find({ user: req.user.id })

  const tourIds = bookings.map((el) => el.tour)
  const tours = await Tour.find({ _id: { $in: tourIds } })
  res.status(200).render('overview', {
    title: 'My tours',
    tours,
  })
})

exports.createBooking = factory.createOne(Booking)

exports.getAll = factory.getAll(Booking)

exports.getBooking = factory.getOne(Booking)

exports.updateBooking = factory.updateOne(Booking)

exports.deleteBooking = factory.deleteOne(Booking)
