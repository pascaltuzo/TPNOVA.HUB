const express = require("express");
const path = require("path");
const expressLayouts = require("express-ejs-layouts");

const app = express();
const PORT = 3000;

// Serve static files (CSS, images, JS)
app.use(express.static(path.join(__dirname, "public")));

// EJS setup
app.set("view engine", "ejs");
app.use(expressLayouts);
app.set("layout", "./partials/layout");

// Routes
app.get("/", (req, res) => {
  res.render("index", {
    title: "TPNOVA HUB"
  });
});

// Start server
app.listen(PORT, () => {
  console.log(`Server running at http://localhost:${PORT}`);
});
app.get("/about", (req, res) => {
  res.render("about", { title: "About" });
});

app.get("/services", (req, res) => {
  res.render("services", { title: "Services" });
});

app.get("/contact", (req, res) => {
  res.render("contacts", { title: "Contact" });
});

app.get("/portfolio", (req, res) => {
  res.render("portfolio", { title: "Portfolio" });
});