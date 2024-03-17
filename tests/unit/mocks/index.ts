import { AsyncLocalStorage } from 'async_hooks'

import Logger from '@kant2002-diia-inhouse/diia-logger'
import { EnvService } from '@kant2002-diia-inhouse/env'
import { CacheService, PubSubService } from '@kant2002-diia-inhouse/redis'
import { mockClass } from '@kant2002-diia-inhouse/test'
import { AppValidator } from '@kant2002-diia-inhouse/validators'

import { EventMessageHandler, InternalEvent, QueueContext } from '@src/index'

import { EventMessageValidator } from '@services/eventMessageValidator'
import { ExternalCommunicatorChannel } from '@services/externalCommunicatorChannel'

export const logger = new (mockClass(Logger))()

export const eventListener = {
    handler: jest.fn(),
    event: InternalEvent.AcquirersOfferRequestHasDeleted,
    validationRules: undefined,
    isSync: false,
    validationErrorHandler: jest.fn(),
}

export const appValidator = new (mockClass(AppValidator))()

export const eventMessageValidator = new (mockClass(EventMessageValidator))(appValidator)

export const envService = new EnvService(logger)

export const redisConfig = { readOnly: { port: 6379 }, readWrite: { port: 6379 } }

export const cacheService = new CacheService(redisConfig, envService, logger)

export const channel = new (mockClass(ExternalCommunicatorChannel))(cacheService)

export const pubSubService = new (mockClass(PubSubService))(redisConfig, logger)

export const asyncLocalStorage = new (mockClass(AsyncLocalStorage<QueueContext>))()

export const eventMessageHandler = new EventMessageHandler(eventMessageValidator, channel, pubSubService, asyncLocalStorage, logger)
