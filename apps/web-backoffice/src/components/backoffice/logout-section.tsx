import { Avatar, Button } from "@heroui/react";

type LogoutSectionProps = {
	email?: string | null;
	isSignedIn: boolean;
	onLogout: () => Promise<void>;
};

export function LogoutSection({
	email,
	isSignedIn,
	onLogout,
}: LogoutSectionProps) {
	return (
		<div className="border-border/60 bg-card/50 mt-6 flex items-center justify-between rounded-2xl border p-3">
			<div className="flex items-center gap-3">
				<Avatar size="sm" name={email ?? "Backoffice"} />
				<div>
					<p className="text-sm font-medium">{email ?? "Signed out"}</p>
					<p className="text-muted-foreground text-xs">Admin</p>
				</div>
			</div>
			<Button
				variant="ghost"
				size="sm"
				isDisabled={!isSignedIn}
				onPress={onLogout}
			>
				Log out
			</Button>
		</div>
	);
}
