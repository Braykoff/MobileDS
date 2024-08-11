import { router } from "expo-router";
import { Pressable, Text, View } from "react-native";
import { DrawerNavigationProp } from "@react-navigation/drawer";
import { ControllerDrawerParamList } from "./_layout";
import { getCurrentNTConnection, NTConnection } from "@/util/nt/NTComms";
import { ExceptionText } from "@/components/ExceptionText";
import { createDrawerOptions } from "@/constants/ControllerDrawerScreenOptions";

// Init navigation
type NetworkTableScreenNavigationProp = DrawerNavigationProp<ControllerDrawerParamList, "NetworkTables">;
type Props = { navigation: NetworkTableScreenNavigationProp }

/**
 * The screen for all viewing the NetworkTables data.
 */
export default function NetworkTableScreen({ navigation } : Props) {
    // Get NTConnection
    const ntConnection = getCurrentNTConnection();

    if (ntConnection == null) {
        // This should never run
        return ExceptionText("There is no current NT connection");
    }

    ntConnection.events.addListener("connectionStatusChanged", () => {
        navigation.setOptions(createDrawerOptions(ntConnection));
    });

    return (
        <View>
            <Pressable onPress={ () => { router.replace("/") }}>
                <Text>Test</Text>
            </Pressable>
        </View>
    );
}