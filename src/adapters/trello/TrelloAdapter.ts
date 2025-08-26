import axios from 'axios';
import * as vscode from 'vscode';
import { BaseAdapter } from '../base/BaseAdapter';
import { IntegrationPlatform, BaseTicket } from '../../types';

export class TrelloAdapter extends BaseAdapter {
    platform = IntegrationPlatform.TRELLO;
    name = 'Trello';

    private get apiKey() {
        return process.env.TRELLO_API_KEY;
    }

    private get token() {
        return process.env.TRELLO_TOKEN;
    }

    async initiateAuth(): Promise<void> {
        if (!this.apiKey) {
            throw new Error('Trello API key not configured');
        }

        const authUrl = `https://trello.com/1/authorize?expiration=never&scope=read&response_type=token&name=Jira-to-Code&key=${this.apiKey}`;
        await vscode.env.openExternal(vscode.Uri.parse(authUrl));
    }

    async isAuthenticated(): Promise<boolean> {
        return !!(this.apiKey && this.token);
    }

    isValidUrl(url: string): boolean {
        return /^https:\/\/trello\.com\/c\/[a-zA-Z0-9]+/i.test(url);
    }

    extractTicketId(url: string): string | null {
        const regex = /\/c\/([a-zA-Z0-9]+)/i;
        const match = url.match(regex);
        return match ? match[1] : null;
    }

    async fetchTicket(ticketId: string, accessToken?: string): Promise<BaseTicket> {
        if (!this.apiKey || !this.token) {
            throw new Error('Trello authentication not configured');
        }

        let cardId: string;
        
        if (ticketId.startsWith('http')) {
            cardId = this.extractTicketId(ticketId)!;
        } else {
            cardId = ticketId;
        }

        const apiUrl = `https://api.trello.com/1/cards/${cardId}`;

        try {
            const response = await axios.get(apiUrl, {
                params: {
                    key: this.apiKey,
                    token: this.token,
                    fields: 'all',
                    members: 'true',
                    member_fields: 'fullName',
                    checklists: 'all',
                    labels: 'true'
                }
            });

            const cardData = response.data;
            return this.transformToBaseTicket(cardData);
        } catch (error: any) {
            this.logError('Error fetching Trello card', {
                message: error.message,
                status: error.response?.status,
                data: error.response?.data,
            });
            throw error;
        }
    }

    private transformToBaseTicket(trelloCard: any): BaseTicket {
        return {
            id: trelloCard.id,
            key: trelloCard.idShort?.toString(),
            title: trelloCard.name,
            description: trelloCard.desc || '',
            status: trelloCard.list?.name || 'Unknown',
            assignee: trelloCard.members?.[0]?.fullName,
            reporter: undefined,
            priority: undefined,
            labels: trelloCard.labels?.map((label: any) => label.name).filter(Boolean) || [],
            url: trelloCard.shortUrl || trelloCard.url,
            createdAt: trelloCard.dateLastActivity,
            updatedAt: trelloCard.dateLastActivity,
            platform: IntegrationPlatform.TRELLO
        };
    }
}