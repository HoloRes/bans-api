import { Injectable, Logger, OnModuleInit } from '@nestjs/common';
import amqp from 'amqp-connection-manager';
import type { ChannelWrapper } from 'amqp-connection-manager';
import type { Channel } from 'amqplib';
import { IAmqpConnectionManager } from 'amqp-connection-manager/dist/types/AmqpConnectionManager';
import type { PublishData } from './publish.service';

@Injectable()
export class RabbitMQService implements OnModuleInit {
	private readonly logger = new Logger('RabbitMQService');

	private connection: IAmqpConnectionManager;

	private channel: ChannelWrapper;

	onModuleInit() {
		if (!process.env.RABBITMQ_URL) {
			throw new Error('Cannot find RABBITMQ_URL in env');
		}

		this.connection = amqp.connect(process.env.RABBITMQ_URL);

		this.channel = this.connection.createChannel({
			json: true,
			confirm: false,
			setup: (channel: Channel) => channel.assertExchange('bans-api', 'direct', { durable: false }),
		});
	}

	public async publish(topic: 'user' | 'userbanlist' | 'content', type: PublishData['type'], data: PublishData['data']) {
		try {
			await this.channel.publish('bans-api', topic, {
				type,
				topic,
				data,
			});
		} catch (err) {
			this.logger.error('Unexpected error while publishing to RabbitMQ:', err);
		}
	}
}
