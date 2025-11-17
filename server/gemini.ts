import { GoogleGenAI } from "@google/genai";

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY || "" });

export async function rewriteAsPodcastScript(text: string): Promise<string> {
  try {
    const systemPrompt = `You are an expert podcast script writer. Transform the following text into an engaging, conversational podcast script. 

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

Format the output in clean markdown with proper headings and paragraphs.`;

    const response = await ai.models.generateContent({
      model: "gemini-2.0-flash-exp",
      config: {
        systemInstruction: systemPrompt,
      },
      contents: `Transform this text into an engaging podcast script:\n\n${text}`,
    });

    const rewrittenText = response.text;
    
    if (!rewrittenText || rewrittenText.length < 50) {
      throw new Error("Generated script is too short");
    }

    return rewrittenText;
  } catch (error) {
    throw new Error(`Failed to rewrite text: ${error instanceof Error ? error.message : String(error)}`);
  }
}
