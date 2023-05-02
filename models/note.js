const mongoose = require("mongoose");
const AutoIncrement = require("mongoose-sequence")(mongoose);
const { RESOURCE } = require("../constants/index");

const noteSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
      ref: "User",
    },
    title: {
      type: String,
      required: true,
    },
    text: {
      type: String,
      required: true,
    },
    completed: {
      type: Boolean,
      default: false,
    },
  },
  {
    timestamps: true,
  }
);

noteSchema.plugin(AutoIncrement, {
  inc_field: "task",
  id: "taskNum",
});

module.exports = mongoose.model(RESOURCE.NOTE, noteSchema);
