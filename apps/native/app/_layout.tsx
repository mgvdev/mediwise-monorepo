import { AuthGate } from "@/components/features/auth/auth-gate";
import { AppThemeProvider } from "@/contexts/app-theme-context";
import "@/global.css";
import "@/polyfills";
import { QueryClientProvider } from "@tanstack/react-query";
import { Stack } from "expo-router";
import { HeroUINativeProvider } from "heroui-native";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import { KeyboardProvider } from "react-native-keyboard-controller";
import { queryClient } from "@/utils/trpc";

export const unstable_settings = {
	initialRouteName: "(drawer)",
};

const isStorybookEnabled = process.env.EXPO_PUBLIC_STORYBOOK === "1";

function StackLayout() {
	return (
		<Stack screenOptions={{}}>
			<Stack.Screen name="(auth)" options={{ headerShown: false }} />
			<Stack.Screen name="(drawer)" options={{ headerShown: false }} />
			<Stack.Screen name="prescriptions" options={{ headerShown: false }} />
			<Stack.Screen
				name="(modals)"
				options={{ presentation: "modal", headerShown: false }}
			/>
			<Stack.Screen
				name="modal"
				options={{ title: "Modal", presentation: "modal" }}
			/>
		</Stack>
	);
}

export default function Layout() {
	if (isStorybookEnabled) {
		const StorybookUIRoot = require("../.storybook").default;

		return (
			<GestureHandlerRootView style={{ flex: 1 }}>
				<KeyboardProvider>
					<AppThemeProvider>
						<HeroUINativeProvider>
							<StorybookUIRoot />
						</HeroUINativeProvider>
					</AppThemeProvider>
				</KeyboardProvider>
			</GestureHandlerRootView>
		);
	}

	return (
		<QueryClientProvider client={queryClient}>
			<GestureHandlerRootView style={{ flex: 1 }}>
				<KeyboardProvider>
					<AppThemeProvider>
						<HeroUINativeProvider>
							<AuthGate>
								<StackLayout />
							</AuthGate>
						</HeroUINativeProvider>
					</AppThemeProvider>
				</KeyboardProvider>
			</GestureHandlerRootView>
		</QueryClientProvider>
	);
}
