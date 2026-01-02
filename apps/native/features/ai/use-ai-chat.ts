import { useChat } from "@ai-sdk/react";
import { env } from "@mediwise-monorepo/env/native";
import { DefaultChatTransport } from "ai";
import { fetch as expoFetch } from "expo/fetch";
import { useEffect, useRef, useState } from "react";
import type { ScrollView } from "react-native";

const generateAPIUrl = (relativePath: string) => {
	const serverUrl = env.EXPO_PUBLIC_SERVER_URL;
	if (!serverUrl) {
		throw new Error(
			"EXPO_PUBLIC_SERVER_URL environment variable is not defined",
		);
	}
	const path = relativePath.startsWith("/") ? relativePath : `/${relativePath}`;
	return serverUrl.concat(path);
};

export function useAiChat() {
	const [input, setInput] = useState("");
	const { messages, error, sendMessage } = useChat({
		transport: new DefaultChatTransport({
			fetch: expoFetch as unknown as typeof globalThis.fetch,
			api: generateAPIUrl("/ai"),
		}),
		onError: (error) => console.error(error, "AI Chat Error"),
	});
	const scrollViewRef = useRef<ScrollView>(null);
	const messageCount = messages.length;

	useEffect(() => {
		if (messageCount === 0) return;
		scrollViewRef.current?.scrollToEnd({ animated: true });
	}, [messageCount]);

	const onSubmit = () => {
		const value = input.trim();
		if (value) {
			sendMessage({ text: value });
			setInput("");
		}
	};

	return {
		input,
		setInput,
		messages,
		error,
		onSubmit,
		scrollViewRef,
	};
}
