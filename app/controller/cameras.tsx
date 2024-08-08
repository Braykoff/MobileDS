import { DrawerNavigationProp } from "@react-navigation/drawer";
import { View, Text } from "react-native";
import { ControllerDrawerParamList } from "./_layout";

// Init navigation
type NetworkTableScreenNavigationProp = DrawerNavigationProp<ControllerDrawerParamList, "Cameras">;
type Props = { navigation: NetworkTableScreenNavigationProp }

/**
 * The screen for viewing camera streams.
 */
export default function CamerasScreen({ navigation } : Props) {
    return (
        <View>
            <Text>Bogus</Text>
        </View>
    );
}