const express = require("express");
const router = express.Router();
const Profile = require("../models/profile");
const auth = require("../middleware/auth");

//Get
router.get("/", auth, async (req, res) => {
  try {
    const profile = await Profile.findOne({ user: req.user.id });
    if (!profile) return res.status(404).json({ message: "Profile Not Found" });
    res.json(profile);
  } catch (error) {
    res.status(500).json({ message: "Server Error" });
  }
});

//Post
router.post("/", auth, async (req, res) => {
  try {
    const profileData = { ...req.body, user: req.user.id };
    const existingProfile = await Profile.findOne({ user: req.user.id });
    if (existingProfile)
      return res.status(400).json({ message: "Profile already exist" });
    const profile = new Profile(profileData);
    await profile.save();
    res.status(201).json(profile);
  } catch (error) {
    res.status(500).json({ message: "Server Error" });
  }
});

//Put

router.put("/", auth, async (req, res) => {
  try {
    const updateProfile = await Profile.findOneAndUpdate(
      {
        user: req.user.id,
      },
      {
        $set: req.body,
      },
      { new: true }
    );
    if (!updateProfile)
      return res.status(404).json({ message: "Profile Not Found" });
    res.json(updateProfile);
  } catch (error) {
    res.status(500).json({ message: "Server Error" });
  }
});

//Delete

router.delete("/", auth, async (req, res) => {
  try {
    const profile = await Profile.findOneAndDelete({ user: req.user.id });
    if (!profile) return res.status(404).json({ message: "Profile Not Found" });
    res.json({ message: "Profile Deleted" });
  } catch (error) {
    res.status(500).json({ message: "Server Error" });
  }
});

module.exports = router;
