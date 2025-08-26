import dotenv from "dotenv";
dotenv.config();

import { GoogleGenerativeAI } from "@google/generative-ai";
import { BaseTicket } from "../types";
import logger from "../utils/logger";

const genAI = new GoogleGenerativeAI(process.env.GOOGLE_API_KEY!);

export async function extractDocsFromGemini(ticket: BaseTicket): Promise<{
    requirements: string;
    technicalSpecs: string;
    acceptanceCriteria: string;
    suggestedImplementation: string;
}> {
    const prompt = `
Analyze this ${ticket.platform} ticket and extract structured development information:

**Ticket Details:**
- Platform: ${ticket.platform}
- ID: ${ticket.key || ticket.id}
- Title: ${ticket.title}
- Status: ${ticket.status}
- Priority: ${ticket.priority || 'Not specified'}
- Labels: ${ticket.labels?.join(', ') || 'None'}
- Assignee: ${ticket.assignee || 'Unassigned'}

**Description:**
${ticket.description}

Please provide a structured analysis with the following sections:

1. **Requirements**: Clear, actionable requirements extracted from the ticket
2. **Technical Specifications**: Technical details, constraints, and implementation considerations
3. **Acceptance Criteria**: Specific criteria that must be met for completion
4. **Suggested Implementation**: High-level implementation approach and recommendations

Format your response as JSON with these exact keys: requirements, technicalSpecs, acceptanceCriteria, suggestedImplementation
`;

    try {
        const model = genAI.getGenerativeModel({ model: "gemma-3-27b-it" });
        const result = await model.generateContent(prompt);
        const response = result.response.text();
        
        // Try to parse as JSON, fallback to structured text if parsing fails
        try {
            return JSON.parse(response);
        } catch {
            // Fallback: create structured response from text
            return {
                requirements: response,
                technicalSpecs: "See requirements section",
                acceptanceCriteria: "See requirements section", 
                suggestedImplementation: "See requirements section"
            };
        }
    } catch (error) {
        logger.error("Error generating content with Gemini", error);
        throw error;
    }
}
