const express = require("express");
const jwt = require("jsonwebtoken");
const bcrypt = require("bcryptjs");
const config = require("../config");

const router = express.Router();

const passwordHash = bcrypt.hashSync(config.testUser.password, 10);

router.post("/login", async (req, res) => {
  const { username, password } = req.body;

  if (!username || !password) {
    return res.status(400).json({ message: "username and password are required" });
  }

  const validUsername = username === config.testUser.username;
  const validPassword = await bcrypt.compare(password, passwordHash);

  if (!validUsername || !validPassword) {
    return res.status(401).json({ message: "Invalid credentials" });
  }

  const token = jwt.sign({ username }, config.jwtSecret, { expiresIn: "1h" });

  return res.json({ token });
});

module.exports = router;
