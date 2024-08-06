import { useNavigation } from "expo-router";
import { Text } from "react-native";

export default function NetworkTableScreen() {
    const navigator = useNavigation();

    navigator.setOptions({ title: "bogus123" });

    return (
        <Text>Hello world</Text>
    );
}