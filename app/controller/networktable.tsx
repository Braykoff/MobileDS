import { router } from "expo-router";
import { Pressable, Text, View } from "react-native";
import { RobotState } from "@/components/frc/StateManager";
import { DrawerNavigationProp } from "@react-navigation/drawer";
import { ControllerDrawerParamList } from "./_layout";

// Init navigation
type NetworkTableScreenNavigationProp = DrawerNavigationProp<ControllerDrawerParamList, "NetworkTables">;
type Props = { navigation: NetworkTableScreenNavigationProp }

/**
 * The screen for all viewing the NetworkTables data.
 */
export default function NetworkTableScreen({ navigation } : Props) {
    return (
        <View>
            <Pressable onPress={ () => { router.replace("/") }}>
                <Text>Test</Text>
            </Pressable>
            <Pressable onPress = { () => { /*navigation.setOptions({headerTitle: "bogus!"})*/ RobotState.Connected = !RobotState.Connected; console.warn("Step 1"); }}>
                <Text>Test 2</Text>
            </Pressable>
        </View>
    );
}