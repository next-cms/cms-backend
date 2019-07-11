// Import Page Model
const Page = require("../model/Page");

// Find All Pages
exports.findAllPages = (req, res) => {
  Page.getAllPages((err, pages) => {
    return err
      ? res.status(500).json({
          status: "error",
          message: err
        })
      : res.json({
          status: "success",
          message: "Pages retrieved successfully!",
          data: pages
        });
  });
};

// Save Page
exports.savePage = (req, res) => {
  const page = new Page(req.body);

  page.save(function(err) {
    if (err) {
      return res.status(400).json({
        status: "error",
        message: err.errors
      });
    }

    return res.status(201).json({
      status: "success",
      message: "New page created!",
      page: page
    });
  });
};

// Find By Id
exports.findPageById = (req, res) => {
  const id = req.params.id;
  Page.findById(id, (err, page) => {
    if (err)
      return res.status(400).json({
        status: "error",
        message: err
      });

    return !page
      ? res.status(400).json({
          status: "error",
          message: `Page not found by id = ${id}`
        })
      : res.json({
          status: "success",
          message: "Successfully retrieved individual page.",
          page: page
        });
  });
};

// Delete By Id
exports.deleteById = (req, res) => {
  const id = req.params.id;
  Page.findByIdAndDelete(id, (err, page) => {
    if (err)
      return res.status(400).json({
        status: "error",
        message: err
      });

    return !page
      ? res.status(400).json({
          status: "error",
          message: `Page not found by id = ${id}`
        })
      : res.json({
          status: "success",
          message: "Successfully deleted individual page."
        });
  });
};

// Update Page
exports.updatePage = (req, res) => {
  const id = req.params.id;
  const validationError = new Page(req.body).validateSync();

  // If not valid
  if (validationError) return res.status(400).json(validationError);
  else
    Page.findByIdAndUpdate(id, req.body, { new: true }, (err, page) => {
      if (err)
        return res.status(400).json({
          status: "error",
          message: err
        });

      return !page
        ? res.status(400).json({
            status: "error",
            message: `Page not found by id = ${id}`
          })
        : res.json({
            status: "success",
            message: "Successfully updated individual page.",
            page: page
          });
    });
};
