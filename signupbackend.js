const express = require("express");
const fs = require("fs");
const path = require("path");
const app = express();
const PORT = 3000;
const cors = require("cors");

app.use(express.static(path.join(__dirname, "../Frontend")));
app.use(cors());
app.use(express.json());

//signin

app.post("/signin", (req, res) => {
    const { email, password } = req.body;

    // Check if email and password are provided
    if (!email || !password) {
        return res.status(400).json({ error: "Email and Password are required!" });
    }

    // Read the users.json file
    fs.readFile("users.json", (err, data) => {
        if (err) {
            return res.status(500).json({ error: "Error reading users data" });
        }

        let users = [];
        try {
            users = JSON.parse(data); // Parse the users data
        } catch (parseErr) {
            return res.status(500).json({ error: "Error parsing users data" });
        }

        // Check if the email and password match any user
        const user = users.find((u) => u.email === email && u.password === password);

        if (user) {
            // Successful login
            return res.status(200).json({ message: "Sign-in successful!", user });
        } else {
            // Invalid credentials
            return res.status(401).json({ error: "Invalid email or password!" });
        }
    });
});



//signup
app.post("/signup", (req, res) => {
    const { lastName, firstName, phone, email, password } = req.body;

    // Check if email or password is missing
    if (!email || !password) {
        return res.status(400).json({ error: "Email and Password are required!" });
    }

    // Read the users.json file and add the new user
    fs.readFile("users.json", (err, data) => {
        if (err) {
            return res.status(500).json({ error: "Error reading users data" });
        }

        let users = [];
        try {
            users = JSON.parse(data);
        } catch (parseErr) {
            users = [];
        }

        // Add the new user to the users array
        users.push({ lastName, firstName, phone, email, password });

        // Save the updated users data back to the file
        fs.writeFile("users.json", JSON.stringify(users), (err) => {
            if (err) {
                return res.status(500).json({ error: "Error saving user data" });
            }
            res.status(200).json({ message: "Sign-up successful!" });
        });
    });
});

// Start the server
app.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
});
