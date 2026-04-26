const mongoose = require("mongoose");

const jobSchema = new mongoose.Schema({
  company: String,
  role: String,
  status: String,
  reason: String,
  suggestion: String
});

module.exports = mongoose.model("Job", jobSchema);