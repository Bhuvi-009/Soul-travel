if (process.env.NODE_ENV !== "production") {
    require("dotenv").config();
}

const express = require("express");
const app = express();
const path = require("path");
const axios = require("axios");

// Middleware
app.use(express.urlencoded({ extended: false }));
app.use(express.json());
app.use(express.static(path.join(__dirname, "public")));

// EJS setup
app.set("views", path.join(__dirname, "views"));
app.set("view engine", "ejs");

// Home route
app.get("/", (req, res) => {
    res.render("index");
});

// Signup → MCAE Form Handler
app.post("/signup", async (req, res) => {
    const { email, firstName, lastName, phone } = req.body;

    if (!email) {
        return res.status(400).json({ success: false, message: "Email is required" });
    }

    if (!process.env.MCAE_FORM_HANDLER_URL) {
        console.error("❌ MCAE_FORM_HANDLER_URL is not set");
        return res.status(500).json({ success: false, message: "Server is not configured yet." });
    }

    try {
        await axios.post(
            process.env.MCAE_FORM_HANDLER_URL,
            new URLSearchParams({
                email,
                firstname: firstName || "",
                lastname: lastName || "",
                phone: phone || ""
            }).toString(),
            {
                headers: { "Content-Type": "application/x-www-form-urlencoded" },
                maxRedirects: 0,
                validateStatus: (status) => status >= 200 && status < 400
            }
        );

        console.log("✅ Sent to MCAE:", email);
        res.status(200).json({ success: true, message: "Registration successful!" });
    } catch (error) {
        console.error(
            "❌ Form handler error:",
            error.message,
            error.response ? `status=${error.response.status}` : ""
        );
        res.status(500).json({ success: false, message: "Something went wrong. Please try again later." });
    }
});

// Start server
const PORT = process.env.PORT || 40000;
app.listen(PORT, () => console.log(`🚀 Server running at http://localhost:${PORT}`));