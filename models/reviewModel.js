const mongoose = require('mongoose')
const Tour = require('./tourModel')

const reviewSchema = mongoose.Schema(
  {
    review: {
      type: String,
      minlength: [2, 'A review can"t be less than 4 letters'],
      maxlength: [300, 'A review can"t be longer than 300 letters'],
      required: [true, 'A review is required'],
      trim: true,
    },
    rating: {
      type: Number,
      max: [5, 'A rating can"t be bigger than 5'],
      min: [1, 'A rating can"t be lesser than 1'],
      required: [true, 'A rating is required'],
    },
    createdAt: {
      type: Date,
      default: Date.now(),
    },
    user: {
      type: mongoose.Schema.ObjectId,
      ref: 'User',
      required: [true, 'Review must belong to a user'],
    },
    tour: {
      type: mongoose.Schema.ObjectId,
      ref: 'Tour',
      required: [true, 'Review must belong to a tour'],
    },
  },
  {
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
    strict: ['throw'],
  }
)

reviewSchema.pre(/^find/, function (next) {
  this.populate({ path: 'user', select: 'name photo' })

  // this.populate({ path: 'user', select: 'name photo email' })
  next()
})

reviewSchema.statics.calcAverageRatings = async function (tourID) {
  const stats = await this.aggregate([
    {
      $match: { tour: tourID },
    },
    {
      $group: {
        _id: '$tour',
        numRating: { $sum: 1 },
        avgRating: { $avg: '$rating' },
      },
    },
  ])
  Tour.findByIdAndUpdate(tourID, {
    ratingsQuantity: stats[0].numRating || 4.5,
    ratingsAverage: stats[0].avgRating || 0,
  })
}
reviewSchema.post('save', function () {
  this.constructor.calcAverageRatings(this.tour)
})

reviewSchema.pre(/^findOneAnd/, async function (next) {
  this.r = await this.findOne()
  next()
})

reviewSchema.post(/^findOneAnd/, async function () {
  //await this.findOne() cant work here, bc query has alreeady been executed
  await this.r.constructor.calcAverageRatings(this.r.tour)
})

reviewSchema.set('toJSON', {
  transform: (document, returnedObject) => {
    returnedObject.id = returnedObject._id.toString()
    delete returnedObject._id
    delete returnedObject.__v
  },
  virtuals: true,
})

reviewSchema.index({ tour: 1, user: 1 }, { unique: true })

const Review = mongoose.model('Review', reviewSchema)

module.exports = Review
