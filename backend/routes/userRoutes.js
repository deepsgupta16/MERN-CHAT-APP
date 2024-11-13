const express = require("express");
const router = express.Router();
const {
  registerUser,
  authUser,
  allUsers,
  cleanupGuestUser,
} = require("../controllers/userControllers");
const { protect } = require("../middleware/authMiddleware");

const User = require("../Models/userModel");

router.route("/").post(registerUser).get(protect, allUsers);
router.post("/login", authUser);
router.post("/logout", protect, async (req, res) => {
  try {
    if (!req.user) {
      return res.status(401).json({ message: "User not found" });
    }

    if (req.user.email === "guest@example.com") {
      await cleanupGuestUser(req.user._id);
    }

    res.status(200).json({ message: "Logged out successfully" });
  } catch (error) {
    res.status(500).json({
      message: "Error in logout",
      error: error.toString(),
    });
  }
});

module.exports = router;
