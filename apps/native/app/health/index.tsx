import { useQuery } from "@tanstack/react-query";
import { Ionicons } from "@expo/vector-icons";
import { router, Stack } from "expo-router";
import { useThemeColor } from "heroui-native";
import { Pressable } from "react-native";
import {
    Card,
    CardBody,
    CardRow,
    CardRowAction,
    CardRowContent,
    CardRowIcon,
} from "@/components/base/card";
import { BodyStrong, Caption } from "@/components/base/typography";
import { Container } from "@/components/layout/container";
import { VerticalStack } from "@/components/layout/stack";
import { applyOpacity, pressableFeedback } from "@/components/utils";
import { trpc } from "@/utils/trpc";
import { filterHealthCategoriesBySex, healthCategories } from "./health-schema";

const CATEGORY_ICONS: Record<string, keyof typeof Ionicons.glyphMap> = {
    personal_information: "person-outline",
    vital_signs: "pulse-outline",
    habits: "wine-outline",
    allergies: "leaf-outline",
    family_history: "people-outline",
    surgical_history: "cut-outline",
    cardiology: "heart-outline",
    pulmonology: "cloud-outline",
    neurology: "hardware-chip-outline",
    endocrinology: "flask-outline",
    psychiatry: "chatbubble-ellipses-outline",
    gynecology: "female-outline",
    obstetrics: "male-female-outline",
};

export default function HealthOverviewScreen() {
    const primary = useThemeColor("accent");
    const muted = useThemeColor("muted");
    const healthQuery = useQuery({
        ...trpc.healthData.get.queryOptions(),
    });
    const data = healthQuery.data?.data ?? {};
    const personalInfo =
        (data?.personal_information as
            | Record<string, string | null>
            | undefined) ?? {};
    const sexValue = personalInfo.biological_sex;
    const visibleCategories = filterHealthCategoriesBySex(
        healthCategories,
        sexValue,
    );

    return (
        <Container className="px-6 pt-6 pb-12">
            <Stack.Screen options={{ title: "Medical record" }} />
            <VerticalStack>
                {visibleCategories.map((category) => {
                    const icon =
                        CATEGORY_ICONS[category.key] ?? "medkit-outline";

                    return (
                        <Pressable
                            key={category.key}
                            onPress={() =>
                                router.push({
                                    pathname: "/health/[category]",
                                    params: { category: category.key },
                                })
                            }
                            className="rounded-2xl"
                            style={pressableFeedback(undefined, {
                                opacity: 0.8,
                            })}
                        >
                            <Card className="p-0">
                                <CardBody className="mt-0">
                                    <CardRow>
                                        <CardRowIcon
                                            style={{
                                                backgroundColor:
                                                    applyOpacity(
                                                        primary,
                                                        0.12,
                                                    ) ?? "transparent",
                                                borderColor:
                                                    applyOpacity(
                                                        primary,
                                                        0.35,
                                                    ) ?? primary,
                                                borderWidth: 1,
                                            }}
                                        >
                                            <Ionicons
                                                name={icon}
                                                size={18}
                                                color={primary}
                                            />
                                        </CardRowIcon>
                                        <CardRowContent>
                                            <BodyStrong>
                                                {category.label}
                                            </BodyStrong>
                                            <Caption>View and edit</Caption>
                                        </CardRowContent>
                                        <CardRowAction>
                                            <Ionicons
                                                name="chevron-forward"
                                                size={18}
                                                color={muted}
                                            />
                                        </CardRowAction>
                                    </CardRow>
                                </CardBody>
                            </Card>
                        </Pressable>
                    );
                })}
            </VerticalStack>
        </Container>
    );
}
