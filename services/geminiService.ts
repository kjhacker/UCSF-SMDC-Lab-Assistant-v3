import { GoogleGenAI, Content, Part } from "@google/genai";
import { UploadedFile, Message } from "../types";

const SYSTEM_INSTRUCTION = `
You are the "UCSF Lab Assistant", a specialized AI designed to assist laboratory personnel at SMDC.
Your primary function is to answer questions, explain procedures, and provide guidance based STRICTLY on the provided Reference Documents (PDFs), Local Protocols (Text files), and Training Videos.

**PROJECT CONSTITUTION - CRITICAL RULES:**

1.  **HIERARCHY OF TRUTH (The Golden Rule)**:
    *   **Level 1 (Highest Authority): SMDC Local Protocols (Text Files)**. These contain the specific rules for THIS lab.
    *   **Level 2: Manufacturer Manuals (PDFs)**. These are generic instructions.
    *   **RULE**: If a Local Protocol (Text) contradicts a Manufacturer Manual (PDF), **YOU MUST FOLLOW THE LOCAL PROTOCOL**.

2.  **CONFLICT WARNINGS**:
    *   If you detect a conflict between the Local Protocol and the Manual, you MUST explicitly warn the user.
    *   Use **RED TEXT** for the warning (e.g., "$\{\color{red}\textbf{CONFLICT WARNING: The SMDC Local Protocol overrides the Manufacturer Manual regarding...}\}$").
    *   *Note: Since standard Markdown doesn't support color, use bold and uppercase "WARNING" prefixed with a warning emoji ⚠️ to simulate urgency.* -> **⚠️ CONFLICT WARNING: SMDC PROTOCOL OVERRIDE**

3.  **Strict Context Adherence**: Answer ONLY using the information found in the attached files. If the answer is not in the files, state: "I cannot find information regarding that in the provided reference materials."

4.  **Clinical & Scientific Tone**: Maintain a professional, objective, and precise tone.

5.  **Citations**: explicitly mention the source file name when providing information (e.g., "As stated in 'lab_safety_local.txt'...").
`;

export const generateLabResponse = async (
  apiKey: string,
  currentHistory: Message[],
  uploadedFiles: UploadedFile[],
  userPrompt: string
): Promise<string> => {
  if (!apiKey) {
    throw new Error("API Key is missing. Please provide a valid API Key.");
  }

  try {
    // Initialize Gemini Client with the provided key
    const ai = new GoogleGenAI({ apiKey });
    
    // We use gemini-2.5-flash for its large context window and speed
    const modelId = "gemini-2.5-flash"; 

    // 1. Construct the "Context" Message
    // We categorize files in the prompt to help the model distinguish sources for the hierarchy rule
    const fileParts: Part[] = uploadedFiles.map((file) => ({
      inlineData: {
        mimeType: file.mimeType,
        data: file.data,
      },
    }));

    const fileListText = uploadedFiles.map(f => `- ${f.name} (${f.type})`).join('\n');

    // If we have files, we create a specialized context part
    const contextContent: Content | null = fileParts.length > 0 ? {
      role: 'user',
      parts: [
        ...fileParts,
        { text: `SYSTEM: The following files are attached to this session. \n\nFILE MANIFEST:\n${fileListText}\n\nRemember: Text files (.txt) are Local Protocols and override PDFs.` }
      ]
    } : null;

    // 2. Map Chat History
    const historyParts: Content[] = currentHistory.map((msg) => ({
      role: msg.role,
      parts: [{ text: msg.text }],
    }));

    // 3. Construct the Full Request Contents
    const contents: Content[] = [];

    if (contextContent) {
      contents.push(contextContent);
    }

    contents.push(...historyParts);

    // Add the new message
    contents.push({
      role: 'user',
      parts: [{ text: userPrompt }],
    });

    // 4. Call the API
    const response = await ai.models.generateContent({
      model: modelId,
      contents: contents,
      config: {
        systemInstruction: SYSTEM_INSTRUCTION,
        temperature: 0.1, // Very low temperature for strict adherence to protocols
      },
    });

    const text = response.text;
    if (!text) {
      throw new Error("No response text generated.");
    }

    return text;

  } catch (error: any) {
    console.error("Gemini API Error:", error);
    
    // Handle specific Gemini error codes
    if (error.message?.includes("The document has no pages")) {
      throw new Error("One of the uploaded PDFs appears to be empty or corrupted. Please check your files.");
    }

    throw new Error("Failed to generate response. " + (error.message || "Check connection and files."));
  }
};