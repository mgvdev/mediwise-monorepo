import { Button, Input, Label, TextField } from "heroui-native";
import { Text, View } from "react-native";

type RecapEmailFormProps = {
	email: string;
	onEmailChange: (next: string) => void;
	onSend: () => void;
	disabled?: boolean;
};

export function RecapEmailForm({
	email,
	onEmailChange,
	onSend,
	disabled,
}: RecapEmailFormProps) {
	return (
		<View className="gap-4">
			<TextField>
				<Label>Send PDF to</Label>
				<Input
					value={email}
					onChangeText={onEmailChange}
					placeholder="doctor@example.com"
					keyboardType="email-address"
					autoCapitalize="none"
					autoCorrect={false}
				/>
			</TextField>
			<Button onPress={onSend} isDisabled={disabled}>
				<Button.Label>Send PDF</Button.Label>
			</Button>
			<Text className="text-muted text-xs">
				We will email a secure PDF recap to the selected contact.
			</Text>
		</View>
	);
}
