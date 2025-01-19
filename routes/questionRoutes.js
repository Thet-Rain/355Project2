const express = require("express");
const fs = require("fs");
const path = require("path");
const router = express.Router();

// Helper function to read the leaderboard JSON file
const getLeaderboard = () => {
const filePath = path.join(__dirname, "../data/leaderboard.json");
const data = fs.readFileSync(filePath, "utf-8");
return JSON.parse(data);
};
  
// Helper function to save the leaderboard JSON file
const saveLeaderboard = (leaderboard) => {
const filePath = path.join(__dirname, "../data/leaderboard.json");
fs.writeFileSync(filePath, JSON.stringify(leaderboard, null, 2), "utf-8");
};

// Helper function to read questions from the JSON file
const getQuestions = () => {
const filePath = path.join(__dirname, "../data/questions.json");
const data = fs.readFileSync(filePath, "utf-8");
return JSON.parse(data);
};

// In-memory score storage and Leader board(reset when server restarts)
let score = 0;
const leaderboard = [];

// Route to get a random question
router.get("/", (req, res) => {
  const questions = getQuestions();
  const randomIndex = Math.floor(Math.random() * questions.length);

  // Format question for frontend
  const question = questions[randomIndex];
  res.json({
    question: question.question,
    choices: {
      A: question.A,
      B: question.B,
      C: question.C,
      D: question.D,
    },
    id: randomIndex, // Send index to identify the question
  });
});

// Route to submit an answer
router.post("/answer", (req, res) => {
  const { questionId, answer } = req.body; // Expecting JSON payload
  const questions = getQuestions();

  if (!questions[questionId]) {
    return res.status(404).json({ message: "Question not found" });
  }

  const correctAnswer = questions[questionId].answer;

  if (answer === correctAnswer) {
    score += 1; // Increment score if the answer is correct
    res.json({ correct: true, score });
  } else {
    res.json({ correct: false, score });
  }
});

// Route to get the current score
router.get("/score", (req, res) => {
  res.json({ score });
});

// **Route to reset the score**
router.post("/reset", (req, res) => {
    score = 0; // Reset the score to 0
    res.json({ message: "Score has been reset.", score });
  });

// Route to get the leaderboard
router.get("/leaderboard", (req, res) => {
const leaderboard = getLeaderboard();
res.json(leaderboard);
});
  
// Route to add a new entry to the leaderboard
router.post("/leaderboard", (req, res) => {
const { name } = req.body;
  
if (!name || typeof name !== "string") {
    return res.status(400).json({ message: "Invalid name provided." });
}
  
const leaderboard = getLeaderboard();
console.log(score);  
leaderboard.push({ name, score });
leaderboard.sort((a, b) => b.score - a.score); // Sort by score descending
leaderboard.splice(10); // Keep only the top 10
console.log(leaderboard);
  
saveLeaderboard(leaderboard);
  
res.json({ message: "Leaderboard updated.", leaderboard });
});

module.exports = router;
