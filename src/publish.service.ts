import { Injectable, Logger, OnModuleInit } from '@nestjs/common';
import { Subscription } from '@prisma/client';
import type { Webhook } from '@prisma/client';
import axios from 'axios';
import * as crypto from 'node:crypto';
import { RabbitMQService } from './rabbitmq.service';
import { UserReport } from './user/userreport.dto';
import { UserBanList } from './user/banlist/banlist.dto';
import { ContentReport } from './content/content.dto';
import { PrismaService } from './prisma.service';

export interface PublishData {
	type: 'create' | 'update' | 'delete';
	data: UserReport | UserBanList | ContentReport;
}

@Injectable()
export class PublishService implements OnModuleInit {
	private readonly logger = new Logger('PublishService');

	constructor(private prisma: PrismaService, private aqmp: RabbitMQService) {}

	// eslint-disable-next-line class-methods-use-this
	onModuleInit() {}

	private async publishToWebhook(webhook: Webhook, data: PublishData) {
		try {
			// Compute the HMAC signature
			const signature = crypto
				// Set the hash function and give it the shared secre
				.createHmac('sha256', webhook.secret)
				// Convert the body to a string, then to a buffer and then to Base64
				// to then finally use as the payload of the HMAC
				.update(Buffer.from(JSON.stringify(data)).toString('base64'))
				.digest('hex')
				.toUpperCase();

			await axios.post(webhook.url, data, {
				headers: {
					'X-Signature': signature,
				},
			});
		} catch (err) {
			if (err.response || err.request) {
				await this.prisma.webhook.update({
					where: {
						id: webhook.id,
					},
					data: {
						failures: {
							increment: 1,
						},
					},
				});
			} else {
				this.logger.error('Something very unexpected happened while triggering a webhook:', err);
			}
		}
	}

	public async publish(topic: 'user' | 'userbanlist' | 'content', type: PublishData['type'], data: PublishData['data']) {
		const topicToWebhookSubscriptionMap = {
			user: Subscription.USER,
			userbanlist: Subscription.USERBANLIST,
			content: Subscription.CONTENT,
		};

		const dataToPublish = { type, data };

		const webhooks = await this.prisma.webhook.findMany({
			where: {
				subscriptions: {
					has: topicToWebhookSubscriptionMap[topic],
				},
				failures: {
					lt: 3,
				},
			},
		});

		webhooks.forEach((wh) => {
			this.publishToWebhook(wh, dataToPublish);
		});

		await this.aqmp.publish(topic, type, data);
	}
}
