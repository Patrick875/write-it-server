const mongoose = require("mongoose");
const validator = require("validator");
const bcrypt = require("bcrypt");

const userSchema = mongoose.Schema({
	firstName: {
		type: String,
		required: [true, "first_name can't be empty"],
	},
	lastName: {
		type: String,
		required: [true, "last_name can't be empty"],
	},
	email: {
		type: String,
		required: [true, "a user must have an email"],
		unique: true,
		lowercase: true,
		validate: [validator.isEmail, "Please provide a valid Email"],
	},
	password: {
		type: String,
		required: [true, "a user must have a password"],
		minlength: 8,
	},
	confirmPassword: {
		type: String,
		required: [true, "Please confirm your Password"],
		selected: false,
		validate: {
			validator: function (el) {
				return el === this.password;
			},
			message: "passwords do not  match",
		},
	},
	active: Boolean,
});
//hashing the user password before saving it o the database
userSchema.pre("save", async function (next) {
	const salt = await bcrypt.genSalt();
	this.password = await bcrypt.hash(this.password, salt);
	next();
});

//login function
userSchema.statics.login = async function (email, password) {
	const user = await this.findOne({ email });
	if (user) {
		const auth = await bcrypt.compare(password, user.password);
		if (auth) {
			return user;
		}
		throw Error("incorrect password");
	}
	throw Error("email is not registered");
};

const User = mongoose.model("User", userSchema);

module.exports = User;
