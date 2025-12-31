import { GoogleGenAI, Type, Schema } from "@google/genai";
import { MigrationConfig, ConversionResult } from "../types";
import { MODEL_NAME } from "../constants";

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

const RESPONSE_SCHEMA: Schema = {
  type: Type.OBJECT,
  properties: {
    modernCode: {
      type: Type.STRING,
      description: "The fully rewritten modern code implementing the requested stack."
    },
    unitTests: {
      type: Type.STRING,
      description: "Comprehensive unit tests for the modern code (e.g., JUnit 5, PyTest)."
    },
    documentation: {
      type: Type.STRING,
      description: "Markdown documentation explaining the changes and architectural decisions."
    },
    securityReport: {
      type: Type.ARRAY,
      items: {
        type: Type.OBJECT,
        properties: {
          severity: { type: Type.STRING, enum: ["HIGH", "MEDIUM", "LOW"] },
          description: { type: Type.STRING },
          remediation: { type: Type.STRING }
        },
        required: ["severity", "description", "remediation"]
      }
    }
  },
  required: ["modernCode", "unitTests", "documentation", "securityReport"]
};

export const convertLegacyCode = async (
  sourceCode: string,
  config: MigrationConfig,
  fileName: string
): Promise<ConversionResult> => {
  if (!sourceCode.trim()) {
    throw new Error("Source code cannot be empty.");
  }

  const sourceStackStr = config.sourceTechs.join(', ');
  const targetStackStr = config.targetTechs.join(', ');

  const prompt = `
    Role: Senior Software Architect specializing in Legacy Migration.
    Task: Modernize the provided legacy code file (${fileName}).
    
    Source Tech Stack: ${sourceStackStr}
    Target Tech Stack: ${targetStackStr}
    
    Requirements:
    1. Maintain functional parity while upgrading syntax and libraries.
    2. Adhere strictly to the "Target Tech Stack" best practices.
    3. Replace deprecated security patterns (e.g., WebSecurityConfigurerAdapter -> SecurityFilterChain).
    4. Generate robust unit tests compatible with the target stack.
    5. Return ONLY valid code for the language derived from the file name.
    
    Legacy Code:
    ${sourceCode}
  `;

  try {
    const response = await ai.models.generateContent({
      model: MODEL_NAME,
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        responseSchema: RESPONSE_SCHEMA,
        thinkingConfig: { thinkingBudget: 4096 } 
      }
    });

    const textResult = response.text;
    if (!textResult) {
      throw new Error("No response generated from AI.");
    }

    const parsedResult = JSON.parse(textResult) as ConversionResult;
    return parsedResult;

  } catch (error) {
    console.error(`Migration failed for ${fileName}:`, error);
    throw new Error("AI Migration failed. Please retry.");
  }
};
