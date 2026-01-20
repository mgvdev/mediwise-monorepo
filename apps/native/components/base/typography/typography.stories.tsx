import type { Meta } from "@storybook/react-native";
import { View } from "react-native";

import {
	Body,
	BodyStrong,
	Caption,
	Display,
	H1,
	H2,
	H3,
	Link,
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
		<View className="flex-1 bg-background p-6">
			<View className="gap-3">
				<Overline>Section Label</Overline>
				<Display>Display Title</Display>
				<H1>Heading One</H1>
				<H2>Heading Two</H2>
				<H3>Heading Three</H3>
				<Title>Card Title</Title>
				<Subtitle>Supporting subtitle text</Subtitle>
				<Body>
					Body text for explanations and longer paragraphs in the app.
				</Body>
				<BodyStrong>Emphasis for important statements.</BodyStrong>
				<Caption>Caption or helper text</Caption>
				<Link>Action link</Link>
			</View>
		</View>
	);
};
