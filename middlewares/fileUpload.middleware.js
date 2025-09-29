// import multer from "multer";
// import fs from "fs";

// const storage = multer.diskStorage({
//   destination: (req, file, cb) => {
//     let uploadPath = "./Uploads/"; // default fallback

//     // Decide folder based on fieldname
//     if (file.fieldname === "aadhar") {
//       uploadPath = "./Uploads/Aadhar";
//     } else if (file.fieldname === "drivingLicense") {
//       uploadPath = "./Uploads/DrivingLicense";
//     } else if (file.fieldname === "addressProof") {
//       uploadPath = "./Uploads/AddressProof";
//     } else if (file.fieldname === "profilePicture") {
//       uploadPath = "./Uploads/ProfilePicture";
//     }

//     // Ensure the folder exists
//     fs.mkdirSync(uploadPath, { recursive: true });

//     cb(null, uploadPath);
//   },
//   filename: (req, file, cb) => {
//     const uniqueName = `${Date.now()}-${file.originalname}`;
//     cb(null, uniqueName);
//   },
// });

import multer from "multer";
import path from "path";

// storage config
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    if (file.mimetype.startsWith("video")) {
      cb(null, "Uploads/Videos");
    } else if (file.mimetype.startsWith("image")) {
      cb(null, "Uploads/Images");
    } else {
      cb(new Error("Invalid file type"), false);
    }
  },
  filename: (req, file, cb) => {
    cb(null, Date.now() + path.extname(file.originalname));
  },
});

// Multer middleware
export const upload = multer({ storage });
