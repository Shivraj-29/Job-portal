const fs = require('fs');
const path = require('path');
const User = require("../models/User");

// @desc    Update user profile (name, avatar, company details)
exports.updateProfile = async (req, res) => {
  try {
    const { name, companyName, companyDescription } = req.body; // Removed avatar, companyLogo, resume from body destructuring as they come from files or body
    const user = await User.findById(req.user._id);
    if (!user) return res.status(404).json({ message: "User not found" });

    user.name = name || user.name;

    // Handle file uploads
    if (req.files) {
      if (req.files.avatar) {
        user.avatar = req.files.avatar[0].path;
      }
      if (req.files.resume) {
        user.resume = req.files.resume[0].path;
      }
      if (req.files.companyLogo) {
        user.companyLogo = req.files.companyLogo[0].path;
      }
    }

    // Also allow updating text URLs if provided in body (fallback), but ONLY if no file was uploaded for that field 
    // AND it is a valid HTTP string (not a blob URL or array)
    if (!req.files?.avatar && typeof req.body.avatar === 'string' && req.body.avatar.startsWith('http') && !req.body.avatar.startsWith('blob:')) {
      user.avatar = req.body.avatar;
    }
    if (!req.files?.resume && typeof req.body.resume === 'string' && req.body.resume.startsWith('http') && !req.body.resume.startsWith('blob:')) {
      user.resume = req.body.resume;
    }
    if (!req.files?.companyLogo && typeof req.body.companyLogo === 'string' && req.body.companyLogo.startsWith('http') && !req.body.companyLogo.startsWith('blob:')) {
      user.companyLogo = req.body.companyLogo;
    }

    // If employer, allow updating company info
    if (user.role === "employer") {
      user.companyName = companyName || user.companyName;
      user.companyDescription = companyDescription || user.companyDescription;
    }
    await user.save();

    res.json({
      _id: user._id,
      name: user.name,
      avatar: user.avatar,
      role: user.role,
      companyName: user.companyName,
      companyDescription: user.companyDescription,
      companyLogo: user.companyLogo,
      resume: user.resume || "",
    });

  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// @desc    Delete resume file (Jobseeker only)
exports.deleteResume = async (req, res) => {
  try {
    const user = await User.findById(req.user._id);
    if (!user) return res.status(404).json({ message: "User not found" });

    if (user.role !== "jobseeker")
      return res.status(403).json({ message: "Only jobseekers can delete resume" });

    // With Cloudinary, we just remove the link from the DB.
    // Optionally we could call cloudinary.uploader.destroy(public_id) if we parsed it.

    user.resume = "";
    await user.save();

    res.json({ message: "Resume deleted successfully" });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// @desc    Get user public profile
exports.getPublicProfile = async (req, res) => {
  try {
    const user = await User.findById(req.params.id).select("-password");

    if (!user) return res.status(404).json({ message: "User not found" });

    res.json(user);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};