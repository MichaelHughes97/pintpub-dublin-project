const bcrypt = require("bcrypt");
const db = require("../config/db");

const registerUser = async (req, res) => {
  try {
    const {
      first_name,
      last_name,
      email,
      password,
    } = req.body;

    // Check that all required fields were provided
    if (!first_name || !last_name || !email || !password) {
      return res.status(400).json({
        message:
          "First name, last name, email and password are required.",
      });
    }

    // Basic password validation
    if (password.length < 6) {
      return res.status(400).json({
        message: "Password must contain at least 6 characters.",
      });
    }

    const normalisedEmail = email.trim().toLowerCase();

    // Check whether the email already exists
    db.query(
      "SELECT user_id FROM users WHERE email = ?",
      [normalisedEmail],
      async (checkError, existingUsers) => {
        if (checkError) {
          console.error("Email check error:", checkError);

          return res.status(500).json({
            message: "Database error while checking the email.",
          });
        }

        if (existingUsers.length > 0) {
          return res.status(409).json({
            message: "An account already exists with this email.",
          });
        }

        try {
          // Hash the password before storing it
          const passwordHash = await bcrypt.hash(password, 10);

          const sql = `
            INSERT INTO users
              (first_name, last_name, email, password_hash, role)
            VALUES (?, ?, ?, ?, ?)
          `;

          db.query(
            sql,
            [
              first_name.trim(),
              last_name.trim(),
              normalisedEmail,
              passwordHash,
              "user",
            ],
            (insertError, result) => {
              if (insertError) {
                console.error("Registration insert error:", insertError);

                return res.status(500).json({
                  message: "Unable to create the account.",
                });
              }

              return res.status(201).json({
                message: "Registration successful.",
                user: {
                  user_id: result.insertId,
                  first_name: first_name.trim(),
                  last_name: last_name.trim(),
                  email: normalisedEmail,
                  role: "user",
                },
              });
            }
          );
        } catch (hashError) {
          console.error("Password hashing error:", hashError);

          return res.status(500).json({
            message: "Unable to securely process the password.",
          });
        }
      }
    );
  } catch (error) {
    console.error("Unexpected registration error:", error);

    return res.status(500).json({
      message: "Unexpected registration error.",
    });
  }
};

module.exports = {
  registerUser,
};