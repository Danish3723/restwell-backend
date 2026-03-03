const express = require("express");
const router = express.Router();
const { db } = require("../firebase");

/* =====================================================
   GET ALL BOOKINGS (ADMIN)
===================================================== */
router.get("/", async (req, res) => {
  try {
    const snapshot = await db
      .collection("bookings")
      .orderBy("createdAt", "desc")
      .get();

    const bookings = snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }));

    res.json(bookings);

  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

/* =====================================================
   GET BOOKINGS BY PHONE (USER)
===================================================== */
router.get("/phone/:phone", async (req, res) => {
  try {
    const phone = req.params.phone;

    const snapshot = await db
      .collection("bookings")
      .where("phone", "==", phone)
      .orderBy("createdAt", "desc")
      .get();

    const bookings = snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }));

    res.json(bookings);

  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

/* =====================================================
   CREATE BOOKING
===================================================== */
router.post("/", async (req, res) => {
  try {
    const {
      userName,
      phone,
      serviceName,
      preferredDate,
      timeSlot,
      description,
      imageUrls
    } = req.body;

    if (!userName || !phone || !serviceName || !preferredDate || !timeSlot) {
      return res.status(400).json({ error: "Missing required fields" });
    }

    const booking = {
      userName,
      phone,
      serviceName,
      preferredDate,
      timeSlot,
      description: description || "",
      imageUrls: Array.isArray(imageUrls) ? imageUrls : [],
      technician: "",
      status: "pending",
      createdAt: new Date()
    };

    const docRef = await db.collection("bookings").add(booking);

    res.json({
      message: "Booking created successfully",
      bookingId: docRef.id
    });

  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

/* =====================================================
   APPROVE BOOKING
===================================================== */
router.put("/:id/approve", async (req, res) => {
  try {
    const bookingId = req.params.id;
    const bookingRef = db.collection("bookings").doc(bookingId);
    const bookingSnap = await bookingRef.get();

    if (!bookingSnap.exists) {
      return res.status(404).json({ error: "Booking not found" });
    }

    const bookingData = bookingSnap.data();

    await bookingRef.update({ status: "approved" });

    await db.collection("adminLogs").add({
      action: "Approved",
      bookingId,
      admin: "Admin",
      time: new Date()
    });

    res.json({ message: "Booking approved" });

  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

/* =====================================================
   REJECT BOOKING
===================================================== */
router.put("/:id/reject", async (req, res) => {
  try {
    const bookingId = req.params.id;
    const bookingRef = db.collection("bookings").doc(bookingId);
    const bookingSnap = await bookingRef.get();

    if (!bookingSnap.exists) {
      return res.status(404).json({ error: "Booking not found" });
    }

    await bookingRef.update({ status: "rejected" });

    await db.collection("adminLogs").add({
      action: "Rejected",
      bookingId,
      admin: "Admin",
      time: new Date()
    });

    res.json({ message: "Booking rejected" });

  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

/* =====================================================
   UPDATE STATUS (In Progress / Completed)
===================================================== */
router.put("/:id/status", async (req, res) => {
  try {
    const { status } = req.body;
    const bookingId = req.params.id;

    await db.collection("bookings")
      .doc(bookingId)
      .update({ status });

    await db.collection("adminLogs").add({
      action: `Status changed to ${status}`,
      bookingId,
      admin: "Admin",
      time: new Date()
    });

    res.json({ message: "Status updated successfully" });

  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

/* =====================================================
   ASSIGN TECHNICIAN
===================================================== */
router.put("/:id/assign", async (req, res) => {
  try {
    const { technician } = req.body;
    const bookingId = req.params.id;

    await db.collection("bookings")
      .doc(bookingId)
      .update({ technician });

    await db.collection("adminLogs").add({
      action: `Technician assigned: ${technician}`,
      bookingId,
      admin: "Admin",
      time: new Date()
    });

    res.json({ message: "Technician assigned successfully" });

  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

/* =====================================================
   DELETE BOOKING
===================================================== */
router.delete("/:id", async (req, res) => {
  try {
    const bookingId = req.params.id;

    await db.collection("bookings").doc(bookingId).delete();

    await db.collection("adminLogs").add({
      action: "Deleted booking",
      bookingId,
      admin: "Admin",
      time: new Date()
    });

    res.json({ message: "Booking deleted successfully" });

  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

/* =====================================================
   GET ADMIN LOGS
===================================================== */
router.get("/logs", async (req, res) => {
  try {
    const snapshot = await db
      .collection("adminLogs")
      .orderBy("time", "desc")
      .get();

    const logs = snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }));

    res.json(logs);

  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;