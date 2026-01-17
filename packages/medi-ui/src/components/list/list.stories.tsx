import { Chip } from "@heroui/react";
import type { Meta, StoryObj } from "@storybook/react";

import {
	List,
	ListAction,
	ListActions,
	ListContent,
	ListDescription,
	ListItem,
	ListPicture,
	ListTitle,
} from "./list";

const meta = {
	title: "Components/List",
	component: List,
	parameters: {
		layout: "centered",
	},
} satisfies Meta<typeof List>;

export default meta;

type Story = StoryObj<typeof List>;

export const Default: Story = {
	render: () => (
		<div className="w-[520px] max-w-full">
			<List>
				<ListItem>
					<ListContent>
						<ListTitle>Prescription_June_2024.jpg</ListTitle>
						<ListDescription>06/10/2024, 09:42 AM</ListDescription>
					</ListContent>
					<ListActions>
						<ListAction>First med: Atorvastatin</ListAction>
						<span className="rounded-full bg-emerald-500/15 px-3 py-1 font-semibold text-[11px] text-emerald-200 uppercase tracking-wide">
							completed
						</span>
					</ListActions>
				</ListItem>
				<ListItem>
					<ListContent>
						<ListTitle>IMG_3291.png</ListTitle>
						<ListDescription>06/09/2024, 06:18 PM</ListDescription>
					</ListContent>
					<ListActions>
						<span className="rounded-full bg-blue-500/15 px-3 py-1 font-semibold text-[11px] text-blue-200 uppercase tracking-wide">
							processing
						</span>
					</ListActions>
				</ListItem>
				<ListItem>
					<ListContent>
						<ListTitle>RX_Scan_4472.heic</ListTitle>
						<ListDescription>06/08/2024, 02:03 PM</ListDescription>
					</ListContent>
					<ListActions>
						<span className="rounded-full bg-rose-500/15 px-3 py-1 font-semibold text-[11px] text-rose-200 uppercase tracking-wide">
							failed
						</span>
					</ListActions>
				</ListItem>
			</List>
		</div>
	),
};

export const WithPictures: Story = {
	render: () => (
		<div className="w-[520px] max-w-full">
			<List>
				<ListItem>
					<ListPicture>
						<div className="flex h-full w-full items-center justify-center text-muted-foreground text-xs">
							PDF
						</div>
					</ListPicture>
					<ListContent>
						<ListTitle>Claim_Statement.pdf</ListTitle>
						<ListDescription>06/05/2024, 11:21 AM</ListDescription>
					</ListContent>
					<ListActions>
						<ListAction>Awaiting review</ListAction>
					</ListActions>
				</ListItem>
				<ListItem>
					<ListPicture src="https://placehold.co/80x80/png" alt="Preview" />
					<ListContent>
						<ListTitle>Pharmacy_Label.png</ListTitle>
						<ListDescription>06/01/2024, 08:14 AM</ListDescription>
					</ListContent>
					<ListActions>
						<Chip variant="secondary">Test</Chip>
						<span className="rounded-full bg-amber-500/15 px-3 py-1 font-semibold text-[11px] text-amber-200 uppercase tracking-wide">
							pending
						</span>
					</ListActions>
				</ListItem>
			</List>
		</div>
	),
};
