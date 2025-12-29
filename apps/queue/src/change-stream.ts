type ChangeStream = {
	on: (event: "change" | "error", handler: (value?: unknown) => void) => void;
	close: () => Promise<void>;
};

type WatchableCollection = {
	watch: (
		pipeline?: unknown[],
		options?: { fullDocument?: "updateLookup" },
	) => ChangeStream;
};

type ChangeStreamOptions = {
	collection: WatchableCollection;
	onQueued: () => void;
	onFallback: () => void;
};

export function startJobChangeStream({
	collection,
	onQueued,
	onFallback,
}: ChangeStreamOptions) {
	try {
		const stream = collection.watch(
			[
				{
					$match: {
						operationType: { $in: ["insert", "update", "replace"] },
						"fullDocument.status": "queued",
					},
				},
			],
			{ fullDocument: "updateLookup" },
		);

		stream.on("change", () => {
			onQueued();
		});

		stream.on("error", (error) => {
			console.error(
				"[queue] Change stream error, falling back to polling.",
				error,
			);
			stream.close().catch(() => undefined);
			onFallback();
		});

		console.info("[queue] Change streams enabled.");
	} catch (error) {
		console.error(
			"[queue] Change streams unavailable, falling back to polling.",
			error,
		);
		onFallback();
	}
}
