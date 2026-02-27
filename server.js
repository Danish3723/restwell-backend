const express = require("express");
const cors = require("cors");
require("dotenv").config();

const app = express();

/* ===============================
   Middleware
================================ */
app.use(cors());
app.use(express.json());

/* ===============================
   Routes
================================ */
app.use("/api/users", require("./routes/userRoutes"));
app.use("/api/services", require("./routes/serviceRoutes"));
app.use("/api/bookings", require("./routes/bookingRoutes"));
app.use("/api/payments", require("./routes/paymentRoutes"));
app.use("/api/logs", require("./routes/logRoutes"));
app.use("/api/reports", require("./routes/reportRoutes"));
app.use("/api/analytics", require("./routes/analyticsRoutes"));

/* ===============================
   Health Check
================================ */
app.get("/", (req, res) => {
  res.send("RestWell Backend Running Successfully");
});

/* ===============================
   Server
================================ */
const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
