const Transaction = require("../models/transaction");
const Comment = require("../models/comment");
const ErrorHandler = require("../utils/errorHandler");
const mongoose = require("mongoose");

exports.getAllTransactionsData = (page, limit, search, sort, filter) => {
  const skip = (page - 1) * limit;

  let transactionsQuery = Transaction.find()
    .populate({ path: "user", select: "name" })
    .skip(skip)
    .limit(limit);

  if (search)
    transactionsQuery = transactionsQuery
      .where("status")
      .equals(new RegExp(search, "i"));

  if (sort) {
    const [field, order] = sort.split(":");
    transactionsQuery = transactionsQuery.sort({
      [field]: order === "asc" ? 1 : -1,
    });
  } else transactionsQuery = transactionsQuery.sort({ createdAt: -1 });

  if (filter) {
    const [field, value] = filter.split(":");
    transactionsQuery = transactionsQuery.where(field).equals(value);
  }

  transactionsQuery = transactionsQuery
    .populate({
      path: "user",
      select: "name",
    })
    .populate({
      path: "cameras",
      select: "name price",
      options: { sort: { name: 1 } },
    });

  return transactionsQuery;
};

exports.getSingleTransactionData = async (id) => {
  if (!mongoose.Types.ObjectId.isValid(id))
    throw new ErrorHandler(`Invalid transaction ID: ${id}`);

  const transaction = await Transaction.findById(id)
    .populate([
      {
        path: "user",
        select: "name",
      },
      {
        path: "cameras",
        select: "name",
      },
    ])
    .lean()
    .exec();

  if (!transaction)
    throw new ErrorHandler(`Transaction not found with ID: ${id}`);

  return transaction;
};
exports.CreateTransactionData = async (data) => {
  const { user, cameras, status, date } = data;
  if (!user) {
    throw new Error("User is required");
  }

  const transaction = await Transaction.create({
    user,
    cameras,
    status,
    date,
  });

  return {
    success: true,
    message: `New transaction on ${date} was created with ID ${transaction._id}`,
    transaction: transaction,
  };
};

exports.updateTransactionData = async (req, res, id) => {
  if (!mongoose.Types.ObjectId.isValid(id))
    throw new ErrorHandler(`Invalid transaction ID: ${id}`);

  const updatedTransaction = await Transaction.findByIdAndUpdate(id, req.body, {
    new: true,
    runValidators: true,
  })
    .lean()
    .exec();

  if (!updatedTransaction)
    throw new ErrorHandler(`Transaction not found with ID: ${id}`);

  return updatedTransaction;
};

exports.deleteTransactionData = async (id) => {
  if (!mongoose.Types.ObjectId.isValid(id))
    throw new ErrorHandler(`Invalid transaction ID: ${id}`);

  const transaction = await Transaction.findOne({ _id: id });
  if (!transaction)
    throw new ErrorHandler(`Transaction not found with ID: ${id}`);

  await Promise.all([
    Transaction.deleteOne({ _id: id }).lean().exec(),
    Comment.deleteMany({ transaction: id }).lean().exec(),
  ]);

  return transaction;
};
