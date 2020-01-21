const express = require('express');
const mongoose = require('mongoose');
const fs = require('fs');

const { username, password } = require('../env').env;

const port = 8080;

const auth = require('./middleware/auth');

const app = express();

app.use((req, res, next) => {
	res.setHeader('Access-Control-Allow-Origin', '*');
	res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, PATCH, DELETE');
	res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
	if (req.method === 'OPTIONS') {
		return res.sendStatus(200);
	}
	next();
});

app.use(auth);


app.use((error, req, res, next) => {
    const errorFile = 'error.txt';
	const status = error.stausCode || 500;
	const message = error.message;
    const data = error.data;

    fs.appendFile(errorFile, `${message}\r\n`, console.log('Error written'))
	res.status(status).json({
		message: message,
		data: data
	});
});

mongoose.connect(`mongodb+srv://${username}:${password}@arcanite-storage-tmu2x.mongodb.net/test?retryWrites=true&w=majority`, { useNewUrlParser: true, useUnifiedTopology: true }).then(result => app.listen(port, () => {
    console.log(`Running on ${port}`);
})).catch(err => {
    console.log(err);
});

