import { GoogleGenAI, Type } from "@google/genai";

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY || "" });

export const analyzeStartup = async (startup: any) => {
  const model = "gemini-3.1-pro-preview";
  const prompt = `
    You are a world-class startup co-founder and venture capitalist. 
    Analyze this startup idea for a solo founder:
    Name: ${startup.name}
    Idea: ${startup.idea}
    Problem: ${startup.problem}
    Target Users: ${startup.targetUsers}
    Market: ${startup.market}
    Known Competitors: ${startup.competitors}

    Your goal is to provide 100% accurate, data-driven, and brutally honest feedback. 
    Use Google Search to find real-time market trends, competitor funding, and user complaints on Reddit/Twitter.

    Provide a comprehensive analysis in JSON format:
    {
      "report": {
        "summary": "Brutally honest executive summary.",
        "problemValidation": "Is this a 'hair on fire' problem? Use data.",
        "marketOpportunity": "TAM/SAM/SOM estimates based on current reports.",
        "uvp": "What is the unfair advantage?",
        "businessModel": "Specific revenue streams.",
        "pricingStrategy": "Data-backed pricing tiers.",
        "gtmPlan": "First 10, 100, 1000 user acquisition strategy."
      },
      "validation": {
        "demandScore": 0-100,
        "competitionLevel": "Low/Medium/High",
        "growthPotential": 0-100,
        "urgencyScore": 0-100,
        "viabilityScore": 0-100,
        "insights": "Specific data points found from search."
      },
      "competitors": [
        {
          "name": "...",
          "offer": "...",
          "pricing": "...",
          "strengths": "...",
          "weaknesses": "...",
          "gaps": "Real opportunities to beat them."
        }
      ],
      "mvp": {
        "features": ["Must-have", "Should-have"],
        "priorities": ["Immediate next steps"],
        "techStack": ["Specific tools for speed"],
        "userFlow": "Step-by-step path to value."
      },
      "roadmap": [
        { "period": "Week 1-2", "goals": ["Validation tasks", "Landing page"] },
        { "period": "Month 1", "goals": ["Build MVP", "User testing"] },
        { "period": "Month 2-3", "goals": ["Launch", "Iterate"] }
      ],
      "fundingStrategy": {
        "stage": "Recommended funding stage (e.g., Bootstrapped, Pre-seed, Seed).",
        "targetAmount": "Estimated capital needed for next 12-18 months.",
        "investorTypes": ["Types of investors to target (e.g., Angels, Micro-VCs)."],
        "pitchFocus": ["Key metrics or story points to highlight in the pitch."],
        "potentialInvestors": ["Specific VC firms or angel groups that match this profile."],
        "advice": "Strategic advice on when and how to raise."
      },
      "coFounderAdvice": [
        "Strategic advice 1",
        "Strategic advice 2",
        "Strategic advice 3"
      ]
    }
  `;

  const response = await ai.models.generateContent({
    model,
    contents: prompt,
    config: {
      responseMimeType: "application/json",
      tools: [{ googleSearch: {} }]
    }
  });

  return JSON.parse(response.text || "{}");
};

export const getMentorResponse = async (startup: any, messages: any[]) => {
  const model = "gemini-3.1-pro-preview";
  const chat = ai.chats.create({
    model,
    config: {
      systemInstruction: `You are the AI Co-founder of ${startup.name}. 
      You are not just an assistant; you are a partner. 
      Your tone is professional, strategic, and deeply supportive of solo founders.
      
      Key Responsibilities:
      1. Challenge the founder's assumptions with data.
      2. Provide emotional support during the 'trough of sorrow'.
      3. Help with tough decisions (hiring, pivoting, pricing).
      4. Always suggest the next high-leverage task.
      5. Use Google Search to verify any market claims.
      
      If the founder is stuck, give them a 'Co-founder Challenge' to get them moving.`
    }
  });

  const lastMessage = messages[messages.length - 1].content;
  const response = await chat.sendMessage({ message: lastMessage });
  return response.text;
};
