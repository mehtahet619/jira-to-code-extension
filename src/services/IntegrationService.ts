import { AdapterRegistry } from '../adapters/AdapterRegistry';
import { IntegrationPlatform, BaseTicket, ExtractedContent } from '../types';
import { extractDocsFromGemini } from '../llms/gemini';
import logger from '../utils/logger';

export class IntegrationService {
    private registry: AdapterRegistry;

    constructor() {
        this.registry = new AdapterRegistry();
    }

    async fetchTicketAndExtract(url: string, accessToken?: string): Promise<ExtractedContent> {
        logger.info('Fetching ticket from URL', { url });

        const adapter = this.registry.getAdapterByUrl(url);
        if (!adapter) {
            throw new Error(`No adapter found for URL: ${url}`);
        }

        logger.info(`Using adapter: ${adapter.name} (${adapter.platform})`);

        const ticketId = adapter.extractTicketId(url);
        if (!ticketId) {
            throw new Error(`Invalid ticket URL format for ${adapter.platform}`);
        }

        const ticket = await adapter.fetchTicket(url, accessToken);
        logger.info('✅ Fetched ticket data', { ticket });

        const extracted = await extractDocsFromGemini(ticket);
        logger.info('✅ Extracted docs from AI', { extracted });

        return {
            ticket,
            extracted
        };
    }

    async initiateAuth(platform: IntegrationPlatform): Promise<void> {
        const adapter = this.registry.getAdapter(platform);
        if (!adapter) {
            throw new Error(`No adapter found for platform: ${platform}`);
        }

        await adapter.initiateAuth();
    }

    async isAuthenticated(platform: IntegrationPlatform): Promise<boolean> {
        const adapter = this.registry.getAdapter(platform);
        if (!adapter) {
            return false;
        }

        return await adapter.isAuthenticated();
    }

    getSupportedPlatforms(): IntegrationPlatform[] {
        return this.registry.getSupportedPlatforms();
    }

    isUrlSupported(url: string): boolean {
        return this.registry.isUrlSupported(url);
    }

    getAdapterForUrl(url: string) {
        return this.registry.getAdapterByUrl(url);
    }
}