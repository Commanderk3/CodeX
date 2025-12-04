const express = require("express");
const Room = require("../models/Room");
const router = express.Router();

router.get("/", async (req, res) => {
  try {
    const rooms = await Room.find();
    res.status(200).json(rooms);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;