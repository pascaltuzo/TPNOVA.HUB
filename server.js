const express = require("express");
const path = require("path");
const expressLayouts = require("express-ejs-layouts");
const mysql = require("mysql2");
const multer = require("multer");
const fs = require("fs");

const app = express();
const PORT = 3000;

// ===============================
// DATABASE CONNECTION
// ===============================
const db = mysql.createConnection({
    host: "localhost",
    user: "root",
    password: "",
    database: "tpnova_hub"
});

db.connect((err) => {

    if (err) {
        console.log("DB Connection Error:", err);
    } else {
        console.log("✅ MySQL Connected Successfully");
    }

});

// ===============================
// CREATE UPLOAD FOLDER
// ===============================
const uploadDir = path.join(__dirname, "public/uploads");

if (!fs.existsSync(uploadDir)) {
    fs.mkdirSync(uploadDir, { recursive: true });
}

// ===============================
// MIDDLEWARE
// ===============================
app.use(express.urlencoded({ extended: true }));
app.use(express.json());

app.use(express.static(path.join(__dirname, "public")));

// ===============================
// VIEW ENGINE
// ===============================
app.set("view engine", "ejs");

app.use(expressLayouts);

app.set("layout", "./partials/layout");

app.set("views", path.join(__dirname, "views"));

// ===============================
// MULTER CONFIG
// ===============================
const storage = multer.diskStorage({

    destination: (req, file, cb) => {

        cb(null, "public/uploads");

    },

    filename: (req, file, cb) => {

        const uniqueName =
            Date.now() + "-" + Math.round(Math.random() * 1E9);

        cb(
            null,
            uniqueName + path.extname(file.originalname)
        );

    }

});

const upload = multer({ storage });

// ===============================
// HOME
// ===============================
app.get("/", (req, res) => {

    res.render("index", {
        title: "TPNOVA HUB"
    });

});

// ===============================
// ABOUT
// ===============================
app.get("/about", (req, res) => {

    res.render("about", {
        title: "About"
    });

});

// ===============================
// SERVICES
// ===============================
app.get("/services", (req, res) => {

    res.render("services", {
        title: "Services"
    });

});

// ===============================
// CONTACT
// ===============================
app.get("/contact", (req, res) => {

    res.render("contacts", {
        title: "Contact"
    });

});

// ===============================
// PORTFOLIO PAGE
// GROUP PROJECTS TOGETHER
// ===============================
app.get("/portfolio", (req, res) => {

    const sql = `
        SELECT * FROM portfolio
        ORDER BY project_id DESC, id DESC
    `;

    db.query(sql, (err, results) => {

        if (err) {

            console.log(err);

            return res.send("Database Error");

        }

        // ===============================
        // GROUP PROJECTS
        // ===============================
        const groupedProjects = {};

        results.forEach(item => {

            if (!groupedProjects[item.project_id]) {

                groupedProjects[item.project_id] = {

                    title: item.title,
                    description: item.description,
                    category: item.category,
                    created_at: item.created_at,
                    images: []

                };

            }

            groupedProjects[item.project_id]
                .images.push(item.image);

        });

        const portfolio = Object.values(groupedProjects);

        res.render("portfolio", {

            title: "Portfolio",
            portfolio

        });

    });

});

// ===============================
// BOOK SERVICE
// ===============================
app.post("/book", (req, res) => {

    const {
        full_name,
        email,
        phone,
        service,
        message
    } = req.body;

    const sql = `
        INSERT INTO bookings
        (full_name, email, phone, service, message)
        VALUES (?, ?, ?, ?, ?)
    `;

    db.query(
        sql,
        [full_name, email, phone, service, message],
        (err) => {

            if (err) {

                console.log(err);

                return res.send("Error saving booking");

            }

            res.redirect("/");

        }
    );

});

// ===============================
// ADMIN LOGIN
// ===============================
app.post("/login", (req, res) => {

    const { username, password, role } = req.body;

    const adminEmail = "pascaltuzo@gmail.com";
    const adminPassword = "Tuzo12*#";

    if (
        username === adminEmail &&
        password === adminPassword &&
        role === "it_admin"
    ) {

        return res.redirect("/admin");

    }

    res.send("Invalid login credentials");

});

// ===============================
// ADMIN DASHBOARD
// ===============================
app.get("/admin", (req, res) => {

    const bookingsSql =
        "SELECT * FROM bookings ORDER BY id DESC";

    const portfolioSql =
        "SELECT * FROM portfolio ORDER BY id DESC";

    db.query(bookingsSql, (err, bookings) => {

        if (err) {

            console.log(err);

            return res.send("Database Error");

        }

        db.query(portfolioSql, (err2, portfolio) => {

            if (err2) {

                console.log(err2);

                return res.send("Database Error");

            }

            res.render("admin/dashboard", {

                title: "Admin Dashboard",
                bookings,
                portfolio

            });

        });

    });

});

// ===============================
// MULTIPLE PORTFOLIO UPLOAD
// ===============================
app.post(
    "/admin/upload",
    upload.array("image", 20),
    (req, res) => {

        const {
            title,
            description,
            category
        } = req.body;

        const files = req.files;

        if (!files || files.length === 0) {

            return res.send("No images uploaded");

        }

        // ===============================
        // UNIQUE PROJECT ID
        // ===============================
        const projectId = Date.now();

        const sql = `
            INSERT INTO portfolio
            (
                project_id,
                title,
                description,
                category,
                image
            )
            VALUES (?, ?, ?, ?, ?)
        `;

        let completed = 0;

        files.forEach(file => {

            db.query(
                sql,
                [
                    projectId,
                    title,
                    description,
                    category,
                    file.filename
                ],
                (err) => {

                    if (err) {

                        console.log("DB Error:", err);

                    }

                    completed++;

                    if (completed === files.length) {

                        console.log(
                            "✅ Portfolio Uploaded Successfully"
                        );

                        res.redirect("/admin");

                    }

                }
            );

        });

    }
);

// ===============================
// DELETE BOOKING
// ===============================
app.post("/admin/bookings/delete/:id", (req, res) => {

    const id = req.params.id;

    const sql = "DELETE FROM bookings WHERE id=?";

    db.query(sql, [id], (err) => {

        if (err) {

            console.log(err);

            return res.send("Delete failed");

        }

        res.redirect("/admin");

    });

});

// ===============================
// START SERVER
// ===============================
app.listen(PORT, () => {

    console.log(
        `🚀 Server running at http://localhost:${PORT}`
    );

});