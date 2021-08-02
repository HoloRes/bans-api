// Imports
const crypto = require('crypto');
const express = require('express');
const helmet = require('helmet');

// Initialize express
const app = express();
app.use(express.json());
app.use(helmet());

app.listen(3002);

// Shared secret to verify the body
const secret = 'suisei';

app.post('/correct', (req, res) => {
	console.log('Got request on /correct');
	const signature = req.get('X-Signature');

	console.log(req.body);

	const expectedSignature = crypto
		.createHmac('sha256', secret)
		.update(Buffer.from(JSON.stringify(req.body)).toString('base64'))
		.digest('hex')
		.toUpperCase();

	console.log(`Got signature: ${signature}\nAnd expected: ${expectedSignature}`);
	if (signature === expectedSignature) {
		console.log('Signature matches');
		res.status(200).end();
	} else {
		res.status(401).end();
		throw new Error('Signature didn\'t match!');
	}
});

app.post('/incorrect', (req, res) => {
	const wrongSecret = `${secret}1111`;
	const signature = req.get('X-Signature');

	console.log(req.body);

	const expectedSignature = crypto
		.createHmac('sha256', wrongSecret)
		.update(Buffer.from(JSON.stringify(req.body)).toString('base64'))
		.digest('hex')
		.toUpperCase();

	console.log(`Got signature: ${signature}\nAnd expected: ${expectedSignature}`);
	if (signature !== expectedSignature) {
		console.log('Signature didn\'t match');
		res.status(401).end();
	} else {
		res.status(200).end();
		throw new Error('Signature matched!');
	}
});

app.post('/failure', (req, res) => {
	console.log('Got request on /failure, responding with HTTP 500.');
	console.log(req.body);
	res.status(500).end();
});
