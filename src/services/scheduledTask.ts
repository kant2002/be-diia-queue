import { Logger, OnInit } from '@kant2002-diia-inhouse/types'

import { EventBusListener, MessageHandler, ScheduledTasksQueue, SubscribeOptions } from '../interfaces'
import { ScheduledTaskEvent, ScheduledTaskQueueName } from '../interfaces/queueConfig'
import { RabbitMQProvider } from '../providers/rabbitmq'
import * as Utils from '../utils'

import { EventMessageHandler } from './eventMessageHandler'

export class ScheduledTask implements ScheduledTasksQueue, OnInit {
    private readonly routingPart: string = 'scheduled-task'

    constructor(
        private readonly queueProvider: RabbitMQProvider,
        private readonly scheduledTaskList: EventBusListener[],
        private readonly eventMessageHandler: EventMessageHandler,

        private readonly logger: Logger,
        private readonly queueName: ScheduledTaskQueueName | undefined = undefined,
    ) {}

    async onInit(): Promise<void> {
        await this.queueProvider.init?.()
        if (!this.queueName) {
            return
        }

        const config = this.queueProvider.getConfig()
        const eventListeners = Utils.collectEventBusListeners(this.scheduledTaskList)

        await this.subscribe(
            this.queueName,
            this.eventMessageHandler.eventListenersMessageHandler.bind(this.eventMessageHandler, eventListeners),
            {
                listener: config.listenerOptions,
            },
        )

        this.scheduledTaskList.forEach((listener) => {
            this.logger.info(`Scheduled task [${listener.event}] initialized successfully`)
        })
    }

    subscribe(subscriptionName: ScheduledTaskQueueName, messageHandler: MessageHandler, options?: SubscribeOptions): Promise<boolean> {
        const routingKey = `${this.queueProvider.getServiceName()}.${this.routingPart}`

        return this.queueProvider.subscribe(subscriptionName, messageHandler, { ...options, routingKey })
    }

    publish(scheduledTaskName: ScheduledTaskEvent, serviceName: string): Promise<boolean> {
        return this.queueProvider.publish(scheduledTaskName, {}, `${serviceName}.${this.routingPart}`)
    }
}
