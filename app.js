//  REQUIRING MODULES
const path = require('path')

const express = require('express')
const morgan = require('morgan')
const helmet = require('helmet')
const rateLimit = require('express-rate-limit')
const mongoSanitize = require('express-mongo-sanitize')
const xss = require('xss-clean')
const hpp = require('hpp')
const cookieParser = require('cookie-parser')
const compression = require('compression')

const ApiError = require('./utils/apiError')
const globalErrorHandler = require('./controllers/errorController')
const tourRouter = require('./routes/tourRoutes')
const userRouter = require('./routes/userRoutes')
const reviewRouter = require('./routes/reviewRoutes')
const viewRouter = require('./routes/viewRoutes')
const bookingRouter = require('./routes/bookingRoutes')

const app = express()

const limiter = rateLimit({
  max: 100,
  windowms: 60 * 60 * 1000,
  message: 'Too many requests from this IP, please try again in an hour!',
})

app.use('/api', limiter)
app.use(helmet())

app.set('view engine', 'pug')
app.set('views', path.join(__dirname, 'views'))
app.use(express.static(path.join(__dirname, 'public')))

// MIDDLEWARE

if (process.env.NODE_ENV) {
  app.use(morgan('dev'))
}

app.use(express.json({ limit: '10kb' }))
app.use(cookieParser())

app.use(mongoSanitize())
app.use(xss())
app.use(
  hpp({
    whiteList: [
      'duration',
      'ratingsAverage',
      'ratingsQuantity',
      'maxGroupSize',
      'difficulty',
      'price',
    ],
  })
)

app.use(compression())

app.use('/api/v1/tours', tourRouter)
app.use('/api/v1/users', userRouter)
app.use('/api/v1/reviews', reviewRouter)
app.use('/api/v1/bookings', bookingRouter)
app.use('/', viewRouter)

// Unknown Route

app.all('*', (req, res, next) => {
  next(new ApiError(`Can't find ${req.originalUrl} on this server`, 404))
})

app.use(globalErrorHandler)
// START THE SERVER

module.exports = app
