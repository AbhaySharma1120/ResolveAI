import Complaint from "../models/Complaint.js";
import ComplaintMessage from "../models/ComplaintsMessage.js";
import Notification from "../models/Notification.js";
import User from "../models/User.js";

const escapeRegularExpression = (value) => {
  return value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
};

const getComplaintFilter = (user) => {
  if (user.role === "student") {
    return {
      student: user._id,
    };
  }

  if (user.role === "officer") {
    return {
      assignedOfficer: user._id,
    };
  }

  return {};
};

const getComplaintPath = (role, trackingId) => {
  if (role === "student") {
    return `/student/complaints/${trackingId}`;
  }

  if (role === "officer") {
    return `/officer/cases/${trackingId}`;
  }

  return `/admin/complaints/${trackingId}`;
};

const pageSearchData = {
  student: [
    {
      title: "My Complaints",
      subtitle: "View your submitted complaints",
      path: "/student/complaints",
    },
    {
      title: "Report a new issue",
      subtitle: "Submit a campus complaint",
      path: "/student/report",
    },
    {
      title: "AI Copilot",
      subtitle: "Get complaint assistance",
      path: "/student/ai-copilot",
    },
    {
      title: "Analytics",
      subtitle: "View complaint analytics",
      path: "/student/analytics",
    },
    {
      title: "Settings",
      subtitle: "Manage your account",
      path: "/student/settings",
    },
  ],

  officer: [
    {
      title: "Assigned Cases",
      subtitle: "View your current workload",
      path: "/officer/cases",
    },
    {
      title: "Triage Queue",
      subtitle: "Review new complaints",
      path: "/officer/triage",
    },
    {
      title: "AI Assistant",
      subtitle: "Analyze complaint cases",
      path: "/officer/ai-assistant",
    },
    {
      title: "Settings",
      subtitle: "Manage your Officer account",
      path: "/officer/settings",
    },
  ],

  admin: [
    {
      title: "All Complaints",
      subtitle: "Monitor university complaints",
      path: "/admin/complaints",
    },
    {
      title: "User Management",
      subtitle: "Manage system accounts",
      path: "/admin/users",
    },
    {
      title: "Departments",
      subtitle: "Manage complaint departments",
      path: "/admin/departments",
    },
    {
      title: "AI Monitoring",
      subtitle: "Review AI classifications",
      path: "/admin/ai-monitoring",
    },
    {
      title: "Settings",
      subtitle: "Manage system settings",
      path: "/admin/settings",
    },
  ],
};

/*
  Return recent messages and notifications.
  GET /api/header
*/
export const getHeaderData = async (req, res) => {
  try {
    const complaintFilter = getComplaintFilter(req.user);

    const accessibleComplaints = await Complaint.find(complaintFilter)
      .select("_id trackingId title")
      .lean();

    const complaintIds = accessibleComplaints.map((complaint) => complaint._id);

    const [messageDocuments, notifications, unreadNotificationCount] =
      await Promise.all([
        ComplaintMessage.find({
          complaint: {
            $in: complaintIds,
          },

          sender: {
            $ne: req.user._id,
          },
        })
          .populate("sender", "name role avatar designation")
          .populate("complaint", "trackingId title")
          .sort({
            createdAt: -1,
          })
          .limit(8)
          .lean(),

        Notification.find({
          recipient: req.user._id,
        })
          .sort({
            createdAt: -1,
          })
          .limit(8)
          .lean(),

        Notification.countDocuments({
          recipient: req.user._id,
          isRead: false,
        }),
      ]);

    const messages = messageDocuments.map((message) => ({
      id: message._id,

      title: message.sender?.name || "ResolveAI user",

      text: message.message,

      trackingId: message.complaint?.trackingId,

      complaintTitle: message.complaint?.title,

      path: getComplaintPath(req.user.role, message.complaint?.trackingId),

      createdAt: message.createdAt,

      isRead:
        message.readBy?.some(
          (userId) => userId.toString() === req.user._id.toString(),
        ) || false,
    }));

    const unreadMessageCount = messages.filter(
      (message) => !message.isRead,
    ).length;

    return res.status(200).json({
      success: true,
      messages,
      notifications,
      counts: {
        unreadMessages: unreadMessageCount,

        unreadNotifications: unreadNotificationCount,
      },
    });
  } catch (error) {
    console.error("Get header data error:", error);

    return res.status(500).json({
      success: false,
      message: "Unable to retrieve header information",
    });
  }
};

/*
  Search accessible complaints, pages
  and Admin users.
  GET /api/header/search?q=...
*/
export const searchHeader = async (req, res) => {
  try {
    const searchText = req.query.q?.trim();

    if (!searchText) {
      return res.status(200).json({
        success: true,
        results: [],
      });
    }

    const safeSearch = escapeRegularExpression(searchText);

    const searchExpression = new RegExp(safeSearch, "i");

    const complaintFilter = {
      ...getComplaintFilter(req.user),

      $or: [
        {
          trackingId: searchExpression,
        },
        {
          title: searchExpression,
        },
        {
          category: searchExpression,
        },
        {
          department: searchExpression,
        },
      ],
    };

    const complaints = await Complaint.find(complaintFilter)
      .sort({
        createdAt: -1,
      })
      .limit(6)
      .select("trackingId title category status")
      .lean();

    const complaintResults = complaints.map((complaint) => ({
      id: complaint._id,
      type: "complaint",
      title: complaint.title,

      subtitle: `${complaint.trackingId} · ${complaint.category} · ${complaint.status}`,

      path: getComplaintPath(req.user.role, complaint.trackingId),
    }));

    const pageResults = (pageSearchData[req.user.role] || [])
      .filter(
        (page) =>
          page.title.toLowerCase().includes(searchText.toLowerCase()) ||
          page.subtitle.toLowerCase().includes(searchText.toLowerCase()),
      )
      .map((page, index) => ({
        id: `page-${index}`,
        type: "page",
        ...page,
      }));

    let userResults = [];

    if (req.user.role === "admin") {
      const users = await User.find({
        $or: [
          {
            name: searchExpression,
          },
          {
            email: searchExpression,
          },
          {
            universityId: searchExpression,
          },
          {
            department: searchExpression,
          },
        ],
      })
        .sort({
          createdAt: -1,
        })
        .limit(5)
        .select("name email role department")
        .lean();

      userResults = users.map((user) => ({
        id: user._id,
        type: "user",
        title: user.name,

        subtitle: `${user.email} · ${user.role} · ${user.department}`,

        path: "/admin/users",
      }));
    }

    return res.status(200).json({
      success: true,

      results: [...complaintResults, ...userResults, ...pageResults].slice(
        0,
        10,
      ),
    });
  } catch (error) {
    console.error("Header search error:", error);

    return res.status(500).json({
      success: false,
      message: "Unable to search ResolveAI",
    });
  }
};

/*
  Mark one notification as read.
  PATCH /api/header/notifications/:id/read
*/
export const markNotificationRead = async (req, res) => {
  try {
    const notification = await Notification.findOneAndUpdate(
      {
        _id: req.params.id,
        recipient: req.user._id,
      },
      {
        $set: {
          isRead: true,
          readAt: new Date(),
        },
      },
      {
        new: true,
      },
    );

    if (!notification) {
      return res.status(404).json({
        success: false,
        message: "Notification not found",
      });
    }

    return res.status(200).json({
      success: true,
      notification,
    });
  } catch (error) {
    console.error("Mark notification error:", error);

    return res.status(500).json({
      success: false,
      message: "Unable to update notification",
    });
  }
};

/*
  Mark every notification as read.
  PATCH /api/header/notifications/read-all
*/
export const markAllNotificationsRead = async (req, res) => {
  try {
    await Notification.updateMany(
      {
        recipient: req.user._id,
        isRead: false,
      },
      {
        $set: {
          isRead: true,
          readAt: new Date(),
        },
      },
    );

    return res.status(200).json({
      success: true,
      message: "All notifications marked as read",
    });
  } catch (error) {
    console.error("Mark all notifications error:", error);

    return res.status(500).json({
      success: false,
      message: "Unable to update notifications",
    });
  }
};

/*
  Mark accessible conversation messages
  as read from the header.
  PATCH /api/header/messages/read-all
*/
export const markAllMessagesRead = async (req, res) => {
  try {
    const complaintFilter = getComplaintFilter(req.user);

    const accessibleComplaints =
      await Complaint.find(complaintFilter).select("_id");

    const complaintIds = accessibleComplaints.map((complaint) => complaint._id);

    await ComplaintMessage.updateMany(
      {
        complaint: {
          $in: complaintIds,
        },

        sender: {
          $ne: req.user._id,
        },

        readBy: {
          $ne: req.user._id,
        },
      },
      {
        $addToSet: {
          readBy: req.user._id,
        },
      },
    );

    return res.status(200).json({
      success: true,
      message: "All messages marked as read",
    });
  } catch (error) {
    console.error("Mark all messages error:", error);

    return res.status(500).json({
      success: false,
      message: "Unable to update messages",
    });
  }
};
