import OpenAI from "openai";

// the newest OpenAI model is "gpt-4o" which was released May 13, 2024. do not change this unless explicitly requested by the user
const openai = new OpenAI({ 
  apiKey: process.env.OPENAI_API_KEY || process.env.OPENAI_API_KEY_ENV_VAR || "sk-default-key"
});

export interface AlertAnalysis {
  summary: string;
  riskScore: number;
  recommendedActions: string[];
  mitreMapping: string[];
  threatIntelligence?: string;
}

export class OpenAIService {
  async analyzeAlert(alertData: {
    title: string;
    description: string;
    source: string;
    sourceUser?: string;
    severity: string;
  }): Promise<AlertAnalysis> {
    try {
      const prompt = `You are a cybersecurity expert analyzing a security alert. Please analyze the following alert and provide a structured response in JSON format.

Alert Details:
- Title: ${alertData.title}
- Description: ${alertData.description}
- Source: ${alertData.source}
- User: ${alertData.sourceUser || "N/A"}
- Severity: ${alertData.severity}

Please respond with a JSON object containing:
- summary: A concise professional summary of the alert
- riskScore: A risk score from 0-100
- recommendedActions: An array of 2-3 specific recommended actions
- mitreMapping: An array of relevant MITRE ATT&CK technique IDs (e.g., ["T1059", "T1105"])
- threatIntelligence: Brief context about the threat type or actor group if applicable`;

      const response = await openai.chat.completions.create({
        model: "gpt-4o",
        messages: [
          {
            role: "system",
            content: "You are a senior cybersecurity analyst specializing in threat detection and incident response. Provide accurate, actionable analysis."
          },
          {
            role: "user",
            content: prompt
          }
        ],
        response_format: { type: "json_object" },
        temperature: 0.3,
      });

      const analysis = JSON.parse(response.choices[0].message.content || "{}");
      
      return {
        summary: analysis.summary || "Alert requires further investigation",
        riskScore: Math.max(0, Math.min(100, analysis.riskScore || 50)),
        recommendedActions: analysis.recommendedActions || ["Review alert details", "Check for related incidents"],
        mitreMapping: analysis.mitreMapping || [],
        threatIntelligence: analysis.threatIntelligence,
      };
    } catch (error) {
      console.error("OpenAI analysis error:", error);
      return {
        summary: "AI analysis temporarily unavailable. Manual review required.",
        riskScore: 50,
        recommendedActions: ["Manually review alert details", "Check system logs", "Escalate if necessary"],
        mitreMapping: [],
      };
    }
  }

  async chatResponse(message: string, context?: string): Promise<string> {
    try {
      const systemPrompt = `You are an AI assistant specialized in cybersecurity operations for a Security Operations Center (SOC). You help analysts with:
- Alert analysis and triage
- Threat intelligence queries
- Investigation guidance
- MITRE ATT&CK framework mapping
- Incident response procedures

Provide helpful, accurate, and actionable responses. Keep responses concise but informative.${context ? `\n\nCurrent context: ${context}` : ""}`;

      const response = await openai.chat.completions.create({
        model: "gpt-4o",
        messages: [
          {
            role: "system",
            content: systemPrompt
          },
          {
            role: "user",
            content: message
          }
        ],
        temperature: 0.7,
        max_tokens: 500,
      });

      return response.choices[0].message.content || "I'm having trouble processing your request right now. Please try again.";
    } catch (error) {
      console.error("OpenAI chat error:", error);
      return "I'm experiencing technical difficulties. Please try your question again or contact your system administrator.";
    }
  }

  async summarizeAlerts(alerts: any[]): Promise<string> {
    try {
      const alertSummary = alerts.slice(0, 10).map(alert => 
        `- ${alert.severity.toUpperCase()}: ${alert.title} (${alert.source})`
      ).join('\n');

      const prompt = `Analyze these recent security alerts and provide a brief summary of the current threat landscape and key concerns:

${alertSummary}

Provide a concise summary highlighting:
1. Overall threat level
2. Most concerning patterns
3. Recommended focus areas for the SOC team`;

      const response = await openai.chat.completions.create({
        model: "gpt-4o",
        messages: [
          {
            role: "system",
            content: "You are a cybersecurity analyst providing situational awareness summaries for SOC leadership."
          },
          {
            role: "user",
            content: prompt
          }
        ],
        temperature: 0.5,
        max_tokens: 300,
      });

      return response.choices[0].message.content || "Alert summary unavailable at this time.";
    } catch (error) {
      console.error("OpenAI summarization error:", error);
      return "Unable to generate alert summary. Please review alerts manually.";
    }
  }
}

export const openaiService = new OpenAIService();
