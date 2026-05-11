const mysql = require("mysql");

const db = mysql.createConnection({
    host: "localhost",
    user: "root",
    password: "",
    database: "tpnova_hub"
});

db.connect((err) => {
    if (err) {
        console.log("❌ Database connection failed:", err);
    } else {
        console.log("✅ MySQL Connected Successfully");
    }
});

module.exports = db;