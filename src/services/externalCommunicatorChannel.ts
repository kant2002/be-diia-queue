import { CacheService } from '@diia-inhouse/redis'

import { ExternalEvent } from '../interfaces/queueConfig'

export class ExternalCommunicatorChannel {
    constructor(private readonly cache: CacheService) {}

    getChannel(event: ExternalEvent, requestUuid: string): string {
        return `external_communicator_channel_${event}_${requestUuid}`
    }

    async isChannelActive(channel: string): Promise<boolean> {
        return !!(await this.cache.get(this.getActiveChannelKey(channel)))
    }

    async saveActiveChannel(channel: string, timeout: number): Promise<void> {
        await this.cache.set(this.getActiveChannelKey(channel), 'true', Math.floor(timeout / 1000))
    }

    private getActiveChannelKey(channel: string): string {
        return `active_${channel}`
    }
}
