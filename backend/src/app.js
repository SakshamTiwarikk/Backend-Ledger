const express = require("express");
const cookieParser = require("cookie-parser");
const cors = require("cors"); // ✅ ADD THIS

const app = express();

// ✅ ADD THIS BLOCK
app.use(
  cors({
    origin: [
    "http://localhost:5173",
    "https://backend-ledger-git-main-sakshamtiwarikks-projects.vercel.app"
    ],
    credentials: true,
  })
);

app.use(express.json());
app.use(cookieParser());

/**
 * - Routes required
 */
const authRouter = require("./routes/auth.routes");
const accountRouter = require("./routes/account.routes");
const transactionRoutes = require("./routes/transaction.routes");

/**
 * - Use Routes
 */

app.get("/", (req, res) => {
  res.send("Ledger Service is up and running");
});

app.use("/api/auth", authRouter);
app.use("/api/accounts", accountRouter);
app.use("/api/transactions", transactionRoutes);

module.exports = app;