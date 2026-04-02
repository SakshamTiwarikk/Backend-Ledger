const accountModel = require("../models/account.model");
const userModel = require("../models/user.model");

// ─────────────────────────────────────────────────────────────────────────────
// POST /api/accounts/
// Creates a new account for the logged-in user
// ─────────────────────────────────────────────────────────────────────────────
async function createAccountController(req, res) {
  const user = req.user;
  const account = await accountModel.create({ user: user._id });
  res.status(201).json({ account });
}

// ─────────────────────────────────────────────────────────────────────────────
// GET /api/accounts/
// Returns only the logged-in user's own accounts
// ─────────────────────────────────────────────────────────────────────────────
async function getUserAccountsController(req, res) {
  const accounts = await accountModel.find({ user: req.user._id });
  res.status(200).json({ accounts });
}

// ─────────────────────────────────────────────────────────────────────────────
// GET /api/accounts/balance/:accountId
// Returns balance for a specific account (must belong to req.user)
// ─────────────────────────────────────────────────────────────────────────────
async function getAccountBalanceController(req, res) {
  const { accountId } = req.params;

  // Allow admin (systemUser) to query any account balance
  const query = req.user.systemUser
    ? { _id: accountId }
    : { _id: accountId, user: req.user._id };

  const account = await accountModel.findOne(query);

  if (!account) {
    return res.status(404).json({ message: "Account not found" });
  }

  const balance = await account.getBalance();
  res.status(200).json({ accountId: account._id, balance });
}

// ─────────────────────────────────────────────────────────────────────────────
// GET /api/accounts/all
// ADMIN ONLY — returns ALL accounts across all users, with user info populated
// Protected by authSystemUserMiddleware
// ─────────────────────────────────────────────────────────────────────────────
async function getAllAccountsController(req, res) {
  try {
    // Populate user field so admin can see name + email alongside each account
    const accounts = await accountModel
      .find({})
      .populate("user", "name email") // pulls name & email from user document
      .sort({ createdAt: -1 });        // newest first

    res.status(200).json({ accounts });
  } catch (err) {
    console.error("getAllAccounts error:", err);
    res.status(500).json({ message: "Failed to fetch all accounts" });
  }
}

// ─────────────────────────────────────────────────────────────────────────────
// GET /api/accounts/by-email/:email
// Finds any active account by the owner's email address
// Used by regular users to search for another user's account before transferring
// ─────────────────────────────────────────────────────────────────────────────
async function getAccountByEmail(req, res) {
  const { email } = req.params;

  try {
    const user = await userModel.findOne({ email });

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    const account = await accountModel.findOne({
      user: user._id,
      status: "ACTIVE",
    });

    if (!account) {
      return res.status(404).json({ message: "No active account found for this user" });
    }

    res.status(200).json({
      account: {
        _id: account._id,
        user: {
          name: user.name,
          email: user.email,
        },
        currency: account.currency,
        status: account.status,
      },
    });
  } catch (err) {
    console.error("getAccountByEmail error:", err);
    res.status(500).json({ message: "Server error" });
  }
}

module.exports = {
  createAccountController,
  getUserAccountsController,
  getAccountBalanceController,
  getAllAccountsController,
  getAccountByEmail,
};
