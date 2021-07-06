const express = require('express');
const bodyParser = require('body-parser');
const bcrypt = require('bcrypt-nodejs'); 
const cors = require('cors');
const mongoose = require('mongoose');

const app = express();

app.use(bodyParser.json());
app.use(cors());
app.use(express.json());

mongoose.connect('mongodb://localhost:27017/faceRecognitionDB', { useUnifiedTopology: true, useNewUrlParser: true, useFindAndModify: false });
const db = mongoose.connection;
db.on('error', (error) => console.error(error));
db.once('open', () => console.log('Connected to Database'));


const userSchema = new mongoose.Schema({
  name: {
  	type: String,
  	required: true
  },
  email: {
  	type: String,
  	required: true
  },
  password: {
  	type: String,
  	required: true
  },
  entries: {
  	type: Number,
  	required: true,
  	default: 0
  },
  joined: {
  	type: Date,
  	required: true,
  	default: Date.now
  }
});

const User = mongoose.model("User", userSchema);

app.get('/', async (req, res) => {
	try {
		const user = await User.find();
		res.status(200).json(user);
	} catch (err) {
		res.status(500).json({ message: err.message });
	}
});

app.get('/profile/:id', async (req, res) => {
	const { id } = req.params;
	try {
		const user = await User.findById(id);
		if (user == null) {
			return res.status(404).json({ message: 'User not found' });
		}
		res.status(200).json(user);
	} catch (err) {
		res.status(500).json({ message: err.message });
	}
});


app.put('/image', async function(req, res) {
	const { id, email, password } = req.body;
	try {
		//const user = await User.findOneAndUpdate({email: email, password: password}, {$inc : {entries : 1}}).exec();
		const user = await User.findOneAndUpdate({_id: id}, {$inc : {entries : 1}}).exec();
		
		if (user == null) {
			return res.status(404).json({ message: 'User not found' });
		}
		res.status(201).json(user);
	} catch (err) {
		res.status(500).json({ message: err.message });
	}
});

app.post('/signin', async function(req, res) {
	const { email, password } = req.body;
	try {
		const user = await User.findOne({email: email, password: password}).exec();
		if (user == null ) {
			return res.status(404).json('error logging in');
		}
		res.status(200).json(user);
	} catch (err) {
		res.status(500).json({ message: err.message });
	}
});

app.post('/register', async function(req, res) {
	const { name, email, password } = req.body;

	// bcrypt.hash(password, null, null, function(err, hash) {
	//     console.log(hash);
	// });

	const user = new User({
		id: '125',
		name: name,
		email: email,
		password: password,
		entries: 0,
		joined: new Date()
	});

	try {
		const signUser = await User.findOne({ email: email, password: password }).exec();
		if (signUser != null) {
			return res.status(400).json({message: 'User already exists'});
		}
		const newUser = await user.save();
		res.status(201).json(newUser);
	} catch (err) {
		res.status(500).json({ message: err.message });
	}
});


app.listen(3000, function() {
	console.log('Server is running on port 3000');
});



// API design
/*
/ signin --> POST = success/fail
/ register --> POST = user
/ zoomMeeting/:userId = PUT = based on the zoom call experience and movie recorded the valence score, emotion score
                        // etc. will be updated.
*/

