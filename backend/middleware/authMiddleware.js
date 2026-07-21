const jwt = require("jsonwebtoken");

// Protect routes that should only be used by logged-in users
const authenticateToken = (req, res, next) => {
  // Get the Authorization header sent by the frontend
  const authHeader = req.headers.authorization;

  // The token should be sent as: Bearer token_here
  const token =
    authHeader && authHeader.startsWith("Bearer ")
      ? authHeader.split(" ")[1]
      : null;

  // Stop the request if no token was sent
  if (!token) {
    return res.status(401).json({
      message: "You must be logged in to perform this action.",
    });
  }

  try {
    // Check if the token is valid
    const decodedUser = jwt.verify(
      token,
      process.env.JWT_SECRET
    );

    // Make the logged-in user's details available to the next function
    req.user = decodedUser;

    next();
  } catch (error) {
    // This happens if the token is invalid or has expired
    return res.status(403).json({
      message: "Your session is invalid or has expired.",
    });
  }
};

module.exports = authenticateToken;