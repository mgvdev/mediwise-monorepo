import { router, Stack } from "expo-router";
import { Button } from "heroui-native";
import { useEffect, useState } from "react";
import { Pressable, View } from "react-native";

import { Card, CardBody, CardHeader, CardTitle } from "@/components/base/card";
import { Body, BodyMuted, Caption } from "@/components/base/typography";
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

function buildFullMap(timeMap: Record<string, string>) {
	const full: Record<string, string> = {};
	for (const moment of ALL_MOMENTS) {
		full[moment] = resolveMomentTime(moment, timeMap);
	}
	return full;
}

export default function ReminderSettingsScreen() {
	const remindersQuery = useRemindersQuery();
	const { updateSettings } = useReminderMutations();
	const timeMap = (remindersQuery.data?.timeMap ?? {}) as Record<
		string,
		string
	>;

	const [draft, setDraft] = useState<Record<string, string>>({});
	const [editingMoment, setEditingMoment] = useState<string | null>(null);
	const [hydrated, setHydrated] = useState(false);

	useEffect(() => {
		if (hydrated || remindersQuery.isLoading) return;
		const map = (remindersQuery.data?.timeMap ?? {}) as Record<string, string>;
		setDraft(buildFullMap(map));
		setHydrated(true);
	}, [hydrated, remindersQuery.isLoading, remindersQuery.data]);

	async function handleSave() {
		await updateSettings.mutateAsync({ timeMap: draft });
		router.back();
	}

	return (
		<Container className="px-5 pt-6 pb-12">
			<Stack.Screen options={{ title: "Reminder times" }} />
			<VerticalStack className="gap-5">
				<Card>
					<CardHeader>
						<CardTitle>Default times</CardTitle>
					</CardHeader>
					<CardBody className="mt-1">
						<BodyMuted className="pb-2">
							These times apply to every medication, unless you set a custom
							time for one.
						</BodyMuted>
						{ALL_MOMENTS.map((moment, index) => (
							<Pressable
								key={moment}
								onPress={() => setEditingMoment(moment)}
								className={
									index > 0
										? "border-panel-border flex-row items-center justify-between border-t py-3.5"
										: "flex-row items-center justify-between py-3.5"
								}
							>
								<Body>{formatMomentLabel(moment)}</Body>
								<View className="flex-row items-center gap-1">
									<Caption className="text-primary">
										{draft[moment] ?? resolveMomentTime(moment, timeMap)}
									</Caption>
								</View>
							</Pressable>
						))}
					</CardBody>
				</Card>

				<Button onPress={handleSave} isDisabled={updateSettings.isPending}>
					<Button.Label>Save times</Button.Label>
				</Button>
			</VerticalStack>

			<TimePickerModal
				visible={editingMoment !== null}
				value={editingMoment ? (draft[editingMoment] ?? "09:00") : "09:00"}
				title={editingMoment ? formatMomentLabel(editingMoment) : "Set time"}
				onCancel={() => setEditingMoment(null)}
				onConfirm={(time) => {
					if (editingMoment) {
						setDraft((prev) => ({ ...prev, [editingMoment]: time }));
					}
					setEditingMoment(null);
				}}
			/>
		</Container>
	);
}
