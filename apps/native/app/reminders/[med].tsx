import { Ionicons } from "@expo/vector-icons";
import { useQuery } from "@tanstack/react-query";
import { Redirect, router, Stack, useLocalSearchParams } from "expo-router";
import { Button, useThemeColor } from "heroui-native";
import { useEffect, useState } from "react";
import { Pressable, Switch, View } from "react-native";

import { Card, CardBody, CardHeader, CardTitle } from "@/components/base/card";
import {
	Body,
	BodyMuted,
	Caption,
	Display,
	Overline,
	Subtitle,
} from "@/components/base/typography";
import type { TreatmentMedication } from "@/components/features/prescription/treatment-list-item";
import { Container } from "@/components/layout/container";
import { VerticalStack } from "@/components/layout/stack";
import { TimePickerModal } from "@/features/reminders/time-picker";
import {
	useReminderMutations,
	useRemindersQuery,
} from "@/features/reminders/use-reminders";
import {
	ALL_MOMENTS,
	formatMomentLabel,
	resolveMomentTime,
} from "@/features/reminders/utils";
import { trpc } from "@/utils/trpc";

type ReminderData = {
	medicationName: string;
	medicationDosage: string | null;
	enabled: boolean;
	moments: string[];
	timeOverrides?: Record<string, string> | null;
};

export default function ReminderManageScreen() {
	const primary = useThemeColor("accent");
	const params = useLocalSearchParams<{
		med?: string | string[];
		dosage?: string | string[];
	}>();
	const name = decodeURIComponent(
		Array.isArray(params.med) ? params.med[0] : (params.med ?? ""),
	);
	const dosageParam = decodeURIComponent(
		Array.isArray(params.dosage) ? params.dosage[0] : (params.dosage ?? ""),
	);

	const remindersQuery = useRemindersQuery();
	const unifiedQuery = useQuery({
		...trpc.prescriptions.unified.get.queryOptions(),
	});
	const { upsert, remove } = useReminderMutations();

	const reminders = (remindersQuery.data?.reminders ?? []) as ReminderData[];
	const timeMap = (remindersQuery.data?.timeMap ?? {}) as Record<
		string,
		string
	>;
	const existing = reminders.find(
		(r) =>
			r.medicationName === name && (r.medicationDosage ?? "") === dosageParam,
	);
	const medications = (unifiedQuery.data?.medications ??
		[]) as TreatmentMedication[];
	const medication = medications.find(
		(m) => m.name === name && (m.dosage ?? "") === dosageParam,
	);

	const [enabled, setEnabled] = useState(true);
	const [moments, setMoments] = useState<string[]>([]);
	const [overrides, setOverrides] = useState<Record<string, string>>({});
	const [editingMoment, setEditingMoment] = useState<string | null>(null);
	const [hydrated, setHydrated] = useState(false);

	useEffect(() => {
		if (hydrated) return;
		if (remindersQuery.isLoading || unifiedQuery.isLoading) return;
		if (existing) {
			setEnabled(existing.enabled);
			setMoments(existing.moments ?? []);
			setOverrides(existing.timeOverrides ?? {});
		} else if (medication) {
			const seed = (medication.intakeMoments ?? []).filter((m) =>
				(ALL_MOMENTS as string[]).includes(m),
			);
			setEnabled(true);
			setMoments(seed);
			setOverrides({});
		}
		setHydrated(true);
	}, [
		hydrated,
		existing,
		medication,
		remindersQuery.isLoading,
		unifiedQuery.isLoading,
	]);

	if (remindersQuery.isLoading || unifiedQuery.isLoading) {
		return (
			<Container className="px-5 pt-6">
				<BodyMuted>Loading…</BodyMuted>
			</Container>
		);
	}

	if (!name || (!existing && !medication)) {
		return <Redirect href="/reminders" />;
	}

	const dosage =
		medication?.dosage ?? existing?.medicationDosage ?? dosageParam;

	function toggleMoment(moment: string) {
		setMoments((prev) =>
			prev.includes(moment)
				? prev.filter((m) => m !== moment)
				: [...prev, moment],
		);
	}

	async function handleSave() {
		await upsert.mutateAsync({
			medicationName: name,
			medicationDosage: dosage || null,
			enabled,
			moments,
			timeOverrides: overrides,
		});
		router.back();
	}

	async function handleRemove() {
		await remove.mutateAsync({
			medicationName: name,
			medicationDosage: dosage || null,
		});
		router.back();
	}

	return (
		<Container className="px-5 pt-6 pb-12">
			<Stack.Screen options={{ title: name }} />
			<VerticalStack className="gap-5">
				<View className="border-primary/10 from-primary/20 via-primary/5 to-panel-background rounded-3xl border bg-gradient-to-br p-5">
					<Overline className="text-primary/80">REMINDER</Overline>
					<Display className="text-foreground mt-2">{name}</Display>
					{dosage ? <Subtitle>{dosage}</Subtitle> : null}
				</View>

				<Card>
					<CardBody className="flex-row items-center justify-between">
						<View className="flex-1 pr-3">
							<Body className="font-semibold">Reminders</Body>
							<Caption>Get notified for this medication.</Caption>
						</View>
						<Switch
							value={enabled}
							onValueChange={setEnabled}
							trackColor={{ true: primary }}
						/>
					</CardBody>
				</Card>

				<Card>
					<CardHeader>
						<CardTitle>Intake moments</CardTitle>
					</CardHeader>
					<CardBody className="mt-1">
						{ALL_MOMENTS.map((moment, index) => {
							const active = moments.includes(moment);
							const time = resolveMomentTime(moment, timeMap, overrides);
							return (
								<View
									key={moment}
									className={
										index > 0
											? "border-panel-border flex-row items-center gap-3 border-t py-3"
											: "flex-row items-center gap-3 py-3"
									}
								>
									<View className="flex-1">
										<Body>{formatMomentLabel(moment)}</Body>
										{active ? (
											<Pressable
												onPress={() => setEditingMoment(moment)}
												disabled={!enabled}
											>
												<Caption className="text-primary">
													{time}
													{overrides[moment] ? " (custom)" : ""}
												</Caption>
											</Pressable>
										) : null}
									</View>
									<Switch
										value={active}
										onValueChange={() => toggleMoment(moment)}
										disabled={!enabled}
										trackColor={{ true: primary }}
									/>
								</View>
							);
						})}
						{!moments.length ? (
							<BodyMuted className="pt-2">
								Turn on at least one moment to receive reminders.
							</BodyMuted>
						) : null}
					</CardBody>
				</Card>

				<Button onPress={handleSave} isDisabled={upsert.isPending}>
					<Button.Label>Save reminder</Button.Label>
				</Button>

				{existing ? (
					<Pressable
						onPress={handleRemove}
						disabled={remove.isPending}
						className="flex-row items-center justify-center gap-2 py-2"
					>
						<Ionicons name="trash-outline" size={16} className="text-danger" />
						<Body className="text-danger">Remove reminder</Body>
					</Pressable>
				) : null}
			</VerticalStack>

			<TimePickerModal
				visible={editingMoment !== null}
				value={
					editingMoment
						? resolveMomentTime(editingMoment, timeMap, overrides)
						: "09:00"
				}
				title={editingMoment ? formatMomentLabel(editingMoment) : "Set time"}
				onCancel={() => setEditingMoment(null)}
				onConfirm={(time) => {
					if (editingMoment) {
						setOverrides((prev) => ({ ...prev, [editingMoment]: time }));
					}
					setEditingMoment(null);
				}}
			/>
		</Container>
	);
}
