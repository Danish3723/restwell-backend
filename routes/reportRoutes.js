const express = require("express");
const router = express.Router();
const { db } = require("../firebase");

/* =====================================================
   GET REPORT (JSON)
   /api/reports?status=approved&from=2025-01-01&to=2025-12-31
===================================================== */
router.get("/", async (req, res) => {
  try {
    const { status, from, to } = req.query;

    let query = db.collection("bookings");

    if (status) {
      query = query.where("status", "==", status);
    }

    const snapshot = await query.get();

    let bookings = snapshot.docs.map(doc => {
      const data = doc.data();
      return {
        id: doc.id,
        userName: data.userName,
        phone: data.phone,
        serviceName: data.serviceName,
        status: data.status,
        createdAt: data.createdAt
          ? new Date(data.createdAt._seconds * 1000)
          : null
      };
    });

    // Date filter (JS-side)
    if (from || to) {
      bookings = bookings.filter(b => {
        if (!b.createdAt) return false;
        if (from && b.createdAt < new Date(from)) return false;
        if (to && b.createdAt > new Date(to)) return false;
        return true;
      });
    }

    res.json(bookings);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

/* =====================================================
   EXPORT CSV
   /api/reports/csv
===================================================== */
router.get("/csv", async (req, res) => {
  try {
    const snapshot = await db.collection("bookings").get();

    let csv = "Booking ID,User,Phone,Service,Status,Created At\n";

    snapshot.docs.forEach(doc => {
      const d = doc.data();
      const date = d.createdAt
        ? new Date(d.createdAt._seconds * 1000).toLocaleString()
        : "";

      csv += `${doc.id},${d.userName},${d.phone},${d.serviceName},${d.status},${date}\n`;
    });

    res.header("Content-Type", "text/csv");
    res.attachment("bookings_report.csv");
    res.send(csv);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
