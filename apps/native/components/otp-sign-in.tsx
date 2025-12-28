import { Button, ErrorView, Spinner, Surface, TextField } from "heroui-native";
import { useEffect, useState } from "react";
import { Text, View } from "react-native";

import { authClient } from "@/lib/auth-client";
import { queryClient } from "@/utils/trpc";

type Step = "request" | "verify";

const RESEND_DELAY_SECONDS = 30;

export function OtpSignIn() {
	const [step, setStep] = useState<Step>("request");
	const [email, setEmail] = useState("");
	const [otp, setOtp] = useState("");
	const [isSending, setIsSending] = useState(false);
	const [isVerifying, setIsVerifying] = useState(false);
	const [resendSeconds, setResendSeconds] = useState(0);
	const [error, setError] = useState<string | null>(null);

	const otpComplete = otp.trim().length === 6;
	const canResend = resendSeconds === 0 && !isSending;

	useEffect(() => {
		if (resendSeconds <= 0) return;
		const timer = setTimeout(() => {
			setResendSeconds((previous) => Math.max(0, previous - 1));
		}, 1000);
		return () => clearTimeout(timer);
	}, [resendSeconds]);

	async function handleSendCode() {
		const trimmedEmail = email.trim();
		if (!trimmedEmail) {
			setError("Please enter your email.");
			return;
		}

		// Step 1: ask the server to send a one-time code to the user's email.
		setIsSending(true);
		setError(null);
		const result = await authClient.emailOtp.sendVerificationOtp({
			email: trimmedEmail,
			type: "sign-in",
		});
		setIsSending(false);

		if (result?.error) {
			setError(result.error.message || "Unable to send the code.");
			return;
		}

		setStep("verify");
		setResendSeconds(RESEND_DELAY_SECONDS);
		setOtp("");
	}

	async function handleVerify() {
		const trimmedEmail = email.trim();
		const trimmedOtp = otp.trim();
		if (!trimmedOtp || trimmedOtp.length !== 6) {
			setError("Enter the 6-digit code you received.");
			return;
		}

		// Step 2: verify the OTP; the Expo plugin persists the session securely.
		setIsVerifying(true);
		setError(null);
		const result = await authClient.signIn.emailOtp({
			email: trimmedEmail,
			otp: trimmedOtp,
		});
		setIsVerifying(false);

		if (result?.error) {
			setError(result.error.message || "Invalid or expired code.");
			return;
		}

		queryClient.refetchQueries();
	}

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
						<Button
							variant="ghost"
							onPress={() => {
								setStep("request");
								setResendSeconds(0);
								setOtp("");
							}}
						>
							<Button.Label>Use a different email</Button.Label>
						</Button>
					</View>
				)}
			</View>
		</Surface>
	);
}
