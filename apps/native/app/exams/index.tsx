import { Ionicons } from "@expo/vector-icons";
import { useQuery } from "@tanstack/react-query";
import { router, Stack } from "expo-router";
import { Input, useThemeColor } from "heroui-native";
import { useState } from "react";
import { Pressable, View } from "react-native";

import { Card, CardBody } from "@/components/base/card";
import { Body, BodyStrong, Caption } from "@/components/base/typography";
import { Container } from "@/components/layout/container";
import { VerticalStack } from "@/components/layout/stack";
import { pressableFeedback } from "@/components/utils";
import { trpc } from "@/utils/trpc";

type ExamListItem = {
	id: string;
	title: string;
	examDate: string | null;
	conclusion: string | null;
	doctor: string | null;
	createdAt: string | Date;
};

const MONTHS_FR = [
	"Janvier",
	"Février",
	"Mars",
	"Avril",
	"Mai",
	"Juin",
	"Juillet",
	"Août",
	"Septembre",
	"Octobre",
	"Novembre",
	"Décembre",
];

function examMoment(exam: ExamListItem) {
	const iso = exam.examDate ?? exam.createdAt;
	const date = new Date(iso);
	return Number.isNaN(date.getTime()) ? null : date;
}

// Group exams into year → month buckets, most recent first (input is already
// sorted desc by the server).
function groupExams(exams: ExamListItem[]) {
	const groups: { key: string; label: string; items: ExamListItem[] }[] = [];
	const index = new Map<string, number>();
	for (const exam of exams) {
		const date = examMoment(exam);
		const key = date ? `${date.getFullYear()}-${date.getMonth()}` : "unknown";
		const label = date
			? `${MONTHS_FR[date.getMonth()]} ${date.getFullYear()}`
			: "Date inconnue";
		if (!index.has(key)) {
			index.set(key, groups.length);
			groups.push({ key, label, items: [] });
		}
		const pos = index.get(key);
		if (pos !== undefined) groups[pos]?.items.push(exam);
	}
	return groups;
}

function formatExamDate(exam: ExamListItem) {
	const date = examMoment(exam);
	return date ? date.toLocaleDateString() : "—";
}

export default function ExamsListScreen() {
	const accent = useThemeColor("accent");
	const [search, setSearch] = useState("");
	const examsQuery = useQuery({
		...trpc.exams.list.queryOptions({ search: search.trim() || null }),
	});
	const exams = (examsQuery.data ?? []) as ExamListItem[];
	const groups = groupExams(exams);

	return (
		<Container className="px-6 pt-4 pb-12">
			<Stack.Screen
				options={{
					headerRight: () => (
						<Pressable
							onPress={() => router.push("/exams/new")}
							className="h-9 w-9 items-center justify-center rounded-full"
							style={pressableFeedback()}
							accessibilityRole="button"
							accessibilityLabel="Ajouter un examen"
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
					placeholder="Rechercher (intitulé, conclusion, médecin)"
				/>
			</View>

			{exams.length ? (
				<VerticalStack className="gap-6">
					{groups.map((group) => (
						<View key={group.key} className="gap-3">
							<Caption>{group.label}</Caption>
							<VerticalStack className="gap-3">
								{group.items.map((exam) => (
									<Pressable
										key={exam.id}
										onPress={() => router.push(`/exams/${exam.id}`)}
										style={pressableFeedback()}
									>
										<Card variant="outline">
											<CardBody className="gap-1">
												<Caption>{formatExamDate(exam)}</Caption>
												<BodyStrong>{exam.title}</BodyStrong>
												{exam.conclusion ? (
													<Body className="text-muted" numberOfLines={2}>
														{exam.conclusion}
													</Body>
												) : null}
											</CardBody>
										</Card>
									</Pressable>
								))}
							</VerticalStack>
						</View>
					))}
				</VerticalStack>
			) : (
				<View className="mt-10 items-center gap-2">
					<Ionicons name="document-text-outline" size={36} color={accent} />
					<BodyStrong>Aucun examen</BodyStrong>
					<Body className="text-muted text-center">
						{search.trim()
							? "Aucun résultat pour cette recherche."
							: "Scannez un compte rendu ou ajoutez un examen manuellement."}
					</Body>
				</View>
			)}
		</Container>
	);
}
