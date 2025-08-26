import { IntegrationAdapter, IntegrationPlatform, BaseTicket } from '../../types';
import logger from '../../utils/logger';

export abstract class BaseAdapter implements IntegrationAdapter {
    abstract platform: IntegrationPlatform;
    abstract name: string;

    constructor(protected config?: any) {}

    abstract initiateAuth(): Promise<void>;
    abstract isAuthenticated(): Promise<boolean>;
    abstract extractTicketId(url: string): string | null;
    abstract fetchTicket(ticketId: string, accessToken?: string): Promise<BaseTicket>;
    abstract isValidUrl(url: string): boolean;

    protected log(message: string, data?: any) {
        logger.info(`[${this.platform.toUpperCase()}] ${message}`, data);
    }

    protected logError(message: string, error?: any) {
        logger.error(`[${this.platform.toUpperCase()}] ${message}`, error);
    }
}