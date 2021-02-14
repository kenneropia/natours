const mongoose = require('mongoose')
const slugify = require('slugify')
const tourSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'A tour must have name'],
      unique: true,
      trim: true,
      maxlength: [40, 'A tour must have less or equal than 48 characters'],
      minlength: [10, 'A tour must have more or equal than 10 characters'],
      // validate: [isAlpha, 'Tour name must contain only character']
    },
    slug: {
      type: String,
      required: false,
    },
    duration: {
      type: Number,
      required: [true, 'A tour must have a duration'],
    },
    maxGroupSize: {
      type: Number,
      required: [true, 'A tour must have a group size'],
    },
    difficulty: {
      type: String,
      required: [true, 'A tour must have difficulty'],
      enum: {
        values: ['easy', 'medium', 'difficult'],
        message: 'Difficulty is either: easy, medium, difficult',
      },
    },
    ratingsAverage: {
      type: Number,
      default: 4.5,
      min: [1, 'Rating must be above 1.0'],
      max: [5, 'Rating must be below 5.0'],
      set: (val) => Math.round(val * 10) / 10, //4.6666, 46.666, 47, 4.7
    },
    ratingsQuantity: {
      type: Number,
      default: 0,
    },
    price: {
      type: Number,
      required: [true, 'A tour must have a price'],
    },
    priceDiscount: {
      type: Number,
      required: false,
      validate: [
        function (val) {
          //the 'this' can only work for a new documnet and not for an upadated document
          return val < this.price
        },
        'Price discount ({VALUE}) must be less than price',
      ],
    },
    summary: {
      type: String,
      trim: true,
    },
    description: {
      type: String,
      trim: true,
    },
    imageCover: {
      type: String,
      required: [true, 'A tour must have a cover image'],
    },
    images: {
      type: [String],
      required: false,
    },
    createdAt: {
      type: Date,
      default: Date.now(),
      select: false,
    },
    startDates: {
      type: [Date],
      required: false,
    },
    secretTour: {
      type: Boolean,
      required: false,
    },
    startLocation: {
      type: {
        type: String,
        default: 'Point',
        enum: ['Point'],
      },
      coordinates: [Number],
      address: String,
      description: String,
    },
    locations: [
      {
        type: {
          type: String,
          default: 'Point',
          enum: ['Point'],
        },
        coordinates: [Number],
        address: String,
        description: String,
        day: Number,
      },
    ],
    guides: [
      {
        type: mongoose.Schema.ObjectId,
        ref: 'User',
      },
    ],
  },
  {
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
    strict: 'throw',
  }
)

tourSchema.index({ price: 1, ratingsAverage: -1 })
tourSchema.index({ slug: 1 })
tourSchema.index({ startLocation: '2dsphere' })

tourSchema.virtual('durationWeeks').get(function () {
  if (this.duration) return this.duration / 7
})

tourSchema.virtual('reviews', {
  ref: 'Review',
  foreignField: 'tour',
  localField: '_id',
})

//this middleware runs only before save() and create(), it cant work for the other method
tourSchema.pre('save', function (next) {
  this.slug = slugify(this.name, { lower: true })
  next()
})

// tourSchema.post('save', function (doc, next) {
//   console.log(doc)
//   next()
// })

tourSchema.pre(/^find/, async function (next) {
  //

  this.find({ secretTour: { $ne: true } })
  next()
})
tourSchema.pre('findOne', function (next) {
  this.populate({
    path: 'guides',
    select: '-__v -passwordChangedAt',
  })

  next()
})

tourSchema.pre('findById', function (next) {
  this.populate({
    path: 'guides',
    select: '-__v -passwordChangedAt',
  })

  next()
})
// tourSchema.post(/^find/, function (docs, next) {
//   next()
// })

tourSchema.pre('aggregate', async function (next) {
  let see = await this.pipeline()[0].$geoNear

  if (!see) {
    await this.pipeline().unshift({ $match: { secretTour: { $ne: true } } })

  }
  //
  next()
})

tourSchema.set('toJSON', {
  transform: (document, returnedObject) => {
    returnedObject.id = returnedObject._id.toString()
    delete returnedObject._id
    delete returnedObject.__v
  },
  virtuals: true,
})
const Tour = mongoose.model('Tour', tourSchema)

module.exports = Tour
