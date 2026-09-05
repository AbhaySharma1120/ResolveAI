import Complaint from "../models/Complaint.js";

import {
  analyzeComplaintWithGemini,
  generateRoleChatResponse,
} from "../services/geminiService.js";

const allowedCategories = [
  "Network",
  "Electrical",
  "Civil",
  "Sanitation",
  "Hostel",
];

const determineFallbackPriority = (title, description) => {
  const complaintText = `${title} ${description}`.toLowerCase();

  const criticalWords = [
    "fire",
    "electric shock",
    "short circuit",
    "burning smell",
    "collapsed",
    "emergency",
    "dangerous",
    "injury",
    "sparking",
  ];

  const highPriorityWords = [
    "not working",
    "leakage",
    "no water",
    "power failure",
    "unsafe",
    "blocked",
    "broken",
  ];

  if (criticalWords.some((word) => complaintText.includes(word))) {
    return "Critical";
  }

  if (highPriorityWords.some((word) => complaintText.includes(word))) {
    return "High";
  }

  return "Medium";
};

const sanitizeHistory = (history) => {
  if (!Array.isArray(history)) {
    return [];
  }

  return history
    .filter((item) => item && typeof item.text === "string")
    .slice(-8)
    .map((item) => ({
      sender: item.sender === "ai" ? "ai" : "user",

      text: item.text.trim().slice(0, 1000),
    }));
};

const findTrackingId = (message) => {
  const match = message.match(/RA-\d{4}-[A-Z0-9]+/i);

  return match ? match[0].toUpperCase() : null;
};

/*
  POST /api/ai/complaint-review
*/
export const reviewComplaint = async (req, res) => {
  try {
    const { title, description, category, campusArea, specificArea } = req.body;

    if (!title || !description || !category || !campusArea || !specificArea) {
      return res.status(400).json({
        success: false,

        message: "Title, description, category and location are required",
      });
    }

    if (!allowedCategories.includes(category)) {
      return res.status(400).json({
        success: false,

        message: "Please select a valid complaint category",
      });
    }

    const normalizedTitle = title.trim();

    const normalizedDescription = description.trim();

    const normalizedCampusArea = campusArea.trim();

    const normalizedSpecificArea = specificArea.trim();

    if (normalizedTitle.length < 5) {
      return res.status(400).json({
        success: false,

        message: "Complaint title must contain at least 5 characters",
      });
    }

    if (normalizedDescription.length < 10) {
      return res.status(400).json({
        success: false,

        message: "Complaint description must contain at least 10 characters",
      });
    }

    const fallbackPriority = determineFallbackPriority(
      normalizedTitle,
      normalizedDescription,
    );

    const duplicateCandidates = await Complaint.find({
      status: {
        $nin: ["Resolved", "Rejected"],
      },

      $or: [
        {
          category,
        },
        {
          "location.campusArea": normalizedCampusArea,
        },
      ],
    })
      .select(
        "trackingId title description category location status student createdAt",
      )
      .sort({
        createdAt: -1,
      })
      .limit(8)
      .lean();

    const analysis = await analyzeComplaintWithGemini({
      title: normalizedTitle,

      description: normalizedDescription,

      selectedCategory: category,

      campusArea: normalizedCampusArea,

      specificArea: normalizedSpecificArea,

      fallbackPriority,

      duplicateCandidates,
    });

    const duplicateComplaint = duplicateCandidates.find(
      (candidate) => candidate.trackingId === analysis.duplicateTrackingId,
    );

    return res.status(200).json({
      success: true,

      message: "AI review generated successfully",

      analysis: {
        summary: analysis.summary,

        suggestedCategory: analysis.suggestedCategory,

        suggestedPriority: analysis.suggestedPriority,

        suggestedDepartment: analysis.suggestedDepartment,

        confidence: analysis.confidence,

        possibleDuplicate: Boolean(duplicateComplaint),

        duplicateComplaint: duplicateComplaint
          ? {
              trackingId: duplicateComplaint.trackingId,

              title: duplicateComplaint.title,

              category: duplicateComplaint.category,

              status: duplicateComplaint.status,

              location: duplicateComplaint.location,
            }
          : null,
      },
    });
  } catch (error) {
    console.error("AI complaint review error:", error);

    return res.status(500).json({
      success: false,

      message: "Unable to generate AI complaint review",
    });
  }
};

/*
  POST /api/ai/chat
  Student and Officer
*/
export const chatWithAssistant = async (req, res) => {
  try {
    const { message, history = [] } = req.body;

    if (!message || typeof message !== "string" || !message.trim()) {
      return res.status(400).json({
        success: false,

        message: "Please enter a message",
      });
    }

    const cleanMessage = message.trim();

    if (cleanMessage.length > 1000) {
      return res.status(400).json({
        success: false,

        message: "Message cannot exceed 1000 characters",
      });
    }

    const role = req.user.role;

    if (!["student", "officer"].includes(role)) {
      return res.status(403).json({
        success: false,

        message: "This AI assistant is available only to Students and Officers",
      });
    }

    const complaintFilter =
      role === "student"
        ? {
            student: req.user._id,
          }
        : {
            assignedOfficer: req.user._id,
          };

    const complaints = await Complaint.find(complaintFilter)
      .select(
        "trackingId title description category priority status department location aiAnalysis createdAt updatedAt resolvedAt",
      )
      .sort({
        updatedAt: -1,
      })
      .limit(15)
      .lean();

    const requestedTrackingId = findTrackingId(cleanMessage);

    if (
      requestedTrackingId &&
      !complaints.some(
        (complaint) => complaint.trackingId === requestedTrackingId,
      )
    ) {
      const requestedComplaint = await Complaint.findOne({
        ...complaintFilter,

        trackingId: requestedTrackingId,
      })
        .select(
          "trackingId title description category priority status department location aiAnalysis createdAt updatedAt resolvedAt",
        )
        .lean();

      if (requestedComplaint) {
        complaints.unshift(requestedComplaint);
      }
    }

    const answer = await generateRoleChatResponse({
      role,

      userName: req.user.name,

      message: cleanMessage,

      history: sanitizeHistory(history),

      complaints,
    });

    return res.status(200).json({
      success: true,
      answer,
    });
  } catch (error) {
    console.error("AI assistant chat error:", error);

    return res.status(500).json({
      success: false,

      message: "The AI assistant is temporarily unavailable. Please try again.",
    });
  }
};
