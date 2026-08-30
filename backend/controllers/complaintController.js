import Complaint from "../models/Complaint.js";
import User from "../models/User.js";

const departmentByCategory = {
  Network: "Network Team",
  Electrical: "Electrical Maintenance",
  Civil: "Civil Maintenance",
  Sanitation: "Sanitation Department",
  Hostel: "Hostel Administration",
};

/*
  Temporary rule-based priority recommendation.

  We will replace this with Gemini analysis later.
*/
const determinePriority = (title, description) => {
  const complaintText = `${title} ${description}`.toLowerCase();

  const criticalWords = [
    "fire",
    "electric shock",
    "short circuit",
    "collapsed",
    "emergency",
    "dangerous",
    "injury",
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

/*
  POST /api/complaints
  Student only
*/
export const createComplaint = async (req, res) => {
  try {
    const {
      title,
      description,
      category,
      campusArea,
      specificArea,
      evidence = [],
    } = req.body;

    if (!title || !description || !category || !campusArea || !specificArea) {
      return res.status(400).json({
        success: false,
        message: "Title, description, category and location are required",
      });
    }

    const department = departmentByCategory[category];

    if (!department) {
      return res.status(400).json({
        success: false,
        message: "Please select a valid complaint category",
      });
    }

    const priority = determinePriority(title, description);

    /*
      Find a possible unresolved duplicate in the same
      category and campus location.
    */
    const possibleDuplicate = await Complaint.findOne({
      student: req.user._id,
      category,
      "location.campusArea": campusArea.trim(),
      status: {
        $nin: ["Resolved", "Rejected"],
      },
    }).sort({ createdAt: -1 });

    const complaint = await Complaint.create({
      student: req.user._id,

      title: title.trim(),
      description: description.trim(),
      category,

      location: {
        campusArea: campusArea.trim(),
        specificArea: specificArea.trim(),
      },

      evidence,

      priority,
      status: "New",
      department,

      aiAnalysis: {
        summary: description.trim().slice(0, 250),

        suggestedCategory: category,
        suggestedPriority: priority,
        suggestedDepartment: department,

        /*
          This is a temporary confidence value.
          Gemini will provide the real value later.
        */
        confidence: 85,

        possibleDuplicate: Boolean(possibleDuplicate),

        duplicateComplaint: possibleDuplicate?._id || null,
      },
    });

    const createdComplaint = await Complaint.findById(complaint._id)
      .populate("student", "name email universityId department")
      .populate("aiAnalysis.duplicateComplaint", "trackingId title status");

    return res.status(201).json({
      success: true,
      message: "Complaint submitted successfully",
      complaint: createdComplaint,
    });
  } catch (error) {
    console.error("Create complaint error:", error);

    if (error.name === "ValidationError") {
      const firstError = Object.values(error.errors)[0];

      return res.status(400).json({
        success: false,
        message: firstError.message,
      });
    }

    return res.status(500).json({
      success: false,
      message: "Unable to submit complaint",
    });
  }
};

/*
  GET /api/complaints/my
  Return complaints submitted by the logged-in Student.
*/
export const getMyComplaints = async (req, res) => {
  try {
    const { status, category, search, page = 1, limit = 10 } = req.query;

    const filter = {
      student: req.user._id,
    };

    if (status && status !== "All") {
      filter.status = status;
    }

    if (category && category !== "All") {
      filter.category = category;
    }

    if (search?.trim()) {
      const searchExpression = new RegExp(search.trim(), "i");

      filter.$or = [
        { trackingId: searchExpression },
        { title: searchExpression },
        { description: searchExpression },
        {
          "location.campusArea": searchExpression,
        },
      ];
    }

    const pageNumber = Math.max(Number.parseInt(page, 10) || 1, 1);

    const pageSize = Math.min(
      Math.max(Number.parseInt(limit, 10) || 10, 1),
      50,
    );

    const skip = (pageNumber - 1) * pageSize;

    const [complaints, totalComplaints] = await Promise.all([
      Complaint.find(filter)
        .populate("assignedOfficer", "name email department designation")
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(pageSize),

      Complaint.countDocuments(filter),
    ]);

    return res.status(200).json({
      success: true,
      complaints,

      pagination: {
        currentPage: pageNumber,
        totalPages: Math.ceil(totalComplaints / pageSize),
        totalComplaints,
        pageSize,
      },
    });
  } catch (error) {
    console.error("Get my complaints error:", error);

    return res.status(500).json({
      success: false,
      message: "Unable to retrieve your complaints",
    });
  }
};

/*
  GET /api/complaints/:trackingId
*/
export const getComplaintByTrackingId = async (req, res) => {
  try {
    const trackingId = req.params.trackingId.trim().toUpperCase();

    const complaint = await Complaint.findOne({
      trackingId,
    })
      .populate(
        "student",
        "name email universityId department designation avatar",
      )
      .populate("assignedOfficer", "name email department designation avatar")
      .populate("timeline.updatedBy", "name role designation")
      .populate(
        "aiAnalysis.duplicateComplaint",
        "trackingId title category priority status",
      );

    if (!complaint) {
      return res.status(404).json({
        success: false,
        message: "Complaint not found",
      });
    }

    if (
      req.user.role === "student" &&
      complaint.student._id.toString() !== req.user._id.toString()
    ) {
      return res.status(403).json({
        success: false,
        message: "You cannot access this complaint",
      });
    }

    return res.status(200).json({
      success: true,
      complaint,
    });
  } catch (error) {
    console.error("Get complaint details error:", error);

    return res.status(500).json({
      success: false,
      message: "Unable to retrieve complaint details",
    });
  }
};

/*
  GET /api/complaints/triage

  Officer and Admin:
  Return new complaints waiting for assignment.
*/
export const getTriageQueue = async (req, res) => {
  try {
    const { priority, category, search, page = 1, limit = 20 } = req.query;

    const filter = {
      status: "New",
      assignedOfficer: null,
    };

    if (priority && priority !== "All") {
      filter.priority = priority;
    }

    if (category && category !== "All") {
      filter.category = category;
    }

    if (search?.trim()) {
      const searchExpression = new RegExp(search.trim(), "i");

      filter.$or = [
        { trackingId: searchExpression },
        { title: searchExpression },
        { description: searchExpression },
        { category: searchExpression },
        { department: searchExpression },
        {
          "location.campusArea": searchExpression,
        },
      ];
    }

    const pageNumber = Math.max(Number.parseInt(page, 10) || 1, 1);

    const pageSize = Math.min(
      Math.max(Number.parseInt(limit, 10) || 20, 1),
      50,
    );

    const skip = (pageNumber - 1) * pageSize;

    const beginningOfToday = new Date();
    beginningOfToday.setHours(0, 0, 0, 0);

    const [
      complaints,
      totalComplaints,
      criticalCount,
      assignedToday,
      waitingComplaints,
    ] = await Promise.all([
      Complaint.find(filter)
        .populate("student", "name email universityId department")
        .sort({
          priority: 1,
          createdAt: 1,
        })
        .skip(skip)
        .limit(pageSize),

      Complaint.countDocuments(filter),

      Complaint.countDocuments({
        status: "New",
        assignedOfficer: null,
        priority: "Critical",
      }),

      Complaint.countDocuments({
        assignedOfficer: req.user._id,
        status: {
          $in: ["Assigned", "In Progress", "Resolved"],
        },
        updatedAt: {
          $gte: beginningOfToday,
        },
      }),

      Complaint.find({
        status: "New",
        assignedOfficer: null,
      }).select("createdAt"),
    ]);

    let averageWaitMinutes = 0;

    if (waitingComplaints.length > 0) {
      const currentTime = Date.now();

      const totalWaitingTime = waitingComplaints.reduce((total, complaint) => {
        const submittedTime = new Date(complaint.createdAt).getTime();

        return total + (currentTime - submittedTime);
      }, 0);

      averageWaitMinutes = Math.round(
        totalWaitingTime / waitingComplaints.length / (1000 * 60),
      );
    }

    return res.status(200).json({
      success: true,
      complaints,

      summary: {
        waiting: totalComplaints,
        critical: criticalCount,
        assignedToday,
        averageWaitMinutes,
      },

      pagination: {
        currentPage: pageNumber,
        totalPages: Math.ceil(totalComplaints / pageSize),
        totalComplaints,
        pageSize,
      },
    });
  } catch (error) {
    console.error("Get triage queue error:", error);

    return res.status(500).json({
      success: false,
      message: "Unable to retrieve the triage queue",
    });
  }
};

/*
  PATCH /api/complaints/:trackingId/assign

  Officer:
  Atomically accept and assign a new complaint
  to themselves.
*/
export const assignComplaintToSelf = async (req, res) => {
  try {
    const trackingId = req.params.trackingId.trim().toUpperCase();

    /*
      findOneAndUpdate performs the condition check and
      assignment in one database operation.

      If another Officer already accepted it, this query
      will not find it.
    */
    const complaint = await Complaint.findOneAndUpdate(
      {
        trackingId,
        status: "New",
        assignedOfficer: null,
      },
      {
        $set: {
          assignedOfficer: req.user._id,
          status: "Assigned",
        },

        $push: {
          timeline: {
            status: "Assigned",
            message: `Complaint assigned to ${req.user.name}`,
            updatedBy: req.user._id,
            createdAt: new Date(),
          },
        },
      },
      {
        new: true,
        runValidators: true,
      },
    )
      .populate("student", "name email universityId department")
      .populate("assignedOfficer", "name email department designation");

    if (!complaint) {
      const existingComplaint = await Complaint.findOne({
        trackingId,
      }).select("trackingId status assignedOfficer");

      if (!existingComplaint) {
        return res.status(404).json({
          success: false,
          message: "Complaint not found",
        });
      }

      return res.status(409).json({
        success: false,
        message:
          "This complaint has already been assigned or is no longer waiting",
      });
    }

    return res.status(200).json({
      success: true,
      message: "Complaint assigned successfully",
      complaint,
    });
  } catch (error) {
    console.error("Assign complaint error:", error);

    return res.status(500).json({
      success: false,
      message: "Unable to assign the complaint",
    });
  }
};

const getSlaHours = (priority) => {
  const hoursByPriority = {
    Critical: 2,
    High: 6,
    Medium: 24,
    Low: 48,
  };

  return hoursByPriority[priority] || 24;
};

const calculateSlaDeadline = (createdAt, priority) => {
  const deadline = new Date(createdAt);

  deadline.setHours(deadline.getHours() + getSlaHours(priority));

  return deadline;
};

/*
  GET /api/complaints/assigned

  Officer:
  Return complaints assigned to the logged-in Officer.
*/
export const getAssignedComplaints = async (req, res) => {
  try {
    const { status, search, page = 1, limit = 20 } = req.query;

    const filter = {
      assignedOfficer: req.user._id,
    };

    if (status && status !== "All") {
      filter.status = status;
    }

    if (search?.trim()) {
      const searchExpression = new RegExp(search.trim(), "i");

      filter.$or = [
        { trackingId: searchExpression },
        { title: searchExpression },
        { category: searchExpression },
        { department: searchExpression },
      ];
    }

    const pageNumber = Math.max(Number.parseInt(page, 10) || 1, 1);

    const pageSize = Math.min(
      Math.max(Number.parseInt(limit, 10) || 20, 1),
      50,
    );

    const skip = (pageNumber - 1) * pageSize;

    const [complaints, totalAssigned, inProgress, resolved] = await Promise.all(
      [
        Complaint.find(filter)
          .populate("student", "name email universityId department")
          .sort({ updatedAt: -1 })
          .skip(skip)
          .limit(pageSize),

        Complaint.countDocuments({
          assignedOfficer: req.user._id,
        }),

        Complaint.countDocuments({
          assignedOfficer: req.user._id,
          status: "In Progress",
        }),

        Complaint.countDocuments({
          assignedOfficer: req.user._id,
          status: "Resolved",
        }),
      ],
    );

    const complaintsWithDeadline = complaints.map((complaint) => {
      const complaintObject = complaint.toObject();

      return {
        ...complaintObject,

        slaDeadline: calculateSlaDeadline(
          complaint.createdAt,
          complaint.priority,
        ),
      };
    });

    const endOfToday = new Date();
    endOfToday.setHours(23, 59, 59, 999);

    const dueToday = complaintsWithDeadline.filter((complaint) => {
      if (complaint.status === "Resolved") {
        return false;
      }

      return new Date(complaint.slaDeadline) <= endOfToday;
    }).length;

    return res.status(200).json({
      success: true,
      complaints: complaintsWithDeadline,

      summary: {
        totalAssigned,
        inProgress,
        dueToday,
        resolved,
      },

      pagination: {
        currentPage: pageNumber,
        totalPages: Math.ceil(totalAssigned / pageSize),
        totalComplaints: totalAssigned,
        pageSize,
      },
    });
  } catch (error) {
    console.error("Get assigned complaints error:", error);

    return res.status(500).json({
      success: false,
      message: "Unable to retrieve assigned complaints",
    });
  }
};

/*
  PATCH /api/complaints/:trackingId/status

  Officer:
  Update the status of a complaint assigned to them.
*/
export const updateComplaintStatus = async (req, res) => {
  try {
    const trackingId = req.params.trackingId.trim().toUpperCase();

    const { status, message } = req.body;

    const allowedStatuses = ["Assigned", "In Progress", "Resolved"];

    if (!allowedStatuses.includes(status)) {
      return res.status(400).json({
        success: false,
        message: "Please select a valid complaint status",
      });
    }

    const complaint = await Complaint.findOne({
      trackingId,
    });

    if (!complaint) {
      return res.status(404).json({
        success: false,
        message: "Complaint not found",
      });
    }

    if (complaint.assignedOfficer?.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        success: false,
        message: "This complaint is not assigned to you",
      });
    }

    const allowedTransitions = {
      Assigned: ["Assigned", "In Progress"],

      "In Progress": ["In Progress", "Resolved"],

      Resolved: ["Resolved"],
    };

    if (!allowedTransitions[complaint.status]?.includes(status)) {
      return res.status(400).json({
        success: false,
        message: `Status cannot change from ${complaint.status} to ${status}`,
      });
    }

    const statusChanged = complaint.status !== status;

    if (!statusChanged && !message?.trim()) {
      return res.status(400).json({
        success: false,
        message: "Status is unchanged and no update message was provided",
      });
    }

    complaint.status = status;

    if (status === "Resolved") {
      complaint.resolvedAt = new Date();
    }

    complaint.timeline.push({
      status,
      message: message?.trim() || `Complaint status updated to ${status}`,
      updatedBy: req.user._id,
      createdAt: new Date(),
    });

    await complaint.save();

    await complaint.populate([
      {
        path: "student",
        select: "name email universityId department",
      },
      {
        path: "assignedOfficer",
        select: "name email department designation",
      },
      {
        path: "timeline.updatedBy",
        select: "name role designation",
      },
    ]);

    return res.status(200).json({
      success: true,
      message: "Complaint status updated successfully",
      complaint,
    });
  } catch (error) {
    console.error("Update complaint status error:", error);

    return res.status(500).json({
      success: false,
      message: "Unable to update complaint status",
    });
  }
};

/*
  GET /api/complaints/admin

  Admin:
  Return every complaint with filtering,
  statistics and pagination.
*/
export const getAllComplaintsForAdmin = async (req, res) => {
  try {
    const {
      status,
      department,
      priority,
      search,
      page = 1,
      limit = 20,
    } = req.query;

    const filter = {};

    if (status && status !== "All") {
      filter.status = status;
    }

    if (department && department !== "All") {
      filter.department = department;
    }

    if (priority && priority !== "All") {
      filter.priority = priority;
    }

    if (search?.trim()) {
      const searchExpression = new RegExp(search.trim(), "i");

      /*
        Find Students whose names or emails
        match the Admin search.
      */
      const matchingStudents = await User.find({
        $or: [
          { name: searchExpression },
          { email: searchExpression },
          {
            universityId: searchExpression,
          },
        ],
      }).select("_id");

      const matchingStudentIds = matchingStudents.map((student) => student._id);

      filter.$or = [
        { trackingId: searchExpression },
        { title: searchExpression },
        { description: searchExpression },
        { category: searchExpression },
        { department: searchExpression },
        {
          student: {
            $in: matchingStudentIds,
          },
        },
      ];
    }

    const pageNumber = Math.max(Number.parseInt(page, 10) || 1, 1);

    const pageSize = Math.min(
      Math.max(Number.parseInt(limit, 10) || 20, 1),
      50,
    );

    const skip = (pageNumber - 1) * pageSize;

    const [
      complaints,
      filteredTotal,
      total,
      open,
      critical,
      resolved,
      departments,
    ] = await Promise.all([
      Complaint.find(filter)
        .populate("student", "name email universityId department")
        .populate("assignedOfficer", "name email designation department")
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(pageSize),

      Complaint.countDocuments(filter),

      Complaint.countDocuments(),

      Complaint.countDocuments({
        status: {
          $nin: ["Resolved", "Rejected"],
        },
      }),

      Complaint.countDocuments({
        priority: "Critical",
        status: {
          $nin: ["Resolved", "Rejected"],
        },
      }),

      Complaint.countDocuments({
        status: "Resolved",
      }),

      Complaint.distinct("department"),
    ]);

    return res.status(200).json({
      success: true,
      complaints,

      summary: {
        total,
        open,
        critical,
        resolved,
      },

      departments: departments.filter(Boolean).sort(),

      pagination: {
        currentPage: pageNumber,
        totalPages: Math.ceil(filteredTotal / pageSize),
        totalComplaints: filteredTotal,
        pageSize,
      },
    });
  } catch (error) {
    console.error("Get all complaints error:", error);

    return res.status(500).json({
      success: false,
      message: "Unable to retrieve all complaints",
    });
  }
};

/*
  PATCH /api/complaints/admin/:trackingId

  Admin:
  Update complaint status, department and priority.
*/
export const updateComplaintByAdmin = async (req, res) => {
  try {
    const trackingId = req.params.trackingId.trim().toUpperCase();

    const { status, department, priority } = req.body;

    const validStatuses = [
      "New",
      "Assigned",
      "In Progress",
      "Resolved",
      "Rejected",
      "Reopened",
    ];

    const validPriorities = ["Low", "Medium", "High", "Critical"];

    if (status && !validStatuses.includes(status)) {
      return res.status(400).json({
        success: false,
        message: "Please select a valid complaint status",
      });
    }

    if (priority && !validPriorities.includes(priority)) {
      return res.status(400).json({
        success: false,
        message: "Please select a valid complaint priority",
      });
    }

    if (department !== undefined && !department.trim()) {
      return res.status(400).json({
        success: false,
        message: "Department cannot be empty",
      });
    }

    const complaint = await Complaint.findOne({
      trackingId,
    });

    if (!complaint) {
      return res.status(404).json({
        success: false,
        message: "Complaint not found",
      });
    }

    const changes = [];

    if (status && status !== complaint.status) {
      changes.push(`status changed from ${complaint.status} to ${status}`);

      complaint.status = status;

      if (status === "Resolved") {
        complaint.resolvedAt = new Date();
      } else {
        complaint.resolvedAt = null;
      }
    }

    if (priority && priority !== complaint.priority) {
      changes.push(
        `priority changed from ${complaint.priority} to ${priority}`,
      );

      complaint.priority = priority;
    }

    if (department && department.trim() !== complaint.department) {
      changes.push(
        `department changed from ${complaint.department} to ${department.trim()}`,
      );

      complaint.department = department.trim();
    }

    if (changes.length === 0) {
      return res.status(400).json({
        success: false,
        message: "No administrative changes were provided",
      });
    }

    complaint.timeline.push({
      status: complaint.status,
      message: `Administrator ${changes.join(", ")}.`,
      updatedBy: req.user._id,
      createdAt: new Date(),
    });

    await complaint.save();

    await complaint.populate([
      {
        path: "student",
        select: "name email universityId department designation avatar",
      },
      {
        path: "assignedOfficer",
        select: "name email department designation avatar",
      },
      {
        path: "timeline.updatedBy",
        select: "name role designation",
      },
      {
        path: "aiAnalysis.duplicateComplaint",
        select: "trackingId title category priority status",
      },
    ]);

    return res.status(200).json({
      success: true,
      message: "Administrative changes saved successfully",
      complaint,
    });
  } catch (error) {
    console.error("Admin update complaint error:", error);

    return res.status(500).json({
      success: false,
      message: "Unable to save administrative changes",
    });
  }
};
