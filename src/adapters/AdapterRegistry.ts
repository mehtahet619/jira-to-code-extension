import { IntegrationAdapter, IntegrationPlatform } from '../types';
import { JiraAdapter } from './jira/JiraAdapter';
import { TrelloAdapter } from './trello/TrelloAdapter';
import { LinearAdapter } from './linear/LinearAdapter';
import { GitHubAdapter } from './github/GitHubAdapter';
import logger from '../utils/logger';

export class AdapterRegistry {
    private adapters: Map<IntegrationPlatform, IntegrationAdapter> = new Map();

    constructor() {
        this.registerDefaultAdapters();
    }

    private registerDefaultAdapters() {
        this.register(new JiraAdapter());
        this.register(new TrelloAdapter());
        this.register(new LinearAdapter());
        this.register(new GitHubAdapter());
    }

    register(adapter: IntegrationAdapter) {
        this.adapters.set(adapter.platform, adapter);
        logger.info(`Registered adapter: ${adapter.name} (${adapter.platform})`);
    }

    getAdapter(platform: IntegrationPlatform): IntegrationAdapter | undefined {
        return this.adapters.get(platform);
    }

    getAdapterByUrl(url: string): IntegrationAdapter | undefined {
        for (const adapter of this.adapters.values()) {
            if (adapter.isValidUrl(url)) {
                return adapter;
            }
        }
        return undefined;
    }

    getAllAdapters(): IntegrationAdapter[] {
        return Array.from(this.adapters.values());
    }

    getSupportedPlatforms(): IntegrationPlatform[] {
        return Array.from(this.adapters.keys());
    }

    isUrlSupported(url: string): boolean {
        return this.getAdapterByUrl(url) !== undefined;
    }
}