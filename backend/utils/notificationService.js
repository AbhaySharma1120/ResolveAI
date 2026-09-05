import Notification from "../models/Notification.js";
import User from "../models/User.js";

export const createNotification = async ({
  recipient,
  type,
  title,
  text,
  complaint = null,
  path,
}) => {
  try {
    if (!recipient) {
      return null;
    }

    return await Notification.create({
      recipient,
      type,
      title,
      text,
      complaint,
      path,
    });
  } catch (error) {
    /*
      A notification failure should not
      break the main complaint operation.
    */
    console.error("Create notification error:", error.message);

    return null;
  }
};

export const notifyUsers = async ({
  recipients,
  type,
  title,
  text,
  complaint = null,
  path,
}) => {
  try {
    const uniqueRecipients = [
      ...new Set(
        recipients.filter(Boolean).map((recipient) => recipient.toString()),
      ),
    ];

    if (uniqueRecipients.length === 0) {
      return [];
    }

    const notifications = uniqueRecipients.map((recipient) => ({
      recipient,
      type,
      title,
      text,
      complaint,
      path,
    }));

    return await Notification.insertMany(notifications, {
      ordered: false,
    });
  } catch (error) {
    console.error("Create multiple notifications error:", error.message);

    return [];
  }
};

export const notifyActiveRole = async ({
  role,
  department,
  type,
  title,
  text,
  complaint = null,
  path,
}) => {
  try {
    const filter = {
      role,
      isActive: true,
    };

    if (department) {
      filter.department = department;
    }

    const users = await User.find(filter).select("_id");

    return notifyUsers({
      recipients: users.map((user) => user._id),
      type,
      title,
      text,
      complaint,
      path,
    });
  } catch (error) {
    console.error("Notify role error:", error.message);

    return [];
  }
};
