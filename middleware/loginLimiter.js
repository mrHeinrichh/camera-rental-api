const rateLimit = require("express-rate-limit");
const { logEvents } = require("./logger");

const WINDOW_MS = 60 * 1000;
const MAX_REQUESTS = 5;
const MESSAGE = {
  message:
    "Too many login attempts from this IP, please try again after a 60 second pause",
};
const HANDLER = (req, res, next, { message, statusCode }) => {
  logEvents(
    `Too Many Requests: ${message.message}\t${req.method}\t${req.url}\t${req.headers.origin}`,
    "errLog.log"
  );
  res.status(statusCode).send(message);
};

module.exports = rateLimit({
  windowMs: WINDOW_MS,
  max: MAX_REQUESTS,
  message: MESSAGE,
  handler: HANDLER,
  standardHeaders: true,
  legacyHeaders: false,
});
