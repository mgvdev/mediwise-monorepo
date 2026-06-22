import { useFocusEffect } from "expo-router/react-navigation";
import { useQuery } from "@tanstack/react-query";
import { router } from "expo-router";
import { useCallback, useMemo, useState } from "react";

import { authClient } from "@/lib/auth-client";
import { trpc } from "@/utils/trpc";

export function usePrescriptionsList() {
	const { data: session } = authClient.useSession();
	const [searchQuery, setSearchQuery] = useState("");
	const [isRefreshing, setIsRefreshing] = useState(false);

	const prescriptions = useQuery({
		...trpc.prescriptions.listAll.queryOptions(),
		enabled: !!session?.user,
		refetchInterval: session?.user ? 5000 : false,
	});

	const filteredPrescriptions = useMemo(() => {
		if (!prescriptions.data) return [];
		const query = searchQuery.trim().toLowerCase();
		if (!query) return prescriptions.data;
		return prescriptions.data.filter((item) =>
			item.filename.toLowerCase().includes(query),
		);
	}, [prescriptions.data, searchQuery]);

	const handleRefresh = async () => {
		setIsRefreshing(true);
		try {
			await prescriptions.refetch();
		} finally {
			setIsRefreshing(false);
		}
	};

	const openPrescription = (id: string) => {
		router.push(`/prescriptions/${id}`);
	};

	useFocusEffect(
		useCallback(() => {
			if (!session?.user) return;
			prescriptions.refetch();
		}, [prescriptions, session?.user]),
	);

	return {
		session,
		searchQuery,
		setSearchQuery,
		isRefreshing,
		handleRefresh,
		openPrescription,
		prescriptions,
		filteredPrescriptions,
	};
}
