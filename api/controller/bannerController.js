// Import Banner Model
const Banner = require("../model/bannerModel");

// Find All Banners
exports.findAllBanners = (req, res) => {
  Banner.getAllBanners((err, banners) => {
    return err
      ? res.status(500).json({
          status: "error",
          message: err
        })
      : res.json({
          status: "success",
          message: "Banners retrieved successfully!",
          data: banners
        });
  });
};

// Save Banner
exports.saveBanner = (req, res) => {
  let banner = new Banner(req.body);
  banner.image = req.file.path;

  banner.save(function(err) {
    if (err) {
      return res.status(400).json({
        status: "error",
        message: Object.values(err.errors)[0].message
      });
    }

    return res.status(201).json({
      status: "success",
      message: "New Banner created!",
      Banner: banner
    });
  });
};

// Find By Id
exports.findBannerById = (req, res) => {
  const id = req.params.id;
  Banner.findById(id, (err, banner) => {
    if (err)
      return res.status(400).json({
        status: "error",
        message: err
      });

    return !banner
      ? res.status(400).json({
          status: "error",
          message: `Banner not found by id = ${id}`
        })
      : res.json({
          status: "success",
          message: "Successfully retrieved individual Banner.",
          Banner: banner
        });
  });
};

// Delete By Id
exports.deleteById = (req, res) => {
  const id = req.params.id;
  Banner.findByIdAndDelete(id, (err, banner) => {
    if (err)
      return res.status(400).json({
        status: "error",
        message: err
      });

    return !banner
      ? res.status(400).json({
          status: "error",
          message: `Banner not found by id = ${id}`
        })
      : res.json({
          status: "success",
          message: "Successfully deleted individual Banner."
        });
  });
};

// Update Banner
exports.updateBanner = (req, res) => {
  const id = req.params.id;
  const validationError = new Banner(req.body).validateSync();

  // If not valid
  if (validationError) return res.status(400).json(validationError);
  else
    Banner.findByIdAndUpdate(id, req.body, { new: true }, (err, banner) => {
      if (err)
        return res.status(400).json({
          status: "error",
          message: err
        });

      return !banner
        ? res.status(400).json({
            status: "error",
            message: `Banner not found by id = ${id}`
          })
        : res.json({
            status: "success",
            message: "Successfully updated individual Banner.",
            Banner: banner
          });
    });
};
