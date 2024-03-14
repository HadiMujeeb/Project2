const mongoose = require("mongoose");

require("dotenv").config();


const path = require("path");
const nocache = require("nocache");
const express = require("express");
const app = express();
const flash = require("express-flash");
const session = require("express-session");
const connectDB = require("./database/connection");
connectDB();
app.use(
  session({
    secret: process.env.SESSION_SECRET,
    resave: true,
    saveUninitialized: true,
  })
);

//hy
app.use(express.json());
app.use(nocache());
app.use(flash());

app.use(express.json({ limit: "10mb" }));
app.use(express.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, "public/user")));
app.use(express.static(path.join(__dirname, "public/admin")));
app.use(express.static(path.join(__dirname, "public")));

const user_router = require("./Routes/user");
app.use("/", user_router);

const admin_router = require("./Routes/admin");
app.use("/", admin_router);

const PORT = process.env.PORT||8000;

app.listen(PORT, () => {
  console.log(` server is running  on http://localhost:${PORT}`);
  console.log(` server is running  on http://localhost:${PORT}/admin`);
});
