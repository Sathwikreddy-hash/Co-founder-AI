import { GoogleGenAI, Type, FunctionDeclaration } from "@google/genai";

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY || "" });

const sendEmailTool: FunctionDeclaration = {
  name: "request_send_email",
  parameters: {
    type: Type.OBJECT,
    description: "Request to send an email to a recipient. This requires user approval.",
    properties: {
      to: { type: Type.STRING, description: "Recipient email address" },
      subject: { type: Type.STRING, description: "Email subject" },
      body: { type: Type.STRING, description: "Email body content" }
    },
    required: ["to", "subject", "body"]
  }
};

const createTaskTool: FunctionDeclaration = {
  name: "request_create_task",
  parameters: {
    type: Type.OBJECT,
    description: "Request to create a task in the startup roadmap. This requires user approval.",
    properties: {
      title: { type: Type.STRING, description: "Task title" },
      description: { type: Type.STRING, description: "Task description" },
      priority: { type: Type.STRING, enum: ["low", "medium", "high"], description: "Task priority" }
    },
    required: ["title", "description"]
  }
};

const marketResearchTool: FunctionDeclaration = {
  name: "request_market_research",
  parameters: {
    type: Type.OBJECT,
    description: "Request deep market research on a specific topic. This requires user approval.",
    properties: {
      topic: { type: Type.STRING, description: "The specific topic or competitor to research" },
      depth: { type: Type.STRING, enum: ["quick", "deep"], description: "Level of research depth" }
    },
    required: ["topic"]
  }
};

export const analyzeStartup = async (startup: any) => {
  const model = "gemini-3-flash-preview";
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
      ],
      "startupScore": {
        "total": 0-100,
        "marketDemand": 0-100,
        "competitionIntensity": 0-100,
        "problemUrgency": 0-100,
        "growthPotential": 0-100
      },
      "nextActions": [
        { "title": "Action title", "description": "Practical description", "impact": "high/medium/low" },
        { "title": "Action title", "description": "Practical description", "impact": "high/medium/low" },
        { "title": "Action title", "description": "Practical description", "impact": "high/medium/low" }
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

export const generateDailyBriefing = async (startup: any) => {
  const model = "gemini-3.1-pro-preview";
  const prompt = `
    You are the AI Co-founder of ${startup.name}. 
    Startup Context: ${startup.idea}
    
    Generate a "Daily Founder Briefing" based on current market signals and news.
    Use Google Search to find the latest news, competitor updates, and trends.
    
    Return JSON:
    {
      "marketUpdates": ["Update 1", "Update 2"],
      "competitorActivity": ["Activity 1", "Activity 2"],
      "opportunities": ["Opportunity 1", "Opportunity 2"],
      "risks": ["Risk 1", "Risk 2"],
      "recommendedActions": ["Action 1", "Action 2"]
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

export const generateMarketIntelligence = async (startup: any) => {
  const model = "gemini-3.1-pro-preview";
  const prompt = `
    You are the AI Co-founder of ${startup.name}. 
    Startup Context: ${startup.idea}
    
    Continuously analyze market signals. Find:
    1. Industry growth signals
    2. Competitor launches
    3. Funding announcements in the space
    4. Tech trends
    5. Social signals (Reddit/Twitter discussions)
    
    Return JSON:
    {
      "signals": [
        {
          "type": "growth|competitor|funding|tech|social",
          "title": "Signal title",
          "description": "Signal description",
          "impact": "positive|negative|neutral"
        }
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

export const generateWeeklyReport = async (startup: any, weekProgress: string) => {
  const model = "gemini-3.1-pro-preview";
  const prompt = `
    You are the AI Co-founder of ${startup.name}. 
    Startup Context: ${startup.idea}
    Progress this week: ${weekProgress}
    
    Generate a Weekly Founder Report.
    
    Return JSON:
    {
      "weekRange": "Current week range",
      "progress": "Summary of progress",
      "keyInsights": ["Insight 1", "Insight 2"],
      "risksDiscovered": ["Risk 1", "Risk 2"],
      "strategyAdjustments": ["Adjustment 1", "Adjustment 2"],
      "nextWeekPriorities": ["Priority 1", "Priority 2"]
    }
  `;

  const response = await ai.models.generateContent({
    model,
    contents: prompt,
    config: {
      responseMimeType: "application/json"
    }
  });

  return JSON.parse(response.text || "{}");
};

export const getMentorResponse = async (startup: any, messages: any[], isAgentMode: boolean = false) => {
  const model = "gemini-3.1-pro-preview";
  const chat = ai.chats.create({
    model,
    config: {
      systemInstruction: `You are the AI Co-founder of ${startup.name}. 
      ${isAgentMode ? 'AGENT MODE IS ACTIVE. You can now request to perform actions on behalf of the founder using the provided tools. ALWAYS explain why you want to perform an action and wait for user approval.' : 'You are not just an assistant; you are a partner.'}
      Your tone is professional, strategic, and deeply supportive of solo founders.
      
      Key Responsibilities:
      1. Challenge the founder's assumptions with data.
      2. Provide emotional support during the 'trough of sorrow'.
      3. Help with tough decisions (hiring, pivoting, pricing).
      4. Always suggest the next high-leverage task.
      5. Use Google Search to verify any market claims.
      ${isAgentMode ? '6. Proactively suggest using your tools (sending emails, creating tasks, deep research) when it helps the startup.' : ''}
      
      If the founder is stuck, give them a 'Co-founder Challenge' to get them moving.`,
      tools: isAgentMode ? [{ functionDeclarations: [sendEmailTool, createTaskTool, marketResearchTool] }] : []
    }
  });

  const lastMessage = messages[messages.length - 1].content;
  const response = await chat.sendMessage({ message: lastMessage });
  
  return {
    text: response.text,
    functionCalls: response.functionCalls
  };
};
