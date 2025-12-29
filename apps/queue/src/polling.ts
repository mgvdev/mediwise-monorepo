type PollingOptions = {
	intervalMs: number;
	onTick: () => void;
};

export function createPolling({ intervalMs, onTick }: PollingOptions) {
	let timer: ReturnType<typeof setInterval> | null = null;

	return () => {
		if (timer) return;
		timer = setInterval(() => {
			onTick();
		}, intervalMs);
	};
}
