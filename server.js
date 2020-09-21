const express = require('express');
const jwt = require('jsonwebtoken');
const connectDB = require('./config/db');

const app = express();

//Database Connection
connectDB();

// Init Middleware
app.use(express.json({ extended: false }));

app.get('/', (req, res) => {
	console.log('Hello world');
	res.json({ msg: 'Welcome to Contact Keeper App' });
});

// Defining Routes
app.use('/api/users', require('./routes/users'));
app.use('/api/auth', require('./routes/auth'));
app.use('/api/contacts', require('./routes/contacts'));

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => console.log(`Server is running on port ${PORT}`));
