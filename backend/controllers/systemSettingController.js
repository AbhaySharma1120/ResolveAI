import SystemSetting from "../models/SystemSetting.js";

const defaultSettings = {
  autoClassification: true,
  duplicateDetection: true,
  autoAssignment: false,
  humanReview: true,
};

/*
  Get the global ResolveAI system settings.
  GET /api/system-settings
*/
export const getSystemSettings = async (req, res) => {
  try {
    let settings = await SystemSetting.findOne({
      key: "resolveai-system",
    }).populate("updatedBy", "name email");

    /*
      Create the default document the first
      time this endpoint is requested.
    */
    if (!settings) {
      settings = await SystemSetting.create({
        key: "resolveai-system",
        ...defaultSettings,
        updatedBy: req.user._id,
      });

      settings = await SystemSetting.findById(settings._id).populate(
        "updatedBy",
        "name email",
      );
    }

    return res.status(200).json({
      success: true,

      settings: {
        autoClassification: settings.autoClassification,

        duplicateDetection: settings.duplicateDetection,

        autoAssignment: settings.autoAssignment,

        humanReview: settings.humanReview,

        updatedAt: settings.updatedAt,
        updatedBy: settings.updatedBy,
      },
    });
  } catch (error) {
    console.error("Get system settings error:", error);

    return res.status(500).json({
      success: false,
      message: "Unable to retrieve system settings",
    });
  }
};

/*
  Update the global ResolveAI system settings.
  PUT /api/system-settings
*/

export const updateSystemSettings = async (req, res) => {
  try {
    const allowedSettings = [
      "autoClassification",
      "duplicateDetection",
      "autoAssignment",
      "humanReview",
    ];

    const updates = {};

    allowedSettings.forEach((settingName) => {
      if (typeof req.body[settingName] === "boolean") {
        updates[settingName] = req.body[settingName];
      }
    });

    if (Object.keys(updates).length === 0) {
      return res.status(400).json({
        success: false,
        message: "Please provide at least one valid system setting",
      });
    }

    let settings = await SystemSetting.findOne({
      key: "resolveai-system",
    });

    /*
      Create the settings document if it
      does not exist yet.
    */
    if (!settings) {
      settings = new SystemSetting({
        key: "resolveai-system",
        ...defaultSettings,
      });
    }

    /*
      Apply the received switch values.
    */
    allowedSettings.forEach((settingName) => {
      if (typeof updates[settingName] === "boolean") {
        settings[settingName] = updates[settingName];
      }
    });

    settings.updatedBy = req.user._id;

    await settings.save();

    await settings.populate("updatedBy", "name email");

    return res.status(200).json({
      success: true,
      message: "System settings updated successfully",

      settings: {
        autoClassification: settings.autoClassification,

        duplicateDetection: settings.duplicateDetection,

        autoAssignment: settings.autoAssignment,

        humanReview: settings.humanReview,

        updatedAt: settings.updatedAt,
        updatedBy: settings.updatedBy,
      },
    });
  } catch (error) {
    console.error("Update system settings error:", error);

    return res.status(500).json({
      success: false,
      message: "Unable to update system settings",
    });
  }
};
