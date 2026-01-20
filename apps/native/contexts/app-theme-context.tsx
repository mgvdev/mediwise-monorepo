import type React from "react";
import {
	createContext,
	useCallback,
	useContext,
	useEffect,
	useMemo,
} from "react";
import { Uniwind, useUniwind } from "uniwind";

type ThemeName = "light" | "dark";

type AppThemeContextType = {
	currentTheme: string;
	isLight: boolean;
	isDark: boolean;
	setTheme: (theme: ThemeName) => void;
	toggleTheme: () => void;
};

const AppThemeContext = createContext<AppThemeContextType | undefined>(
	undefined,
);

export const AppThemeProvider = ({
	children,
}: {
	children: React.ReactNode;
}) => {
	const { theme } = useUniwind();

	useEffect(() => {
		if (theme !== "light") {
			Uniwind.setTheme("light");
		}
	}, [theme]);

	const isLight = useMemo(() => {
		return theme === "light";
	}, [theme]);

	const isDark = useMemo(() => {
		return theme === "dark";
	}, [theme]);

	const setTheme = useCallback((newTheme: ThemeName) => {
		if (newTheme !== "light") {
			Uniwind.setTheme("light");
			return;
		}
		Uniwind.setTheme("light");
	}, []);

	const toggleTheme = useCallback(() => {
		Uniwind.setTheme("light");
	}, []);

	const value = useMemo(
		() => ({
			currentTheme: theme,
			isLight,
			isDark,
			setTheme,
			toggleTheme,
		}),
		[theme, isLight, isDark, setTheme, toggleTheme],
	);

	return (
		<AppThemeContext.Provider value={value}>
			{children}
		</AppThemeContext.Provider>
	);
};

export function useAppTheme() {
	const context = useContext(AppThemeContext);
	if (!context) {
		throw new Error("useAppTheme must be used within AppThemeProvider");
	}
	return context;
}
