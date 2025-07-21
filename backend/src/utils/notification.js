// utils/createNotification.js
import Notification from "../models/notificationModel.js";

const createNotification = async ({ recipient, sender, type, post = null }) => {
  if (recipient.toString() === sender.toString()) return; // Don't notify yourself

  try {
    await Notification.create({
      recipient,
      sender,
      type,
      post,
    });
  } catch (err) {
    console.error("Notification error:", err);
  }
};

export default createNotification;
