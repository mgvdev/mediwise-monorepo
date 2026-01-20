import type { Meta } from "@storybook/react-native";
import { useMemo, useState } from "react";
import { View } from "react-native";

import { ChoiceComment, ChoiceInput, type ChoiceValue } from "./choice";

const meta: Meta = {
	title: "Base/Choice",
};

export default meta;

const yesNoOptions = [
	{ value: "yes", label: "Yes" },
	{ value: "no", label: "No" },
];

const triStateOptions = [
	{ value: "yes", label: "Yes" },
	{ value: "no", label: "No" },
	{ value: "suspected", label: "Suspected" },
];

export const Default = () => {
	const [allergies, setAllergies] = useState<ChoiceValue>(null);
	const [allergyComment, setAllergyComment] = useState("");
	const [refill, setRefill] = useState<ChoiceValue>(null);
	const [refillComment, setRefillComment] = useState("");

	const allergiesLabel = useMemo(() => {
		switch (allergies) {
			case "yes":
				return "List your allergies";
			case "suspected":
				return "What makes you suspect it?";
			case "no":
				return "Any past issues to share?";
			default:
				return "";
		}
	}, [allergies]);

	const refillLabel = useMemo(() => {
		switch (refill) {
			case "yes":
				return "How often do you refill?";
			case "suspected":
				return "What makes you unsure?";
			case "no":
				return "What stopped you?";
			default:
				return "";
		}
	}, [refill]);

	return (
		<View className="flex-1 bg-background p-6">
			<View className="gap-6">
				<View className="gap-3">
					<ChoiceInput
						label="Do you have allergies?"
						description="We use this to personalize your plan."
						value={allergies}
						onChange={setAllergies}
						options={triStateOptions}
					/>
					{allergies ? (
						<ChoiceComment
							label={allergiesLabel}
							value={allergyComment}
							onChangeText={setAllergyComment}
							placeholder="Add details"
						/>
					) : null}
				</View>
				<View className="gap-3">
					<ChoiceInput
						label="Have you refilled this prescription?"
						description="This helps us track adherence."
						value={refill}
						onChange={setRefill}
						options={triStateOptions}
					/>
					{refill ? (
						<ChoiceComment
							label={refillLabel}
							value={refillComment}
							onChangeText={setRefillComment}
							placeholder="Add details"
						/>
					) : null}
				</View>
			</View>
		</View>
	);
};

export const CommentOnlyOnYes = () => {
	const [value, setValue] = useState<ChoiceValue>(null);
	const [comment, setComment] = useState("");

	return (
		<View className="flex-1 bg-background p-6">
			<View className="gap-3">
				<ChoiceInput
					label="Have you ever experienced side effects?"
					description="We only ask for details when you say yes."
					value={value}
					onChange={setValue}
					options={triStateOptions}
				/>
				{value === "yes" ? (
					<ChoiceComment
						label="Tell us more"
						value={comment}
						onChangeText={setComment}
						placeholder="Add details"
					/>
				) : null}
			</View>
		</View>
	);
};

export const TwoChoices = () => {
	const [value, setValue] = useState<ChoiceValue>(null);
	const [comment, setComment] = useState("");

	return (
		<View className="flex-1 bg-background p-6">
			<View className="gap-3">
				<ChoiceInput
					label="Do you consent to share vitals?"
					description="We will only share with your care team."
					value={value}
					onChange={setValue}
					options={yesNoOptions}
				/>
				{value === "no" ? (
					<ChoiceComment
						label="What is your concern?"
						value={comment}
						onChangeText={setComment}
						placeholder="Add details"
					/>
				) : null}
			</View>
		</View>
	);
};

export const ThreeChoices = () => {
	const [value, setValue] = useState<ChoiceValue>(null);
	const [comment, setComment] = useState("");

	return (
		<View className="flex-1 bg-background p-6">
			<View className="gap-3">
				<ChoiceInput
					label="Do you suspect any medication intolerance?"
					description="Answer as best as you can."
					value={value}
					onChange={setValue}
					options={triStateOptions}
				/>
				{value ? (
					<ChoiceComment
						label="Tell us more"
						value={comment}
						onChangeText={setComment}
						placeholder="Add details"
					/>
				) : null}
			</View>
		</View>
	);
};

export const CommentOnNoOrSuspected = () => {
	const [value, setValue] = useState<ChoiceValue>(null);
	const [comment, setComment] = useState("");

	return (
		<View className="flex-1 bg-background p-6">
			<View className="gap-3">
				<ChoiceInput
					label="Is your prescription current?"
					description="Select the closest answer."
					value={value}
					onChange={setValue}
					options={triStateOptions}
				/>
				{value === "no" || value === "suspected" ? (
					<ChoiceComment
						label="What changed?"
						value={comment}
						onChangeText={setComment}
						placeholder="Add details"
					/>
				) : null}
			</View>
		</View>
	);
};

export const VerticalChoices = () => {
	const [value, setValue] = useState<ChoiceValue>(null);
	const [comment, setComment] = useState("");

	return (
		<View className="flex-1 bg-background p-6">
			<View className="gap-3">
				<ChoiceInput
					label="Do you suspect any medication intolerance?"
					description="Vertical layout keeps long labels inside the card."
					value={value}
					onChange={setValue}
					options={triStateOptions}
					layout="vertical"
				/>
				{value ? (
					<ChoiceComment
						label="Tell us more"
						value={comment}
						onChangeText={setComment}
						placeholder="Add details"
					/>
				) : null}
			</View>
		</View>
	);
};

export const AutoLayout = () => {
	const [value, setValue] = useState<ChoiceValue>(null);
	const [comment, setComment] = useState("");

	return (
		<View className="flex-1 bg-background p-6">
			<View className="gap-3">
				<ChoiceInput
					label="Do you suspect any medication intolerance?"
					description="Auto layout switches to vertical for longer labels."
					value={value}
					onChange={setValue}
					options={triStateOptions}
					layout="auto"
				/>
				{value ? (
					<ChoiceComment
						label="Tell us more"
						value={comment}
						onChangeText={setComment}
						placeholder="Add details"
					/>
				) : null}
			</View>
		</View>
	);
};
