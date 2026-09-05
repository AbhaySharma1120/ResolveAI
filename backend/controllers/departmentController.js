import Complaint from "../models/Complaint.js";
import Department from "../models/Department.js";
import User from "../models/User.js";

const escapeRegularExpression = (value) => {
  return value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
};

/*
  GET /api/departments

  Admin:
  Retrieve departments with real Officer
  and complaint statistics.
*/
export const getDepartments = async (req, res) => {
  try {
    const { search = "" } = req.query;

    const departments = await Department.find()
      .populate("createdBy", "name email role")
      .populate("updatedBy", "name email role")
      .sort({ name: 1 });

    const departmentsWithStatistics = await Promise.all(
      departments.map(async (department) => {
        const [officers, activeCases, totalCases, resolvedCases] =
          await Promise.all([
            User.countDocuments({
              role: "officer",
              department: department.name,
              isActive: true,
            }),

            Complaint.countDocuments({
              department: department.name,

              status: {
                $nin: ["Resolved", "Rejected"],
              },
            }),

            Complaint.countDocuments({
              department: department.name,
            }),

            Complaint.countDocuments({
              department: department.name,
              status: "Resolved",
            }),
          ]);

        const resolutionRate =
          totalCases > 0 ? Math.round((resolvedCases / totalCases) * 100) : 0;

        return {
          ...department.toObject(),
          officers,
          activeCases,
          totalCases,
          resolvedCases,
          resolutionRate,
        };
      }),
    );

    const normalizedSearch = search.trim().toLowerCase();

    const filteredDepartments = normalizedSearch
      ? departmentsWithStatistics.filter(
          (department) =>
            department.name.toLowerCase().includes(normalizedSearch) ||
            department.head.toLowerCase().includes(normalizedSearch) ||
            department.email.toLowerCase().includes(normalizedSearch),
        )
      : departmentsWithStatistics;

    const totalOfficers = departmentsWithStatistics.reduce(
      (total, department) => total + department.officers,
      0,
    );

    const totalActiveCases = departmentsWithStatistics.reduce(
      (total, department) => total + department.activeCases,
      0,
    );

    const totalCases = departmentsWithStatistics.reduce(
      (total, department) => total + department.totalCases,
      0,
    );

    const totalResolvedCases = departmentsWithStatistics.reduce(
      (total, department) => total + department.resolvedCases,
      0,
    );

    const averageResolutionRate =
      totalCases > 0
        ? Number(((totalResolvedCases / totalCases) * 100).toFixed(1))
        : 0;

    return res.status(200).json({
      success: true,
      departments: filteredDepartments,

      summary: {
        totalDepartments: departmentsWithStatistics.length,

        activeDepartments: departmentsWithStatistics.filter(
          (department) => department.status === "Active",
        ).length,

        totalOfficers,
        activeCases: totalActiveCases,
        averageResolutionRate,
      },
    });
  } catch (error) {
    console.error("Get departments error:", error);

    return res.status(500).json({
      success: false,
      message: "Unable to retrieve departments",
    });
  }
};

/*
  POST /api/departments

  Admin:
  Create a department.
*/
export const createDepartment = async (req, res) => {
  try {
    const { name, head, email, description = "", color = "blue" } = req.body;

    if (!name || !head || !email) {
      return res.status(400).json({
        success: false,
        message: "Department name, head and email are required",
      });
    }

    const normalizedName = name.trim();
    const normalizedEmail = email.trim().toLowerCase();

    const nameExpression = new RegExp(
      `^${escapeRegularExpression(normalizedName)}$`,
      "i",
    );

    const existingDepartment = await Department.findOne({
      $or: [
        {
          name: nameExpression,
        },
        {
          email: normalizedEmail,
        },
      ],
    });

    if (existingDepartment) {
      return res.status(409).json({
        success: false,
        message:
          existingDepartment.email === normalizedEmail
            ? "A department with this email already exists"
            : "A department with this name already exists",
      });
    }

    const department = await Department.create({
      name: normalizedName,
      head: head.trim(),
      email: normalizedEmail,
      description: description.trim(),
      color,
      createdBy: req.user._id,
    });

    await department.populate("createdBy", "name email role");

    return res.status(201).json({
      success: true,
      message: "Department created successfully",

      department: {
        ...department.toObject(),
        officers: 0,
        activeCases: 0,
        totalCases: 0,
        resolvedCases: 0,
        resolutionRate: 0,
      },
    });
  } catch (error) {
    console.error("Create department error:", error);

    if (error.name === "ValidationError") {
      const firstError = Object.values(error.errors)[0];

      return res.status(400).json({
        success: false,
        message: firstError.message,
      });
    }

    if (error.code === 11000) {
      return res.status(409).json({
        success: false,
        message: "Department name or email already exists",
      });
    }

    return res.status(500).json({
      success: false,
      message: "Unable to create department",
    });
  }
};

/*
  PATCH /api/departments/:departmentId

  Admin:
  Edit department information, status,
  colour and SLA targets.
*/
export const updateDepartment = async (req, res) => {
  try {
    const { departmentId } = req.params;

    const department = await Department.findById(departmentId);

    if (!department) {
      return res.status(404).json({
        success: false,
        message: "Department not found",
      });
    }

    const allowedFields = [
      "name",
      "head",
      "email",
      "description",
      "status",
      "color",
      "slaHours",
    ];

    const updates = Object.fromEntries(
      Object.entries(req.body).filter(([key]) => allowedFields.includes(key)),
    );

    if (updates.name && updates.name.trim() !== department.name) {
      const nameExpression = new RegExp(
        `^${escapeRegularExpression(updates.name.trim())}$`,
        "i",
      );

      const duplicateName = await Department.findOne({
        _id: {
          $ne: department._id,
        },
        name: nameExpression,
      });

      if (duplicateName) {
        return res.status(409).json({
          success: false,
          message: "A department with this name already exists",
        });
      }
    }

    if (
      updates.email &&
      updates.email.trim().toLowerCase() !== department.email
    ) {
      const duplicateEmail = await Department.findOne({
        _id: {
          $ne: department._id,
        },
        email: updates.email.trim().toLowerCase(),
      });

      if (duplicateEmail) {
        return res.status(409).json({
          success: false,
          message: "A department with this email already exists",
        });
      }
    }

    if (updates.name) {
      department.name = updates.name.trim();
    }

    if (updates.head) {
      department.head = updates.head.trim();
    }

    if (updates.email) {
      department.email = updates.email.trim().toLowerCase();
    }

    if (updates.description !== undefined) {
      department.description = updates.description.trim();
    }

    if (updates.status) {
      department.status = updates.status;
    }

    if (updates.color) {
      department.color = updates.color;
    }

    if (updates.slaHours) {
      department.slaHours = {
        ...department.slaHours.toObject(),
        ...updates.slaHours,
      };
    }

    department.updatedBy = req.user._id;

    await department.save();

    await department.populate([
      {
        path: "createdBy",
        select: "name email role",
      },
      {
        path: "updatedBy",
        select: "name email role",
      },
    ]);

    return res.status(200).json({
      success: true,
      message: "Department updated successfully",
      department,
    });
  } catch (error) {
    console.error("Update department error:", error);

    if (error.name === "CastError") {
      return res.status(400).json({
        success: false,
        message: "Invalid department ID",
      });
    }

    if (error.name === "ValidationError") {
      const firstError = Object.values(error.errors)[0];

      return res.status(400).json({
        success: false,
        message: firstError.message,
      });
    }

    return res.status(500).json({
      success: false,
      message: "Unable to update department",
    });
  }
};
