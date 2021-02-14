const express = require('express')
const authController = require('./../controllers/authController')
const bookingController = require('./../controllers/bookingController')

const router = express.Router()

router.use(authController.protect)

router.get('/checkout-session/:tourId', bookingController.getCheckoutSessions)

router
  .route('/')
  .get(bookingController.getAll)
  .post(bookingController.createBooking)

router
  .route('/:id')
  .get(bookingController.getBooking)
  .patch(bookingController.updateBooking)
  .delete(
    authController.restrictTo('user', 'admin'),
    bookingController.deleteBooking
  )
module.exports = router
