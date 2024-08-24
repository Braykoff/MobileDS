import { createDrawerOptions } from "@/constants/ControllerDrawerScreenOptions";
import { getCurrentNTConnection } from "@/util/nt/NTComms";
import { useNTConnected } from "@/util/nt/NTHooks";
import { useNavigation } from "expo-router";
import { useEffect } from "react";
import { View, Text } from "react-native";

/** The screen for driving the robot. */
export default function DriverStationScreen() {
  const navigation = useNavigation();

  // Get NTConnection
  const ntConnection = getCurrentNTConnection();
  
  if (ntConnection == null) {
    // This should never run
    throw "NT connection is null";
  }

  // Listen for status change
  const isNTConnected = useNTConnected(ntConnection);

  useEffect(() => {
    navigation.setOptions(createDrawerOptions(ntConnection));
  }, [navigation, ntConnection, isNTConnected]);

  return (
    <View>
      <Text>DS</Text>
    </View>
  );
}
