/* =============================
        Import All
================================ */
const apiRoutes = require("./api/routes/apiRoutes");
const authRoutes = require("./api/routes/authRoutes");
const mongoose = require("./config/mongoDBConfig");
const { verifyToken } = require("./helpers/securityUtils");

const express = require("express");

/* =============================
        Initialize The App
================================ */
const app = express();

// can be use bodyparser

/* =============================
        Config Body Parser 
           (Middleware)
================================ */
app.use(express.json());

/* =============================
        Setup Database 
================================ */
const mongoDB = mongoose.connection;

/* =============================
        Middleware
================================ */
// Logging
app.use((req, res, next) => {
  console.log(`Logged  ${req.baseUrl}  ${req.method} -- ${new Date()}`);
  next();
});

// Authentication && Authrization
app.delete("/api/*", verifyToken);
app.post("/api/*", verifyToken);
app.put("/api/*", verifyToken);

/* =============================
        Setup Static File
================================*/
app.use("/uploads", express.static("uploads"));

/* =============================
        Setup Routes
================================ */

// Default Route
app.get("/", (req, res) => {
  res.send("Hello viva cms back end.");
});

// Auth Routes
app.use("/auth", authRoutes);

// API Routes
app.use("/api", apiRoutes);

/*==============================
        Setup Server Port
================================ */
let port = process.env.PORT || 3000;

/* =============================
        Launch App To Lister
                TO
        Specified Port
================================ */
app.listen(port, () => {
  console.log(`Runnig backend viva cms on port ${port}`);
});
