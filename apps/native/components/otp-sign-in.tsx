import { Button, ErrorView, Spinner, Surface, TextField } from "heroui-native";
import { Text, View } from "react-native";

import { useOtpSignIn } from "@/features/auth/use-otp-sign-in";

export function OtpSignIn() {
	const {
		step,
		email,
		otp,
		isSending,
		isVerifying,
		resendSeconds,
		error,
		otpComplete,
		canResend,
		setEmail,
		setOtp,
		handleSendCode,
		handleVerify,
		handleUseDifferentEmail,
	} = useOtpSignIn();

	return (
		<Surface variant="secondary" className="rounded-2xl p-5">
			<Text className="font-medium text-base text-foreground">Sign in</Text>
			<Text className="mb-4 text-muted text-xs">
				We will send a one-time code to your email.
			</Text>

			<ErrorView isInvalid={!!error} className="mb-3">
				{error}
			</ErrorView>

			<View className="gap-3">
				<TextField>
					<TextField.Label>Work email</TextField.Label>
					<TextField.Input
						value={email}
						onChangeText={setEmail}
						placeholder="email@example.com"
						keyboardType="email-address"
						autoCapitalize="none"
						editable={step === "request"}
					/>
				</TextField>

				<View className="rounded-2xl border border-border/60 bg-surface/50 px-3 py-2">
					<View className="flex-row justify-between">
						<Text className="text-[10px] text-muted">
							Step {step === "request" ? "1" : "2"} of 2
						</Text>
						<Text className="text-[10px] text-muted">
							{step === "request" ? "Request code" : "Verify code"}
						</Text>
					</View>
				</View>

				{step === "verify" && (
					<>
						<Text className="text-muted text-xs">
							Code sent to <Text className="text-foreground">{email}</Text>
						</Text>
						<TextField>
							<TextField.Label>One-time code</TextField.Label>
							<TextField.Input
								value={otp}
								onChangeText={setOtp}
								placeholder="123456"
								keyboardType="number-pad"
								maxLength={6}
								autoCapitalize="none"
								autoFocus
							/>
						</TextField>
					</>
				)}

				{step === "request" ? (
					<Button
						onPress={handleSendCode}
						isDisabled={isSending}
						className="mt-1"
					>
						{isSending ? (
							<Spinner size="sm" color="default" />
						) : (
							<Button.Label>Send code</Button.Label>
						)}
					</Button>
				) : (
					<View className="gap-2">
						<Button
							onPress={handleVerify}
							isDisabled={isVerifying || !otpComplete}
							className="mt-1"
						>
							{isVerifying ? (
								<Spinner size="sm" color="default" />
							) : (
								<Button.Label>Verify and sign in</Button.Label>
							)}
						</Button>
						<Button
							variant="secondary"
							onPress={handleSendCode}
							isDisabled={!canResend}
						>
							<Button.Label>
								{canResend ? "Resend code" : `Resend in ${resendSeconds}s`}
							</Button.Label>
						</Button>
						<Button variant="ghost" onPress={handleUseDifferentEmail}>
							<Button.Label>Use a different email</Button.Label>
						</Button>
					</View>
				)}
			</View>
		</Surface>
	);
}
