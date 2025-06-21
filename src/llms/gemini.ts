import dotenv from "dotenv";
dotenv.config();

import { GoogleGenerativeAI } from "@google/generative-ai";
import logger from "../utils/logger";

const genAI = new GoogleGenerativeAI(
    process.env.GOOGLE_API_KEY! || "AIzaSyBbozeLF1v4UGZd1p1FBPB7w5zJ3Z7x_TE"
);

export async function extractDocsFromGemini(issueData: any): Promise<string> {
    const summary = issueData.fields.summary || "";
    const description =
        issueData.fields.description?.content
            ?.map((block: any) => block.content?.map((c: any) => c.text).join(""))
            .join("\n") || "";

    const prompt = `Extract development requirements and tasks from this Jira ticket:\n\nTitle: ${summary}\n\nDescription:\n${description}`;

    const model = genAI.getGenerativeModel({ model: "gemma-3-27b-it" });

    const result = await model.generateContent(prompt);
    const response = result.response;
    return response.text();
}
