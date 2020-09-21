const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const config = require('config');

const { check, validationResult } = require('express-validator');

const User = require('../models/User');

// @route      POST api/users
// @desc       Register a user
// @access     Public
router.post(
	'/',
	[
		check('name', 'name is required').not().isEmpty(),
		check('email', 'Please include a valid email').isEmail(),
		check(
			'password',
			'Please enter a password with at least 6 character'
		).isLength({ min: 6 }),
	],
	async (req, res) => {
		//res.send('Register a user');
		const errors = validationResult(req);
		if (!errors.isEmpty()) {
			// array() is a method that gives us the arrays of the errors in express-validator
			return res.status(400).json({ errors: errors.array() });
		}
		const { name, email, password } = req.body;

		try {
			let user = await User.findOne({ email });

			if (user) {
				return res.status(400).json({ msg: 'User already exists' });
			}

			// Send verification link or code to the unique provided during registeration

			// create a new instance of a User in the database but have not been save yet
			user = new User({
				name,
				email,
				password,
			});

			// Hashing the  password
			const salt = await bcrypt.genSalt(10);
			user.password = await bcrypt.hash(password, salt);

			// save the user in the database
			await user.save();

			const payload = {
				user: {
					id: user.id,
				},
			};

			jwt.sign(
				payload,
				config.get('JWT_SECRET'),
				{
					expiresIn: 360000, // When it expires, they can just sign in again
				},
				(err, token) => {
					if (err) throw err;
					res.json({ token });
				}
			);
		} catch (err) {
			console.error(err.message);
			res.status(500).send('Server Error');
		}
	}
);

module.exports = router;
