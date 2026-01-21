import type {
	PressableStateCallbackType,
	StyleProp,
	ViewStyle,
} from "react-native";

type PressableStyle =
	| StyleProp<ViewStyle>
	| ((state: PressableStateCallbackType) => StyleProp<ViewStyle>);

type PressableFeedbackOptions = {
	scale?: number;
	opacity?: number;
	disabled?: boolean;
};

const DEFAULT_OPACITY = 0.88;
const DEFAULT_SCALE = 0.98;

export function pressableFeedback(
	style?: PressableStyle,
	options: PressableFeedbackOptions = {},
) {
	return (state: PressableStateCallbackType): StyleProp<ViewStyle> => {
		const resolvedStyle = typeof style === "function" ? style(state) : style;

		if (!state.pressed || options.disabled) {
			return resolvedStyle;
		}

		return [
			resolvedStyle,
			{
				opacity: options.opacity ?? DEFAULT_OPACITY,
				transform: [{ scale: options.scale ?? DEFAULT_SCALE }],
			},
		];
	};
}
