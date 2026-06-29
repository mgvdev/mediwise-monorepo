import { env } from "@mediwise-monorepo/env/server";

import { normalizeAiResponse, UNIFIED_JSON_SCHEMA } from "./parser";
import type { UnifiedPrescriptionData } from "./types";

export type AiProvider = {
	provider: string;
	model: string;
	extractPrescription: (input: {
		// One buffer per page of the document.
		images: Buffer[];
		mimeType: string;
	}) => Promise<UnifiedPrescriptionData>;
};

const SYSTEM_PROMPT =
	"You are extracting structured data from a photo of a medical document. " +
	"First classify the document: set documentType to 'prescription' for a medical prescription/ordonnance, " +
	"'report' for a medical report / compte-rendu / lab or imaging result, otherwise 'unknown'. " +
	"If documentType is not 'prescription', return medications: []. Return valid JSON only. " +
	'Schema: { documentType: "prescription"|"report"|"unknown", patientName: string|null, prescriberName: string|null, issuedDate: string|null, validUntil: string|null, medications: [{ name: string, dosage?: string|null, frequency?: string|null, frequencyCount?: number|null, frequencyUnit?: "day"|"week"|"month"|null, route?: string|null, duration?: string|null, durationValue?: number|null, durationUnit?: "day"|"week"|"month"|null, refills?: string|null, instructions?: string|null, form?: string|null }], notes?: string|null }. ' +
	"form is the galenic form when stated (e.g. tablet, capsule, syrup, solution, injection, cream, drops, inhaler, patch, suppository); otherwise null. " +
	"If a field is unknown, use null. Do not wrap the JSON in markdown.";

export function createAiProvider(): AiProvider {
	return env.AI_PROVIDER === "openai"
		? createOpenAiProvider()
		: createOllamaProvider();
}

function createOllamaProvider(): AiProvider {
	const baseUrl = env.OLLAMA_BASE_URL || "http://localhost:11434";
	const model = env.OLLAMA_MODEL || "gemma3:4b";

	return {
		provider: "ollama",
		model,
		extractPrescription: async ({ images, mimeType: _mimeType }) => {
			const controller = new AbortController();
			const timeout = setTimeout(
				() => controller.abort(),
				env.OLLAMA_TIMEOUT_MS,
			);

			try {
				const response = await fetch(`${baseUrl}/api/generate`, {
					method: "POST",
					headers: { "Content-Type": "application/json" },
					signal: controller.signal,
					body: JSON.stringify({
						model,
						prompt: SYSTEM_PROMPT,
						stream: false,
						images: images.map((b) => b.toString("base64")),
						// Structured output: force JSON matching the schema.
						format: UNIFIED_JSON_SCHEMA,
						options: { temperature: 0 },
					}),
				});

				if (!response.ok) {
					throw new Error(`Ollama request failed: ${response.status}`);
				}

				const data = (await response.json()) as { response?: string };
				return normalizeAiResponse(data.response || "");
			} finally {
				clearTimeout(timeout);
			}
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
		extractPrescription: async ({ images, mimeType }) => {
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
									{
										type: "text",
										text: "Extract the prescription data.",
									},
									...images.map((image) => ({
										type: "image_url",
										image_url: {
											url: `data:${mimeType};base64,${image.toString("base64")}`,
										},
									})),
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
