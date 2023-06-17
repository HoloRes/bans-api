/**
 * Small web server meant for testing webhooks
 */

/* eslint-disable import/no-extraneous-dependencies,@typescript-eslint/no-var-requires,no-console */

const express = require('express');
const crypto = require('crypto');

const app = express();

// Shared secret to verify the body
const secret = 'suisei';

app.post('/trigger', (req, res) => {
	const body = JSON.parse(req.body);

	// Get the signature from the headers
	const signature = req.get('X-Signature');

	// Compute the expected HMAC, see docs
	const expectedSignature = crypto
		.createHmac('sha256', secret)
		.update(Buffer.from(JSON.stringify(body)).toString('base64'))
		.digest('hex')
		.toUpperCase();

	console.log(`Got signature: ${signature}\nAnd expected: ${expectedSignature}`);

	// Respond appropriately based on what we get
	if (signature === expectedSignature) {
		console.log('Signature matches');
		res.status(200).end();
	} else {
		res.status(401).end();
		throw new Error('Signature didn\'t match!');
	}
});

app.listen(3172);
