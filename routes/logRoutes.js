const express = require("express");
const router = express.Router();
const { db } = require("../firebase");

/* =====================================================
   GET logs (with readable timestamp)
===================================================== */
router.get("/", async (req, res) => {
  try {
    const snapshot = await db
      .collection("logs")
      .orderBy("timestamp", "desc")
      .get();

    const logs = snapshot.docs.map(doc => {
      const data = doc.data();

      return {
        id: doc.id,
        action: data.action,
        bookingId: data.bookingId,
        adminEmail: data.adminEmail,

        // ✅ Convert Firestore Timestamp → readable date
        timestamp: data.timestamp
          ? new Date(data.timestamp._seconds * 1000).toLocaleString()
          : null
      };
    });

    res.json(logs);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;
