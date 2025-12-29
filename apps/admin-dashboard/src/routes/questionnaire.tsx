import { Button, Card, Chip, Input, Label, TextArea } from "@heroui/react";
import { useMutation, useQuery } from "@tanstack/react-query";
import { createFileRoute, redirect } from "@tanstack/react-router";
import { useEffect, useMemo, useState } from "react";
import { toast } from "sonner";

import { PageHeader } from "@/components/backoffice/page-header";
import { authClient } from "@/lib/auth-client";
import { queryClient, trpc } from "@/utils/trpc";

const DEFAULT_QUESTIONNAIRE = {
	title: "Intake Questionnaire",
	questions: [],
};

export const Route = createFileRoute("/questionnaire")({
	beforeLoad: async () => {
		const session = await authClient.getSession();
		if (!session.data) {
			redirect({
				to: "/login",
				throw: true,
			});
		}
		return { session };
	},
	component: RouteComponent,
});

function RouteComponent() {
	const questionnaireQuery = useQuery(trpc.questionnaire.get.queryOptions());
	const saveMutation = useMutation(
		trpc.questionnaire.save.mutationOptions({
			onSuccess: () => {
				queryClient.invalidateQueries();
				toast.success("Questionnaire saved.");
			},
			onError: (error) => {
				toast.error(error.message || "Unable to save questionnaire.");
			},
		}),
	);

	const [title, setTitle] = useState(DEFAULT_QUESTIONNAIRE.title);
	const [definitionText, setDefinitionText] = useState(
		JSON.stringify(DEFAULT_QUESTIONNAIRE, null, 2),
	);
	const [jsonError, setJsonError] = useState<string | null>(null);

	useEffect(() => {
		if (questionnaireQuery.isLoading) return;
		const data = questionnaireQuery.data;
		if (!data) return;
		setTitle(data.title);
		setDefinitionText(JSON.stringify(data.definition, null, 2));
	}, [questionnaireQuery.data, questionnaireQuery.isLoading]);

	const lastUpdatedLabel = useMemo(() => {
		if (!questionnaireQuery.data?.updatedAt) return "Not published yet";
		return `Updated ${new Date(questionnaireQuery.data.updatedAt).toLocaleString()}`;
	}, [questionnaireQuery.data?.updatedAt]);

	const handleSave = () => {
		setJsonError(null);
		let parsed: unknown;
		try {
			parsed = JSON.parse(definitionText);
		} catch (_error) {
			setJsonError("Please enter valid JSON before saving.");
			return;
		}
		const trimmedTitle = title.trim() || DEFAULT_QUESTIONNAIRE.title;
		saveMutation.mutate({
			title: trimmedTitle,
			definition: parsed,
		});
	};

	const handleReset = () => {
		if (questionnaireQuery.data) {
			setTitle(questionnaireQuery.data.title);
			setDefinitionText(
				JSON.stringify(questionnaireQuery.data.definition, null, 2),
			);
			setJsonError(null);
			return;
		}
		setTitle(DEFAULT_QUESTIONNAIRE.title);
		setDefinitionText(JSON.stringify(DEFAULT_QUESTIONNAIRE, null, 2));
		setJsonError(null);
	};

	return (
		<div className="flex flex-col gap-6">
			<PageHeader
				eyebrow="Questionnaire Management"
				title="Form Builder (MVP)"
				description="Edit the shared intake questionnaire definition. This version applies to every tenant for now."
				actions={<Chip variant="soft">{lastUpdatedLabel}</Chip>}
			/>

			<Card className="rounded-3xl border border-border/60 bg-card/70 p-6 shadow-sm">
				<div className="flex flex-col gap-6">
					<div className="grid gap-2">
						<Label htmlFor="questionnaire-title">Title</Label>
						<Input
							id="questionnaire-title"
							value={title}
							fullWidth
							isOnSurface
							onChange={(event) => setTitle(event.target.value)}
							placeholder="Intake Questionnaire"
						/>
					</div>

					<div className="grid gap-2">
						<Label htmlFor="questionnaire-json">Definition (JSON)</Label>
						<TextArea
							id="questionnaire-json"
							value={definitionText}
							onChange={(event) => setDefinitionText(event.target.value)}
							spellCheck={false}
							rows={16}
							fullWidth
							isOnSurface
						/>
						{jsonError ? (
							<p className="text-destructive text-xs">{jsonError}</p>
						) : null}
					</div>

					<div className="flex flex-wrap gap-3">
						<Button onPress={handleSave} isDisabled={saveMutation.isPending}>
							{saveMutation.isPending ? "Saving..." : "Save questionnaire"}
						</Button>
						<Button variant="secondary" onPress={handleReset}>
							Reset
						</Button>
					</div>
				</div>
			</Card>
		</div>
	);
}
