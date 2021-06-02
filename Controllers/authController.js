const User = require("./../models/usersModel");
const jwt = require("jsonwebtoken");
const dotenv = require("dotenv");
dotenv.config({ path: "./config.env" });
const JWT_SECRET = process.env.JWT_SECRET;

const errorHandler = (err) => {
	let errors = {
		firstname: "",
		lastname: "",
		email: "",
		password: "",
		confirmPassword: "",
	};

	console.log(err.message, err.code);
	//duplicate error
	if (err.code === 11000) {
		errors.email = "that email is already registered";
		return errors;
	}

	if (err.message.includes("user validation failed")) {
		Object.values(err.errors).forEach(({ properties }) => {
			errors[properties.path] = properties.message;
		});
	}

	return errors;
};
const maxAge = 7 * 24 * 60 * 60 * 1000;
const createToken = (id) => {
	return jwt.sign({ id }, JWT_SECRET, {
		expiresIn: maxAge,
	});
};

exports.checkUser = async (req, res, next) => {
	const token = res.cookies.token;
	const token2 = req.headers.authorization.split(" ")[1];
	if (token2) {
		jwt.verify(token, JWT_SECRET, async (err, decodedToken) => {
			try {
				const user = await User.findById(decodedToken.id);
				req.user = user;
				next();
			} catch (error) {
				const errors = errorHandler(error);
				res.status(400).json({ errors });
				next();
			}
		});
	} else {
	}
	next();
};
exports.protected = (req, res, next) => {
	const token = req.headers.authorization.split(" ")[1];

	if (token) {
		jwt.verify(token, JWT_SECRET, async (err, decodedToken) => {
			if (err) {
				res.redirect("/login");
				console.log(err);
			} else {
				const user = await User.findById(decodedToken.id);
				req.user = user._id;
				next();
			}
		});
	} else {
		res.redirect("/login");
	}
};

exports.signup = async (req, res) => {
	try {
		const user = await User.create(req.body);
		const token = createToken(user._id);
		res.cookie("token", token, {
			maxAge: maxAge,
			httpOnly: true,
		});
		res.status(201).json({ user: user, token });
	} catch (error) {
		const errors = errorHandler(error);
		res.status(400).json({ errors });
	}
};

exports.login = async (req, res) => {
	const { email, password } = req.body;
	try {
		const user = await User.login(email, password);
		const token = createToken(user._id);
		res.cookie("token", token, {
			httpOnly: true,
			maxAge: maxAge,
		});

		res.status(200).json({
			status: "success",
			user: user,
			token: token,
		});
	} catch (error) {
		const errors = errorHandler(error);
		res.status(400).json({ errors, message: "login failed" });
	}
};
