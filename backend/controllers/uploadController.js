import { cloudinary } from "../config/cloudinary.js";

const getCloudinaryResourceType = (mimeType) => {
  if (mimeType.startsWith("video/")) {
    return "video";
  }

  if (mimeType === "application/pdf") {
    return "raw";
  }

  return "image";
};

const getDatabaseResourceType = (mimeType) => {
  if (mimeType.startsWith("video/")) {
    return "video";
  }

  if (mimeType === "application/pdf") {
    return "document";
  }

  return "image";
};

const createDataUri = (file) => {
  const encodedFile = file.buffer.toString("base64");

  return `data:${file.mimetype};base64,${encodedFile}`;
};

/*
  Add Cloudinary's attachment delivery flag.

  Normal URL:
  /image/upload/folder/file.jpg

  Download URL:
  /image/upload/fl_attachment/folder/file.jpg
*/
const createDownloadUrl = (cloudinaryUrl) => {
  if (!cloudinaryUrl || !cloudinaryUrl.includes("/upload/")) {
    return cloudinaryUrl;
  }

  return cloudinaryUrl.replace("/upload/", "/upload/fl_attachment/");
};

/*
  Upload one complaint evidence file.

  POST /api/uploads/evidence

  multipart/form-data:
  evidence: selected file
*/
export const uploadComplaintEvidence = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: "Please select an evidence file",
      });
    }

    const resourceType = getCloudinaryResourceType(req.file.mimetype);

    const fileDataUri = createDataUri(req.file);

    const uploadResult = await cloudinary.uploader.upload(fileDataUri, {
      folder: "resolveai/complaint-evidence",

      resource_type: resourceType,

      use_filename: true,

      unique_filename: true,

      overwrite: false,
    });

    const downloadUrl = createDownloadUrl(uploadResult.secure_url);

    return res.status(201).json({
      success: true,
      message: "Evidence uploaded successfully",

      evidence: {
        url: downloadUrl,

        publicId: uploadResult.public_id,

        originalName: req.file.originalname,

        resourceType: getDatabaseResourceType(req.file.mimetype),
      },
    });
  } catch (error) {
    console.error("Evidence upload error:", error);

    return res
      .status(
        error.http_code && error.http_code >= 400 && error.http_code < 500
          ? error.http_code
          : 500,
      )
      .json({
        success: false,

        message:
          error.message || "Unable to upload evidence. Please try again.",
      });
  }
};
