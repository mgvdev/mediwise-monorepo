import type { Meta } from "@storybook/react-native";
import { View } from "react-native";

import {
	Body,
	BodyMedium,
	BodyMuted,
	BodyStrong,
	Caption,
	CaptionStrong,
	Display,
	Emoji,
	H1,
	H2,
	H3,
	Link,
	Micro,
	MicroStrong,
	Overline,
	Subtitle,
	Title,
} from "./typography";

const meta: Meta = {
	title: "Base/Typography",
};

export default meta;

export const Default = () => {
	return (
		<View className="bg-background flex-1 p-6">
			<View className="gap-3">
				<Overline>Section Label</Overline>
				<Display>Display Title</Display>
				<H1>Heading One</H1>
				<H2>Heading Two</H2>
				<H3>Heading Three</H3>
				<Title>Card Title</Title>
				<Subtitle>Supporting subtitle text</Subtitle>
				<BodyMuted>Muted body text for helper descriptions.</BodyMuted>
				<Body>
					Body text for explanations and longer paragraphs in the app.
				</Body>
				<BodyMedium>Body text with medium weight.</BodyMedium>
				<BodyStrong>Emphasis for important statements.</BodyStrong>
				<Caption>Caption or helper text</Caption>
				<CaptionStrong>Caption for emphasized helper text</CaptionStrong>
				<Micro>Micro text for metadata</Micro>
				<MicroStrong>Micro text for status labels</MicroStrong>
				<Link>Action link</Link>
				<Emoji>🤔</Emoji>
			</View>
		</View>
	);
};
