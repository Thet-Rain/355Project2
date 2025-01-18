const express = require("express");
const cors = require("cors");

const questionRoutes = require("./routes/questionRoutes");

const app = express();
const PORT = 3000;

// Middleware
app.use(cors());
app.use(express.json());

// Serve static files from the "public" folder
app.use(express.static("public"));

// Use the question routes
app.use("/api/questions", questionRoutes);

// Start the server
app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
});