import { useNavigate } from "@tanstack/react-router";
import { useEffect, useRef, useState } from "react";
import { toast } from "sonner";

import { authClient } from "@/lib/auth-client";

import Loader from "./loader";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Label } from "./ui/label";

type Step = "request" | "verify";

const OTP_SLOTS = ["one", "two", "three", "four", "five", "six"] as const;
const OTP_LENGTH = OTP_SLOTS.length;
const RESEND_DELAY_SECONDS = 30;

export default function OtpSignInForm() {
	const navigate = useNavigate({ from: "/login" });
	const { isPending } = authClient.useSession();
	const [step, setStep] = useState<Step>("request");
	const [email, setEmail] = useState("");
	const [otpDigits, setOtpDigits] = useState<string[]>(
		Array.from({ length: OTP_LENGTH }, () => ""),
	);
	const [isSending, setIsSending] = useState(false);
	const [isVerifying, setIsVerifying] = useState(false);
	const [resendSeconds, setResendSeconds] = useState(0);
	const inputRefs = useRef<Array<HTMLInputElement | null>>([]);

	const otpValue = otpDigits.join("");
	const isOtpComplete = otpDigits.every((digit) => digit.length === 1);
	const canResend = resendSeconds === 0 && !isSending;

	useEffect(() => {
		if (resendSeconds <= 0) return;
		const timer = window.setTimeout(() => {
			setResendSeconds((previous) => Math.max(0, previous - 1));
		}, 1000);
		return () => window.clearTimeout(timer);
	}, [resendSeconds]);

	useEffect(() => {
		if (step !== "verify") return;
		inputRefs.current[0]?.focus();
	}, [step]);

	const startResendTimer = () => {
		setResendSeconds(RESEND_DELAY_SECONDS);
	};

	const resetOtp = () => {
		setOtpDigits(Array.from({ length: OTP_LENGTH }, () => ""));
	};

	const sendOtp = async () => {
		const trimmedEmail = email.trim();
		if (!trimmedEmail) {
			toast.error("Please enter your email address.");
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
		startResendTimer();
		resetOtp();
	};

	const verifyOtp = async () => {
		const trimmedEmail = email.trim();
		if (!isOtpComplete) {
			toast.error("Please enter the 6-digit code.");
			return;
		}

		setIsVerifying(true);
		const result = await authClient.signIn.emailOtp({
			email: trimmedEmail,
			otp: otpValue,
		});
		setIsVerifying(false);

		if (result?.error) {
			toast.error(result.error.message || "Invalid or expired code.");
			return;
		}

		toast.success("Signed in successfully.");
		navigate({ to: "/dashboard" });
	};

	const handleOtpChange = (index: number, value: string) => {
		const nextValue = value.replace(/\D/g, "");
		if (!nextValue) {
			const updated = [...otpDigits];
			updated[index] = "";
			setOtpDigits(updated);
			return;
		}

		const updated = [...otpDigits];
		updated[index] = nextValue[0];
		setOtpDigits(updated);

		if (index < OTP_LENGTH - 1) {
			inputRefs.current[index + 1]?.focus();
		}
	};

	const handleOtpKeyDown = (
		index: number,
		event: React.KeyboardEvent<HTMLInputElement>,
	) => {
		if (event.key === "Enter" && isOtpComplete) {
			event.preventDefault();
			verifyOtp();
			return;
		}
		if (event.key !== "Backspace") return;
		if (otpDigits[index]) return;
		if (index === 0) return;

		inputRefs.current[index - 1]?.focus();
	};

	const handleOtpPaste = (event: React.ClipboardEvent<HTMLInputElement>) => {
		const pasted = event.clipboardData.getData("text").replace(/\D/g, "");
		if (!pasted) return;
		event.preventDefault();

		const updated = Array.from(
			{ length: OTP_LENGTH },
			(_, index) => pasted[index] || "",
		);
		setOtpDigits(updated);
		const nextIndex = Math.min(pasted.length, OTP_LENGTH - 1);
		inputRefs.current[nextIndex]?.focus();
	};

	if (isPending) {
		return <Loader />;
	}

	return (
		<div className="relative min-h-svh overflow-hidden bg-background text-foreground">
			<div className="pointer-events-none absolute inset-0 opacity-80">
				<div className="absolute top-[-10%] -left-24 h-80 w-80 rounded-full bg-[radial-gradient(circle,rgba(56,189,248,0.28),transparent_70%)]" />
				<div className="absolute -right-16 bottom-[-20%] h-96 w-96 rounded-full bg-[radial-gradient(circle,rgba(99,102,241,0.26),transparent_65%)]" />
				<div className="absolute inset-0 bg-[linear-gradient(120deg,rgba(15,23,42,0.9),rgba(15,23,42,0.4),rgba(2,6,23,0.9))]" />
			</div>

			<div className="relative z-10 grid min-h-svh items-center gap-10 px-6 py-10 lg:grid-cols-[1.05fr_0.95fr] lg:px-16">
				<section className="space-y-8">
					<div className="space-y-3">
						<p className="text-muted-foreground text-xs uppercase tracking-[0.3em]">
							Mediwise Backoffice
						</p>
						<h1 className="text-balance font-semibold text-4xl leading-tight md:text-5xl">
							Secure access for insurer teams.
						</h1>
						<p className="max-w-xl text-base text-muted-foreground">
							Invite-only access keeps protected health data private. We use
							one-time codes instead of passwords, so nothing sensitive is
							stored.
						</p>
					</div>

					<div className="grid gap-4 md:grid-cols-2">
						<div className="rounded-2xl border border-white/10 bg-card/60 p-4 shadow-[0_20px_60px_-40px_rgba(59,130,246,0.6)]">
							<p className="text-muted-foreground text-xs uppercase tracking-wide">
								Zero passwords
							</p>
							<p className="mt-2 text-foreground text-sm">
								Codes expire quickly and are tied to registered members only.
							</p>
						</div>
						<div className="rounded-2xl border border-white/10 bg-card/60 p-4 shadow-[0_20px_60px_-40px_rgba(14,116,144,0.6)]">
							<p className="text-muted-foreground text-xs uppercase tracking-wide">
								Audit-ready
							</p>
							<p className="mt-2 text-foreground text-sm">
								Track member intake, prescriptions, and AI insights in one
								place.
							</p>
						</div>
					</div>
				</section>

				<section className="flex w-full justify-center lg:justify-end">
					<div className="w-full max-w-md rounded-3xl border border-white/10 bg-card/80 p-6 shadow-[0_30px_80px_-60px_rgba(15,23,42,0.8)] backdrop-blur">
						<div className="space-y-2">
							<h2 className="font-semibold text-xl">Sign in</h2>
							<p className="text-muted-foreground text-sm">
								Use the email registered by the insurer administrator.
							</p>
						</div>

						<div className="mt-6 space-y-4">
							<div className="space-y-2">
								<Label htmlFor="email">Work email</Label>
								<Input
									id="email"
									name="email"
									type="email"
									value={email}
									onChange={(event) => setEmail(event.target.value)}
									onKeyDown={(event) => {
										if (event.key === "Enter") {
											event.preventDefault();
											sendOtp();
										}
									}}
									autoComplete="email"
									autoFocus={step === "request"}
									disabled={step === "verify"}
									className="h-11 rounded-xl px-3 text-sm"
								/>
							</div>

							<div className="rounded-2xl border border-border/70 bg-background/60 p-4">
								<div className="flex items-center justify-between text-muted-foreground text-xs">
									<span>Step {step === "request" ? "1" : "2"} of 2</span>
									<span>
										{step === "request" ? "Request code" : "Verify code"}
									</span>
								</div>
								<div className="mt-3 flex items-center gap-2">
									<div
										className={`flex h-8 w-8 items-center justify-center rounded-full border font-semibold text-xs ${
											step === "request"
												? "border-primary bg-primary text-primary-foreground"
												: "border-border text-muted-foreground"
										}`}
									>
										1
									</div>
									<div className="h-px flex-1 bg-border/70" />
									<div
										className={`flex h-8 w-8 items-center justify-center rounded-full border font-semibold text-xs ${
											step === "verify"
												? "border-primary bg-primary text-primary-foreground"
												: "border-border text-muted-foreground"
										}`}
									>
										2
									</div>
								</div>
							</div>

							{step === "verify" ? (
								<div className="space-y-3">
									<p className="text-muted-foreground text-xs">
										Code sent to{" "}
										<span className="text-foreground">{email}</span>
									</p>
									<div className="flex gap-2" onPaste={handleOtpPaste}>
										{OTP_SLOTS.map((slot, index) => (
											<input
												key={`otp-${slot}`}
												ref={(element) => {
													inputRefs.current[index] = element;
												}}
												type="text"
												inputMode="numeric"
												maxLength={1}
												value={digit}
												onChange={(event) =>
													handleOtpChange(index, event.target.value)
												}
												onKeyDown={(event) => handleOtpKeyDown(index, event)}
												className="h-12 w-11 rounded-xl border border-border/70 bg-transparent text-center font-semibold text-base text-foreground tracking-wide shadow-[0_10px_30px_-20px_rgba(59,130,246,0.8)] focus-visible:border-primary focus-visible:outline-none"
											/>
										))}
									</div>
								</div>
							) : null}

							{step === "request" ? (
								<Button
									type="button"
									className="w-full"
									disabled={isSending}
									onClick={sendOtp}
								>
									{isSending ? "Sending..." : "Send code"}
								</Button>
							) : (
								<div className="space-y-2">
									<Button
										type="button"
										className="w-full"
										disabled={isVerifying || !isOtpComplete}
										onClick={verifyOtp}
									>
										{isVerifying ? "Verifying..." : "Verify and sign in"}
									</Button>
									<Button
										type="button"
										variant="ghost"
										className="w-full"
										disabled={!canResend}
										onClick={sendOtp}
									>
										{canResend ? "Resend code" : `Resend in ${resendSeconds}s`}
									</Button>
									<Button
										type="button"
										variant="link"
										className="w-full"
										onClick={() => {
											setStep("request");
											setResendSeconds(0);
											resetOtp();
										}}
									>
										Use a different email
									</Button>
								</div>
							)}
						</div>

						<p className="mt-6 text-center text-muted-foreground text-xs">
							Need help? Contact your insurer administrator.
						</p>
					</div>
				</section>
			</div>
		</div>
	);
}
