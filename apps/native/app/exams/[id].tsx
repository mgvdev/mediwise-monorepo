import { useMutation, useQuery } from "@tanstack/react-query";
import { router, useLocalSearchParams } from "expo-router";
import { useState } from "react";
import { Image, Modal, Pressable, View } from "react-native";

import { Card, CardBody, CardHeader, CardTitle } from "@/components/base/card";
import { Body, Caption } from "@/components/base/typography";
import {
	ExamForm,
	type ExamFormValues,
} from "@/components/features/exam/exam-form";
import { Container } from "@/components/layout/container";
import { pressableFeedback } from "@/components/utils";
import { queryClient, trpc } from "@/utils/trpc";

export default function ExamDetailScreen() {
	const params = useLocalSearchParams<{ id: string }>();
	const id = String(params.id ?? "");
	const [error, setError] = useState<string | null>(null);
	const [viewerUri, setViewerUri] = useState<string | null>(null);

	const examQuery = useQuery({
		...trpc.exams.get.queryOptions({ id }),
		enabled: Boolean(id),
	});
	const exam = examQuery.data;

	const scanQuery = useQuery({
		...trpc.exams.scan.queryOptions({ id }),
		enabled: Boolean(id) && Boolean(exam?.rawId),
	});
	const images = scanQuery.data?.images ?? [];

	const saveMutation = useMutation(
		trpc.exams.save.mutationOptions({
			onSuccess: () => {
				queryClient.invalidateQueries();
				router.back();
			},
			onError: (e) => setError(e.message || "Couldn't save."),
		}),
	);
	const deleteMutation = useMutation(
		trpc.exams.delete.mutationOptions({
			onSuccess: () => {
				queryClient.invalidateQueries();
				router.back();
			},
			onError: (e) => setError(e.message || "Couldn't delete."),
		}),
	);

	const handleSubmit = (values: ExamFormValues) => {
		setError(null);
		saveMutation.mutate({ ...values, id });
	};

	if (!exam) {
		return (
			<Container className="px-6 pt-4 pb-12">
				<Caption>Loading…</Caption>
			</Container>
		);
	}

	return (
		<Container className="px-6 pt-4 pb-12">
			<View className="gap-4">
				{images.length ? (
					<Card variant="outline">
						<CardHeader>
							<CardTitle>Scanned document</CardTitle>
						</CardHeader>
						<CardBody className="gap-2">
							{images.map((image, index) => {
								const uri = `data:${image.contentType};base64,${image.base64}`;
								return (
									<Pressable
										key={uri.slice(0, 48) + index}
										onPress={() => setViewerUri(uri)}
										style={pressableFeedback()}
									>
										<Image
											source={{ uri }}
											className="h-56 w-full rounded-xl"
											resizeMode="cover"
										/>
									</Pressable>
								);
							})}
							<Caption>Tap to enlarge</Caption>
						</CardBody>
					</Card>
				) : null}

				<ExamForm
					initial={{
						title: exam.title,
						examDate: exam.examDate,
						doctor: exam.doctor,
						conclusion: exam.conclusion,
					}}
					onSubmit={handleSubmit}
					isSaving={saveMutation.isPending}
					submitLabel="Save changes"
					error={error}
					onDelete={() => deleteMutation.mutate({ id })}
					isDeleting={deleteMutation.isPending}
				/>
			</View>

			<Modal
				visible={Boolean(viewerUri)}
				transparent
				animationType="fade"
				onRequestClose={() => setViewerUri(null)}
			>
				<Pressable
					onPress={() => setViewerUri(null)}
					className="flex-1 items-center justify-center bg-black/90 p-4"
				>
					{viewerUri ? (
						<Image
							source={{ uri: viewerUri }}
							className="h-full w-full"
							resizeMode="contain"
						/>
					) : null}
					<View className="absolute bottom-12">
						<Body className="text-white">Tap to close</Body>
					</View>
				</Pressable>
			</Modal>
		</Container>
	);
}
