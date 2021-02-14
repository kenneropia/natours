const catchAsync = require('../../utils/catchAsync')
const APIFeatures = require('./apiFeatures')
const ApiError = require('../../utils/apiError')

exports.getAll = (Model) =>
  catchAsync(async (req, res) => {
    //To allow for nested GET reviews on tour (hack)
    let filter = {}
    if (req.params.tourId) filter = { tour: req.params.tourId }

    const features = new APIFeatures(req.query, Model.find(filter))
      .filter()
      .sort()
      .limitFields()
      .paginate()

    //const docs = await features.query.populate().explain()
    //$.data[0].executionStats

    const docs = await features.query.populate()
    console.log(docs)
    res.status(200).json({
      status: 'success',
      results: docs.length,
      data: docs,
    })
  })

exports.getOne = (Model, populateOption, select) =>
  catchAsync(async (req, res, next) => {
    let query = Model.findById(req.params.id)
    //Tour.findOne({_id: req.params.id})
    if (populateOption) query = query.populate(populateOption)
    if (select) query = query.select(select)
    const doc = await query
    if (!doc) {
      return next(new ApiError('No document found with that ID', 404))
    }

    res.status(200).json({
      status: 'success',
      data: doc,
    })
  })

exports.createOne = (Model) =>
  catchAsync(async (req, res, next) => {
    const doc = await Model.create(req.body)
    res.status(201).json({
      status: 'success',
      data: doc,
    })
  })

exports.updateOne = (Model) =>
  catchAsync(async (req, res, next) => {
    const doc = await Model.findByIdAndUpdate(req.params.id, req.body, {
      runValidators: true,
      new: true,
    })
    if (!doc) return next(new ApiError('No document found with that ID', 404))

    res.status(202).json({
      status: 'success',
      data: doc,
    })
  })

exports.deleteOne = (Model) =>
  catchAsync(async (req, res, next) => {
    const doc = await Model.findByIdAndDelete(req.params.id)

    if (!doc) {
      return next(new ApiError('No document found with that ID', 404))
    }

    res.status(204).json({
      status: 'success',
      data: null,
    })
  })
