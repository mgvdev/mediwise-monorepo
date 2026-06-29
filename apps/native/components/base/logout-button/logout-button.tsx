import { Button, Dialog } from "heroui-native";
import { useState } from "react";
import { View } from "react-native";

import { authClient } from "@/lib/auth-client";
import { queryClient } from "@/utils/trpc";

type LogoutButtonProps = {
	label?: string;
	onPress?: () => void;
};

export function LogoutButton({
	label = "Sign out",
	onPress,
}: LogoutButtonProps) {
	const [open, setOpen] = useState(false);

	const handlePress = async () => {
		if (onPress) {
			onPress();
			return;
		}
		await authClient.signOut();
		queryClient.invalidateQueries();
	};

	return (
		<Dialog isOpen={open} onOpenChange={setOpen}>
			<Dialog.Trigger asChild>
				<Button className="bg-danger">
					<Button.Label className="text-white">{label}</Button.Label>
				</Button>
			</Dialog.Trigger>
			<Dialog.Portal>
				<Dialog.Overlay />
				<Dialog.Content>
					<View className="mb-4 gap-2">
						<Dialog.Title>Sign out?</Dialog.Title>
						<Dialog.Description>
							You will need to sign in again to access your account.
						</Dialog.Description>
					</View>
					<View className="flex-row justify-end gap-3">
						<Dialog.Close asChild>
							<Button variant="secondary" size="sm">
								<Button.Label>Cancel</Button.Label>
							</Button>
						</Dialog.Close>
						<Button
							size="sm"
							className="bg-danger"
							onPress={async () => {
								await handlePress();
								setOpen(false);
							}}
						>
							<Button.Label className="text-white">Sign out</Button.Label>
						</Button>
					</View>
				</Dialog.Content>
			</Dialog.Portal>
		</Dialog>
	);
}
