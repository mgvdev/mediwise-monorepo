import { Button, Dialog, Input, Label, TextField, useThemeColor } from "heroui-native";
import { Pressable, Text, View } from "react-native";

const BLOOD_GROUPS = [
    "O-",
    "O+",
    "A-",
    "A+",
    "B-",
    "B+",
    "AB-",
    "AB+",
] as const;

type BloodGroupInputProps = {
    label?: string;
    value?: string | null;
    helperText?: string;
    onChange: (nextValue: string) => void;
};

export function BloodGroupInput({
    label = "Blood group",
    value,
    helperText,
    onChange,
}: BloodGroupInputProps) {
    const muted = useThemeColor("muted");

    return (
        <Dialog>
            <Dialog.Trigger asChild>
                <Pressable>
                    <TextField>
                        <Label>{label}</Label>
                        <Input
                            value={value ?? "Select blood group"}
                            editable={false}
                            pointerEvents="none"
                        />
                    </TextField>
                    {helperText ? (
                        <Text className="mt-1 text-muted text-xs">
                            {helperText}
                        </Text>
                    ) : null}
                </Pressable>
            </Dialog.Trigger>
            <Dialog.Portal>
                <Dialog.Overlay />
                <Dialog.Content>
                    <View className="mb-4 gap-1">
                        <Dialog.Title>{label}</Dialog.Title>
                        <Dialog.Description>
                            Choose the option that matches your blood group.
                        </Dialog.Description>
                    </View>
                    <View className="flex-row flex-wrap gap-3">
                        {BLOOD_GROUPS.map((group) => {
                            const isSelected = group === value;
                            return (
                                <Button
                                    key={group}
                                    variant={
                                        isSelected ? "primary" : "secondary"
                                    }
                                    className="min-w-[84px]"
                                    onPress={() => onChange(group)}
                                >
                                    <Button.Label>{group}</Button.Label>
                                </Button>
                            );
                        })}
                    </View>
                    <View className="mt-5 flex-row justify-end">
                        <Dialog.Close asChild>
                            <Button variant="primary" size="sm">
                                <Button.Label>Done</Button.Label>
                            </Button>
                        </Dialog.Close>
                    </View>
                    <Text
                        className="mt-3 text-muted text-xs"
                        style={{ color: muted }}
                    >
                        Tip: You can update this later if you are unsure.
                    </Text>
                </Dialog.Content>
            </Dialog.Portal>
        </Dialog>
    );
}
