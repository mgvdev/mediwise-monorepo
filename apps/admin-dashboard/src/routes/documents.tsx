import { env } from "@mediwise-monorepo/env/web";
import { useQuery } from "@tanstack/react-query";
import { createFileRoute, redirect } from "@tanstack/react-router";
import { useState } from "react";
import { toast } from "sonner";
import { authClient } from "@/lib/auth-client";
import { queryClient, trpc } from "@/utils/trpc";

export const Route = createFileRoute("/documents")({
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

function statusStyles(status: string) {
	switch (status) {
		case "completed":
			return "bg-emerald-500/15 text-emerald-200";
		case "processing":
			return "bg-blue-500/15 text-blue-200";
		case "failed":
			return "bg-rose-500/15 text-rose-200";
		default:
			return "bg-amber-500/15 text-amber-200";
	}
}

function RouteComponent() {
	const [file, setFile] = useState<File | null>(null);
	const [isUploading, setIsUploading] = useState(false);

	const prescriptions = useQuery({
		...trpc.prescriptions.list.queryOptions(),
		refetchInterval: 5000,
	});

	const handleUpload = async () => {
		if (!file) {
			toast.error("Select an image to upload.");
			return;
		}

		const formData = new FormData();
		formData.append("file", file);
		formData.append("source", "upload");

		setIsUploading(true);
		const response = await fetch(
			`${env.VITE_SERVER_URL}/api/prescriptions/upload`,
			{
				method: "POST",
				body: formData,
				credentials: "include",
			},
		);
		setIsUploading(false);

		if (!response.ok) {
			toast.error("Upload failed. Please try again.");
			return;
		}

		setFile(null);
		toast.success("Prescription received. Processing started.");
		queryClient.invalidateQueries();
	};

	return (
		<div className="mx-auto flex w-full max-w-3xl flex-col gap-6">
			<div className="rounded-3xl border border-border/70 bg-card/70 p-6">
				<h1 className="font-semibold text-xl">Documents</h1>
				<p className="mt-1 text-muted-foreground text-sm">
					Upload a prescription photo to start the unified extraction.
				</p>

				<div className="mt-5 flex flex-col gap-3 md:flex-row md:items-center">
					<label className="flex-1 rounded-2xl border border-border/70 border-dashed bg-background/60 px-4 py-3 text-muted-foreground text-sm">
						<input
							type="file"
							accept="image/*"
							capture="environment"
							className="hidden"
							onChange={(event) => setFile(event.target.files?.[0] ?? null)}
						/>
						{file ? file.name : "Tap to select a prescription image"}
					</label>
					<button
						type="button"
						className="rounded-2xl bg-primary px-5 py-3 font-semibold text-primary-foreground text-sm transition disabled:opacity-60"
						disabled={!file || isUploading}
						onClick={handleUpload}
					>
						{isUploading ? "Uploading..." : "Upload"}
					</button>
				</div>
				<p className="mt-3 text-muted-foreground text-xs">
					Accepted formats: JPG, PNG, HEIC. Processing runs in the background.
				</p>
			</div>

			<div className="rounded-3xl border border-border/70 bg-card/70 p-6">
				<div className="flex items-center justify-between">
					<h2 className="font-semibold text-lg">Recent uploads</h2>
					<button
						type="button"
						className="text-muted-foreground text-xs"
						onClick={() => prescriptions.refetch()}
					>
						Refresh
					</button>
				</div>

				<div className="mt-4 space-y-3">
					{prescriptions.data?.length ? (
						prescriptions.data.map((item) => (
							<div
								key={item.rawId}
								className="flex flex-col gap-3 rounded-2xl border border-border/60 bg-background/60 p-4 md:flex-row md:items-center md:justify-between"
							>
								<div>
									<p className="font-medium text-foreground text-sm">
										{item.filename}
									</p>
									<p className="text-muted-foreground text-xs">
										{new Date(item.createdAt).toLocaleString()}
									</p>
								</div>
								<div className="flex items-center gap-3">
									{item.medicationSummary ? (
										<p className="text-muted-foreground text-xs">
											First med: {item.medicationSummary}
										</p>
									) : null}
									<span
										className={`rounded-full px-3 py-1 font-semibold text-[11px] uppercase tracking-wide ${statusStyles(item.status)}`}
									>
										{item.status}
									</span>
								</div>
							</div>
						))
					) : (
						<p className="text-muted-foreground text-sm">
							No prescriptions yet.
						</p>
					)}
				</div>
			</div>
		</div>
	);
}
