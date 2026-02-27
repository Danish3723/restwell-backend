const express = require("express");
const router = express.Router();
const { db } = require("../firebase");

/* =====================================================
   REVENUE ANALYTICS
   /api/analytics/revenue
===================================================== */
router.get("/revenue", async (req, res) => {
  try {
    const { from, to } = req.query;

    const snapshot = await db
      .collection("bookings")
      .where("status", "==", "approved")
      .get();

    let totalRevenue = 0;
    let revenueByService = {};
    let revenueByDate = {};

    snapshot.docs.forEach(doc => {
      const data = doc.data();
      const price = Number(data.price || 0);

      // Date conversion
      const dateObj = data.createdAt
        ? new Date(data.createdAt._seconds * 1000)
        : null;

      // Date filter
      if (from && dateObj && dateObj < new Date(from)) return;
      if (to && dateObj && dateObj > new Date(to)) return;

      totalRevenue += price;

      // Group by service
      if (!revenueByService[data.serviceName]) {
        revenueByService[data.serviceName] = 0;
      }
      revenueByService[data.serviceName] += price;

      // Group by date (YYYY-MM-DD)
      const dateKey = dateObj
        ? dateObj.toISOString().split("T")[0]
        : "unknown";

      if (!revenueByDate[dateKey]) {
        revenueByDate[dateKey] = 0;
      }
      revenueByDate[dateKey] += price;
    });

    res.json({
      totalRevenue,
      revenueByService,
      revenueByDate
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;
