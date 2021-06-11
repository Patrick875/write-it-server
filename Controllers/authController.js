const jwt = require("jsonwebtoken");
const User = require("./../models/usersModel");
const dotenv = require("dotenv");
dotenv.config({ path: "./config.env" });
const JWT_SECRET = process.env.JWT_SECRET;
const mailgun = require("mailgun-js");
const DOMAIN = "sandbox6f3f3bcc89ce4329ad5b960881a50989.mailgun.org";
const mg = mailgun({ apiKey: process.env.MAILGUN_APIKEY, domain: DOMAIN });

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
				console.log(user.id);
				req.user = user._id;
				next();
			}
		});
	} else {
		res.redirect("/login");
	}
};

exports.signup = async (req, res) => {
	const { email, password, confirmPassword, firstName, lastName } = req.body;
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

exports.activate = async (req, res) => {
	const { token } = req.body;
	if (token) {
		jwt.verify(token, process.env.JWT_SECRET, function (error, decodedToken) {
			if (error) {
				return res.status(400).json({ error: "incorrect or expired link" });
			}
		});
	} else {
		return res.json({ error: "something went wrong!!!!" });
	}
	const user = await User.create(req.body);
	res.cookie("token", token, {
		maxAge: maxAge,
		httpOnly: true,
	});
	res.status(201).json({ user: user, token });
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
		console.log(errors);
	}
};
exports.forgotPassword = async (req, res) => {
	//1. get user email
	const { email } = req.body;
	const token = createToken(email);
	try {
		const user = await User.findOne({ email });
		console.log(user);
		if (!user) {
			return res.status(400).json({
				error: "user with this email does not exist",
			});
		}
		const updatedUser = await user.updateOne(
			{ email },
			{ passwordResetToken: token },
			{ new: true }
		);
		await user.save({ validateBeforeSave: false });
		console.log(user);
		const data = {
			from: "noreply@write.com",
			to: email,
			subject: "Password reset link",
			html: `
			<h2>Click on this link to change your password your account</h2>
			<p><a href='${process.env.CLIENT_URL}/${token}'>change your password</a></p>
			<p> this link expires in 10 minutes</p>
			`,
		};
		return User.updateOne(
			{ email },
			{ passwordResetToken: token },
			function (err, success) {
				if (err) {
					res.status(400).json({ error: "reset password link error" });
				} else {
					mg.messages().send(data, function (error, body) {
						if (error) {
							return res.json({
								error: errror.message,
							});
						}
						console.log(body);
						return res.json({
							message: "email has been sent kindly follow the instructions",
						});
					});
				}
			}
		);
	} catch (error) {
		return res.status(400).json({
			error: "user with this email does not exist",
		});
	}
};

const verifyResetToken = (token) =>
	jwt.verify(token, process.env.JWT_SECRET, function (err) {
		if (err) {
			return false;
		} else return true;
	});

exports.resetPassword = async (req, res) => {
	console.log("RESET PASSWORD ROUTE IS RUNNING");
	const { resetToken, newPassword, confirmPassword } = req.body;
	console.log(resetToken);
	if (!resetToken) {
		return res.status(401).json({ error: "Authentication error!!!" });
	}
	const isVerified = verifyResetToken(resetToken);
	const user = await User.findOne({ passwordResetToken: resetToken });
	if (user) {
		console.log(user);
	} else console.log("not found!");

	user.password = newPassword;
	user.confirmPassword = confirmPassword;
	await user.save();
	return res.json({ user });
};
