import cloudinary from "../configs/cloudinary.js";
import Hotel from "../models/Hotel.js";
import Room from "../models/Room.js";

// ✅ API untuk membuat kamar baru
export const createRoom = async (req, res) => {
  try {
    const { roomType, pricePerNight, amenities } = req.body;
    const { userId } = await req.auth(); // ✅ Perbaikan penggunaan Clerk

    const hotel = await Hotel.findOne({ owner: userId });
    if (!hotel) {
      return res.json({ success: false, message: "No Hotel Found" });
    }

    // ✅ Upload gambar ke Cloudinary dengan Promise.all
    const uploadImages = await Promise.all(
      req.files.map(async (file) => {
        const response = await cloudinary.uploader.upload(file.path);
        return response.secure_url;
      })
    );

    await Room.create({
      hotel: hotel._id,
      roomType,
      pricePerNight: +pricePerNight,
      amenities: JSON.parse(amenities),
      images: uploadImages,
    });

    res.json({ success: true, message: "Room Created Successfully" });
  } catch (error) {
    res.json({ success: false, message: error.message });
  }
};

// ✅ API untuk mendapatkan semua kamar yang tersedia
export const getRooms = async (req, res) => {
  try {
    const rooms = await Room.find({ isAvailable: true })
      .populate({
        path: "hotel",
        populate: {
          path: "owner",
          select: "image",
        },
      })
      .sort({ createdAt: -1 });

    res.json({ success: true, rooms });
  } catch (error) {
    res.json({ success: false, message: error.message });
  }
};

// ✅ API untuk mendapatkan semua kamar milik owner hotel
export const getOwnerRooms = async (req, res) => {
  try {
    const { userId } = await req.auth(); // ✅ Fix deprecated Clerk
    const hotelData = await Hotel.findOne({ owner: userId });

    if (!hotelData) {
      return res.json({ success: false, message: "Hotel not found" });
    }

    const rooms = await Room.find({ hotel: hotelData._id.toString() }).populate("hotel");
    res.json({ success: true, rooms });
  } catch (error) {
    res.json({ success: false, message: error.message });
  }
};

// ✅ API untuk toggle ketersediaan kamar
export const toggleRoomAvailability = async (req, res) => {
  try {
    const { roomId } = req.body;
    const roomData = await Room.findById(roomId);

    if (!roomData) {
      return res.json({ success: false, message: "Room not found" });
    }

    roomData.isAvailable = !roomData.isAvailable;
    await roomData.save();

    res.json({ success: true, message: "Room Availability Updated" });
  } catch (error) {
    res.json({ success: false, message: error.message });
  }
};
