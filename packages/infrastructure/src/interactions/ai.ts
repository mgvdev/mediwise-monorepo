import { env } from "@mediwise-monorepo/env/server";
import { z } from "zod";
import { INTERACTION_DISCLAIMER, type InteractionItem } from "./types";

export type InteractionAnalyzer = {
	provider: string;
	model: string;
	// Returns AI-sourced interaction items (informational). Never throws on an
	// empty/odd model output — returns `[]` instead.
	analyzeInteractions: (input: {
		medications: string[];
		allergies: string[];
	}) => Promise<InteractionItem[]>;
};

const SYSTEM_PROMPT =
	"You are a clinical pharmacology assistant. Given a list of medications a " +
	"patient currently takes and a list of their known allergies, identify " +
	"potential drug-drug interactions and drug-allergy conflicts. Be conservative " +
	"and only report clinically meaningful issues. This is INFORMATIONAL ONLY and " +
	"must never be presented as a diagnosis. Severity must be one of: 'info', " +
	"'warning', 'danger'. type must be 'drug_drug' or 'drug_allergy'. For " +
	"'drug_drug', a and b are the two medication names. For 'drug_allergy', a is " +
	"the medication name and b is the allergy. Write the description in French, " +
	"one short sentence. If there are no interactions, return an empty array. " +
	"Return valid JSON only, no markdown.";

// JSON Schema passed to Ollama's `format` for structured output.
const INTERACTIONS_JSON_SCHEMA = {
	type: "object",
	properties: {
		items: {
			type: "array",
			items: {
				type: "object",
				properties: {
					type: { type: "string", enum: ["drug_drug", "drug_allergy"] },
					severity: { type: "string", enum: ["info", "warning", "danger"] },
					a: { type: "string" },
					b: { type: "string" },
					description: { type: "string" },
				},
				required: ["type", "severity", "a", "b", "description"],
			},
		},
	},
	required: ["items"],
} as const;

const aiItemSchema = z.object({
	type: z.enum(["drug_drug", "drug_allergy"]),
	severity: z.enum(["info", "warning", "danger"]),
	a: z.string().min(1),
	b: z.string().min(1),
	description: z.string().min(1),
});

const aiResultSchema = z.object({
	items: z.array(aiItemSchema).default([]),
});

function buildUserPrompt(input: {
	medications: string[];
	allergies: string[];
}) {
	return JSON.stringify({
		medications: input.medications,
		allergies: input.allergies,
	});
}

function extractJson(text: string): unknown {
	const first = text.indexOf("{");
	const last = text.lastIndexOf("}");
	if (first === -1 || last === -1 || last <= first) {
		throw new Error("No JSON found in AI response.");
	}
	return JSON.parse(text.slice(first, last + 1));
}

function parseItems(text: string): InteractionItem[] {
	const parsed = aiResultSchema.parse(extractJson(text.trim()));
	return parsed.items.map((item) => ({ ...item, source: "ai" as const }));
}

export function createInteractionAnalyzer(): InteractionAnalyzer {
	return env.AI_PROVIDER === "openai"
		? createOpenAiAnalyzer()
		: createOllamaAnalyzer();
}

function createOllamaAnalyzer(): InteractionAnalyzer {
	const baseUrl = env.OLLAMA_BASE_URL || "http://localhost:11434";
	const model = env.OLLAMA_MODEL || "gemma3:4b";

	return {
		provider: "ollama",
		model,
		analyzeInteractions: async ({ medications, allergies }) => {
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
						prompt: `${SYSTEM_PROMPT}\n\nInput: ${buildUserPrompt({ medications, allergies })}`,
						stream: false,
						format: INTERACTIONS_JSON_SCHEMA,
						options: { temperature: 0 },
					}),
				});

				if (!response.ok) {
					throw new Error(`Ollama request failed: ${response.status}`);
				}

				const data = (await response.json()) as { response?: string };
				return parseItems(data.response || "");
			} finally {
				clearTimeout(timeout);
			}
		},
	};
}

function createOpenAiAnalyzer(): InteractionAnalyzer {
	if (!env.OPENAI_API_KEY) {
		throw new Error("OPENAI_API_KEY is required for the OpenAI provider.");
	}
	const model = env.OPENAI_MODEL || "gpt-4o-mini";

	return {
		provider: "openai",
		model,
		analyzeInteractions: async ({ medications, allergies }) => {
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
								content: buildUserPrompt({ medications, allergies }),
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
			return parseItems(data.choices?.[0]?.message?.content ?? "");
		},
	};
}

export { INTERACTION_DISCLAIMER };
