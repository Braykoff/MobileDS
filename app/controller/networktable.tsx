import { router } from "expo-router";
import { NativeEventEmitter, NativeModules, Pressable, Text, View } from "react-native";
import { DrawerNavigationProp } from "@react-navigation/drawer";
import { ControllerDrawerParamList } from "./_layout";
import { useEffect, useState } from "react";
import { getCurrentNTConnection, NTConnection } from "@/util/nt/NTComms";
import { ConnectedSymbol, NotConnectedSymbol } from "@/constants/Constants";
import { events, GlobalEventEmitter } from "@/util/GlobalEventEmitter";
import { ExceptionText } from "@/components/ExceptionText";

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

    GlobalEventEmitter.addListener(events.onNTConnectionStatusChanged, () => {
        console.log("emitted");
        var icon = (ntConnection.isConnected()) ? ConnectedSymbol : NotConnectedSymbol;
        navigation.setOptions({headerTitle: `${icon} ${ntConnection.address}`});
        navigation.setOptions({headerTitleStyle: { color: (ntConnection.isConnected()) ? "green" : "red" }});
    });

    return (
        <View>
            <Pressable onPress={ () => { router.replace("/") }}>
                <Text>Test</Text>
            </Pressable>
        </View>
    );
}