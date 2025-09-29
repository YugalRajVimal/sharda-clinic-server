import AdminModel from "../../Schema/admin.schema.js";

import sendMail from "../../config/nodeMailer.config.js";

import jwt from "jsonwebtoken";
import BlogsModel from "../../Schema/blogs.schema.js";

class AdminController {
  checkAuth = async (req, res) => {
    try {
      console.log("Not Verified");

      if (req.user.role != "Admin") {
        return res.status(401).json({ message: "Unauthorized" });
      }
      console.log("Verified");
      return res.status(200).json({ message: "Authorized" });
    } catch (error) {
      return res.status(401).json({ message: "Unauthorized" });
    }
  };

  verifyAccount = async (req, res) => {
    const { email, otp } = req.body;
    if (!email || !otp) {
      return res.status(400).json({ message: "Email and OTP are required" });
    }
    try {
      const user = await AdminModel.findOne({ email });
      if (!user) {
        return res.status(404).json({ message: "Admin not found" });
      }
      if (user.otp !== otp) {
        return res.status(401).json({ message: "Invalid OTP" });
      }
      user.otp = null;
      user.save();
      // Verify the user and update the verified field to true
      // Generate a JSON Web Token
      const token = jwt.sign(
        { id: user.id, role: "Admin" },
        process.env.JWT_SECRET,
        { expiresIn: "24h" }
      );
      res.status(200).json({ message: "Account verified successfully", token });
    } catch (error) {
      console.error(error);
      res.status(500).json({ message: "Internal Server Error" });
    }
  };

  signin = async (req, res) => {
    const { email } = req.body;
    if (!email) {
      return res.status(400).json({ message: "Email is required" });
    }
    try {
      const user = await AdminModel.findOne({ email });
      if (!user) {
        return res.status(404).json({ message: "Admin not found" });
      }

      // Generate a random 6 digit OTP
      const otp = Math.floor(Math.random() * 900000) + 100000;
      // Save OTP to the user document and set an expiration time
      await AdminModel.findByIdAndUpdate(
        user.id,
        { otp, otpExpires: new Date(Date.now() + 10 * 60 * 1000) },
        { new: true }
      );

      // Send OTP to the user's email
      const message = `Your OTP is: ${otp}`;
      await sendMail(email, "Sign Up OTP", message);
      console.log(`[Signup] OTP email sent to ${email}.`);

      res.status(200).json({ message: "OTP sent to mail successfully" });
    } catch (error) {
      console.error(error);
      res.status(500).json({ message: "Internal Server Error" });
    }
  };

  addBlog = async (req, res) => {
    const { title, description } = req.body;

    if (!title || !description) {
      return res
        .status(400)
        .json({ message: "Title and description are required." });
    }

    try {
      const adminId = req.user.id;
      const admin = await AdminModel.findById(adminId);

      if (!admin) {
        return res.status(404).json({ message: "Admin not found." });
      }

      let imagePath = null;
      let videoPath = null;

      if (req.file) {
        if (req.file.mimetype.startsWith("video")) {
          videoPath = req.file.path;
        } else if (req.file.mimetype.startsWith("image")) {
          imagePath = req.file.path;
        }
      }

      const newBlog = await BlogsModel.create({
        admin: adminId,
        title,
        description,
        imagePath,
        videoPath,
      });

      res
        .status(201)
        .json({ message: "Blog added successfully.", blog: newBlog });
    } catch (error) {
      console.error("Error adding blog:", error);
      res.status(500).json({ message: "Internal Server Error." });
    }
  };

  fetchAllBlogs = async (req, res) => {
    try {
      const page = parseInt(req.query.page) || 1; // default to page 1
      const limit = parseInt(req.query.limit) || 10; // default 10 blogs per request
      const skip = (page - 1) * limit;

      const total = await BlogsModel.countDocuments();
      const blogs = await BlogsModel.find()
        .sort({ createdAt: -1 }) // latest first
        .skip(skip)
        .limit(limit);

      res.status(200).json({
        message: "Blogs fetched successfully.",
        blogs,
        page,
        totalPages: Math.ceil(total / limit),
      });
    } catch (error) {
      console.error("Error fetching blogs:", error);
      res.status(500).json({ message: "Internal Server Error." });
    }
  };

  deleteBlog = async (req, res) => {
    const { blogId } = req.params;

    if (!blogId) {
      return res
        .status(400)
        .json({ success: false, message: "Blog ID is required" });
    }

    try {
      const blog = await BlogsModel.findById(blogId);

      if (!blog) {
        return res
          .status(404)
          .json({ success: false, message: "Blog not found" });
      }

      // Optional: check if the logged-in admin owns the blog
      if (blog.admin.toString() !== req.user.id) {
        return res
          .status(403)
          .json({
            success: false,
            message: "Unauthorized to delete this blog",
          });
      }

      await BlogsModel.findByIdAndDelete(blogId);

      return res
        .status(200)
        .json({ success: true, message: "Blog deleted successfully", blog });
    } catch (error) {
      console.error("Error deleting blog:", error);
      return res
        .status(500)
        .json({ success: false, message: "Internal Server Error" });
    }
  };
}

export default AdminController;
