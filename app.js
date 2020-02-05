const express = require('express');
const bodyParser = require('body-parser');
const mongoose = require('mongoose');
const cors = require('cors');
const fs = require('fs');

const port = process.env.port || 8080;

const auth = require('./middleware/auth');

const app = express();

app.use(cors());
app.use(bodyParser.json());
app.use((req, res, next) => {
	res.setHeader('Access-Control-Allow-Origin', '*');
	res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, PATCH, DELETE');
	res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
	if (req.method === 'OPTIONS') {
		return res.status(200);
	}
	next();
});

// open auth router early
const authRouter = require('./src/routes/auth');
const postRouter = require('./src/routes/post');
const commentRouter = require('./src/routes/comment');
const openRouter = require('./src/routes/openRoutes');

app.use('/auth', authRouter);
app.use('/a', openRouter);

app.use(auth);

app.use('/p', postRouter);
app.use('/c', commentRouter);

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

mongoose.connect(`mongodb+srv://${process.env.DBusername}:${process.env.DBpassword}@arcanite-storage-tmu2x.mongodb.net/arcanite?retryWrites=true&w=majority`, { useNewUrlParser: true, useUnifiedTopology: true }).then(result => app.listen(port, () => {
    console.log(`Running on ${port}`);
})).catch(err => {
    console.log(err);
});

