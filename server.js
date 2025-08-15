import express from "express";
import { db } from "./db/connection.js";
import interviewRouter from "./routes/interviewRoute.js";
import redis from "./utils/redisClient.js";
import cors from "cors";

const app = express();
const port = 4566;

// Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// CORS setup
const corsOptions = {
  origin: process.env.clientURL, // no trailing slash in .env
  methods: ["GET", "POST"],
  credentials: true,
};

app.use(cors(corsOptions));       // handle actual requests
app.options("*", cors(corsOptions)); // handle preflight requests

// Routes
app.use("/interview", interviewRouter);

//Jobs import
import "./jobs/index.js";

// Simple home route
app.get("/", (req, res) => {
  res.send("Hello World!");
});

// Global error handler
app.use((err, req, res, next) => {
  console.error("Error:", err);
  res.status(500).send("Internal Server Error");
});

// Start the server
app
  .listen(port, () => {
    console.log(`Server is running on port ${port}`);
  })
  .on("error", (err) => {
    console.error(`Error starting server: ${err.message}`);
  });
