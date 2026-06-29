import { useQuery } from "@tanstack/react-query";
import { createFileRoute, redirect } from "@tanstack/react-router";
import { useState } from "react";
import { toast } from "sonner";

import { authClient } from "@/lib/auth-client";
import { queryClient, trpc, trpcClient } from "@/utils/trpc";

function readFileAsBase64(file: File) {
	return new Promise<string>((resolve, reject) => {
		const reader = new FileReader();
		reader.onload = () => {
			const result = typeof reader.result === "string" ? reader.result : "";
			const base64 = result.includes(",") ? result.split(",")[1] : result;
			if (!base64) {
				reject(new Error("Missing file data."));
				return;
			}
			resolve(base64);
		};
		reader.onerror = () =>
			reject(reader.error ?? new Error("File read failed."));
		reader.readAsDataURL(file);
	});
}

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

		setIsUploading(true);
		try {
			const base64 = await readFileAsBase64(file);
			await trpcClient.mutation("prescriptions.upload", {
				filename: file.name,
				contentType: file.type || "image/jpeg",
				base64,
				source: "upload",
			});
		} catch (error) {
			console.error(error);
			toast.error("Upload failed. Please try again.");
			return;
		} finally {
			setIsUploading(false);
		}

		setFile(null);
		toast.success("Prescription received. Processing started.");
		queryClient.invalidateQueries();
	};

	return (
		<div className="mx-auto flex w-full max-w-3xl flex-col gap-6">
			<div className="border-border/70 bg-card/70 rounded-3xl border p-6">
				<h1 className="text-xl font-semibold">Documents</h1>
				<p className="text-muted-foreground mt-1 text-sm">
					Upload a prescription photo to start the unified extraction.
				</p>

				<div className="mt-5 flex flex-col gap-3 md:flex-row md:items-center">
					<label className="border-border/70 bg-background/60 text-muted-foreground flex-1 rounded-2xl border border-dashed px-4 py-3 text-sm">
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
						className="bg-primary text-primary-foreground rounded-2xl px-5 py-3 text-sm font-semibold transition disabled:opacity-60"
						disabled={!file || isUploading}
						onClick={handleUpload}
					>
						{isUploading ? "Uploading..." : "Upload"}
					</button>
				</div>
				<p className="text-muted-foreground mt-3 text-xs">
					Accepted formats: JPG, PNG, HEIC. Processing runs in the background.
				</p>
			</div>

			<div className="border-border/70 bg-card/70 rounded-3xl border p-6">
				<div className="flex items-center justify-between">
					<h2 className="text-lg font-semibold">Recent uploads</h2>
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
								className="border-border/60 bg-background/60 flex flex-col gap-3 rounded-2xl border p-4 md:flex-row md:items-center md:justify-between"
							>
								<div>
									<p className="text-foreground text-sm font-medium">
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
										className={`rounded-full px-3 py-1 text-[11px] font-semibold tracking-wide uppercase ${statusStyles(item.status)}`}
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
