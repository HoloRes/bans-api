/**
 * Quick and dirty CLI program to listen to data published onto RabbitMQ
 * */

/* eslint-disable import/no-extraneous-dependencies,@typescript-eslint/no-var-requires,no-console */

require('dotenv').config({ path: '../../.env' });

const amqplib = require('amqplib/callback_api');

amqplib.connect(process.env.RABBITMQ_URL, (err, conn) => {
	if (err) throw err;

	conn.createChannel((err1, ch) => {
		if (err1) throw err1;

		ch.assertQueue('', { exclusive: true }, (err2, q) => {
			if (err2) throw err2;

			console.log(' [*] Waiting for logs. To exit press CTRL+C');

			['user', 'content'].forEach((topic) => {
				ch.bindQueue(q.queue, 'bans-api', topic);
			});

			ch.consume(q.queue, (msg) => {
				console.log('Received:', JSON.stringify(JSON.parse(msg.content.toString()), null, 4));
			});
		});
	});
});
