import { useEffect, useState } from "react";

import { authClient } from "@/lib/auth-client";
import { queryClient } from "@/utils/trpc";

type Step = "request" | "verify";

const RESEND_DELAY_SECONDS = 30;

export function useOtpSignIn() {
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

	function handleUseDifferentEmail() {
		setStep("request");
		setResendSeconds(0);
		setOtp("");
	}

	return {
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
	};
}
