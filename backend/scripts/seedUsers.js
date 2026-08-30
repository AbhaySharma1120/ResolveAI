import dotenv from "dotenv";

import connectDatabase from "../config/db.js";
import User from "../models/User.js";

dotenv.config();

const seedUsers = async () => {
  try {
    await connectDatabase();

    const accounts = [
      {
        name: "Rajesh Kumar",
        email: process.env.OFFICER_EMAIL,
        password: process.env.OFFICER_PASSWORD,
        role: "officer",
        department: "Student Affairs",
        designation: "Complaint Officer",
      },
      {
        name: "Anil Kumar",
        email: process.env.ADMIN_EMAIL,
        password: process.env.ADMIN_PASSWORD,
        role: "admin",
        department: "Administration",
        designation: "System Administrator",
      },
    ];

    for (const account of accounts) {
      if (!account.email || !account.password) {
        throw new Error(`Missing email or password for ${account.role}`);
      }

      const existingUser = await User.findOne({
        email: account.email.toLowerCase(),
      });

      if (existingUser) {
        console.log(`${account.role} account already exists: ${account.email}`);
        continue;
      }

      await User.create(account);

      console.log(`${account.role} account created: ${account.email}`);
    }

    console.log("Account seeding completed");
    process.exit(0);
  } catch (error) {
    console.error(`Seeding failed: ${error.message}`);
    process.exit(1);
  }
};

seedUsers();
