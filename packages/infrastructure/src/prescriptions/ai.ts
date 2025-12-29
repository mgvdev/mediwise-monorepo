import { env } from "@mediwise-monorepo/env/server";
import { normalizeAiResponse } from "./parser";
import type { UnifiedPrescriptionData } from "./types";

export type AiProvider = {
	provider: string;
	model: string;
	extractPrescription: (input: {
		image: Buffer;
		mimeType: string;
	}) => Promise<UnifiedPrescriptionData>;
};

const SYSTEM_PROMPT =
	"You are extracting data from a prescription image. Return valid JSON only. " +
	"Schema: { patientName: string|null, prescriberName: string|null, issuedDate: string|null, medications: [{ name: string, dosage?: string|null, frequency?: string|null, route?: string|null, duration?: string|null, quantity?: string|null, refills?: string|null, instructions?: string|null }], notes?: string|null }. " +
	"If a field is unknown, use null or an empty string. Do not wrap the JSON in markdown.";

export function createAiProvider(): AiProvider {
	return env.AI_PROVIDER === "openai"
		? createOpenAiProvider()
		: createOllamaProvider();
}

function createOllamaProvider(): AiProvider {
	const baseUrl = env.OLLAMA_BASE_URL || "http://localhost:11434";
	const model = env.OLLAMA_MODEL || "llava";

	return {
		provider: "ollama",
		model,
		extractPrescription: async ({ image, mimeType: _mimeType }) => {
			const payload = {
				model,
				prompt: SYSTEM_PROMPT,
				stream: false,
				images: [image.toString("base64")],
			};

			const response = await fetch(`${baseUrl}/api/generate`, {
				method: "POST",
				headers: { "Content-Type": "application/json" },
				body: JSON.stringify(payload),
			});

			if (!response.ok) {
				throw new Error(`Ollama request failed: ${response.status}`);
			}

			const data = (await response.json()) as { response?: string };
			return normalizeAiResponse(data.response || "");
		},
	};
}

function createOpenAiProvider(): AiProvider {
	if (!env.OPENAI_API_KEY) {
		throw new Error("OPENAI_API_KEY is required for the OpenAI provider.");
	}

	const model = env.OPENAI_MODEL || "gpt-4o-mini";

	return {
		provider: "openai",
		model,
		extractPrescription: async ({ image, mimeType }) => {
			const response = await fetch(
				"https://api.openai.com/v1/chat/completions",
				{
					method: "POST",
					headers: {
						"Content-Type": "application/json",
						Authorization: `Bearer ${env.OPENAI_API_KEY}`,
					},
					body: JSON.stringify({
						model,
						messages: [
							{ role: "system", content: SYSTEM_PROMPT },
							{
								role: "user",
								content: [
									{ type: "text", text: "Extract the prescription data." },
									{
										type: "image_url",
										image_url: {
											url: `data:${mimeType};base64,${image.toString("base64")}`,
										},
									},
								],
							},
						],
						response_format: { type: "json_object" },
					}),
				},
			);

			if (!response.ok) {
				throw new Error(`OpenAI request failed: ${response.status}`);
			}

			const data = (await response.json()) as {
				choices?: Array<{ message?: { content?: string } }>;
			};
			const content = data.choices?.[0]?.message?.content ?? "";
			return normalizeAiResponse(content);
		},
	};
}
