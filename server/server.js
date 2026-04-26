const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const OpenAI = require("openai");

const app = express();

/* ================= ENV CONFIG ================= */
const PORT = process.env.PORT || 5000;

/* ================= OPENAI ================= */
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY
});

/* ================= MIDDLEWARE ================= */
app.use(cors({
  origin: "*"
}));
app.use(express.json());

/* ================= DATABASE ================= */
mongoose.connect(process.env.MONGO_URI)
  .then(() => console.log("MongoDB connected"))
  .catch(err => console.log(err));

/* ================= MODELS ================= */
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

/* ================= AUTH ================= */
const auth = (req, res, next) => {
  const token = req.headers.authorization;

  if (!token) return res.status(401).json({ message: "No token" });

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET || "secretkey");
    req.userId = decoded.id;
    next();
  } catch (err) {
    res.status(401).json({ message: "Invalid token" });
  }
};

/* ================= AUTH ROUTES ================= */

// SIGNUP
app.post("/signup", async (req, res) => {
  const { name, email, password } = req.body;

  const hashed = await bcrypt.hash(password, 10);

  const user = new User({ name, email, password: hashed });
  await user.save();

  res.json({ message: "User created" });
});

// LOGIN
app.post("/login", async (req, res) => {
  const { email, password } = req.body;

  const user = await User.findOne({ email });

  if (!user) return res.json({ message: "User not found" });

  const match = await bcrypt.compare(password, user.password);

  if (!match) return res.json({ message: "Wrong password" });

  const token = jwt.sign(
    { id: user._id },
    process.env.JWT_SECRET || "secretkey"
  );

  res.json({ message: "Login success", token });
});

/* ================= JOB ROUTES ================= */

app.post("/add-job", auth, async (req, res) => {
  const job = new Job({
    userId: req.userId,
    ...req.body
  });

  await job.save();
  res.json(job);
});

app.get("/jobs", auth, async (req, res) => {
  const jobs = await Job.find({ userId: req.userId });
  res.json(jobs);
});

app.delete("/delete-job/:id", auth, async (req, res) => {
  await Job.findByIdAndDelete(req.params.id);
  res.json({ message: "Deleted" });
});

/* ================= AI ================= */
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
    res.status(500).json({ message: "AI error" });
  }
});

/* ================= START SERVER ================= */
app.listen(PORT, () => {
  console.log("Server running on", PORT);
});