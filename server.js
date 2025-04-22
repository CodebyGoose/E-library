const express = require("express");
const mysql = require("mysql");
const cors = require("cors");
const multer = require("multer");
const path = require("path");
const fs = require("fs");

const app = express();
app.use(cors());
app.use(express.json());
app.use(express.static("public")); // ✅ Serve uploaded files

// ✅ Configure Multer for file uploads
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        const uploadDir = "public/uploads/";
        if (!fs.existsSync(uploadDir)) {
            fs.mkdirSync(uploadDir, { recursive: true });
        }
        cb(null, uploadDir);
    },
    filename: (req, file, cb) => {
        cb(null, Date.now() + path.extname(file.originalname));
    }
});
const upload = multer({ storage });

// ✅ Connect to MySQL Database
const db = mysql.createConnection({
    host: "localhost",
    user: "root",
    password: "",
    database: "library_db"
});

db.connect(err => {
    if (err) {
        console.error("Database connection failed:", err);
        return;
    }
    console.log("Connected to MySQL database");
});

// ✅ Example Route (To check if the server is running)
app.get("/", (req, res) => {
    res.send("Server is running!");
});

// ✅ Register User
app.post("/register", async (req, res) => {
    const { full_name, email, password, role, employee_id, lrn } = req.body;

    if (!full_name || !email || !password || !role) {
        return res.status(400).json({ error: "All fields are required!" });
    }

    db.query("SELECT * FROM users WHERE email = ?", [email], async (err, result) => {
        if (err) return res.status(500).json({ error: "Database error" });
        if (result.length > 0) return res.status(400).json({ error: "Email already registered!" });

        const empId = role === "teacher" ? employee_id : null;
        const studentLrn = role === "student" ? lrn : null;

        db.query(
            "INSERT INTO users (full_name, email, password, role, employee_id, lrn) VALUES (?, ?, ?, ?, ?, ?)",
            [full_name, email, password, role, empId, studentLrn],
            (err, result) => {
                if (err) return res.status(500).json({ error: "Database error" });
                res.json({ message: "Registration successful!" });
            }
        );
    });
});

// ✅ Get all users (Admin Only)
app.get("/users", (req, res) => {
    db.query("SELECT full_name, email, role, employee_id, lrn FROM users", (err, result) => {
        if (err) return res.status(500).json({ error: "Database error" });
        res.json(result);
    });
});

// ✅ Delete user (Admin Only)
app.delete("/delete-user/:email", (req, res) => {
    const { email } = req.params;
    db.query("DELETE FROM users WHERE email = ?", [email], (err, result) => {
        if (err) return res.status(500).json({ error: "Database error" });
        res.json({ message: "User deleted successfully" });
    });
});

// ✅ Delete a book by ID
app.delete("/delete-book/:id", (req, res) => {
    const bookId = req.params.id;

    db.query("DELETE FROM books WHERE id = ?", [bookId], (err, result) => {
        if (err) return res.status(500).json({ error: "Database error" });

        if (result.affectedRows > 0) {
            res.json({ message: "Book deleted successfully!" });
        } else {
            res.status(404).json({ error: "Book not found!" });
        }
    });
});

// ✅ Edit Book
app.put("/edit-book/:id", upload.single("file"), (req, res) => {
    const bookId = req.params.id;
    const { title, author, year } = req.body;
    const filePath = req.file ? `/uploads/${req.file.filename}` : null; // Handle file upload

    if (!title || !author || !year) {
        return res.status(400).json({ error: "All fields are required!" });
    }

    let query = "UPDATE books SET title = ?, author = ?, year = ?";
    let values = [title, author, year];

    if (filePath) {
        query += ", file_path = ?";
        values.push(filePath);
    }

    query += " WHERE id = ?";
    values.push(bookId);

    db.query(query, values, (err, result) => {
        if (err) return res.status(500).json({ error: "Database error" });

        if (result.affectedRows > 0) {
            res.json({ message: "Book updated successfully!" });
        } else {
            res.status(404).json({ error: "Book not found!" });
        }
    });
});



// ✅ Get all books (Include File URLs)
app.get("/books", (req, res) => {
    db.query("SELECT * FROM books", (err, result) => {
        if (err) return res.status(500).json({ error: "Database error" });
        res.json(result);
    });
});

// ✅ Add Book with File Upload
app.post("/upload-book", upload.single("file"), (req, res) => {
    const { title, author, year } = req.body;
    if (!title || !author || !year || !req.file) {
        return res.status(400).json({ error: "All fields and file are required!" });
    }

    const filePath = `/uploads/${req.file.filename}`;

    db.query(
        "INSERT INTO books (title, author, year, file_path) VALUES (?, ?, ?, ?)",
        [title, author, year, filePath],
        (err, result) => {
            if (err) return res.status(500).json({ error: "Database error" });
            res.json({ message: "Book uploaded successfully!", file_path: filePath });
        }
    );
});

app.post("/login", (req, res) => {
    const { email, password, role, employeeId, lrn } = req.body;
    
    if (!email || !password || !role) {
        return res.status(400).json({ error: "All fields are required!" });
    }

    let query = "SELECT * FROM users WHERE email = ? AND password = ? AND role = ?";
    let values = [email, password, role];

    // If role is "teacher", check Employee ID
    if (role === "teacher" && employeeId) {
        query += " AND employee_id = ?";
        values.push(employeeId);
    }

    // If role is "student", check LRN
    if (role === "student" && lrn) {
        query += " AND lrn = ?";
        values.push(lrn);
    }

    db.query(query, values, (err, results) => {
        if (err) return res.status(500).json({ error: "Database error" });

        if (results.length > 0) {
            res.json({ message: "Login successful!", user: results[0] });
        } else {
            res.status(401).json({ error: "Invalid credentials!" });
        }
    });
});

// ✅ Serve Uploaded Files
app.use("/uploads", express.static("public/uploads"));

// ✅ Get all used Employee IDs
app.get("/used-employee-ids", (req, res) => {
    db.query("SELECT employee_id FROM users WHERE employee_id IS NOT NULL", (err, result) => {
        if (err) return res.status(500).json({ error: "Database error" });

        const usedEmployeeIDs = result.map(row => row.employee_id);
        res.json({ usedEmployeeIDs });
    });
});

// ✅ Get all used LRNs
app.get("/used-lrns", (req, res) => {
    db.query("SELECT lrn FROM users WHERE lrn IS NOT NULL", (err, result) => {
        if (err) return res.status(500).json({ error: "Database error" });

        const usedLRNs = result.map(row => row.lrn);
        res.json({ usedLRNs });
    });
});

// ✅ Start Server
const PORT = 4000;
app.listen(4000, "0.0.0.0", () => console.log(`Server running on port 4000`));
