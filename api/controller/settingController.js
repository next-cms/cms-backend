// Import Setting Model
const Setting = require("../model/settingModel");

// Find All Settings
exports.findAllSettings = (req, res) => {
  Setting.getAllSettings((err, settings) => {
    return err
      ? res.status(500).json({
          status: "error",
          message: err
        })
      : res.json({
          status: "success",
          message: "Settings retrieved successfully!",
          data: settings
        });
  });
};

// Save Setting
exports.saveSetting = (req, res) => {
  const setting = new Setting(req.body);

  setting.save(function(err) {
    if (err) {
      return res.status(400).json({
        status: "error",
        message: Object.values(err.errors)[0].message
      });
    }

    return res.status(201).json({
      status: "success",
      message: "New Setting created!",
      Setting: setting
    });
  });
};

// Find By Id
exports.findSettingById = (req, res) => {
  const id = req.params.id;
  Setting.findById(id, (err, setting) => {
    if (err)
      return res.status(400).json({
        status: "error",
        message: err
      });

    return !Setting
      ? res.status(400).json({
          status: "error",
          message: `Setting not found by id = ${id}`
        })
      : res.json({
          status: "success",
          message: "Successfully retrieved individual Setting.",
          Setting: setting
        });
  });
};

// Delete By Id
exports.deleteById = (req, res) => {
  const id = req.params.id;
  Setting.findByIdAndDelete(id, (err, setting) => {
    if (err)
      return res.status(400).json({
        status: "error",
        message: err
      });

    return !setting
      ? res.status(400).json({
          status: "error",
          message: `Setting not found by id = ${id}`
        })
      : res.json({
          status: "success",
          message: "Successfully deleted individual Setting."
        });
  });
};

// Update Setting
exports.updateSetting = (req, res) => {
  const id = req.params.id;
  const validationError = new Setting(req.body).validateSync();

  // If not valid
  if (validationError) return res.status(400).json(validationError);
  else
    Setting.findByIdAndUpdate(id, req.body, { new: true }, (err, setting) => {
      if (err)
        return res.status(400).json({
          status: "error",
          message: err
        });

      return !setting
        ? res.status(400).json({
            status: "error",
            message: `Setting not found by id = ${id}`
          })
        : res.json({
            status: "success",
            message: "Successfully updated individual Setting.",
            Setting: setting
          });
    });
};
