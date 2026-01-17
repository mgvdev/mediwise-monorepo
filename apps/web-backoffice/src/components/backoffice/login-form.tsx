import { Button, Card, Chip, Input, InputOTP, Label } from "@heroui/react";
import { useNavigate } from "@tanstack/react-router";
import { useCallback, useEffect, useRef, useState } from "react";
import { toast } from "sonner";

import { authClient } from "@/lib/auth-client";

type Step = "request" | "verify";

const OTP_LENGTH = 6;
const OTP_SLOTS = Array.from(
	{ length: OTP_LENGTH },
	(_, index) => `otp-${index}`,
);
const RESEND_DELAY_SECONDS = 30;

export function BackofficeLoginForm() {
	const navigate = useNavigate({ from: "/login" });
	const { isPending } = authClient.useSession();
	const [step, setStep] = useState<Step>("request");
	const [email, setEmail] = useState("");
	const [otp, setOtp] = useState("");
	const [isSending, setIsSending] = useState(false);
	const [isVerifying, setIsVerifying] = useState(false);
	const [resendSeconds, setResendSeconds] = useState(0);
	const lastSubmittedOtp = useRef<string | null>(null);

	const otpComplete = otp.length === OTP_LENGTH;
	const canResend = resendSeconds === 0 && !isSending;

	useEffect(() => {
		if (resendSeconds <= 0) return;
		const timer = window.setTimeout(() => {
			setResendSeconds((previous) => Math.max(0, previous - 1));
		}, 1000);
		return () => window.clearTimeout(timer);
	}, [resendSeconds]);

	useEffect(() => {
		if (step === "request") {
			lastSubmittedOtp.current = null;
		}
	}, [step]);

	const sendOtp = useCallback(async () => {
		const trimmedEmail = email.trim();
		if (!trimmedEmail) {
			toast.error("Please enter your work email.");
			return;
		}

		setIsSending(true);
		const result = await authClient.emailOtp.sendVerificationOtp({
			email: trimmedEmail,
			type: "sign-in",
		});
		setIsSending(false);

		if (result?.error) {
			toast.error(result.error.message || "Unable to send your code.");
			return;
		}

		toast.success("Your sign-in code is on the way.");
		setStep("verify");
		setResendSeconds(RESEND_DELAY_SECONDS);
		setOtp("");
	}, [email]);

	const verifyOtp = useCallback(async () => {
		const trimmedEmail = email.trim();
		if (!otpComplete) {
			toast.error("Enter the 6-digit code.");
			return;
		}

		setIsVerifying(true);
		const result = await authClient.signIn.emailOtp({
			email: trimmedEmail,
			otp,
		});
		setIsVerifying(false);

		if (result?.error) {
			toast.error(result.error.message || "Invalid or expired code.");
			return;
		}

		toast.success("Signed in successfully.");
		navigate({ to: "/dashboard" });
	}, [email, navigate, otp, otpComplete]);

	useEffect(() => {
		if (step !== "verify") return;
		if (!otpComplete || isVerifying) return;
		if (lastSubmittedOtp.current === otp) return;
		lastSubmittedOtp.current = otp;
		void verifyOtp();
	}, [otp, otpComplete, isVerifying, step, verifyOtp]);

	const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
		event.preventDefault();
		if (step === "request") {
			void sendOtp();
			return;
		}
		if (step === "verify") {
			void verifyOtp();
		}
	};

	if (isPending) {
		return (
			<Card className="w-full max-w-md rounded-3xl border border-border/60 bg-card p-6 shadow-lg">
				<p className="text-muted-foreground text-sm">Checking session...</p>
			</Card>
		);
	}

	return (
		<Card className="w-full max-w-md rounded-3xl border border-border/60 bg-card p-6 shadow-lg">
			<Card.Header className="flex flex-col items-start gap-2">
				<p className="text-muted-foreground text-xs uppercase tracking-[0.3em]">
					Backoffice Access
				</p>
				<h2 className="font-semibold text-2xl">Sign in</h2>
				<p className="text-muted-foreground text-sm">
					Use your corporate email to receive a one-time login code.
				</p>
				<Chip size="sm" variant="soft" color="default">
					Step {step === "request" ? "1" : "2"} of 2
				</Chip>
			</Card.Header>

			<Card.Content className="mt-4">
				<form className="space-y-4" onSubmit={handleSubmit}>
					<div className="space-y-2">
						<Label htmlFor="login-email">Work email</Label>
						<Input
							id="login-email"
							type="email"
							fullWidth
							isOnSurface
							value={email}
							onChange={(event) => setEmail(event.target.value)}
							placeholder="name@company.com"
							isDisabled={step === "verify"}
						/>
					</div>

					{step === "verify" ? (
						<div className="space-y-3">
							<p className="text-muted-foreground text-xs">
								Code sent to <span className="font-medium">{email}</span>
							</p>
							<InputOTP
								value={otp}
								onChange={(value) => setOtp(value)}
								maxLength={OTP_LENGTH}
								isOnSurface
							>
								<InputOTP.Group className="gap-2">
									{OTP_SLOTS.map((slot, index) => (
										<InputOTP.Slot key={slot} index={index} />
									))}
								</InputOTP.Group>
							</InputOTP>
						</div>
					) : null}
				</form>
			</Card.Content>

			<Card.Footer className="mt-6 flex flex-col gap-3">
				{step === "request" ? (
					<Button fullWidth onPress={sendOtp} isDisabled={isSending}>
						{isSending ? "Sending..." : "Send code"}
					</Button>
				) : (
					<>
						<Button
							fullWidth
							onPress={verifyOtp}
							isDisabled={isVerifying || !otpComplete}
						>
							{isVerifying ? "Verifying..." : "Verify and sign in"}
						</Button>
						<Button
							fullWidth
							variant="secondary"
							onPress={sendOtp}
							isDisabled={!canResend}
						>
							{canResend ? "Resend code" : `Resend in ${resendSeconds}s`}
						</Button>
						<Button
							fullWidth
							variant="ghost"
							onPress={() => {
								setStep("request");
								setResendSeconds(0);
								setOtp("");
							}}
						>
							Use a different email
						</Button>
					</>
				)}
			</Card.Footer>
		</Card>
	);
}
