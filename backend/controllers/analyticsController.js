import Complaint from "../models/Complaint.js";
import User from "../models/User.js";

const MONTH_NAMES = [
  "Jan",
  "Feb",
  "Mar",
  "Apr",
  "May",
  "Jun",
  "Jul",
  "Aug",
  "Sep",
  "Oct",
  "Nov",
  "Dec",
];

const getPeriodConfiguration = (requestedPeriod) => {
  const now = new Date();

  if (requestedPeriod === "year") {
    return {
      period: "year",
      startDate: new Date(now.getFullYear(), 0, 1),
    };
  }

  if (requestedPeriod === "academic") {
    const academicStartYear =
      now.getMonth() >= 6 ? now.getFullYear() : now.getFullYear() - 1;

    return {
      period: "academic",
      startDate: new Date(academicStartYear, 6, 1),
    };
  }

  const months = Number(requestedPeriod) === 12 ? 12 : 6;

  return {
    period: String(months),
    startDate: new Date(now.getFullYear(), now.getMonth() - months + 1, 1),
  };
};

const createMonthList = (startDate, endDate) => {
  const months = [];

  const cursor = new Date(startDate.getFullYear(), startDate.getMonth(), 1);

  const finalMonth = new Date(endDate.getFullYear(), endDate.getMonth(), 1);

  while (cursor <= finalMonth) {
    months.push({
      key: `${cursor.getFullYear()}-${cursor.getMonth()}`,
      month: MONTH_NAMES[cursor.getMonth()],
      year: cursor.getFullYear(),
      submitted: 0,
      received: 0,
      resolved: 0,
    });

    cursor.setMonth(cursor.getMonth() + 1);
  }

  return months;
};

const calculateAverageResolutionDays = (complaints) => {
  const resolvedComplaints = complaints.filter(
    (complaint) =>
      complaint.status === "Resolved" &&
      complaint.resolvedAt &&
      complaint.createdAt,
  );

  if (resolvedComplaints.length === 0) {
    return 0;
  }

  const totalMilliseconds = resolvedComplaints.reduce((total, complaint) => {
    const createdAt = new Date(complaint.createdAt);
    const resolvedAt = new Date(complaint.resolvedAt);

    return total + Math.max(resolvedAt - createdAt, 0);
  }, 0);

  const millisecondsPerDay = 1000 * 60 * 60 * 24;

  return Number(
    (
      totalMilliseconds /
      resolvedComplaints.length /
      millisecondsPerDay
    ).toFixed(1),
  );
};

const calculatePercentageChange = (currentValue, previousValue) => {
  if (previousValue === 0) {
    return currentValue > 0 ? 100 : 0;
  }

  return Number(
    (((currentValue - previousValue) / previousValue) * 100).toFixed(1),
  );
};

const createStudentInsight = ({
  averageResolutionDays,
  previousAverageResolutionDays,
  topCategory,
  totalComplaints,
}) => {
  if (totalComplaints === 0) {
    return {
      title: "Submit complaints to generate insights",
      description:
        "Your analytics will appear after you submit campus complaints.",
      recommendation:
        "Use the Report Issue page whenever you notice a campus problem.",
      improvementPercentage: 0,
      topCategory: "",
    };
  }

  let improvementPercentage = 0;

  if (averageResolutionDays > 0 && previousAverageResolutionDays > 0) {
    improvementPercentage = Math.round(
      ((previousAverageResolutionDays - averageResolutionDays) /
        previousAverageResolutionDays) *
        100,
    );
  }

  let title = "Your complaint activity is being tracked";

  if (improvementPercentage > 0) {
    title = `Your complaints are resolving ${improvementPercentage}% faster`;
  } else if (improvementPercentage < 0) {
    title = "Some complaints are taking longer to resolve";
  } else if (averageResolutionDays > 0) {
    title = `Average resolution time is ${averageResolutionDays} days`;
  }

  const categoryText = topCategory
    ? `${topCategory} is your most frequently reported category.`
    : "Your category information will appear as more complaints are submitted.";

  return {
    title,
    description: `${categoryText} These insights are calculated from your real complaint history.`,
    recommendation:
      "Include the exact building, floor, room and time of occurrence so the responsible department can resolve the issue faster.",
    improvementPercentage,
    topCategory: topCategory || "",
  };
};

const createAdminInsight = ({
  complaints,
  categories,
  departments,
  receivedChange,
}) => {
  if (complaints.length === 0) {
    return {
      text: "No complaint data is available for this period. Analytics insights will appear after complaints are submitted.",
      aiConfidence: 0,
    };
  }

  const topCategory = categories[0];
  const busiestDepartment = departments[0];

  let trendText = "Complaint volume remained stable";

  if (receivedChange > 0) {
    trendText = `Complaint volume increased by ${Math.abs(receivedChange)}%`;
  } else if (receivedChange < 0) {
    trendText = `Complaint volume decreased by ${Math.abs(receivedChange)}%`;
  }

  const categoryText = topCategory
    ? `${topCategory.name} was the most frequently reported category with ${topCategory.complaints} complaints.`
    : "";

  const departmentText = busiestDepartment
    ? `${busiestDepartment.department} received the highest complaint volume.`
    : "";

  const confidenceValues = complaints
    .map((complaint) => complaint.aiAnalysis?.confidence || 0)
    .filter((confidence) => confidence > 0);

  const aiConfidence =
    confidenceValues.length > 0
      ? Number(
          (
            confidenceValues.reduce(
              (total, confidence) => total + confidence,
              0,
            ) / confidenceValues.length
          ).toFixed(1),
        )
      : 0;

  return {
    text: `${trendText} compared with the previous period. ${categoryText} ${departmentText}`.trim(),
    aiConfidence,
  };
};

/*
  Student analytics.

  GET /api/analytics/student?period=6
*/
export const getStudentAnalytics = async (req, res) => {
  try {
    const { period, startDate } = getPeriodConfiguration(req.query.period);

    const now = new Date();
    const periodDuration = now.getTime() - startDate.getTime();

    const previousStartDate = new Date(startDate.getTime() - periodDuration);

    const complaints = await Complaint.find({
      student: req.user._id,
      createdAt: {
        $gte: startDate,
        $lte: now,
      },
    })
      .select("category status createdAt resolvedAt trackingId priority")
      .sort({ createdAt: 1 })
      .lean();

    const previousComplaints = await Complaint.find({
      student: req.user._id,
      createdAt: {
        $gte: previousStartDate,
        $lt: startDate,
      },
    })
      .select("status createdAt resolvedAt")
      .lean();

    const totalComplaints = complaints.length;

    const resolvedComplaints = complaints.filter(
      (complaint) => complaint.status === "Resolved",
    ).length;

    const inProgressComplaints = complaints.filter((complaint) =>
      ["Assigned", "In Progress", "Reopened"].includes(complaint.status),
    ).length;

    const remainingComplaints = Math.max(
      totalComplaints - resolvedComplaints,
      0,
    );

    const resolutionRate =
      totalComplaints > 0
        ? Number(((resolvedComplaints / totalComplaints) * 100).toFixed(1))
        : 0;

    const averageResolutionDays = calculateAverageResolutionDays(complaints);

    const previousAverageResolutionDays =
      calculateAverageResolutionDays(previousComplaints);

    const submittedThisMonth = complaints.filter((complaint) => {
      const createdAt = new Date(complaint.createdAt);

      return (
        createdAt.getMonth() === now.getMonth() &&
        createdAt.getFullYear() === now.getFullYear()
      );
    }).length;

    const monthlyActivity = createMonthList(startDate, now);

    const monthlyMap = new Map(monthlyActivity.map((item) => [item.key, item]));

    complaints.forEach((complaint) => {
      const createdAt = new Date(complaint.createdAt);
      const createdKey = `${createdAt.getFullYear()}-${createdAt.getMonth()}`;

      const submittedMonth = monthlyMap.get(createdKey);

      if (submittedMonth) {
        submittedMonth.submitted += 1;
      }

      if (complaint.status === "Resolved" && complaint.resolvedAt) {
        const resolvedAt = new Date(complaint.resolvedAt);
        const resolvedKey = `${resolvedAt.getFullYear()}-${resolvedAt.getMonth()}`;

        const resolvedMonth = monthlyMap.get(resolvedKey);

        if (resolvedMonth) {
          resolvedMonth.resolved += 1;
        }
      }
    });

    const categoryCounts = complaints.reduce((counts, complaint) => {
      counts[complaint.category] = (counts[complaint.category] || 0) + 1;

      return counts;
    }, {});

    const highestCategoryCount = Math.max(...Object.values(categoryCounts), 0);

    const categories = Object.entries(categoryCounts)
      .map(([name, count]) => ({
        name,
        count,
        percentage:
          highestCategoryCount > 0
            ? Math.round((count / highestCategoryCount) * 100)
            : 0,
      }))
      .sort(
        (firstCategory, secondCategory) =>
          secondCategory.count - firstCategory.count,
      );

    const topCategory = categories[0]?.name || "";

    const insight = createStudentInsight({
      averageResolutionDays,
      previousAverageResolutionDays,
      topCategory,
      totalComplaints,
    });

    return res.status(200).json({
      success: true,
      analytics: {
        period,
        summary: {
          totalComplaints,
          submittedThisMonth,
          resolvedComplaints,
          inProgressComplaints,
          remainingComplaints,
          resolutionRate,
          averageResolutionDays,
          previousAverageResolutionDays,
        },
        monthlyActivity: monthlyActivity.map(
          ({ key, received, ...monthData }) => monthData,
        ),
        categories,
        insight,
      },
    });
  } catch (error) {
    console.error("Student analytics error:", error);

    return res.status(500).json({
      success: false,
      message: "Unable to retrieve student analytics",
    });
  }
};

/*
  System-wide Admin analytics.

  GET /api/analytics/admin?period=6
*/
export const getAdminAnalytics = async (req, res) => {
  try {
    const { period, startDate } = getPeriodConfiguration(req.query.period);

    const now = new Date();
    const periodDuration = now.getTime() - startDate.getTime();

    const previousStartDate = new Date(startDate.getTime() - periodDuration);

    const complaints = await Complaint.find({
      createdAt: {
        $gte: startDate,
        $lte: now,
      },
    })
      .select("category department status createdAt resolvedAt aiAnalysis")
      .sort({ createdAt: 1 })
      .lean();

    const previousComplaints = await Complaint.find({
      createdAt: {
        $gte: previousStartDate,
        $lt: startDate,
      },
    })
      .select("status createdAt resolvedAt")
      .lean();

    const totalComplaints = complaints.length;

    const previousTotalComplaints = previousComplaints.length;

    const resolvedComplaints = complaints.filter(
      (complaint) => complaint.status === "Resolved",
    ).length;

    const previousResolvedComplaints = previousComplaints.filter(
      (complaint) => complaint.status === "Resolved",
    ).length;

    const openComplaints = Math.max(totalComplaints - resolvedComplaints, 0);

    const resolutionRate =
      totalComplaints > 0
        ? Number(((resolvedComplaints / totalComplaints) * 100).toFixed(1))
        : 0;

    const previousResolutionRate =
      previousTotalComplaints > 0
        ? Number(
            (
              (previousResolvedComplaints / previousTotalComplaints) *
              100
            ).toFixed(1),
          )
        : 0;

    const averageResolutionDays = calculateAverageResolutionDays(complaints);

    const previousAverageResolutionDays =
      calculateAverageResolutionDays(previousComplaints);

    const complaintsChange = calculatePercentageChange(
      totalComplaints,
      previousTotalComplaints,
    );

    const resolutionRateChange = Number(
      (resolutionRate - previousResolutionRate).toFixed(1),
    );

    const averageResolutionChange =
      previousAverageResolutionDays > 0
        ? calculatePercentageChange(
            averageResolutionDays,
            previousAverageResolutionDays,
          )
        : 0;

    const activeStudents = await User.countDocuments({
      role: "student",
      isActive: true,
    });

    const studentsBeforePeriod = await User.countDocuments({
      role: "student",
      isActive: true,
      createdAt: {
        $lt: startDate,
      },
    });

    const activeStudentsChange = calculatePercentageChange(
      activeStudents,
      studentsBeforePeriod,
    );

    const monthlyActivity = createMonthList(startDate, now);

    const monthlyMap = new Map(monthlyActivity.map((item) => [item.key, item]));

    complaints.forEach((complaint) => {
      const createdAt = new Date(complaint.createdAt);
      const createdKey = `${createdAt.getFullYear()}-${createdAt.getMonth()}`;

      const receivedMonth = monthlyMap.get(createdKey);

      if (receivedMonth) {
        receivedMonth.received += 1;
      }

      if (complaint.status === "Resolved" && complaint.resolvedAt) {
        const resolvedAt = new Date(complaint.resolvedAt);
        const resolvedKey = `${resolvedAt.getFullYear()}-${resolvedAt.getMonth()}`;

        const resolvedMonth = monthlyMap.get(resolvedKey);

        if (resolvedMonth) {
          resolvedMonth.resolved += 1;
        }
      }
    });

    const categoryCounts = complaints.reduce((counts, complaint) => {
      counts[complaint.category] = (counts[complaint.category] || 0) + 1;

      return counts;
    }, {});

    const highestCategoryCount = Math.max(...Object.values(categoryCounts), 0);

    const categories = Object.entries(categoryCounts)
      .map(([name, complaintsCount]) => ({
        name,
        complaints: complaintsCount,
        percentage:
          highestCategoryCount > 0
            ? Math.round((complaintsCount / highestCategoryCount) * 100)
            : 0,
      }))
      .sort(
        (firstCategory, secondCategory) =>
          secondCategory.complaints - firstCategory.complaints,
      );

    const departmentGroups = complaints.reduce((groups, complaint) => {
      const department = complaint.department || "Unassigned";

      if (!groups[department]) {
        groups[department] = [];
      }

      groups[department].push(complaint);

      return groups;
    }, {});

    const departments = Object.entries(departmentGroups)
      .map(([department, departmentComplaints]) => {
        const received = departmentComplaints.length;

        const resolved = departmentComplaints.filter(
          (complaint) => complaint.status === "Resolved",
        ).length;

        const rate =
          received > 0 ? Number(((resolved / received) * 100).toFixed(1)) : 0;

        const averageTime =
          calculateAverageResolutionDays(departmentComplaints);

        return {
          department,
          received,
          resolved,
          rate,
          averageTime,
        };
      })
      .sort(
        (firstDepartment, secondDepartment) =>
          secondDepartment.received - firstDepartment.received,
      );

    const insight = createAdminInsight({
      complaints,
      categories,
      departments,
      receivedChange: complaintsChange,
    });

    return res.status(200).json({
      success: true,
      analytics: {
        period,
        summary: {
          totalComplaints,
          resolvedComplaints,
          openComplaints,
          resolutionRate,
          averageResolutionDays,
          activeStudents,
          changes: {
            complaints: complaintsChange,
            resolutionRate: resolutionRateChange,
            averageResolution: averageResolutionChange,
            activeStudents: activeStudentsChange,
          },
        },
        monthlyActivity: monthlyActivity.map(
          ({ key, submitted, ...monthData }) => monthData,
        ),
        categories,
        departments,
        insight,
      },
    });
  } catch (error) {
    console.error("Admin analytics error:", error);

    return res.status(500).json({
      success: false,
      message: "Unable to retrieve Admin analytics",
    });
  }
};
