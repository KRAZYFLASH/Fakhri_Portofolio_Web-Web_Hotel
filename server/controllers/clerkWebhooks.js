import connectDB from "./configs/db.js" // atau path sesuai struktur project
import User from "../models/User.js";
import { Webhook } from "svix";

const clerkWebhooks = async (req, res) => {
  try {
    await connectDB(); // 🔥 PENTING: aktifkan koneksi sebelum akses DB

    const whook = new Webhook(process.env.CLERK_WEBHOOK_SECRET);
    const headers = {
      "svix-id": req.headers["svix-id"],
      "svix-timestamp": req.headers["svix-timestamp"],
      "svix-signature": req.headers["svix-signature"]
    };

    const evt = whook.verify(JSON.stringify(req.body), headers);
    const { data, type } = evt;

    const email = data?.email_addresses?.[0]?.email_address;
    if (!email) {
      return res.status(400).json({ success: false, message: "Missing email" });
    }

    const fullName = [data.first_name, data.last_name].filter(Boolean).join(" ");
    const userData = {
      _id: data.id,
      email,
      username: fullName,
      image: data.image_url || "",
      role: "user",
      recentSearchCities: [],
    };

    switch (type) {
      case "user.created": {
        const exists = await User.findById(data.id);
        if (!exists) await User.create(userData);
        break;
      }
      case "user.updated": {
        await User.findByIdAndUpdate(data.id, userData);
        break;
      }
      case "user.deleted": {
        await User.findByIdAndDelete(data.id);
        break;
      }
    }

    res.status(200).json({ success: true, message: "Webhook processed" });
  } catch (error) {
    console.error("❌ Webhook error:", error.message);
    res.status(500).json({ success: false, message: error.message });
  }
};

export default clerkWebhooks;
