const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");

const Job = require("./models/Job");
const User = require("./models/User");

const app = express();

app.use(cors());
app.use(express.json());


// ✅ MongoDB connection
mongoose.connect("mongodb://127.0.0.1:27017/jobtracker");


// ================= JOB APIs =================

// Add Job
app.post("/add-job", async (req, res) => {
  const { company, role, status, reason } = req.body;

  let suggestion = "";

  if (reason === "lack of skills") {
    suggestion = "Improve your skills and build projects";
  } else if (reason === "communication") {
    suggestion = "Practice communication and mock interviews";
  } else if (reason === "technical") {
    suggestion = "Practice DSA and technical concepts";
  }

  const job = new Job({
    company,
    role,
    status,
    reason,
    suggestion
  });

  await job.save();

  res.send(job);
});


// Get all jobs
app.get("/jobs", async (req, res) => {
  const jobs = await Job.find();
  res.send(jobs);
});


// Delete job
app.delete("/delete-job/:id", async (req, res) => {
  const { id } = req.params;

  await Job.findByIdAndDelete(id);

  res.send({ message: "Job deleted" });
});


// ================= AUTH APIs =================

// Signup
app.post("/signup", async (req, res) => {
  const { name, email, password } = req.body;

  const hashedPassword = await bcrypt.hash(password, 10);

  const user = new User({
    name,
    email,
    password: hashedPassword
  });

  await user.save();

  res.send({ message: "User created" });
});


// Login
app.post("/login", async (req, res) => {
  const { email, password } = req.body;

  const user = await User.findOne({ email });

  if (!user) {
    return res.send({ message: "User not found" });
  }

  const isMatch = await bcrypt.compare(password, user.password);

  if (!isMatch) {
    return res.send({ message: "Wrong password" });
  }

  const token = jwt.sign({ id: user._id }, "secretkey");

  res.send({ message: "Login success", token });
});


// ================= SERVER =================

app.listen(5000, () => {
  console.log("Server running on port 5000");
});