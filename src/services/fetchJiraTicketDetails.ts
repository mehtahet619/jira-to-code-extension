import axios from "axios";
import logger from "../utils/logger";
import { extractDocsFromGemini } from "../llms/gemini";

const ATLASSIAN_EMAIL = process.env.ATLASSIAN_EMAIL! || "yorkhackathonteam15@gmail.com";
const ATLASSIAN_API_TOKEN =
    process.env.ATLASSIAN_API_TOKEN! ||
    "ATATT3xFfGF0L2A7Qv4_32mJnzv5q3Q5py7yC_5ODkoMUNAUE6JPiraQhCRsE1lkLOvMHpsod-Uvtf6diKc3p4xEojHcp5DNpn1tNmWGz1Zn5sYlvllvsKKPPIfIfXKbTEjjEy511RwbiuEFvmh2DtYcR71KelHw_jhj8FYkSRLKc0c507wM3BU=4AA0DD2F"; // 🔐 Avoid committing real tokens in code

export function extractTicketKey(jiraUrl: string): string | null {
    const regex = /\/browse\/([A-Z]+-\d+)/i;
    const match = jiraUrl.match(regex);
    return match ? match[1] : null;
}

export async function fetchJiraAndExtract(jiraUrl: string, accessToken: string) {
    logger.info("Fetching Jira ticket", { jiraUrl });
    logger.info("Using Atlassian Email", { email: ATLASSIAN_EMAIL });
    logger.info("Using Atlassian API Token", { token: ATLASSIAN_API_TOKEN });

    const issueKey = extractTicketKey(jiraUrl);
    if (!issueKey) {
        logger.error("❌ Invalid Jira ticket URL");
        throw new Error("Invalid Jira ticket URL");
    }

    const domainMatch = jiraUrl.match(/^https:\/\/([^\/]+)/);
    if (!domainMatch) {
        logger.error("❌ Invalid Jira URL format");
        throw new Error("Invalid Jira URL format");
    }

    const domain = domainMatch[1];
    const apiUrl = `https://${domain}/rest/api/3/issue/${issueKey}`;

    logger.info("Using API URL", { apiUrl });

    try {
        const response = await axios.get(apiUrl, {
            headers: {
                Authorization: `Basic ${Buffer.from(`${ATLASSIAN_EMAIL}:${ATLASSIAN_API_TOKEN}`).toString("base64")}`,
                Accept: "application/json",
            },
        });

        const issueData = response.data;

        logger.info("✅ Fetched Jira issue data", {
            issueData,
        });

        const llmResult = await extractDocsFromGemini(issueData);

        logger.info("✅ Extracted docs from gemini", {
            llmResult,
        });

        return {
            ticket: issueData,
            extracted: llmResult,
        };
    } catch (error: any) {
        logger.error("❌ Error fetching Jira issue", {
            message: error.message,
            status: error.response?.status,
            data: error.response?.data,
        });
        throw error;
    }
}
