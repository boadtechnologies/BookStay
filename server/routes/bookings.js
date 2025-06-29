const express = require("express");
const router = express.Router();
const Booking = require("../models/Booking");
const auth = require("../middleware/auth");

//create a new booking
router.post("/", auth, async (req, res) => {
  try {
    const { listingId, checkIn, checkOut } = req.body;
    const booking = new Booking({
      listingId,
      userId: req.user.id,
      checkIn,
      checkOut,
    });
    await booking.save();
    res.status(201).json(booking);
  } catch (error) {
    res.status(500).json({ message: "Error creating booking" });
  }
});

router.get("/my-bookings", auth, async (req, res) => {
  try {
    const bookings = await Booking.find({ userId: req.user.id }).populate(
      "listingId"
    );
    res.json(bookings);
  } catch (error) {
    res.status(500).json({ message: "Error fetching booking" });
  }
});

//Get a single booking by thier id

router.get("/:id", auth, async (req, res) => {
  try {
    const booking = await Booking.findById(req.params.id).populate("listingId");
    if (!booking) return res.status(404).json({ message: "Booking not found" });
    if (booking.userId.toString() !== req.user.id)
      return res.status(403).json({ message: "unauthorized" });
    res.json(booking);
  } catch (error) {
    res.status(500).json({ message: "Error fetching booking" });
  }
});

//Update the booking

router.put("/:id", auth, async (req, res) => {
  try {
    const booking = await Booking.findById(req.params.id);
    if (!booking) return res.status(404).json({ message: "Booking not found" });
    if (booking.userId.toString() !== req.user.id)
      return res.status(403).json({
        message: "Unauthorized",
      });

    const { checkIn, checkOut } = req.body;
    booking.checkIn = checkIn || booking.checkIn;
    booking.checkOut = checkOut || booking.checkOut;

    await booking.save();
    res.json(booking);
  } catch (error) {
    res.status(500).json({ message: "Error updating Booking" });
  }
});
router.delete("/:id", auth, async (req, res) => {
  try {
    const booking = await Booking.findById(req.params.id);
    if (!booking) return res.status(404).json({ message: "Booking not found" });
    if (booking.userId.toString() !== req.user.id)
      return res.status(403).json({
        message: "Unauthorized",
      });
    await Booking.deleteOne();
    res.json({ message: "Booking Deleted" });
  } catch (error) {
    res.status(500).json({ message: "Error deleting Booking" });
  }
});

module.exports = router;
