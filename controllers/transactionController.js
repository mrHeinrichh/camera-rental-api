const SuccessHandler = require('../utils/successHandler')
const ErrorHandler = require('../utils/errorHandler')
const transactionsService = require('../services/transactionService')
const asyncHandler = require('express-async-handler')
const checkRequiredFields = require('../helpers/checkRequiredFields')

exports.getAllTransactions = asyncHandler(async (req, res, next) => {
  const page = parseInt(req.query.page) || 1
  const limit = parseInt(req.query.limit) || 100
  const search = req.query.search
  const sort = req.query.sort
  const filter = req.query.filter

  const transactionsQuery = transactionsService.getAllTransactionsData(
    page,
    limit,
    search,
    sort,
    filter,
  )
  const transactions = await transactionsQuery.lean().exec()

  if (!transactions.length) {
    return next(new ErrorHandler('No transactions found'))
  }

  const transactionStatuses = transactions.map((u) => u.status).join(', ')
  const transactionIds = transactions.map((u) => u._id).join(', ')

  return SuccessHandler(
    res,
    `Transactions with status ${transactionStatuses} and IDs ${transactionIds} retrieved`,
    transactions,
  )
})

exports.getSingleTransaction = asyncHandler(async (req, res, next) => {
  const transaction = await transactionsService.getSingleTransactionData(
    req.params.id,
  )

  return !transaction
    ? next(new ErrorHandler('No transaction found'))
    : SuccessHandler(
        res,
        `Transaction with ID ${transaction.id} is ${transaction.status}`,
        transaction,
      )
})

exports.createNewTransaction = [
  checkRequiredFields(['user', 'cameras', 'status', 'date']),
  asyncHandler(async (req, res, next) => {
    const { user, status, date } = req.body
    const cameras = req.body.cameras || []

    if (!user || !status || !date) {
      return ErrorHandler(res, 400, 'Missing required fields')
    }

    const transactionData = {
      user,
      cameras,
      status,
      date,
    }

    const transaction = await transactionsService.CreateTransactionData(
      transactionData,
    )

    return SuccessHandler(res, transaction.message, transaction)
  }),
]

exports.updateTransaction = [
  checkRequiredFields(['status', 'date']),
  asyncHandler(async (req, res, next) => {
    const transaction = await transactionsService.updateTransactionData(
      req,
      res,
      req.params.id,
    )

    return SuccessHandler(
      res,
      `Transaction on ${transaction.date} with ID ${transaction._id} is updated`,
      transaction,
    )
  }),
]

exports.deleteTransaction = asyncHandler(async (req, res, next) => {
  const transaction = await transactionsService.deleteTransactionData(
    req.params.id,
  )

  return !transaction
    ? next(new ErrorHandler('No transaction found'))
    : SuccessHandler(
        res,
        `Transaction on ${transaction.date} with ID ${transaction._id} is deleted`,
        transaction,
      )
})
