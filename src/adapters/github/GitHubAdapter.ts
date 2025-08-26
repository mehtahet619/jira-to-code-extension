import axios from 'axios';
import * as vscode from 'vscode';
import { BaseAdapter } from '../base/BaseAdapter';
import { IntegrationPlatform, BaseTicket } from '../../types';

export class GitHubAdapter extends BaseAdapter {
    platform = IntegrationPlatform.GITHUB;
    name = 'GitHub Issues';

    private get token() {
        return process.env.GITHUB_TOKEN;
    }

    private get clientId() {
        return process.env.GITHUB_CLIENT_ID;
    }

    private get clientSecret() {
        return process.env.GITHUB_CLIENT_SECRET;
    }

    async initiateAuth(): Promise<void> {
        if (!this.clientId) {
            throw new Error('GitHub OAuth not configured. Please set GITHUB_CLIENT_ID');
        }

        const scopes = ['repo', 'read:user'];
        const state = encodeURIComponent(JSON.stringify({
            vscode: true,
            timestamp: Date.now(),
        }));

        const authUrl = `https://github.com/login/oauth/authorize?client_id=${this.clientId}&scope=${scopes.join(' ')}&state=${state}`;
        
        await vscode.env.openExternal(vscode.Uri.parse(authUrl));
    }

    async isAuthenticated(): Promise<boolean> {
        return !!this.token;
    }

    isValidUrl(url: string): boolean {
        return /^https:\/\/github\.com\/[^\/]+\/[^\/]+\/issues\/\d+/i.test(url);
    }

    extractTicketId(url: string): string | null {
        const regex = /github\.com\/([^\/]+)\/([^\/]+)\/issues\/(\d+)/i;
        const match = url.match(regex);
        return match ? `${match[1]}/${match[2]}/${match[3]}` : null;
    }

    async fetchTicket(ticketId: string, accessToken?: string): Promise<BaseTicket> {
        const token = accessToken || this.token;
        if (!token) {
            throw new Error('GitHub authentication not configured');
        }

        let owner: string, repo: string, issueNumber: string;
        
        if (ticketId.startsWith('http')) {
            const extracted = this.extractTicketId(ticketId);
            if (!extracted) {
                throw new Error('Invalid GitHub issue URL');
            }
            [owner, repo, issueNumber] = extracted.split('/');
        } else {
            // Expect format: owner/repo/issueNumber
            [owner, repo, issueNumber] = ticketId.split('/');
        }

        if (!owner || !repo || !issueNumber) {
            throw new Error('Invalid GitHub issue format. Expected: owner/repo/issueNumber');
        }

        const apiUrl = `https://api.github.com/repos/${owner}/${repo}/issues/${issueNumber}`;

        try {
            const response = await axios.get(apiUrl, {
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Accept': 'application/vnd.github.v3+json',
                    'User-Agent': 'Jira-to-Code-Extension'
                }
            });

            const issueData = response.data;
            return this.transformToBaseTicket(issueData);
        } catch (error: any) {
            this.logError('Error fetching GitHub issue', {
                message: error.message,
                status: error.response?.status,
                data: error.response?.data,
            });
            throw error;
        }
    }

    private transformToBaseTicket(githubIssue: any): BaseTicket {
        return {
            id: githubIssue.id.toString(),
            key: `#${githubIssue.number}`,
            title: githubIssue.title,
            description: githubIssue.body || '',
            status: githubIssue.state,
            assignee: githubIssue.assignee?.login,
            reporter: githubIssue.user?.login,
            priority: undefined, // GitHub doesn't have built-in priority
            labels: githubIssue.labels?.map((label: any) => label.name) || [],
            url: githubIssue.html_url,
            createdAt: githubIssue.created_at,
            updatedAt: githubIssue.updated_at,
            platform: IntegrationPlatform.GITHUB
        };
    }
}