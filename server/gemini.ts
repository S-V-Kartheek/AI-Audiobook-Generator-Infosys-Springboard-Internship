import { GoogleGenAI } from "@google/genai";

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY || process.env.GOOGLE_AI_API_KEY || "" });

export async function rewriteAsPodcastScript(text: string): Promise<string> {
  try {
    const prompt = `You are an expert podcast script writer. Transform the following text into an engaging, conversational podcast script. 

Guidelines:
- Use a warm, conversational tone as if speaking directly to listeners
- Break content into logical sections with clear headings (use markdown # for main topics, ## for subtopics)
- Add transitions between topics that flow naturally
- Include occasional questions or prompts to engage listeners
- Keep sentences clear and easy to understand when spoken aloud
- Add emphasis where appropriate for dramatic effect
- Structure the content to maintain interest throughout
- Start with a brief, engaging introduction
- End with a thoughtful conclusion or call to action

Format the output in clean markdown with proper headings and paragraphs.

TEXT TO TRANSFORM:
${text}`;

    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: prompt,
    });

    const rewrittenText = await (response as any).text();
    
    if (!rewrittenText || rewrittenText.length < 50) {
      throw new Error("Generated script is too short");
    }

    return rewrittenText;
  } catch (error) {
    const fallback = `# Podcast Script\n\n## Introduction\n\nWelcome to our episode.\n\n## Main Content\n\n${text}\n\n## Closing\n\nThanks for listening.`;
    return fallback;
  }
}
