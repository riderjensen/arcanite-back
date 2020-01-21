const express = require('express');
const bodyParser = require('body-parser');
const mongoose = require('mongoose');
const fs = require('fs');

const { username, password } = require('../env').env;

const port = 8080;

const auth = require('./middleware/auth');

const app = express();

app.use(bodyParser.json());
app.use((req, res, next) => {
	res.setHeader('Access-Control-Allow-Origin', '*');
	res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, PATCH, DELETE');
	res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
	if (req.method === 'OPTIONS') {
		return res.sendStatus(200);
	}
	next();
});

// open auth router early
const authRouter = require('./src/routes/auth');
app.use('/auth', authRouter)
// check jwt hopefully
app.use(auth);

// other routes
const postRouter = require('./src/routes/post');
const commentRouter = require('./src/routes/comment');

app.use('/post', postRouter);
app.use('/comment', commentRouter);

app.use((error, req, res, next) => {
    const errorFile = 'error.txt';
	const status = error.stausCode || 500;
    const data = error.data;

    fs.appendFile(errorFile, `${error}\r\n`, () => {console.log('Error written')})
	res.status(status).send({
		message: error,
		data: data
	});
});

mongoose.connect(`mongodb+srv://${username}:${password}@arcanite-storage-tmu2x.mongodb.net/arcanite?retryWrites=true&w=majority`, { useNewUrlParser: true, useUnifiedTopology: true }).then(result => app.listen(port, () => {
    console.log(`Running on ${port}`);
})).catch(err => {
    console.log(err);
});

