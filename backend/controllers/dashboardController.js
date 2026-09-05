import Complaint from "../models/Complaint.js";
import Department from "../models/Department.js";
import User from "../models/User.js";

export const getAdminDashboard = async (req, res) => {
  try {
    const now = new Date();

    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(now.getDate() - 6);
    sevenDaysAgo.setHours(0, 0, 0, 0);

    const [
      totalComplaints,
      resolvedComplaints,
      totalUsers,
      activeUsers,
      totalDepartments,
      weeklyCreatedComplaints,
      weeklyResolvedComplaints,
      departmentDocuments,
      recentComplaints,
      recentUsers,
    ] = await Promise.all([
      Complaint.countDocuments(),

      Complaint.countDocuments({
        status: "Resolved",
      }),

      User.countDocuments(),

      User.countDocuments({
        isActive: true,
      }),

      Department.countDocuments({
        isActive: true,
      }),

      Complaint.find({
        createdAt: {
          $gte: sevenDaysAgo,
        },
      })
        .select("createdAt")
        .lean(),

      Complaint.find({
        status: "Resolved",
        resolvedAt: {
          $gte: sevenDaysAgo,
        },
      })
        .select("resolvedAt")
        .lean(),

      Department.find({
        isActive: true,
      })
        .select("name")
        .lean(),

      Complaint.find()
        .sort({ updatedAt: -1 })
        .limit(5)
        .select("trackingId title status priority department updatedAt")
        .lean(),

      User.find()
        .sort({ createdAt: -1 })
        .limit(3)
        .select("name role department createdAt")
        .lean(),
    ]);

    const activeComplaints = totalComplaints - resolvedComplaints;

    const resolutionRate =
      totalComplaints === 0
        ? 0
        : Number(((resolvedComplaints / totalComplaints) * 100).toFixed(1));

    /*
      Create the last seven days for the chart.
    */
    const weeklyData = [];

    for (let index = 0; index < 7; index += 1) {
      const currentDate = new Date(sevenDaysAgo);
      currentDate.setDate(sevenDaysAgo.getDate() + index);

      const nextDate = new Date(currentDate);
      nextDate.setDate(currentDate.getDate() + 1);

      const received = weeklyCreatedComplaints.filter((complaint) => {
        const createdAt = new Date(complaint.createdAt);

        return createdAt >= currentDate && createdAt < nextDate;
      }).length;

      const resolved = weeklyResolvedComplaints.filter((complaint) => {
        const resolvedAt = new Date(complaint.resolvedAt);

        return resolvedAt >= currentDate && resolvedAt < nextDate;
      }).length;

      weeklyData.push({
        day: currentDate.toLocaleDateString("en-US", {
          weekday: "short",
        }),
        received,
        resolved,
      });
    }

    /*
      Calculate complaint performance for every department.
    */
    const departmentPerformance = await Promise.all(
      departmentDocuments.map(async (department) => {
        const complaints = await Complaint.countDocuments({
          department: department.name,
        });

        const resolved = await Complaint.countDocuments({
          department: department.name,
          status: "Resolved",
        });

        const rate =
          complaints === 0 ? 0 : Math.round((resolved / complaints) * 100);

        return {
          id: department._id,
          name: department.name,
          complaints,
          resolved,
          rate,
        };
      }),
    );

    /*
      Combine recent complaint and user events.
    */
    const complaintActivities = recentComplaints.map((complaint) => ({
      id: complaint._id,
      type: "complaint",
      title:
        complaint.status === "Resolved"
          ? "Complaint marked resolved"
          : "Complaint updated",
      detail: `${complaint.trackingId} · ${complaint.title}`,
      date: complaint.updatedAt,
      priority: complaint.priority,
    }));

    const userActivities = recentUsers.map((user) => ({
      id: user._id,
      type: "user",
      title: `New ${user.role} account created`,
      detail: `${user.name} · ${user.department || "No department"}`,
      date: user.createdAt,
    }));

    const recentActivity = [...complaintActivities, ...userActivities]
      .sort((first, second) => new Date(second.date) - new Date(first.date))
      .slice(0, 5);

    return res.status(200).json({
      success: true,

      summary: {
        totalComplaints,
        activeComplaints,
        resolvedComplaints,
        resolutionRate,
        totalUsers,
        activeUsers,
        totalDepartments,
      },

      weeklyData,

      departmentPerformance: departmentPerformance
        .sort((first, second) => second.complaints - first.complaints)
        .slice(0, 4),

      recentActivity,
    });
  } catch (error) {
    console.error("Admin dashboard error:", error);

    return res.status(500).json({
      success: false,
      message: "Unable to retrieve dashboard information",
    });
  }
};

export const getOfficerDashboard = async (req, res) => {
  try {
    const officerId = req.user._id;

    const startOfToday = new Date();
    startOfToday.setHours(0, 0, 0, 0);

    const endOfToday = new Date();
    endOfToday.setHours(23, 59, 59, 999);

    const activeStatuses = ["Assigned", "In Progress", "Pending Student"];

    const [
      unassignedCases,
      myActiveCases,
      urgentCases,
      resolvedToday,
      recentComplaintDocuments,
      assignedComplaintDocuments,
      departmentWorkloadDocuments,
    ] = await Promise.all([
      Complaint.countDocuments({
        assignedOfficer: null,
        status: {
          $nin: ["Resolved", "Closed"],
        },
      }),

      Complaint.countDocuments({
        assignedOfficer: officerId,
        status: {
          $in: activeStatuses,
        },
      }),

      Complaint.countDocuments({
        priority: "Urgent",
        status: {
          $nin: ["Resolved", "Closed"],
        },
        $or: [
          {
            assignedOfficer: null,
          },
          {
            assignedOfficer: officerId,
          },
        ],
      }),

      Complaint.countDocuments({
        assignedOfficer: officerId,
        status: "Resolved",
        resolvedAt: {
          $gte: startOfToday,
          $lte: endOfToday,
        },
      }),

      Complaint.find({
        assignedOfficer: null,
        status: {
          $nin: ["Resolved", "Closed"],
        },
      })
        .populate("student", "name")
        .sort({
          createdAt: -1,
        })
        .limit(5)
        .select("trackingId title category student priority status createdAt")
        .lean(),

      Complaint.find({
        assignedOfficer: officerId,
        status: {
          $in: activeStatuses,
        },
      })
        .select("priority status createdAt resolvedAt")
        .lean(),

      Complaint.aggregate([
        {
          $match: {
            status: {
              $nin: ["Resolved", "Closed"],
            },
          },
        },
        {
          $group: {
            _id: {
              $ifNull: ["$department", "Unassigned"],
            },
            cases: {
              $sum: 1,
            },
          },
        },
        {
          $sort: {
            cases: -1,
          },
        },
        {
          $limit: 4,
        },
      ]),
    ]);

    /*
      Calculate approximate SLA status from complaint
      priority and creation time.

      Urgent: 4 hours
      High: 8 hours
      Medium: 24 hours
      Low: 48 hours
    */
    const slaHours = {
      Urgent: 4,
      High: 8,
      Medium: 24,
      Low: 48,
    };

    let withinSla = 0;
    let atRisk = 0;
    let overdue = 0;

    assignedComplaintDocuments.forEach((complaint) => {
      const allowedHours = slaHours[complaint.priority] || 24;

      const deadline =
        new Date(complaint.createdAt).getTime() + allowedHours * 60 * 60 * 1000;

      const currentTime = Date.now();
      const remainingTime = deadline - currentTime;

      const allowedMilliseconds = allowedHours * 60 * 60 * 1000;

      if (remainingTime <= 0) {
        overdue += 1;
      } else if (remainingTime <= allowedMilliseconds * 0.25) {
        atRisk += 1;
      } else {
        withinSla += 1;
      }
    });

    const totalSlaCases = withinSla + atRisk + overdue;

    const slaPercentage =
      totalSlaCases === 0 ? 100 : Math.round((withinSla / totalSlaCases) * 100);

    const recentCases = recentComplaintDocuments.map((complaint) => ({
      id: complaint.trackingId,
      title: complaint.title,
      category: complaint.category,
      student: complaint.student?.name || "Unknown student",
      priority: complaint.priority,
      status: complaint.status === "Submitted" ? "New" : complaint.status,
      createdAt: complaint.createdAt,
    }));

    const maximumDepartmentCases = Math.max(
      ...departmentWorkloadDocuments.map((department) => department.cases),
      1,
    );

    const departmentWorkload = departmentWorkloadDocuments.map(
      (department) => ({
        department: department._id || "Unassigned",
        cases: department.cases,
        percentage: Math.round(
          (department.cases / maximumDepartmentCases) * 100,
        ),
      }),
    );

    let insight =
      "Complaint workload is currently balanced across departments.";

    if (departmentWorkload.length > 0) {
      const busiestDepartment = departmentWorkload[0];

      insight = `${busiestDepartment.department} currently has the highest workload with ${busiestDepartment.cases} active case${
        busiestDepartment.cases === 1 ? "" : "s"
      }. Consider reviewing officer assignments.`;
    }

    return res.status(200).json({
      success: true,

      officer: {
        name: req.user.name,
        department: req.user.department,
      },

      summary: {
        unassignedCases,
        myActiveCases,
        urgentCases,
        resolvedToday,
      },

      recentCases,

      slaPerformance: {
        percentage: slaPercentage,
        withinSla,
        atRisk,
        overdue,
      },

      departmentWorkload,

      insight,
    });
  } catch (error) {
    console.error("Officer dashboard error:", error);

    return res.status(500).json({
      success: false,
      message: "Unable to retrieve Officer Dashboard information",
    });
  }
};

export const getStudentDashboard = async (req, res) => {
  try {
    const studentId = req.user._id;

    const studentFilter = {
      student: studentId,
    };

    const [
      totalComplaints,
      openComplaints,
      inProgressComplaints,
      resolvedComplaints,
      recentComplaintDocuments,
      categoryDocuments,
      locationDocuments,
      resolvedComplaintDocuments,
    ] = await Promise.all([
      Complaint.countDocuments(studentFilter),

      Complaint.countDocuments({
        ...studentFilter,
        status: {
          $nin: ["Resolved", "Closed"],
        },
      }),

      Complaint.countDocuments({
        ...studentFilter,
        status: "In Progress",
      }),

      Complaint.countDocuments({
        ...studentFilter,
        status: {
          $in: ["Resolved", "Closed"],
        },
      }),

      Complaint.find(studentFilter)
        .sort({
          createdAt: -1,
        })
        .limit(5)
        .select(
          "trackingId title category location priority status createdAt updatedAt resolvedAt",
        )
        .lean(),

      Complaint.aggregate([
        {
          $match: {
            student: studentId,
          },
        },
        {
          $group: {
            _id: {
              $ifNull: ["$category", "Other"],
            },
            value: {
              $sum: 1,
            },
          },
        },
        {
          $sort: {
            value: -1,
          },
        },
        {
          $limit: 5,
        },
      ]),

      Complaint.aggregate([
        {
          $match: {
            student: studentId,
            status: {
              $nin: ["Resolved", "Closed"],
            },
          },
        },
        {
          $group: {
            _id: {
              $ifNull: ["$location", "Other location"],
            },
            count: {
              $sum: 1,
            },
          },
        },
        {
          $sort: {
            count: -1,
          },
        },
        {
          $limit: 4,
        },
      ]),

      Complaint.find({
        ...studentFilter,
        status: {
          $in: ["Resolved", "Closed"],
        },
        resolvedAt: {
          $ne: null,
        },
      })
        .select("createdAt resolvedAt")
        .lean(),
    ]);

    /*
      Calculate the student's average complaint
      resolution time.
    */
    let averageResolutionHours = 0;

    if (resolvedComplaintDocuments.length > 0) {
      const totalResolutionMilliseconds = resolvedComplaintDocuments.reduce(
        (total, complaint) => {
          const createdAt = new Date(complaint.createdAt).getTime();

          const resolvedAt = new Date(complaint.resolvedAt).getTime();

          return total + Math.max(resolvedAt - createdAt, 0);
        },
        0,
      );

      averageResolutionHours =
        totalResolutionMilliseconds /
        resolvedComplaintDocuments.length /
        (1000 * 60 * 60);
    }

    const resolutionRate =
      totalComplaints === 0
        ? 0
        : Number(((resolvedComplaints / totalComplaints) * 100).toFixed(1));

    const categories = categoryDocuments.map((category) => ({
      name: category._id || "Other",
      value: category.value,
    }));

    const locations = locationDocuments.map((location) => ({
      name:
        typeof location._id === "string"
          ? location._id
          : location._id?.name || location._id?.building || "Campus location",
      count: location.count,
    }));

    const recentComplaints = recentComplaintDocuments.map((complaint) => ({
      id: complaint.trackingId,
      title: complaint.title,
      category: complaint.category,
      location:
        typeof complaint.location === "string"
          ? complaint.location
          : complaint.location?.name ||
            complaint.location?.building ||
            "Campus",
      priority: complaint.priority,
      status: complaint.status === "Submitted" ? "New" : complaint.status,
      createdAt: complaint.createdAt,
    }));

    /*
      Create a simple data-based summary.
    */
    let insight = "You have not submitted any complaints yet.";

    if (totalComplaints > 0) {
      if (openComplaints === 0) {
        insight = "All your submitted complaints have been resolved.";
      } else if (categories.length > 0) {
        insight = `You currently have ${openComplaints} open complaint${
          openComplaints === 1 ? "" : "s"
        }. ${categories[0].name} is your most reported category.`;
      }
    }

    return res.status(200).json({
      success: true,

      student: {
        name: req.user.name,
        department: req.user.department,
        universityId: req.user.universityId,
      },

      summary: {
        totalComplaints,
        openComplaints,
        inProgressComplaints,
        resolvedComplaints,
        resolutionRate,
        averageResolutionHours: Number(averageResolutionHours.toFixed(1)),
      },

      categories,
      locations,
      recentComplaints,
      insight,
    });
  } catch (error) {
    console.error("Student dashboard error:", error);

    return res.status(500).json({
      success: false,
      message: "Unable to retrieve Student Dashboard information",
    });
  }
};
