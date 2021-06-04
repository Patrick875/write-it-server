//jshint esversion:9
const mongoose = require("mongoose");
const dotenv = require("dotenv");
dotenv.config({ path: "./config.env" });
const app = require("./App");

const DB = process.env.DATABASE_CONNECTION;

mongoose
	.connect(DB, {
		useNewUrlParser: true,
		useUnifiedTopology: true,
		useFindAndModify: false,
		useCreateIndex: true,
	})
	.then(() => {
		console.log("Database connection established");
	});

const port = process.env.PORT || 4000;
app.listen(port, () => {
	console.log(`node app launched on port ${port}`);
});
