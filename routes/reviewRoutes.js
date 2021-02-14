const express = require('express')
const authController = require('./../controllers/authController')
const reviewController = require('./../controllers/reviewController')

const router = express.Router({ mergeParams: true })

router.use(authController.protect)

router.use(reviewController.setTourUserId)

router
  .route('/')
  .get(reviewController.getAll)
  .post(reviewController.createReview)

router
  .route('/:id')
  .get(reviewController.getReview)
  .patch(reviewController.updateReview)
  .delete(
    authController.restrictTo('user', 'admin'),
    reviewController.deleteReview
  )

module.exports = router
