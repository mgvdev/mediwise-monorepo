import { Button } from "heroui-native";
import { useState } from "react";
import { Text, View } from "react-native";

import { RecapBuilderModal } from "./recap-builder-modal";
import type { RecapSection, RecapSelection } from "./recap-types";

type RecapBuilderButtonProps = {
	sections: RecapSection[];
	initialSelectedIds?: string[];
	onComplete?: (selection: RecapSelection) => void;
	buttonLabel?: string;
	className?: string;
};

export function RecapBuilderButton({
	sections,
	initialSelectedIds,
	onComplete,
	buttonLabel = "Build recap",
	className,
}: RecapBuilderButtonProps) {
	const [open, setOpen] = useState(false);
	const [selectedIds, setSelectedIds] = useState<string[]>(
		initialSelectedIds ?? sections.map((section) => section.id),
	);
	const [lastSelection, setLastSelection] = useState<RecapSelection | null>(
		null,
	);

	const handleComplete = (selection: RecapSelection) => {
		setLastSelection(selection);
		onComplete?.(selection);
	};

	return (
		<View className={className}>
			<Button onPress={() => setOpen(true)}>
				<Button.Label>{buttonLabel}</Button.Label>
			</Button>
			{lastSelection ? (
				<Text className="mt-3 text-muted text-xs">
					Shared {lastSelection.sectionIds.length} sections via{" "}
					{lastSelection.method}.
				</Text>
			) : null}
			<RecapBuilderModal
				open={open}
				onClose={() => setOpen(false)}
				sections={sections}
				selectedIds={selectedIds}
				onSelectedIdsChange={setSelectedIds}
				onComplete={handleComplete}
			/>
		</View>
	);
}
