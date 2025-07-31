import { Injectable, Logger, OnModuleInit, OnModuleDestroy } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Kafka, Producer, Consumer, KafkaMessage } from 'kafkajs';

export interface EventMessage {
  eventType: string;
  payload: any;
  timestamp: Date;
  correlationId: string;
  version: string;
}

@Injectable()
export class KafkaService implements OnModuleInit, OnModuleDestroy {
  private readonly logger = new Logger(KafkaService.name);
  private kafka: Kafka;
  private producer: Producer;
  private consumers: Map<string, Consumer> = new Map();

  constructor(private readonly configService: ConfigService) {
    this.kafka = new Kafka({
      clientId: this.configService.get('KAFKA_CLIENT_ID', 'n8n-clone'),
      brokers: this.configService.get('KAFKA_BROKERS', 'localhost:9092').split(','),
      retry: {
        initialRetryTime: 100,
        retries: 8
      }
    });

    this.producer = this.kafka.producer({
      maxInFlightRequests: 1,
      idempotent: true,
      transactionTimeout: 30000
    });
  }

  async onModuleInit() {
    try {
      await this.producer.connect();
      this.logger.log('Kafka producer connected successfully');
    } catch (error) {
      this.logger.error('Failed to connect Kafka producer:', error);
    }
  }

  async onModuleDestroy() {
    try {
      await this.producer.disconnect();
      
      for (const [topic, consumer] of this.consumers) {
        await consumer.disconnect();
        this.logger.log(`Disconnected consumer for topic: ${topic}`);
      }
      
      this.logger.log('Kafka connections closed');
    } catch (error) {
      this.logger.error('Error disconnecting Kafka:', error);
    }
  }

  async publishEvent(topic: string, event: EventMessage): Promise<void> {
    try {
      const message = {
        key: event.correlationId,
        value: JSON.stringify(event),
        timestamp: event.timestamp.getTime().toString(),
        headers: {
          eventType: event.eventType,
          version: event.version
        }
      };

      await this.producer.send({
        topic,
        messages: [message]
      });

      this.logger.log(`Event published to topic ${topic}: ${event.eventType}`);
    } catch (error) {
      this.logger.error(`Failed to publish event to topic ${topic}:`, error);
      throw error;
    }
  }

  async publishWorkflowEvent(eventType: string, payload: any): Promise<void> {
    const event: EventMessage = {
      eventType,
      payload,
      timestamp: new Date(),
      correlationId: this.generateCorrelationId(),
      version: '1.0'
    };

    await this.publishEvent('workflow-events', event);
  }

  async publishExecutionEvent(eventType: string, payload: any): Promise<void> {
    const event: EventMessage = {
      eventType,
      payload,
      timestamp: new Date(),
      correlationId: this.generateCorrelationId(),
      version: '1.0'
    };

    await this.publishEvent('execution-events', event);
  }

  async subscribe(
    topic: string, 
    groupId: string, 
    handler: (message: EventMessage) => Promise<void>
  ): Promise<void> {
    const consumer = this.kafka.consumer({ 
      groupId,
      sessionTimeout: 30000,
      heartbeatInterval: 3000
    });

    try {
      await consumer.connect();
      await consumer.subscribe({ topic, fromBeginning: false });

      await consumer.run({
        eachMessage: async ({ topic, partition, message }) => {
          try {
            const eventMessage: EventMessage = JSON.parse(message.value?.toString() || '{}');
            await handler(eventMessage);
            
            this.logger.log(`Processed message from topic ${topic}, partition ${partition}`);
          } catch (error) {
            this.logger.error(`Error processing message from topic ${topic}:`, error);
            // In production, you might want to send to a dead letter queue
          }
        },
      });

      this.consumers.set(topic, consumer);
      this.logger.log(`Subscribed to topic: ${topic} with group: ${groupId}`);
    } catch (error) {
      this.logger.error(`Failed to subscribe to topic ${topic}:`, error);
      throw error;
    }
  }

  private generateCorrelationId(): string {
    return `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
  }

  async createTopics(topics: string[]): Promise<void> {
    const admin = this.kafka.admin();
    
    try {
      await admin.connect();
      
      const topicConfigs = topics.map(topic => ({
        topic,
        numPartitions: 3,
        replicationFactor: 1,
        configEntries: [
          { name: 'cleanup.policy', value: 'compact' },
          { name: 'retention.ms', value: '604800000' } // 7 days
        ]
      }));

      await admin.createTopics({
        topics: topicConfigs
      });

      this.logger.log(`Created topics: ${topics.join(', ')}`);
    } catch (error) {
      this.logger.error('Failed to create topics:', error);
      throw error;
    } finally {
      await admin.disconnect();
    }
  }
}
