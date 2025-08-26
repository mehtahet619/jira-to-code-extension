import axios from 'axios';
import * as vscode from 'vscode';
import { BaseAdapter } from '../base/BaseAdapter';
import { IntegrationPlatform, BaseTicket } from '../../types';

export class JiraAdapter extends BaseAdapter {
    platform = IntegrationPlatform.JIRA;
    name = 'Atlassian Jira';

    private get email() {
        return process.env.ATLASSIAN_EMAIL;
    }

    private get apiToken() {
        return process.env.ATLASSIAN_API_TOKEN;
    }

    private get clientId() {
        return process.env.ATLASSIAN_CLIENT_ID;
    }

    private get redirectUri() {
        return process.env.ATLASSIAN_REDIRECT_URI;
    }

    async initiateAuth(): Promise<void> {
        const scopes = ['read:me', 'read:jira-work', 'read:account', 'offline_access'];
        const scopeStr = scopes.join(' ');

        const stateObj = {
            vscode: true,
            timestamp: Date.now(),
        };
        const state = encodeURIComponent(JSON.stringify(stateObj));

        const authUrl = `https://auth.atlassian.com/authorize?audience=api.atlassian.com&client_id=${this.clientId}&scope=${encodeURIComponent(
            scopeStr
        )}&redirect_uri=${encodeURIComponent(this.redirectUri!)}&state=${state}&response_type=code&prompt=consent`;

        await vscode.env.openExternal(vscode.Uri.parse(authUrl));
    }

    async isAuthenticated(): Promise<boolean> {
        return !!(this.email && this.apiToken);
    }

    isValidUrl(url: string): boolean {
        return /^https:\/\/[^\/]+\.atlassian\.net\/browse\/[A-Z]+-\d+/i.test(url);
    }

    extractTicketId(url: string): string | null {
        const regex = /\/browse\/([A-Z]+-\d+)/i;
        const match = url.match(regex);
        return match ? match[1] : null;
    }

    async fetchTicket(ticketId: string, accessToken?: string): Promise<BaseTicket> {
        if (!this.email || !this.apiToken) {
            throw new Error('Jira authentication not configured');
        }

        // Extract domain from a full URL if provided, or use ticketId directly
        let domain: string;
        let issueKey: string;

        if (ticketId.startsWith('http')) {
            const domainMatch = ticketId.match(/^https:\/\/([^\/]+)/);
            if (!domainMatch) {
                throw new Error('Invalid Jira URL format');
            }
            domain = domainMatch[1];
            issueKey = this.extractTicketId(ticketId)!;
        } else {
            // If just a ticket key is provided, we need the domain from config
            throw new Error('Domain required for ticket key. Please provide full URL.');
        }

        const apiUrl = `https://${domain}/rest/api/3/issue/${issueKey}`;

        try {
            const response = await axios.get(apiUrl, {
                headers: {
                    Authorization: `Basic ${Buffer.from(`${this.email}:${this.apiToken}`).toString('base64')}`,
                    Accept: 'application/json',
                },
            });

            const issueData = response.data;
            
            return this.transformToBaseTicket(issueData, `https://${domain}/browse/${issueKey}`);
        } catch (error: any) {
            this.logError('Error fetching Jira issue', {
                message: error.message,
                status: error.response?.status,
                data: error.response?.data,
            });
            throw error;
        }
    }

    private transformToBaseTicket(jiraIssue: any, url: string): BaseTicket {
        return {
            id: jiraIssue.id,
            key: jiraIssue.key,
            title: jiraIssue.fields.summary,
            description: jiraIssue.fields.description?.content?.[0]?.content?.[0]?.text || jiraIssue.fields.description || '',
            status: jiraIssue.fields.status.name,
            assignee: jiraIssue.fields.assignee?.displayName,
            reporter: jiraIssue.fields.reporter?.displayName,
            priority: jiraIssue.fields.priority?.name,
            labels: jiraIssue.fields.labels || [],
            url,
            createdAt: jiraIssue.fields.created,
            updatedAt: jiraIssue.fields.updated,
            platform: IntegrationPlatform.JIRA
        };
    }
}