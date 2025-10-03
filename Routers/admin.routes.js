import express from "express";
import AdminController from "../Controllers/AdminControllers/admin.controller.js";
import jwtAdminAuth from "../middlewares/Auth/admin.auth.middleware.js";
import { upload } from "../middlewares/fileUpload.middleware.js";

const adminRouter = express.Router();

const adminController = new AdminController();

adminRouter.get("/", (req, res) => {
  res.send("Welcome to Green Glide App Admin APIs");
});

adminRouter.post("/auth", jwtAdminAuth, (req, res) => {
  adminController.checkAuth(req, res);
});

adminRouter.post("/signin", (req, res) => {
  adminController.signin(req, res);
});

adminRouter.post("/verify-account", (req, res) => {
  adminController.verifyAccount(req, res);
});

// adminRouter.post("/add-blog", jwtAdminAuth, (req, res) => {
//   adminController.addBlog(req, res);
// });

adminRouter.post(
  "/add-blog",
  jwtAdminAuth,
  upload.single("file"), // one file, optional
  (req, res) => adminController.addBlog(req, res)
);

adminRouter.get("/blogs", (req, res) => {
  adminController.fetchAllBlogs(req, res);
});

adminRouter.delete("/blog/:blogId", jwtAdminAuth, (req, res) => {
  adminController.deleteBlog(req, res);
});

adminRouter.post(
  "/add-video",
  jwtAdminAuth,
  upload.single("file"), // one file, optional
  (req, res) => adminController.addVideo(req, res)
);

adminRouter.get("/videos", (req, res) => {
  adminController.fetchAllVideos(req, res);
});

adminRouter.delete("/video/:videoId", jwtAdminAuth, (req, res) => {
  adminController.deleteVideo(req, res);
});

adminRouter.get("/dashboard-details", jwtAdminAuth, (req, res) => {
  adminController.getDashboardDetails(req, res);
});

export default adminRouter;
