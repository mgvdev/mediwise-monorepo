import type { Meta, StoryObj } from "@storybook/react";

import {
	InsuredActions,
	InsuredBody,
	InsuredCard,
	InsuredCardFooter,
	InsuredHeader,
	InsuredInfo,
	InsuredQrCode,
	InsuredScore,
} from "./insured-card";

const meta = {
	title: "Components/InsuredCard",
	component: InsuredCard,
	parameters: {
		layout: "centered",
	},
} satisfies Meta<typeof InsuredCard>;

export default meta;

type Story = StoryObj<typeof InsuredCard>;

export const Default: Story = {
	render: () => (
		<div className="w-[560px] max-w-full">
			<InsuredCard>
				<InsuredHeader>
					<div className="space-y-2">
						<p className="text-xl font-semibold">Maya Hernandez</p>
						<p className="text-muted-foreground text-sm">
							Insured ID: MW-024-938
						</p>
					</div>
					<div className="flex items-center gap-4">
						<InsuredScore score="82" />
						<InsuredQrCode />
					</div>
				</InsuredHeader>

				<InsuredBody>
					<InsuredInfo label="Height" value={`5'6"`} />
					<InsuredInfo label="Weight" value="138 lb" />
					<InsuredInfo label="Blood type" value="O+" />
					<InsuredInfo label="Allergies" value="Penicillin" />
					<InsuredInfo label="Primary care" value="Dr. Parker" />
					<InsuredInfo label="Last visit" value="05/21/2024" />
				</InsuredBody>

				<InsuredCardFooter>
					<p className="text-muted-foreground text-xs">
						Last updated 2 days ago
					</p>
					<InsuredActions>
						<button
							type="button"
							className="border-border/60 rounded-full border px-3 py-1 text-sm"
						>
							Message
						</button>
						<button
							type="button"
							className="bg-primary text-primary-foreground rounded-full px-3 py-1 text-sm font-semibold"
						>
							Open profile
						</button>
					</InsuredActions>
				</InsuredCardFooter>
			</InsuredCard>
		</div>
	),
};
