const express = require("express");
const {
  updateProfile,
  deleteResume,
  getPublicProfile,
} = require("../controllers/userController");
const { protect } = require("../middlewares/authMiddleware");

const router = express.Router();

const upload = require("../middlewares/uploadMiddleware");

// Protected routes
router.put(
  "/profile",
  protect,
  upload.fields([
    { name: "avatar", maxCount: 1 },
    { name: "companyLogo", maxCount: 1 },
    { name: "resume", maxCount: 1 },
  ]),
  updateProfile
);
router.post("/resume", protect, deleteResume);

// Public route
router.get("/:id", getPublicProfile);

module.exports = router;