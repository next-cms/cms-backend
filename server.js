/* =============================
        Import All
================================ */
const apiRoutes = require("./api/routes/apiRoutes");
const authRoutes = require("./api/routes/authRoutes");
const mongoose = require("./config/mongoDBConfig");
const { verifyToken } = require("./helpers/securityUtils");

const express = require("express");
const cors = require('cors');

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

// Enable all cors
app.use(cors());

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

// Test Route
app.post("/uploads", (req, res) => {

        // console.log(req)

        return res.status(200).json({
                status: "success",
                message: "successfully added image.",
                link: "/uploads/2019-04-30T04:37:58.467Zwith-search.png"
        });
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
