const router = require("express").Router();
const userController = require("../controller/authController");

// Default Route
router.get("/", (req, res) => {
  res.send("From auth route.");
});

/* ============================== 
            Model Routes
================================= */

// User Route
router
  .route("/signup")
  // .get(pageController.findAllPages)
  .post(userController.saveUser);

router.route("/login").post(userController.login);

// Export Api Routes
module.exports = router;
