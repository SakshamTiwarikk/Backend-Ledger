const express = require("express")
const authMiddleware = require("../middleware/auth.middleware")
const accountController = require("../controllers/account.controller")

const router = express.Router()

// ─────────────────────────────────────────────────────────────────────────────
// POST /api/accounts/
// Create a new account for the logged-in user
// ─────────────────────────────────────────────────────────────────────────────
router.post(
  "/",
  authMiddleware.authMiddleware,
  accountController.createAccountController
)

// ─────────────────────────────────────────────────────────────────────────────
// GET /api/accounts/
// Get all accounts belonging to the logged-in user
// ─────────────────────────────────────────────────────────────────────────────
router.get(
  "/",
  authMiddleware.authMiddleware,
  accountController.getUserAccountsController
)

// ─────────────────────────────────────────────────────────────────────────────
// GET /api/accounts/all
// ADMIN ONLY — fetch every account across all users (with user name + email)
// Must be registered BEFORE /balance/:accountId to avoid route conflicts
// ─────────────────────────────────────────────────────────────────────────────
router.get(
  "/all",
  authMiddleware.authSystemUserMiddleware,
  accountController.getAllAccountsController
)

// ─────────────────────────────────────────────────────────────────────────────
// GET /api/accounts/balance/:accountId
// Get balance for a specific account
// Admin can query any account; regular users only their own
// ─────────────────────────────────────────────────────────────────────────────
router.get(
  "/balance/:accountId",
  authMiddleware.authMiddleware,
  accountController.getAccountBalanceController
)

// ─────────────────────────────────────────────────────────────────────────────
// GET /api/accounts/by-email/:email
// Find another user's active account by their email (for peer transfers)
// ─────────────────────────────────────────────────────────────────────────────
router.get(
  "/by-email/:email",
  authMiddleware.authMiddleware,
  accountController.getAccountByEmail
)

module.exports = router
