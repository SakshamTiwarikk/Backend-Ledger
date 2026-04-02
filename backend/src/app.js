const express = require("express");
const cookieParser = require("cookie-parser");
const cors = require("cors");

const app = express();

// ✅ CORS must be the VERY FIRST middleware — before json, cookieParser, routes
app.use(
  cors({
    origin: [
      "http://localhost:5173",
      "https://backend-ledger-ecru.vercel.app",  // your Vercel frontend
    ],
    credentials: true,
    methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"],
  })
);



app.use(express.json());
app.use(cookieParser());

const authRouter = require("./routes/auth.routes");
const accountRouter = require("./routes/account.routes");
const transactionRoutes = require("./routes/transaction.routes");

app.get("/", (req, res) => {
  res.send("Ledger Service is up and running");
});

app.use("/api/auth", authRouter);
app.use("/api/accounts", accountRouter);
app.use("/api/transactions", transactionRoutes);

module.exports = app;