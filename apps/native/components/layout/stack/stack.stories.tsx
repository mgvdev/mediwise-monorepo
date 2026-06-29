import type { Meta, StoryObj } from "@storybook/react";
import { View } from "react-native";

import { Body, Caption, H3 } from "@/components/base/typography";

import { HorizontalStack, VerticalStack, ZStack } from "./stack";

const meta = {
	title: "Layout/Stack",
	component: VerticalStack,
} satisfies Meta<typeof VerticalStack>;

export default meta;

type Story = StoryObj<typeof VerticalStack>;

export const Vertical: Story = {
	render: () => (
		<VerticalStack className="bg-background p-6">
			<View className="border-panel-border bg-panel-background rounded-2xl border p-4">
				<H3>Default gap</H3>
				<Caption>Uses gap-4.</Caption>
			</View>
			<View className="border-panel-border bg-panel-background rounded-2xl border p-4">
				<Body>Use className to override spacing.</Body>
				<Caption>Example: className="gap-6"</Caption>
			</View>
			<VerticalStack className="gap-2">
				<View className="bg-primary/10 rounded-xl p-3">
					<Body>Nested stack</Body>
				</View>
				<View className="bg-primary/10 rounded-xl p-3">
					<Body>Use smaller gaps inside cards.</Body>
				</View>
			</VerticalStack>
		</VerticalStack>
	),
};

export const Horizontal: Story = {
	render: () => (
		<HorizontalStack className="bg-background p-6">
			<View className="border-panel-border bg-panel-background flex-1 rounded-2xl border p-4">
				<Body>Left</Body>
				<Caption>flex-row + gap-4</Caption>
			</View>
			<View className="border-panel-border bg-panel-background flex-1 rounded-2xl border p-4">
				<Body>Right</Body>
				<Caption>ClassName can override gap.</Caption>
			</View>
		</HorizontalStack>
	),
};

export const ZStackOverlay: Story = {
	render: () => (
		<View className="bg-background p-6">
			<ZStack className="bg-panel-background h-44 rounded-3xl">
				<View className="border-panel-border bg-panel-background h-44 rounded-3xl border" />
				<View className="bg-primary/10 rounded-full px-4 py-2">
					<Body>Centered overlay</Body>
				</View>
			</ZStack>

			<View className="mt-6">
				<ZStack
					className="bg-panel-background h-44 rounded-3xl"
					align="end"
					justify="start"
					overlayClassName="p-4"
				>
					<View className="border-panel-border bg-panel-background h-44 rounded-3xl border" />
					<View className="justify-self-end rounded-2xl bg-yellow-500 px-3 py-2">
						<Body className="text-white">Pinned corner</Body>
					</View>
					<View className="bg-primary rounded-2xl px-3 py-2">
						<Body className="text-white">Pinned corner</Body>
					</View>
					<View className="self-start rounded-2xl bg-red-500 px-3 py-2">
						<Body className="text-white">Pinned corner</Body>
					</View>
				</ZStack>
				<Caption className="mt-2">
					Tip: use align/justify to anchor overlays.
				</Caption>
			</View>

			<View className="mt-6">
				<ZStack className="bg-panel-background h-44 rounded-3xl">
					<View className="border-panel-border bg-panel-background h-44 rounded-3xl border" />

					<View className="absolute top-4 left-4">
						<View className="self-start rounded-2xl bg-red-500 px-3 py-2">
							<Body className="text-white">Pinned corner</Body>
						</View>
					</View>
					<View className="absolute top-4 right-4">
						<View className="self-start rounded-2xl bg-orange-500 px-3 py-2">
							<Body className="text-white">Pinned corner</Body>
						</View>
					</View>
					<View className="absolute bottom-4 left-4">
						<View className="self-start rounded-2xl bg-yellow-500 px-3 py-2">
							<Body className="text-white">Pinned corner</Body>
						</View>
					</View>
					<View className="absolute right-4 bottom-4">
						<View className="self-start rounded-2xl bg-purple-500 px-3 py-2">
							<Body className="text-white">Pinned corner</Body>
						</View>
					</View>
				</ZStack>
			</View>
		</View>
	),
};
