// Base types for integration adapters
export interface BaseTicket {
    id: string;
    key?: string;
    title: string;
    description: string;
    status: string;
    assignee?: string;
    reporter?: string;
    priority?: string;
    labels?: string[];
    url: string;
    createdAt: string;
    updatedAt: string;
    platform: IntegrationPlatform;
}

export interface AuthConfig {
    type: 'oauth' | 'token' | 'basic';
    credentials?: {
        email?: string;
        token?: string;
        clientId?: string;
        clientSecret?: string;
        redirectUri?: string;
    };
}

export interface AdapterConfig {
    name: string;
    platform: IntegrationPlatform;
    baseUrl?: string;
    auth: AuthConfig;
}

export enum IntegrationPlatform {
    JIRA = 'jira',
    TRELLO = 'trello',
    LINEAR = 'linear',
    GITHUB = 'github'
}

export interface IntegrationAdapter {
    platform: IntegrationPlatform;
    name: string;
    
    // Authentication methods
    initiateAuth(): Promise<void>;
    isAuthenticated(): Promise<boolean>;
    
    // Ticket operations
    extractTicketId(url: string): string | null;
    fetchTicket(ticketId: string, accessToken?: string): Promise<BaseTicket>;
    
    // URL validation
    isValidUrl(url: string): boolean;
}

export interface ExtractedContent {
    ticket: BaseTicket;
    extracted: {
        requirements: string;
        technicalSpecs: string;
        acceptanceCriteria: string;
        suggestedImplementation: string;
    };
}