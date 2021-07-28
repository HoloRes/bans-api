import sendgrid from '@sendgrid/mail';
import axios from 'axios';
import crypto from 'crypto';
import zmq from 'zeromq';
import User from './mongodb/models/userData';
import Webhook, { IWebhook } from './mongodb/models/webhook';

export const socket = zmq.socket('pub');
export default socket;

socket.bindSync(`tcp://0.0.0.0:${process.env.ZEROMQ_PORT ?? '5555'}`);

if (!process.env.SENDGRID_API_KEY) throw new Error('Environment variable SENDGRID_API_KEY is not set!');
sendgrid.setApiKey(process.env.SENDGRID_API_KEY);

async function sendWarningEmail(webhook: IWebhook) {
	const user = await User.findById(webhook.owner).exec().catch(() => {});

	if (!process.env.SENDGRID_TEMPLATE_ID) throw new Error('Environment variable SENDGRID_TEMPLATE_ID is not set!');

	await sendgrid.send({
		to: user!.email,
		from: process.env.SENDGRID_EMAIL ?? 'noreply@example.com',
		templateId: process.env.SENDGRID_TEMPLATE_ID,
		dynamicTemplateData: {
			webhookurl: webhook.url,
		},
	}).catch(() => {});
}

export async function publishRemoval(id: string) {
	socket.send(['delete', id]); const webhooks = await Webhook.find({ subscriptions: 'delete', disabled: false }).exec();

	webhooks.forEach((webhook) => {
		const signature = crypto
			.createHmac('sha256', webhook.secret)
			.update(Buffer.from(id).toString('base64'))
			.digest('hex')
			.toUpperCase();

		axios.post(webhook.url, {
			type: 'delete',
			ban: id,
		}, {
			headers: {
				'X-Signature': signature,
			},
		}).then(async () => {
			/* eslint-disable no-param-reassign */
			webhook.failures = 0;
			/* eslint-enable */
			await webhook.save();
		}).catch(async (error) => {
			if (error.response || error.request) {
				/* eslint-disable no-param-reassign, no-void */
				webhook.failures += 1;
				webhook.disabled = webhook.failures >= 5;
				if (webhook.disabled) void sendWarningEmail(webhook);
				/* eslint-enable */
				await webhook.save();
			}
		});
	});
}

export async function publish(type: string, document: object) {
	socket.send([type, JSON.stringify(document)]);

	const webhooks = await Webhook.find({ subscriptions: type, disabled: false }).exec();

	webhooks.forEach((webhook) => {
		const signature = crypto
			.createHmac('sha256', webhook.secret)
			.update(Buffer.from(JSON.stringify(document)).toString('base64'))
			.digest('hex')
			.toUpperCase();

		axios.post(webhook.url, {
			type,
			ban: document,
		}, {
			headers: {
				'X-Signature': signature,
			},
		}).then(async () => {
			/* eslint-disable no-param-reassign */
			webhook.failures = 0;
			/* eslint-enable */
			await webhook.save();
		}).catch(async (error) => {
			if (error.response || error.request) {
				/* eslint-disable no-param-reassign, no-void */
				webhook.failures += 1;
				webhook.disabled = webhook.failures >= 5;
				if (webhook.disabled) void sendWarningEmail(webhook);
				/* eslint-enable */
				await webhook.save();
			}
		});
	});
}
