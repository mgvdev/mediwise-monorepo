import { Button, Input, Label, Spinner, TextField } from "heroui-native";
import { useState } from "react";
import { View } from "react-native";

import { OptionsPicker } from "@/components/base/options-picker";
import { Caption } from "@/components/base/typography";
import { SPECIALTY_OPTIONS } from "@/features/practitioners/specialties";

export type PractitionerFormValues = {
	firstName: string | null;
	lastName: string;
	specialty: string;
	specialtyOther: string | null;
	phone: string | null;
	email: string | null;
	address: string | null;
	notes: string | null;
};

type PractitionerFormProps = {
	initial?: Partial<PractitionerFormValues>;
	onSubmit: (values: PractitionerFormValues) => void;
	isSaving?: boolean;
	submitLabel?: string;
	error?: string | null;
	onDelete?: () => void;
	isDeleting?: boolean;
};

export function PractitionerForm({
	initial,
	onSubmit,
	isSaving,
	submitLabel = "Save",
	error,
	onDelete,
	isDeleting,
}: PractitionerFormProps) {
	const [firstName, setFirstName] = useState(initial?.firstName ?? "");
	const [lastName, setLastName] = useState(initial?.lastName ?? "");
	const [specialty, setSpecialty] = useState(
		initial?.specialty ?? "general_practitioner",
	);
	const [specialtyOther, setSpecialtyOther] = useState(
		initial?.specialtyOther ?? "",
	);
	const [phone, setPhone] = useState(initial?.phone ?? "");
	const [email, setEmail] = useState(initial?.email ?? "");
	const [address, setAddress] = useState(initial?.address ?? "");
	const [notes, setNotes] = useState(initial?.notes ?? "");
	const [localError, setLocalError] = useState<string | null>(null);

	const handleSubmit = () => {
		if (!lastName.trim()) {
			setLocalError("Last name is required.");
			return;
		}
		if (specialty === "other" && !specialtyOther.trim()) {
			setLocalError("Describe the specialty.");
			return;
		}
		setLocalError(null);
		onSubmit({
			firstName: firstName.trim() || null,
			lastName: lastName.trim(),
			specialty,
			specialtyOther: specialty === "other" ? specialtyOther.trim() : null,
			phone: phone.trim() || null,
			email: email.trim() || null,
			address: address.trim() || null,
			notes: notes.trim() || null,
		});
	};

	return (
		<View className="gap-4">
			<TextField>
				<Label>Last name</Label>
				<Input value={lastName} onChangeText={setLastName} placeholder="Doe" />
			</TextField>

			<TextField>
				<Label>First name</Label>
				<Input
					value={firstName}
					onChangeText={setFirstName}
					placeholder="Jane"
				/>
			</TextField>

			<OptionsPicker
				label="Specialty"
				title="Select a specialty"
				options={SPECIALTY_OPTIONS}
				value={specialty}
				onChange={setSpecialty}
			/>

			{specialty === "other" ? (
				<TextField>
					<Label>Specialty name</Label>
					<Input
						value={specialtyOther}
						onChangeText={setSpecialtyOther}
						placeholder="Osteopath, speech therapist…"
					/>
				</TextField>
			) : null}

			<TextField>
				<Label>Phone</Label>
				<Input
					value={phone}
					onChangeText={setPhone}
					placeholder="+1 555 010 2030"
					keyboardType="phone-pad"
				/>
			</TextField>

			<TextField>
				<Label>Email</Label>
				<Input
					value={email}
					onChangeText={setEmail}
					placeholder="jane.doe@clinic.com"
					keyboardType="email-address"
					autoCapitalize="none"
				/>
			</TextField>

			<TextField>
				<Label>Address</Label>
				<Input
					value={address}
					onChangeText={setAddress}
					placeholder="12 Main Street, Springfield"
					multiline
				/>
			</TextField>

			<TextField>
				<Label>Notes</Label>
				<Input
					value={notes}
					onChangeText={setNotes}
					placeholder="Parking at the back, speaks Spanish…"
					multiline
				/>
			</TextField>

			{error || localError ? (
				<Caption className="text-danger">{error ?? localError}</Caption>
			) : null}

			<Button onPress={handleSubmit} isDisabled={isSaving} className="mt-2">
				{isSaving ? (
					<Spinner size="sm" color="default" />
				) : (
					<Button.Label>{submitLabel}</Button.Label>
				)}
			</Button>

			{onDelete ? (
				<Button
					variant="secondary"
					onPress={onDelete}
					isDisabled={isDeleting}
					className="border-danger/40 mt-1"
				>
					<Button.Label className="text-danger">
						{isDeleting ? "Deleting…" : "Delete practitioner"}
					</Button.Label>
				</Button>
			) : null}
		</View>
	);
}
