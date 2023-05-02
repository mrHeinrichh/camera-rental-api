const ErrorHandler = require("../utils/errorHandler");

const checkRequiredFields = (fields) => (req, res, next) => {
  const missingFields = fields.filter((field) =>
    field === "image" ? !req.body.image && !req.files : !req.body[field]
  );
  if (missingFields.length)
    return next(
      new ErrorHandler(
        JSON.stringify(
          missingFields.map((field) => ({ [field]: ` ${field} is required` }))
        ).replace(/[{}\[\]\\"]/g, "")
      )
    );
  next();
};

module.exports = checkRequiredFields;
