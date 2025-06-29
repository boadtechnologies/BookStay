const express = require("express");
const router = express.Router();
const Listing = require("../models/Listing");
const auth = require("../middleware/auth");

//Get Listings
router.get("/", async (req, res) => {
  try {
    const { location, minPrice, maxPrice } = req.query;
    const filter = {};

    if (location) filter.location = { $regex: location, $options: "i" };
    if (minPrice || maxPrice) filter.price = {};
    if (minPrice) filter.price.$gte = +minPrice;
    if (maxPrice) filter.price.$lte = +maxPrice;

    const listings = await Listing.find(filter);
    res.json(listings);
  } catch (error) {
    res.status(500).json({ message: "Error fetching listings" });
  }
});

//Get Listing by id

router.get("/:id", async (req, res) => {
  try {
    const listing = await Listing.findById(req.params.id);
    if (!listing) return res.status(404).json({ message: "Listing Not Found" });
    res.json(listing);
  } catch (error) {
    res.status(500).json({ message: "Error Fetching Listings" });
  }
});

//Post Listing by Host

router.post("/", auth, async (req, res) => {
  try {
    if (!req.user.isHost) {
      return res.status(403).json({ message: "Only hosts can add listings" });
    }
    const listing = new Listing({ ...req.body, hostId: req.user.id });
    await listing.save();
    res.status(201).json(listing);
  } catch (error) {
    res.status(500).json({ message: "Error creating listings" });
  }
});

//Put by host
router.put("/:id", auth, async (req, res) => {
  try {
    const listing = await Listing.findById(req.params.id);
    if (!listing) return res.status(404).json({ message: "Listing not found" });
    if (listing.hostId.toString() !== req.user.id) {
      return res.status(403).json({ message: "Unauthorized" });
    }
    const updated = await Listing.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
    });
    res.json(updated);
  } catch (error) {
    res.status(500).json({ message: "Error updating Listing" });
  }
});

//Delete Listing by Host

router.delete("/:id", auth, async (req, res) => {
  try {
    const listing = await Listing.findById(req.params.id);
    if (!listing) return res.status(404).json({ message: "Listing not found" });

    if (listing.hostId.toString() !== req.user.id) {
      return res.status(403).json({ message: "Unauthorized" });
    }
    await listing.deleteOne();
    res.json({ message: "Deleted Successfully" });
  } catch (error) {
    res.status(500).json({ message: "Error in deleting Listing" });
  }
});

router.get("/my-listing", auth, async (req, res) => {
  try {
    if (!req.user.isHost) {
      return res
        .status(403)
        .json({ message: "only host can view their listing " });
    }
    const listing = await Listing.find({ hostId: req.user.id });
    res.json(listing);
  } catch (error) {
    res.status(500).json({ message: "Error in fetching the listing" });
  }
});

module.exports = router;
