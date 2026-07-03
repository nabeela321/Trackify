require("dotenv").config();
const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const { google } = require("googleapis");
const fs = require("fs");
const path = require("path");
const multer = require("multer");
const pdfParse = require("pdf-parse");
const { GoogleGenerativeAI } = require("@google/generative-ai");

const upload = multer({ dest: "uploads/" });
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || "dummy-key");


const app = express();

let webpush = null;
try {
  webpush = require("web-push");
  webpush.setVapidDetails(
    'mailto:test@example.com',
    process.env.VAPID_PUBLIC_KEY,
    process.env.VAPID_PRIVATE_KEY
  );
} catch (err) {
  console.log("web-push module not found. Push notifications will be disabled.");
}



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
  password: String,
  googleRefreshToken: String,
  googleAccessToken: String,
  avatarUrl: String // for profile
});

const Job = mongoose.model("Job", {
  userId: String,
  company: String,
  role: String,
  status: String,
  subject: String,
  date: String,
  messageId: String,
  sender: String,
  source: String,
  interviewDate: String,
  isAssessment: Boolean,
  offerExpiry: String,
  submissionDeadline: String,
  joiningDate: String,
  notes: String,
  checklist: [String],
  bookmarks: [String],
  // Company Info
  website: String,
  logo: String,
  industry: String,
  glassdoor: String,
  linkedin: String,
  jobDescription: String,
  resumeUsed: String
});

const Reminder = mongoose.model("Reminder", {
  userId: String,
  jobId: String,
  title: String,
  description: String,
  reminderDate: Date,
  completed: { type: Boolean, default: false },
  createdAt: { type: Date, default: Date.now },
  isAuto: { type: Boolean, default: false },
  // Deadline specific fields
  deadlineType: String,
  company: String,
  role: String,
  deadline: String,
  emailSubject: String,
  messageId: String,
  status: String
});

const PushSubscription = mongoose.model("PushSubscription", {
  userId: String,
  endpoint: String,
  expirationTime: String,
  keys: {
    p256dh: String,
    auth: String
  }
});

const Notification = mongoose.model("Notification", {
  userId: String,
  title: String,
  body: String,
  date: String,
  read: { type: Boolean, default: false },
  type: String
});

const InterviewPrepProgress = mongoose.model("InterviewPrepProgress", {
  userId: String,
  completedTopics: [String],
  solvedCoding: [String],
  bookmarkedQuestions: [String],
  mockInterviews: [{
    date: Date,
    score: Number,
    total: Number
  }]
});

const AiInterviewSession = mongoose.model("AiInterviewSession", {
  userId: String,
  setup: {
    role: String,
    company: String,
    tech: String,
    type: { type: String }, // Prevents Mongoose from confusing this with a schema type configuration
    experience: String,
    resumeText: String
  },
  history: [{
    role: String, // 'model' or 'user'
    text: String,
    score: Number,
    feedback: String,
    strengths: String,
    weaknesses: String,
    betterAnswer: String
  }],
  finalReport: {
    overallScore: Number,
    technicalScore: Number,
    communicationScore: Number,
    confidenceScore: Number,
    weakAreas: [String],
    strongAreas: [String],
    topicsToRevise: [String],
    feedback: String
  },
  status: { type: String, default: "in-progress" }, // "in-progress" | "completed"
  createdAt: { type: Date, default: Date.now }
});

const AtsScanResult = mongoose.model("AtsScanResult", {
  userId: String,
  jobTitle: String,
  company: String,
  atsScore: Number,
  matchingKeywords: [String],
  missingKeywords: [String],
  feedback: String,
  createdAt: { type: Date, default: Date.now }
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

// ================= GOOGLE GMAIL OAUTH =================

const oauth2Client = new google.auth.OAuth2(
  process.env.GOOGLE_CLIENT_ID,
  process.env.GOOGLE_CLIENT_SECRET,
  "postmessage" // Required for @react-oauth/google auth-code flow
);

// Handle Callback
app.post("/auth/google/callback", auth, async (req, res) => {
  console.log("--- GOOGLE CALLBACK STARTED ---");
  const { code } = req.body;
  console.log("1. JWT req.userId:", req.userId);

  try {
    const { tokens } = await oauth2Client.getToken(code);
    console.log("2. Tokens received from Google:", Object.keys(tokens));

    // Update object: Always save the access_token. 
    // Only save refresh_token if Google sent one.
    const updateData = { googleAccessToken: tokens.access_token };
    if (tokens.refresh_token) {
      updateData.googleRefreshToken = tokens.refresh_token;
    }
    
    console.log("3. updateData to save:", Object.keys(updateData));

    const updatedUser = await User.findByIdAndUpdate(
      req.userId, 
      updateData, 
      { new: true } // Returns the updated document
    );
    
    console.log("4. Updated User in DB:", updatedUser ? `Found User: ${updatedUser.email}` : "NULL/NOT FOUND");

    if (!updatedUser) {
      console.log("❌ ERROR: No user found in DB for ID:", req.userId);
      return res.status(404).send({ message: "User not found in database" });
    }

    res.send({ message: "Gmail connected successfully!" });
  } catch (error) {
    console.error("Google Auth Error:", error);
    res.status(500).send({ message: "Failed to connect Gmail" });
  }
});

// Helper to parse complex dates
function extractSmartDate(text) {
  const strictDateRegex = /\b(\d{1,2}\s+(?:jan|feb|mar|apr|may|jun|jul|aug|sep|oct|nov|dec)[a-z]*\s+\d{4}|\d{1,2}\/\d{1,2}\/\d{2,4}|(?:jan|feb|mar|apr|may|jun|jul|aug|sep|oct|nov|dec)[a-z]*\s+\d{1,2}(?:st|nd|rd|th)?)\b/i;
  const relativeDateRegex = /\b(tomorrow|today|next\s+(?:monday|tuesday|wednesday|thursday|friday|saturday|sunday)|(?:monday|tuesday|wednesday|thursday|friday|saturday|sunday))\b/i;
  const timeRegex = /\b(\d{1,2}(?::\d{2})?\s*(?:am|pm)\s*(?:ist|gmt|est|pst)?|\d{1,2}\s*(?:am|pm))\b/i;

  let finalDate = new Date();
  let foundDate = false;

  const strictMatch = text.match(strictDateRegex);
  if (strictMatch) {
    const parsed = new Date(strictMatch[1] + (strictMatch[1].match(/\d{4}/) ? "" : " " + new Date().getFullYear()));
    if (!isNaN(parsed.getTime())) {
      finalDate = parsed;
      foundDate = true;
    }
  } else {
    const relMatch = text.match(relativeDateRegex);
    if (relMatch) {
      const relStr = relMatch[1].toLowerCase();
      if (relStr === "tomorrow") {
        finalDate.setDate(finalDate.getDate() + 1);
        foundDate = true;
      } else if (relStr === "today") {
        foundDate = true;
      } else {
        const days = ["sunday","monday","tuesday","wednesday","thursday","friday","saturday"];
        const dayMatch = days.find(d => relStr.includes(d));
        if (dayMatch) {
          const targetDay = days.indexOf(dayMatch);
          let currentDay = finalDate.getDay();
          let daysAhead = targetDay - currentDay;
          if (daysAhead <= 0 || relStr.includes("next")) daysAhead += 7;
          finalDate.setDate(finalDate.getDate() + daysAhead);
          foundDate = true;
        }
      }
    }
  }

  if (!foundDate) return null;

  const timeMatch = text.match(timeRegex);
  if (timeMatch) {
    const timeStr = timeMatch[1].toLowerCase();
    let hours = 12, mins = 0;
    const timeParts = timeStr.match(/(\d{1,2})(?::(\d{2}))?\s*(am|pm)?/);
    if (timeParts) {
      hours = parseInt(timeParts[1], 10);
      if (timeParts[2]) mins = parseInt(timeParts[2], 10);
      if (timeParts[3] === 'pm' && hours < 12) hours += 12;
      if (timeParts[3] === 'am' && hours === 12) hours = 0;
      finalDate.setHours(hours, mins, 0, 0);
    }
  } else {
    finalDate.setHours(10, 0, 0, 0); // 10 AM default
  }

  return finalDate;
}

// Sync Gmail
app.post("/sync-gmail", auth, async (req, res) => {
  console.log("--- SYNC GMAIL STARTED ---");
  console.log("JWT User ID:", req.userId);
  try {
    const user = await User.findById(req.userId);
    console.log("User found in DB:", !!user);
    console.log("Has Google Access Token:", !!user?.googleAccessToken);
    console.log("Has Google Refresh Token:", !!user?.googleRefreshToken);

    if (!user || (!user.googleRefreshToken && !user.googleAccessToken)) {
      return res.status(400).send({ message: "Gmail not connected" });
    }

    oauth2Client.setCredentials({ 
      access_token: user.googleAccessToken,
      refresh_token: user.googleRefreshToken 
    });
    const gmail = google.gmail({ version: "v1", auth: oauth2Client });

    // Fetch last 10 emails related to jobs
    const response = await gmail.users.messages.list({
      userId: "me",
      maxResults: 10,
      q: "subject:application OR subject:interview OR subject:offer OR subject:rejected OR subject:assessment OR subject:hackerrank OR subject:coderbyte"
    });

    const messages = response.data.messages || [];
    let newJobsCount = 0;

    for (let msg of messages) {
      const email = await gmail.users.messages.get({
        userId: "me",
        id: msg.id,
        format: "full"
      });

      const headers = email.data.payload.headers;
      const subject = headers.find(h => h.name === 'Subject')?.value || '';
      const from = headers.find(h => h.name === 'From')?.value || '';
      const date = headers.find(h => h.name === 'Date')?.value || '';
      const messageId = msg.id;
      const snippet = email.data.snippet || '';

      // Determine Status via Regex
      let status = "Applied";
      let isAssessment = false;
      const textToSearch = (subject + " " + snippet).toLowerCase();
      
      if (/assessment|hackerrank|coderbyte|test|take-home|challenge/i.test(textToSearch)) {
        status = "Interview";
        isAssessment = true;
      }
      else if (/interview/i.test(subject)) status = "Interview";
      else if (/reject|unfortunately/i.test(subject)) status = "Rejected";
      else if (/offer/i.test(subject)) status = "Offer";

      // Extract Company Name
      let company = "Unknown Company";
      const fromMatch = from.match(/^(.*?)\s*</);
      if (fromMatch && fromMatch[1]) {
        company = fromMatch[1].replace(/"/g, '').trim();
      } else {
        company = from; // Fallback
      }

      // Determine Source
      let source = "Email";
      const fromLower = from.toLowerCase();
      if (fromLower.includes("linkedin")) source = "LinkedIn";
      else if (fromLower.includes("internshala")) source = "Internshala";
      else if (fromLower.includes("indeed")) source = "Indeed";
      else if (fromLower.includes("naukri")) source = "Naukri";
      else if (fromLower.includes("wellfound") || fromLower.includes("angellist")) source = "Wellfound";

      // Extract Role from Subject
      let role = "Role from Email";
      const roleMatch = subject.match(/(?:for|position of|role of|application for)\s+([a-zA-Z\s,]+?)(?:\s+at|\s*-|\s*$)/i);
      if (roleMatch && roleMatch[1]) {
        role = roleMatch[1].trim();
      }

      // Extract Important Dates via Smart Detector
      const deadlines = [];

      const checkDeadline = (regex, type, text) => {
        if (regex.test(text)) {
          const extractedDate = extractSmartDate(text);
          if (extractedDate) {
            deadlines.push({ type, date: extractedDate });
          }
        }
      };

      // Interview Date
      if (status === "Interview") {
        checkDeadline(/interview|schedule|call/i, "Interview", textToSearch);
      }
      
      // Assessments & Tests
      checkDeadline(/assessment|test\s+deadline|complete\s+test/i, "Assessment", textToSearch);
      checkDeadline(/coding\s+test|hackerrank|coderbyte/i, "Coding Test", textToSearch);
      checkDeadline(/assignment|take-home|take\s+home/i, "Assignment", textToSearch);
      checkDeadline(/document\s+submission|submit\s+documents/i, "Document Submission", textToSearch);
      
      // Offer
      if (status === "Offer") {
        checkDeadline(/expir|valid until/i, "Offer Expiry", textToSearch);
        checkDeadline(/join|start date/i, "Joining Date", textToSearch);
      }

      // Fetch Company Info via Free Clearbit Autocomplete API
      let website = "";
      let logo = "";
      let industry = "";
      if (company && company !== "Unknown Company") {
        try {
          const cbRes = await fetch(`https://autocomplete.clearbit.com/v1/companies/suggest?query=${encodeURIComponent(company)}`);
          if (cbRes.ok) {
            const cbData = await cbRes.json();
            if (cbData && cbData.length > 0) {
              website = "https://" + cbData[0].domain;
              logo = cbData[0].logo;
            }
          }
        } catch (e) { console.error("Clearbit error", e); }
      }
      const glassdoor = `https://www.glassdoor.com/Search/results.htm?keyword=${encodeURIComponent(company)}`;
      const linkedinUrl = `https://www.linkedin.com/search/results/companies/?keywords=${encodeURIComponent(company)}`;

      // Avoid duplicates using messageId
      let existingJob = await Job.findOne({
        userId: req.userId,
        messageId: messageId
      });

      let jobId = existingJob ? existingJob._id : null;

      if (!existingJob) {
        const newJob = new Job({
          userId: req.userId,
          company,
          role, 
          status,
          subject,
          date,
          messageId,
          sender: from,
          source,
          website,
          logo,
          industry,
          glassdoor,
          linkedin: linkedinUrl
        });
        await newJob.save();
        jobId = newJob._id;
        newJobsCount++;

        // Push Notification & In-App Notification
        let notifTitle = "New Job Application Detected";
        let notifBody = `${company} - ${role}`;
        if (status === "Interview") { notifTitle = "Interview Detected!"; notifBody = `Interview or Assessment found for ${company}`; }
        if (status === "Offer") { notifTitle = "Offer Received! 🎉"; notifBody = `Offer detected from ${company}`; }

        await new Notification({ userId: req.userId, title: notifTitle, body: notifBody, date: new Date().toISOString(), type: status }).save();

        if (webpush) {
          const subs = await PushSubscription.find({ userId: req.userId });
          for (let sub of subs) {
            try {
              await webpush.sendNotification({ endpoint: sub.endpoint, keys: sub.keys }, JSON.stringify({ title: notifTitle, body: notifBody }));
            } catch (e) {
              console.error("Push Error", e);
            }
          }
        }
      }

      // Auto Reminders for Deadlines (Handles threads properly)
      for (const d of deadlines) {
        const reminderExists = await Reminder.findOne({ userId: req.userId, messageId: messageId, deadlineType: d.type });
        if (!reminderExists) {
          await new Reminder({
            userId: req.userId,
            jobId: jobId,
            title: `${d.type}: ${company}`,
            reminderDate: d.date,
            isAuto: true,
            deadlineType: d.type,
            company,
            role,
            deadline: d.date.toISOString(),
            emailSubject: subject,
            messageId,
            status
          }).save();
        }
      }
    }

    if (webpush && newJobsCount > 0) {
      const subs = await PushSubscription.find({ userId: req.userId });
      for (let sub of subs) {
        try {
          await webpush.sendNotification({ endpoint: sub.endpoint, keys: sub.keys }, JSON.stringify({ title: "Gmail Sync Completed", body: `Found ${newJobsCount} new updates.` }));
        } catch (e) { }
      }
    }

    res.send({ message: `Synced successfully! Found ${newJobsCount} new jobs.` });
  } catch (error) {
    console.error("Gmail Sync Error:", error);
    res.status(500).send({ message: "Failed to sync Gmail" });
  }
});

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

// GOOGLE LOGIN (Frontend AuthModal)
app.post("/google-login", async (req, res) => {
  const { code } = req.body;
  try {
    const { tokens } = await oauth2Client.getToken(code);
    oauth2Client.setCredentials(tokens);
    
    const oauth2 = google.oauth2({ version: 'v2', auth: oauth2Client });
    const userInfo = await oauth2.userinfo.get();
    
    let user = await User.findOne({ email: userInfo.data.email });
    
    if (!user) {
      user = new User({ 
        name: userInfo.data.name, 
        email: userInfo.data.email, 
        googleAccessToken: tokens.access_token,
        googleRefreshToken: tokens.refresh_token
      });
      await user.save();
    } else {
      user.googleAccessToken = tokens.access_token;
      if (tokens.refresh_token) user.googleRefreshToken = tokens.refresh_token;
      await user.save();
    }

    const token = jwt.sign({ id: user._id }, "secretkey");
    res.send({ message: "Login success", token });
  } catch (err) {
    console.error("Google login failed", err);
    res.status(500).send({ message: "Google login failed" });
  }
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

// ================= REMINDERS & NOTIFICATIONS =================

app.post("/subscribe", auth, async (req, res) => {
  const subscription = req.body;
  const existingSub = await PushSubscription.findOne({ endpoint: subscription.endpoint });
  
  if (!existingSub) {
    const sub = new PushSubscription({
      userId: req.userId,
      ...subscription
    });
    await sub.save();
  }
  res.status(201).json({});
});

app.post("/add-reminder", auth, async (req, res) => {
  try {
    const reminder = new Reminder({
      userId: req.userId,
      ...req.body
    });
    await reminder.save();
    res.status(201).send(reminder);
  } catch (error) {
    res.status(500).send({ message: "Error adding reminder" });
  }
});

app.get("/reminders", auth, async (req, res) => {
  try {
    const reminders = await Reminder.find({ userId: req.userId }).sort({ createdAt: -1 });
    res.send(reminders);
  } catch (error) {
    res.status(500).send({ message: "Error fetching reminders" });
  }
});

app.delete("/reminder/:id", auth, async (req, res) => {
  try {
    await Reminder.findByIdAndDelete(req.params.id);
    res.send({ message: "Reminder deleted" });
  } catch (error) {
    res.status(500).send({ message: "Error deleting reminder" });
  }
});

app.patch("/reminder/:id/complete", auth, async (req, res) => {
  try {
    const { completed } = req.body;
    await Reminder.findByIdAndUpdate(req.params.id, { completed });
    res.send({ message: "Reminder updated" });
  } catch (error) {
    res.status(500).send({ message: "Error completing reminder" });
  }
});

app.put("/reminder/:id", auth, async (req, res) => {
  try {
    await Reminder.findByIdAndUpdate(req.params.id, req.body);
    res.send({ message: "Reminder updated" });
  } catch (error) {
    res.status(500).send({ message: "Error updating reminder" });
  }
});

app.get("/notifications", auth, async (req, res) => {
  const notifs = await Notification.find({ userId: req.userId }).sort({ date: -1 });
  res.send(notifs);
});

app.patch("/read-notification/:id", auth, async (req, res) => {
  await Notification.findByIdAndUpdate(req.params.id, { read: true });
  res.send({ message: "Read" });
});

app.delete("/notifications", auth, async (req, res) => {
  await Notification.deleteMany({ userId: req.userId });
  res.send({ message: "Cleared" });
});

// ================= USER & PROFILE =================

app.put("/update-profile", auth, async (req, res) => {
  const { name, avatarUrl } = req.body;
  const user = await User.findByIdAndUpdate(req.userId, { name, avatarUrl }, { new: true });
  res.send({ message: "Profile updated", user });
});

app.get("/user", auth, async (req, res) => {
  const user = await User.findById(req.userId).select("-password -googleRefreshToken -googleAccessToken");
  res.send(user);
});

app.put("/job/:id", auth, async (req, res) => {
  const updated = await Job.findByIdAndUpdate(req.params.id, req.body, { new: true });
  res.send(updated);
});

// ================= AI & QUESTIONS =================

app.get("/api/questions/:role", auth, (req, res) => {
  try {
    const role = req.params.role.toLowerCase();
    const questionsPath = path.join(__dirname, "data", "questions.json");
    if (!fs.existsSync(questionsPath)) return res.json(null);
    const questions = JSON.parse(fs.readFileSync(questionsPath, "utf-8"));
    
    let matchedKey = "general";
    if (role.includes("front") || role.includes("react")) matchedKey = "frontend";
    else if (role.includes("back") || role.includes("node") || role.includes("python")) matchedKey = "backend";
    else if (role.includes("data") || role.includes("machine") || role.includes("ml")) matchedKey = "data";
    
    res.json(questions[matchedKey] || questions.general);
  } catch (err) {
    res.status(500).json({ message: "Error fetching questions" });
  }
});

// ================= INTERVIEW PREP HUB =================

app.get("/api/interview-hub/data", auth, (req, res) => {
  try {
    const dataPath = path.join(__dirname, "data", "interviewHubData.json");
    if (!fs.existsSync(dataPath)) return res.json(null);
    const data = JSON.parse(fs.readFileSync(dataPath, "utf-8"));
    res.json(data);
  } catch (err) {
    res.status(500).json({ message: "Error fetching interview data" });
  }
});

app.get("/api/interview-hub/progress", auth, async (req, res) => {
  try {
    let progress = await InterviewPrepProgress.findOne({ userId: req.userId });
    if (!progress) {
      progress = await InterviewPrepProgress.create({
        userId: req.userId,
        completedTopics: [],
        solvedCoding: [],
        bookmarkedQuestions: [],
        mockInterviews: []
      });
    }
    res.json(progress);
  } catch (err) {
    res.status(500).json({ message: "Error fetching progress" });
  }
});

app.put("/api/interview-hub/progress", auth, async (req, res) => {
  try {
    const { completedTopics, solvedCoding, bookmarkedQuestions, mockInterview } = req.body;
    let progress = await InterviewPrepProgress.findOne({ userId: req.userId });
    
    if (!progress) {
      progress = new InterviewPrepProgress({ userId: req.userId });
    }

    if (completedTopics !== undefined) progress.completedTopics = completedTopics;
    if (solvedCoding !== undefined) progress.solvedCoding = solvedCoding;
    if (bookmarkedQuestions !== undefined) progress.bookmarkedQuestions = bookmarkedQuestions;
    if (mockInterview) progress.mockInterviews.push(mockInterview);

    await progress.save();
    res.json(progress);
  } catch (err) {
    res.status(500).json({ message: "Error updating progress" });
  }
});

// ================= AI INTERVIEW COACH =================

app.post("/api/ai-coach/start", auth, async (req, res) => {
  try {
    const { role, company, tech, type, experience, resumeText } = req.body;
    
    // Initialize session
    const session = await AiInterviewSession.create({
      userId: req.userId,
      setup: { role, company, tech, type, experience, resumeText },
      history: [],
      status: "in-progress"
    });

    const prompt = `You are an expert technical interviewer for ${company || "a top tech company"}.
The candidate is applying for a ${role} role with ${experience} experience.
The interview type is ${type}. 
Technologies: ${tech}.
${resumeText ? `Here is the candidate's parsed resume text: ${resumeText}` : ""}

Start the interview by asking ONE single relevant and challenging question. Do not include any other text or pleasantries.`;

    const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" });
    const result = await model.generateContent(prompt);
    const question = result.response.text();

    session.history.push({ role: "model", text: question });
    await session.save();

    res.json(session);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Error starting AI session" });
  }
});

app.post("/api/ai-coach/answer", auth, async (req, res) => {
  try {
    const { sessionId, answer } = req.body;
    const session = await AiInterviewSession.findOne({ _id: sessionId, userId: req.userId });
    if (!session) return res.status(404).json({ message: "Session not found" });

    const lastQuestion = session.history[session.history.length - 1].text;
    
    const prompt = `You are the interviewer. 
Context: ${session.setup.role} at ${session.setup.company}, ${session.setup.type} interview.
The question you just asked was: "${lastQuestion}"
The candidate's answer was: "${answer}"

Evaluate the answer. Provide your response strictly in the following JSON format without any markdown wrappers (like \`\`\`json):
{
  "score": (number from 0 to 10),
  "feedback": "Overall brief feedback",
  "strengths": "What they did well",
  "weaknesses": "What they missed",
  "betterAnswer": "An example of a 10/10 answer",
  "nextQuestion": "The next single question to ask in the interview based on their performance or moving to a new topic."
}`;

    const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" });
    const result = await model.generateContent(prompt);
    const responseText = result.response.text().replace(/```json/g, '').replace(/```/g, '').trim();
    
    let evaluation;
    try {
      evaluation = JSON.parse(responseText);
    } catch (e) {
      console.error("Failed to parse Gemini response", responseText);
      return res.status(500).json({ message: "AI response parsing failed" });
    }

    // Save user's answer and its evaluation
    session.history.push({
      role: "user",
      text: answer,
      score: evaluation.score,
      feedback: evaluation.feedback,
      strengths: evaluation.strengths,
      weaknesses: evaluation.weaknesses,
      betterAnswer: evaluation.betterAnswer
    });

    // Save the next question
    session.history.push({
      role: "model",
      text: evaluation.nextQuestion
    });

    await session.save();
    res.json(session);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Error processing answer" });
  }
});

app.post("/api/ai-coach/end", auth, async (req, res) => {
  try {
    const { sessionId } = req.body;
    const session = await AiInterviewSession.findOne({ _id: sessionId, userId: req.userId });
    if (!session) return res.status(404).json({ message: "Session not found" });

    // Calculate averages
    const userAnswers = session.history.filter(h => h.role === "user");
    let avgScore = 0;
    if (userAnswers.length > 0) {
      avgScore = userAnswers.reduce((sum, a) => sum + a.score, 0) / userAnswers.length;
    }

    const prompt = `You are an expert interviewer. The interview is now complete. 
Here is the entire conversation:
${session.history.map(h => `${h.role === 'model' ? 'Interviewer' : 'Candidate'}: ${h.text}`).join('\n')}

Generate a final report. Provide your response strictly in the following JSON format without markdown wrappers:
{
  "technicalScore": (0-10 based on technical depth),
  "communicationScore": (0-10 based on clarity),
  "confidenceScore": (0-10 based on tone and structure),
  "weakAreas": ["topic 1", "topic 2"],
  "strongAreas": ["topic 1"],
  "topicsToRevise": ["specific concept to study"],
  "feedback": "Final concluding remarks"
}`;

    const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" });
    const result = await model.generateContent(prompt);
    const responseText = result.response.text().replace(/```json/g, '').replace(/```/g, '').trim();
    
    let report;
    try {
      report = JSON.parse(responseText);
    } catch (e) {
      console.error("Failed to parse report", responseText);
      report = { feedback: "Failed to generate comprehensive report." };
    }

    session.finalReport = { ...report, overallScore: Math.round(avgScore) };
    session.status = "completed";
    await session.save();

    res.json(session);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Error ending session" });
  }
});

app.get("/api/ai-coach/sessions", auth, async (req, res) => {
  try {
    const sessions = await AiInterviewSession.find({ userId: req.userId }).sort({ createdAt: -1 });
    res.json(sessions);
  } catch (err) {
    res.status(500).json({ message: "Error fetching sessions" });
  }
});

app.post("/api/ai-coach/parse-resume", auth, upload.single("resume"), async (req, res) => {
  try {
    if (!req.file) return res.status(400).json({ message: "No file uploaded" });
    const dataBuffer = fs.readFileSync(req.file.path);
    const data = await pdfParse(dataBuffer);
    fs.unlinkSync(req.file.path); // cleanup
    res.json({ text: data.text });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Error parsing resume" });
  }
});

// ================= ATS RESUME ANALYZER =================

app.post("/api/ats/scan", auth, upload.single("resume"), async (req, res) => {
  try {
    if (!req.file) return res.status(400).json({ message: "No resume uploaded" });
    const { jobDescription, jobTitle, company } = req.body;
    if (!jobDescription) {
      fs.unlinkSync(req.file.path);
      return res.status(400).json({ message: "Job description is required" });
    }

    // Parse PDF
    const dataBuffer = fs.readFileSync(req.file.path);
    const pdfData = await pdfParse(dataBuffer);
    const resumeText = pdfData.text;
    fs.unlinkSync(req.file.path); // cleanup

    // Prompt Gemini
    const prompt = `You are an expert ATS (Applicant Tracking System). 
Compare the following Resume to the Job Description.

Job Title: ${jobTitle || "Not specified"}
Company: ${company || "Not specified"}

Job Description:
${jobDescription}

Resume:
${resumeText}

Analyze the match and provide the result strictly in this JSON format without any markdown blocks:
{
  "atsScore": (0 to 100 representing the match percentage),
  "matchingKeywords": ["keyword1", "keyword2"],
  "missingKeywords": ["keyword3", "keyword4"],
  "feedback": "Actionable feedback on how to improve the resume for this job."
}`;

    const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" });
    const result = await model.generateContent(prompt);
    const responseText = result.response.text().replace(/```json/g, '').replace(/```/g, '').trim();
    
    let analysis;
    try {
      analysis = JSON.parse(responseText);
    } catch (e) {
      console.error("Failed to parse ATS response", responseText);
      return res.status(500).json({ message: "AI response parsing failed" });
    }

    // Save to DB
    const scanResult = await AtsScanResult.create({
      userId: req.userId,
      jobTitle: jobTitle || "Unknown Job",
      company: company || "Unknown Company",
      atsScore: analysis.atsScore,
      matchingKeywords: analysis.matchingKeywords,
      missingKeywords: analysis.missingKeywords,
      feedback: analysis.feedback
    });

    res.json(scanResult);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Error performing ATS scan" });
  }
});

app.get("/api/ats/history", auth, async (req, res) => {
  try {
    const history = await AtsScanResult.find({ userId: req.userId }).sort({ createdAt: -1 });
    res.json(history);
  } catch (err) {
    res.status(500).json({ message: "Error fetching ATS history" });
  }
});

// SERVER
app.listen(5000, () => {
  console.log("Server running on 5000");
});