import { GoogleGenAI } from "@google/genai";

const allowedCategories = [
  "Network",
  "Electrical",
  "Civil",
  "Sanitation",
  "Hostel",
];

const allowedPriorities = ["Low", "Medium", "High", "Critical"];

const departmentByCategory = {
  Network: "Network Team",
  Electrical: "Electrical Maintenance",
  Civil: "Civil Maintenance",
  Sanitation: "Sanitation Department",
  Hostel: "Hostel Administration",
};

const getGeminiClient = () => {
  if (!process.env.GEMINI_API_KEY) {
    return null;
  }

  return new GoogleGenAI({
    apiKey: process.env.GEMINI_API_KEY,
  });
};

const safelyParseJson = (value) => {
  if (!value) {
    return null;
  }

  try {
    return JSON.parse(value);
  } catch {
    const cleanedValue = value
      .replace(/^```json\s*/i, "")
      .replace(/^```\s*/i, "")
      .replace(/```$/i, "")
      .trim();

    try {
      return JSON.parse(cleanedValue);
    } catch {
      return null;
    }
  }
};

const createFallbackAnalysis = ({
  title,
  description,
  selectedCategory,
  fallbackPriority,
}) => {
  return {
    summary: `${title.trim()}: ${description.trim()}`.slice(0, 250),

    suggestedCategory: selectedCategory,

    suggestedPriority: fallbackPriority,

    suggestedDepartment: departmentByCategory[selectedCategory],

    confidence: 0,

    duplicateTrackingId: null,
  };
};

export const analyzeComplaintWithGemini = async ({
  title,
  description,
  selectedCategory,
  campusArea,
  specificArea,
  fallbackPriority,
  duplicateCandidates = [],
}) => {
  const fallback = createFallbackAnalysis({
    title,
    description,
    selectedCategory,
    fallbackPriority,
  });

  const client = getGeminiClient();

  if (!client) {
    console.warn("Gemini analysis skipped: GEMINI_API_KEY is missing");

    return fallback;
  }

  try {
    const candidateData = duplicateCandidates.map((candidate) => ({
      trackingId: candidate.trackingId,

      title: candidate.title,

      description: candidate.description,

      category: candidate.category,

      campusArea: candidate.location?.campusArea,

      specificArea: candidate.location?.specificArea,

      status: candidate.status,
    }));

    const prompt = `
You are ResolveAI, a campus complaint-classification assistant.

Analyze the new complaint and return only valid JSON.

Allowed categories:
${allowedCategories.join(", ")}

Category meanings:
- Network: Wi-Fi, internet, LAN, routers and connectivity
- Electrical: lights, fans, switches, wiring and power supply
- Civil: furniture, walls, doors, roads and building infrastructure
- Sanitation: cleaning, waste, washrooms, drainage and hygiene
- Hostel: hostel administration, rooms and hostel-specific facilities

Allowed priorities:
${allowedPriorities.join(", ")}

Priority rules:
- Critical: immediate danger, fire, electric shock, injury or major safety emergency
- High: essential service failure, serious leakage, unsafe or widespread disruption
- Medium: normal operational issue requiring attention
- Low: minor inconvenience with limited impact

New complaint:
${JSON.stringify({
  title,
  description,
  selectedCategory,
  campusArea,
  specificArea,
})}

Possible existing complaints:
${JSON.stringify(candidateData)}

Return this exact JSON structure:
{
  "summary": "A concise factual summary under 250 characters",
  "suggestedCategory": "One allowed category",
  "suggestedPriority": "One allowed priority",
  "confidence": 0,
  "duplicateTrackingId": null
}

confidence must be an integer from 0 to 100.

duplicateTrackingId must be null unless a provided complaint clearly describes the same issue at the same or closely related location.
`;

    const response = await client.models.generateContent({
      model: process.env.GEMINI_MODEL || "gemini-3.6-flash",

      contents: prompt,

      config: {
        responseMimeType: "application/json",

        temperature: 0.1,
      },
    });

    const parsed = safelyParseJson(response.text);

    if (!parsed) {
      console.warn("Gemini returned invalid JSON");

      return fallback;
    }

    const suggestedCategory = allowedCategories.includes(
      parsed.suggestedCategory,
    )
      ? parsed.suggestedCategory
      : selectedCategory;

    const suggestedPriority = allowedPriorities.includes(
      parsed.suggestedPriority,
    )
      ? parsed.suggestedPriority
      : fallbackPriority;

    const confidenceValue = Number(parsed.confidence);

    const confidence = Number.isFinite(confidenceValue)
      ? Math.min(Math.max(Math.round(confidenceValue), 0), 100)
      : 0;

    const validDuplicate = duplicateCandidates.find(
      (candidate) => candidate.trackingId === parsed.duplicateTrackingId,
    );

    return {
      summary:
        typeof parsed.summary === "string" && parsed.summary.trim()
          ? parsed.summary.trim().slice(0, 250)
          : fallback.summary,

      suggestedCategory,

      suggestedPriority,

      suggestedDepartment: departmentByCategory[suggestedCategory],

      confidence,

      duplicateTrackingId: validDuplicate?.trackingId || null,
    };
  } catch (error) {
    console.error("Gemini complaint analysis error:", error.message);

    return fallback;
  }
};

export const generateRoleChatResponse = async ({
  role,
  userName,
  message,
  history = [],
  complaints = [],
}) => {
  const client = getGeminiClient();

  if (!client) {
    throw new Error("Gemini API is not configured");
  }

  const safeHistory = history.slice(-8).map((item) => ({
    sender: item.sender === "ai" ? "assistant" : "user",

    text: String(item.text || "").slice(0, 1000),
  }));

  const complaintContext = complaints.map((complaint) => ({
    trackingId: complaint.trackingId,

    title: complaint.title,

    description: complaint.description,

    category: complaint.category,

    priority: complaint.priority,

    status: complaint.status,

    department: complaint.department,

    location: complaint.location,

    aiSummary: complaint.aiAnalysis?.summary,

    createdAt: complaint.createdAt,

    updatedAt: complaint.updatedAt,

    resolvedAt: complaint.resolvedAt,
  }));

  const roleInstructions =
    role === "student"
      ? `
You are assisting a university Student.

You may:
- Explain only this Student's complaint status.
- Summarize this Student's complaints.
- Help write clear and professional complaints.
- Explain campus complaint categories and departments.
- Suggest useful information the Student should include.

You must not:
- Claim that you changed a complaint.
- Claim that an Officer completed an action.
- Reveal another Student's information.
- Invent complaint records that are not provided.
`
      : `
You are assisting a university Complaint Officer.

You may:
- Summarize only complaints assigned to this Officer.
- Suggest professional responses to Students.
- Recommend which assigned complaints need attention first.
- Create practical investigation and resolution plans.
- Explain priority, status and SLA considerations.

You must not:
- Claim that you changed a complaint.
- Claim that a response was sent.
- Reveal complaints not assigned to this Officer.
- Invent complaint records that are not provided.
- Make the final administrative decision.
`;

  const prompt = `
You are ResolveAI Copilot.

Current user:
${JSON.stringify({
  name: userName,
  role,
})}

${roleInstructions}

Accessible complaint records:
${JSON.stringify(complaintContext)}

Recent conversation:
${JSON.stringify(safeHistory)}

Current request:
${message}

Response rules:
- Answer using plain, professional language.
- Be concise but helpful.
- Use only the accessible complaint records supplied above.
- If a requested tracking ID is unavailable, clearly say you cannot find it in the user's accessible complaints.
- Never expose database IDs, passwords, tokens, API keys or private system details.
- If the user asks for an unsafe or unrelated action, politely redirect them to campus complaint assistance.
`;

  const response = await client.models.generateContent({
    model: process.env.GEMINI_MODEL || "gemini-3.6-flash",

    contents: prompt,

    config: {
      temperature: 0.3,
      maxOutputTokens: 700,
    },
  });

  const responseText = response.text?.trim();

  if (!responseText) {
    throw new Error("Gemini returned an empty response");
  }

  return responseText;
};
