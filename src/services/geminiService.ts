import { GoogleGenAI } from "@google/genai";

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

export async function runResearchAgent(query: string): Promise<string> {
  const prompt = `You are a Research Agent. Your job is to collect relevant information related to the user's request.
Search for facts, statistics, trends, and useful insights.
Return structured research findings.

User Request: ${query}

OUTPUT FORMAT:
* Key facts
* Important statistics
* Relevant trends`;

  const response = await ai.models.generateContent({
    model: "gemini-3.1-pro-preview",
    contents: prompt,
  });
  return response.text || "No research output generated.";
}

export async function runAnalysisAgent(query: string, researchData: string): Promise<string> {
  const prompt = `You are an Analysis Agent. Your job is to analyze the research data provided by the Research Agent.
Identify patterns, risks, opportunities, and comparisons.
Convert raw information into meaningful insights.

User Request: ${query}
Research Data:
${researchData}

OUTPUT FORMAT:
* Pattern identification
* Opportunity evaluation
* Risk assessment`;

  const response = await ai.models.generateContent({
    model: "gemini-3.1-pro-preview",
    contents: prompt,
  });
  return response.text || "No analysis output generated.";
}

export async function runDecisionAgent(query: string, analysisData: string): Promise<string> {
  const prompt = `You are a Decision Agent. Your job is to evaluate the analysis results and determine the best possible solution or recommendation.
Use logical reasoning and prioritize the most effective strategy.

User Request: ${query}
Analysis Data:
${analysisData}

OUTPUT FORMAT:
* Final recommendation
* Reasoning for the decision`;

  const response = await ai.models.generateContent({
    model: "gemini-3.1-pro-preview",
    contents: prompt,
  });
  return response.text || "No decision output generated.";
}

export async function runReportAgent(
  query: string,
  researchData: string,
  analysisData: string,
  decisionData: string
): Promise<string> {
  const prompt = `You are a Report Agent. Your job is to produce a final structured report for the user.
Summarize the research, analysis, and decision in a professional and easy-to-understand format.

User Request: ${query}

Research Data:
${researchData}

Analysis Data:
${analysisData}

Decision Data:
${decisionData}

OUTPUT FORMAT:
* Executive summary
* Key insights
* Final recommendation
* Actionable next steps`;

  const response = await ai.models.generateContent({
    model: "gemini-3.1-pro-preview",
    contents: prompt,
  });
  return response.text || "No report output generated.";
}
