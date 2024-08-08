import { DrawerNavigationProp } from "@react-navigation/drawer";
import { router } from "expo-router";
import { Pressable, Text, View } from "react-native";
import { ControllerDrawerParamList } from "./_layout";
import { RobotState } from "@/components/frc/StateManager";

type NetworkTableScreenNavigationProp = DrawerNavigationProp<ControllerDrawerParamList, "networktable">;
type Props = { navigation: NetworkTableScreenNavigationProp }

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