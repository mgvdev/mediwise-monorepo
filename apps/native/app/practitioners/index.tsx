import { Ionicons } from "@expo/vector-icons";
import { useQuery } from "@tanstack/react-query";
import { router, Stack } from "expo-router";
import { Input, Spinner, useThemeColor } from "heroui-native";
import { useState } from "react";
import { Pressable, View } from "react-native";

import { Card, CardBody } from "@/components/base/card";
import { Body, BodyStrong, Caption } from "@/components/base/typography";
import { Container } from "@/components/layout/container";
import { VerticalStack } from "@/components/layout/stack";
import { pressableFeedback } from "@/components/utils";
import { specialtyLabel } from "@/features/practitioners/specialties";
import {
	formatPractitionerName,
	groupBySpecialty,
	type PractitionerListItem,
} from "@/features/practitioners/utils";
import { trpc } from "@/utils/trpc";

type Suggestion = {
	displayName: string;
	occurrences: number;
};

export default function PractitionersScreen() {
	const accent = useThemeColor("accent");
	const [search, setSearch] = useState("");

	const practitionersQuery = useQuery({
		...trpc.practitioners.list.queryOptions({ search: search.trim() || null }),
	});
	const suggestionsQuery = useQuery({
		...trpc.practitioners.suggestions.queryOptions(),
	});

	const practitioners = (practitionersQuery.data ??
		[]) as PractitionerListItem[];
	const groups = groupBySpecialty(practitioners);
	const suggestions = (suggestionsQuery.data ?? []) as Suggestion[];

	return (
		<Container className="px-6 pt-4 pb-12">
			<Stack.Screen
				options={{
					headerRight: () => (
						<Pressable
							onPress={() => router.push("/practitioners/new")}
							className="h-9 w-9 items-center justify-center rounded-full"
							style={pressableFeedback()}
							accessibilityRole="button"
							accessibilityLabel="Add a practitioner"
						>
							<Ionicons name="add" size={22} color={accent} />
						</Pressable>
					),
				}}
			/>

			<View className="mb-4">
				<Input
					value={search}
					onChangeText={setSearch}
					placeholder="Search (name, specialty, notes)"
				/>
			</View>

			<VerticalStack className="gap-6">
				{suggestions.length ? (
					<View className="gap-3">
						<Caption>Found in your documents</Caption>
						<VerticalStack className="gap-3">
							{suggestions.map((suggestion) => (
								<Card key={suggestion.displayName} variant="outline">
									<CardBody className="flex-row items-center justify-between gap-3">
										<View className="flex-1">
											<BodyStrong>{suggestion.displayName}</BodyStrong>
											<Body className="text-muted">
												{suggestion.occurrences === 1
													? "1 document"
													: `${suggestion.occurrences} documents`}
											</Body>
										</View>
										<Pressable
											onPress={() =>
												router.push(
													`/practitioners/new?name=${encodeURIComponent(
														suggestion.displayName,
													)}`,
												)
											}
											className="border-panel-border h-9 w-9 items-center justify-center rounded-full border"
											style={pressableFeedback()}
											accessibilityRole="button"
											accessibilityLabel={`Add ${suggestion.displayName}`}
										>
											<Ionicons name="add" size={18} color={accent} />
										</Pressable>
									</CardBody>
								</Card>
							))}
						</VerticalStack>
					</View>
				) : null}

				{practitionersQuery.isPending ? (
					<View className="mt-10 items-center">
						<Spinner />
					</View>
				) : practitioners.length ? (
					groups.map((group) => (
						<View key={group.key} className="gap-3">
							<Caption>{group.label}</Caption>
							<VerticalStack className="gap-3">
								{group.items.map((practitioner) => (
									<Pressable
										key={practitioner.id}
										onPress={() =>
											router.push(`/practitioners/${practitioner.id}`)
										}
										style={pressableFeedback()}
									>
										<Card variant="outline">
											<CardBody className="gap-1">
												<BodyStrong>
													{formatPractitionerName(practitioner)}
												</BodyStrong>
												<Body className="text-muted">
													{specialtyLabel(
														practitioner.specialty,
														practitioner.specialtyOther,
													)}
												</Body>
												{practitioner.phone ? (
													<Caption>{practitioner.phone}</Caption>
												) : null}
											</CardBody>
										</Card>
									</Pressable>
								))}
							</VerticalStack>
						</View>
					))
				) : (
					<View className="mt-10 items-center gap-2">
						<Ionicons name="person-outline" size={36} color={accent} />
						<BodyStrong>No practitioners</BodyStrong>
						<Body className="text-muted text-center">
							{search.trim()
								? "No results for this search."
								: "Add the doctors, dentists and therapists you see."}
						</Body>
					</View>
				)}
			</VerticalStack>
		</Container>
	);
}
