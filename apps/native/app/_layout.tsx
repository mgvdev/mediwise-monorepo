import { QueryClientProvider } from "@tanstack/react-query";
import { Stack } from "expo-router";

import "@/global.css";
import "@/polyfills";
import { HeroUINativeProvider, ToastProvider } from "heroui-native";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import { KeyboardProvider } from "react-native-keyboard-controller";

import { AuthGate } from "@/components/features/auth/auth-gate";
import { AppThemeProvider } from "@/contexts/app-theme-context";
import { ReminderSync } from "@/features/reminders/reminder-sync";
import { useReminderNotificationObserver } from "@/features/reminders/use-reminders";
import { queryClient } from "@/utils/trpc";

export const unstable_settings = {
	initialRouteName: "(tabs)",
};

const isStorybookEnabled = process.env.EXPO_PUBLIC_STORYBOOK === "1";

function StackLayout() {
	useReminderNotificationObserver();
	return (
		<>
			<ReminderSync />
			<StackScreens />
		</>
	);
}

function StackScreens() {
	return (
		<Stack screenOptions={{ headerShown: false }}>
			<Stack.Screen name="(auth)" />
			<Stack.Screen name="onboarding" />
			<Stack.Screen name="(tabs)" />
			<Stack.Screen name="profile" />
			<Stack.Screen name="health" />
			<Stack.Screen name="prescriptions" />
			<Stack.Screen name="exams" />
			<Stack.Screen name="reminders" />
			<Stack.Screen name="calendar" />
			<Stack.Screen name="practitioners" />
			<Stack.Screen name="modal" options={{ presentation: "modal" }} />
		</Stack>
	);
}

export default function Layout() {
	if (isStorybookEnabled) {
		const StorybookUIRoot = require("../.rnstorybook").default;

		return (
			<GestureHandlerRootView style={{ flex: 1 }}>
				<KeyboardProvider>
					<AppThemeProvider>
						<HeroUINativeProvider>
							<ToastProvider>
								<StorybookUIRoot />
							</ToastProvider>
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
							<ToastProvider>
								<AuthGate>
									<StackLayout />
								</AuthGate>
							</ToastProvider>
						</HeroUINativeProvider>
					</AppThemeProvider>
				</KeyboardProvider>
			</GestureHandlerRootView>
		</QueryClientProvider>
	);
}
