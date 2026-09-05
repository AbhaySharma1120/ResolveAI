import express from "express";
import multer from "multer";

import {
  uploadComplaintEvidence,
} from "../controllers/uploadController.js";

import {
  authorizeRoles,
  protect,
} from "../middleware/authMiddleware.js";

import uploadEvidence from "../middleware/uploadMiddleware.js";

const router = express.Router();

router.use(protect);

/*
  Student complaint evidence upload.
*/
router.post(
  "/evidence",
  authorizeRoles("student"),
  (req, res, next) => {
    uploadEvidence.single("evidence")(
      req,
      res,
      (error) => {
        if (!error) {
          next();
          return;
        }

        if (error instanceof multer.MulterError) {
          if (error.code === "LIMIT_FILE_SIZE") {
            return res.status(400).json({
              success: false,
              message:
                "Evidence file cannot exceed 20 MB",
            });
          }

          return res.status(400).json({
            success: false,
            message:
              error.message ||
              "Unable to process evidence file",
          });
        }

        return res.status(400).json({
          success: false,
          message:
            error.message ||
            "Invalid evidence file",
        });
      },
    );
  },
  uploadComplaintEvidence,
);

export default router;