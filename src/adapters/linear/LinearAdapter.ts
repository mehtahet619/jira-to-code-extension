import axios from 'axios';
import * as vscode from 'vscode';
import { BaseAdapter } from '../base/BaseAdapter';
import { IntegrationPlatform, BaseTicket } from '../../types';

export class LinearAdapter extends BaseAdapter {
    platform = IntegrationPlatform.LINEAR;
    name = 'Linear';

    private get apiKey() {
        return process.env.LINEAR_API_KEY;
    }

    private get clientId() {
        return process.env.LINEAR_CLIENT_ID;
    }

    private get redirectUri() {
        return process.env.LINEAR_REDIRECT_URI;
    }

    async initiateAuth(): Promise<void> {
        if (!this.clientId || !this.redirectUri) {
            throw new Error('Linear OAuth not configured. Please set LINEAR_CLIENT_ID and LINEAR_REDIRECT_URI');
        }

        const scopes = ['read'];
        const state = encodeURIComponent(JSON.stringify({
            vscode: true,
            timestamp: Date.now(),
        }));

        const authUrl = `https://linear.app/oauth/authorize?client_id=${this.clientId}&redirect_uri=${encodeURIComponent(this.redirectUri)}&scope=${scopes.join(',')}&state=${state}&response_type=code`;
        
        await vscode.env.openExternal(vscode.Uri.parse(authUrl));
    }

    async isAuthenticated(): Promise<boolean> {
        return !!this.apiKey;
    }

    isValidUrl(url: string): boolean {
        return /^https:\/\/linear\.app\/[^\/]+\/issue\/[A-Z]+-\d+/i.test(url);
    }

    extractTicketId(url: string): string | null {
        const regex = /\/issue\/([A-Z]+-\d+)/i;
        const match = url.match(regex);
        return match ? match[1] : null;
    }

    async fetchTicket(ticketId: string, accessToken?: string): Promise<BaseTicket> {
        const token = accessToken || this.apiKey;
        if (!token) {
            throw new Error('Linear authentication not configured');
        }

        let issueId: string;
        
        if (ticketId.startsWith('http')) {
            issueId = this.extractTicketId(ticketId)!;
        } else {
            issueId = ticketId;
        }

        const query = `
            query GetIssue($id: String!) {
                issue(id: $id) {
                    id
                    identifier
                    title
                    description
                    state {
                        name
                    }
                    assignee {
                        displayName
                    }
                    creator {
                        displayName
                    }
                    priority
                    labels {
                        nodes {
                            name
                        }
                    }
                    url
                    createdAt
                    updatedAt
                }
            }
        `;

        try {
            const response = await axios.post('https://api.linear.app/graphql', {
                query,
                variables: { id: issueId }
            }, {
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json',
                }
            });

            if (response.data.errors) {
                throw new Error(`Linear API error: ${response.data.errors[0].message}`);
            }

            const issueData = response.data.data.issue;
            if (!issueData) {
                throw new Error('Issue not found');
            }

            return this.transformToBaseTicket(issueData);
        } catch (error: any) {
            this.logError('Error fetching Linear issue', {
                message: error.message,
                status: error.response?.status,
                data: error.response?.data,
            });
            throw error;
        }
    }

    private transformToBaseTicket(linearIssue: any): BaseTicket {
        return {
            id: linearIssue.id,
            key: linearIssue.identifier,
            title: linearIssue.title,
            description: linearIssue.description || '',
            status: linearIssue.state?.name || 'Unknown',
            assignee: linearIssue.assignee?.displayName,
            reporter: linearIssue.creator?.displayName,
            priority: linearIssue.priority?.toString(),
            labels: linearIssue.labels?.nodes?.map((label: any) => label.name) || [],
            url: linearIssue.url,
            createdAt: linearIssue.createdAt,
            updatedAt: linearIssue.updatedAt,
            platform: IntegrationPlatform.LINEAR
        };
    }
}