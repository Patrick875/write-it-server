//jshint esversion:9
//packages import
const express = require("express");
const morgan = require("morgan");
const cors = require("cors");
const cookieParser = require("cookie-parser");
//modules import
const entryRoutes = require("./Routers/entryRoutes");
const userRoutes = require("./Routers/userRoutes");
const app = express();
//middleware
if (process.env.NODE_ENV === "development") {
	app.use(morgan("dev"));
}

app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(cors());

//routes
app.use("/api/v1/entries", entryRoutes);
app.use("/api/v1/users", userRoutes);
app.get("/", (req, res) => {
	res.send("Hello to write-it API");
});

module.exports = app;
