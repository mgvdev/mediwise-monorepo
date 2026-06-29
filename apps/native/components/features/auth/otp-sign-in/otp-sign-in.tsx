import { Ionicons } from "@expo/vector-icons";
import { Button, FieldError, Spinner, useThemeColor } from "heroui-native";
import { useState } from "react";
import { Text, TextInput, View } from "react-native";

import { InputOtp } from "@/components/base/input-otp";
import { useOtpSignIn } from "@/features/auth/use-otp-sign-in";

export function OtpSignIn() {
	const [keepSignedIn, setKeepSignedIn] = useState(true);
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

	const placeholderColor = useThemeColor("muted");

	return (
		<View className="gap-4">
			<Text className="text-foreground text-xs font-semibold tracking-widest uppercase">
				Email Address
			</Text>

			<View className="border-border/60 flex-row items-center gap-2 rounded-2xl border px-4 py-3">
				<Ionicons name="mail-outline" size={18} className="text-muted" />
				<TextInput
					value={email}
					onChangeText={setEmail}
					placeholder="Enter your email address..."
					placeholderTextColor={placeholderColor}
					keyboardType="email-address"
					autoCapitalize="none"
					editable={step === "request"}
					className="text-foreground flex-1 text-sm"
				/>
			</View>

			{step === "verify" && (
				<View className="gap-2">
					<Text className="text-muted text-xs">
						Code sent to <Text className="text-foreground">{email}</Text>
					</Text>
					<Text className="text-foreground text-xs font-semibold tracking-widest uppercase">
						One-time code
					</Text>
					<View className="mt-2">
						<InputOtp
							value={otp}
							onChange={setOtp}
							autoFocus
							length={6}
							className="self-start"
						/>
					</View>
				</View>
			)}

			<View className="flex-row items-center justify-between">
				<View className="flex-row items-center gap-2">
					<Button
						variant="ghost"
						isIconOnly
						onPress={() => setKeepSignedIn((value) => !value)}
						size="sm"
					>
						<Ionicons
							name={keepSignedIn ? "checkmark-circle" : "ellipse-outline"}
							size={18}
							className={keepSignedIn ? "text-foreground" : "text-muted"}
						/>
					</Button>
					<Text className="text-muted text-xs">Keep me signed in</Text>
				</View>
				<Text className="text-primary text-xs font-medium">Need help?</Text>
			</View>

			<FieldError isInvalid={!!error}>{error}</FieldError>

			{step === "request" ? (
				<Button onPress={handleSendCode} isDisabled={isSending}>
					{isSending ? (
						<Spinner size="sm" color="default" />
					) : (
						<Button.Label>Sign In</Button.Label>
					)}
				</Button>
			) : (
				<View className="gap-2">
					<Button
						onPress={handleVerify}
						isDisabled={isVerifying || !otpComplete}
					>
						{isVerifying ? (
							<Spinner size="sm" color="default" />
						) : (
							<Button.Label>Verify and sign in</Button.Label>
						)}
					</Button>
					<Button
						variant="ghost"
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
	);
}
