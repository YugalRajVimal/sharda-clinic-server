import mongoose from "mongoose";

const adminSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
  },
  email: {
    type: String,
    required: true,
    unique: true,
  },
  phoneNo: {
    type: String,
    unique: true,
  },
  otp: {
    type: String,
  },
  otpExpires: {
    type: Date,
  },
  blogs: [
    {
      title: String,
      description: String,
      imagePath: String,
      videoPath: String,
    },
  ],
});

const AdminModel = mongoose.model("Admin", adminSchema);

export default AdminModel;
