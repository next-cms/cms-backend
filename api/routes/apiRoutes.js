const router = require("express").Router();
const pageController = require("../controller/pageController");
const bannerController = require("../controller/bannerController");
const settingController = require("../controller/settingController");
const multer = require("multer");

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, "./uploads/");
  },
  filename: (req, file, cb) => {
    cb(null, new Date().toISOString() + file.originalname);
  }
});

const imageFilter = (req, file, cb) => {
  // accept image only
  if (!file.originalname.match(/\.(jpg|jpeg|png|gif)$/)) {
    return cb(new Error("Only image files are allowed!"), false);
  }
  cb(null, true);
};

const upload = multer({
  storage: storage,
  limits: {
    fileSize: 1024 * 1024 * 5
  },
  fileFilter: imageFilter
});

// const upload = multer({ dest: "uploads/" });

// Default Route
router.get("/", (req, res) => {
  res.send("From api route.");
});

/* ============================== 
            Model Routes
================================= */

// Page Route
router
  .route("/pages")
  .get(pageController.findAllPages)
  .post(pageController.savePage);

router
  .route("/pages/:id")
  .get(pageController.findPageById)
  .delete(pageController.deleteById)
  .put(pageController.updatePage);

// Banner Route
router
  .route("/banners")
  .get(bannerController.findAllBanners)
  .post(upload.single("bannerImage"), bannerController.saveBanner);

router
  .route("/banners/:id")
  .get(bannerController.findBannerById)
  .delete(bannerController.deleteById)
  .put(bannerController.updateBanner);

// Setting Route
router
  .route("/settings")
  .get(settingController.findAllSettings)
  .post(settingController.saveSetting);

router
  .route("/settings/:id")
  .get(settingController.findSettingById)
  .delete(settingController.deleteById)
  .put(settingController.updateSetting);

// Export Api Routes
module.exports = router;
