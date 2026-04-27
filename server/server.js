const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const OpenAI = require("openai");

const app = express();

// 🔥 CONFIG
const openai = new OpenAI({
  apiKey: "YOUR_OPENAI_API_KEY" // 👈 replace this
});

// MIDDLEWARE
app.use(cors());
app.use(express.json());

// DB
mongoose.connect(process.env.MONGO_URI)
  .then(() => console.log("MongoDB connected"))
  .catch(err => console.log(err));
// MODELS
const User = mongoose.model("User", {
  name: String,
  email: String,
  password: String
});

const Job = mongoose.model("Job", {
  userId: String,
  company: String,
  role: String,
  status: String
});

// AUTH MIDDLEWARE
const auth = (req, res, next) => {
  const token = req.headers.authorization;
  if (!token) return res.send({ message: "No token" });

  try {
    const decoded = jwt.verify(token, "secretkey");
    req.userId = decoded.id;
    next();
  } catch {
    res.send({ message: "Invalid token" });
  }
};

// ================= AUTH =================

// SIGNUP
app.post("/signup", async (req, res) => {
  const { name, email, password } = req.body;

  const hashed = await bcrypt.hash(password, 10);

  const user = new User({ name, email, password: hashed });
  await user.save();

  res.send({ message: "User created" });
});

// LOGIN
app.post("/login", async (req, res) => {
  const { email, password } = req.body;

  const user = await User.findOne({ email });

  if (!user) return res.send({ message: "User not found" });

  const match = await bcrypt.compare(password, user.password);

  if (!match) return res.send({ message: "Wrong password" });

  const token = jwt.sign({ id: user._id }, "secretkey");

  res.send({ message: "Login success", token });
});

// ================= JOB =================

// ADD JOB
app.post("/add-job", auth, async (req, res) => {
  const job = new Job({
    userId: req.userId,
    ...req.body
  });

  await job.save();
  res.send(job);
});

// GET JOBS
app.get("/jobs", auth, async (req, res) => {
  const jobs = await Job.find({ userId: req.userId });
  res.send(jobs);
});

// DELETE
app.delete("/delete-job/:id", auth, async (req, res) => {
  await Job.findByIdAndDelete(req.params.id);
  res.send({ message: "Deleted" });
});

// ================= AI =================

app.post("/ai-suggestion", async (req, res) => {
  try {
    const { role, status } = req.body;

    const prompt = `
    I applied for a ${role} job and got ${status}.
    Give short advice:
    - what to improve
    - what to study
    - how to succeed next time
    `;

    const response = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [{ role: "user", content: prompt }]
    });

    res.json({
      suggestion: response.choices[0].message.content
    });

  } catch (err) {
    console.log(err);
    res.status(500).send({ message: "AI error" });
  }
});

// SERVER
app.listen(5000, () => {
  console.log("Server running on 5000");
});