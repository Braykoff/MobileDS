import { createDrawerOptions } from "@/constants/ControllerDrawerScreenOptions";
import { getCurrentDSConnection } from "@/util/ds/DSComms";
import { useDSConnected } from "@/util/ds/DSHooks";
import { getCurrentNTConnection } from "@/util/nt/NTComms";
import { useNTConnected } from "@/util/nt/NTHooks";
import { useNavigation } from "expo-router";
import { useEffect } from "react";
import { View, Text, StyleSheet } from "react-native";
import { RFPercentage } from "react-native-responsive-fontsize";

/** The screen for driving the robot. */
export default function DriverStationScreen() {
  const navigation = useNavigation();

  // Get connection
  const ntConnection = getCurrentNTConnection();
  const dsConnection = getCurrentDSConnection();
  
  if (ntConnection == null || dsConnection == null) {
    // This should never run
    throw `Connection is null (nt: ${ntConnection}, ds: ${dsConnection})`;
  }
  
  // Listen for status change
  const isNTConnected = useNTConnected(ntConnection);
  const isDSConnected = useDSConnected(dsConnection);

  useEffect(() => {
    navigation.setOptions(createDrawerOptions(ntConnection, dsConnection));
  }, [navigation, ntConnection, dsConnection, isNTConnected, isDSConnected]);

  if (dsConnection.state.estop && dsConnection.isConnected()) {
    // Robot is estopped, show warning message
    return (
      <View style={styles.estopContainer}>
        <Text style={styles.estopLabel}>
          Robot has been Emergency Stopped {"\n"}
          Please reboot it to continue.
        </Text>
      </View>
    );
  }

  return (
    <View>
      <Text>DS</Text>
    </View>
  );
}

// Styles
const styles = StyleSheet.create({
  /* Estop Message */
  estopContainer: {
    flex: 1,
    justifyContent: "center"
  },
  estopLabel: {
    fontFamily: "Montserrat-Bold",
    color: "red",
    textAlign: "center",
    fontSize: RFPercentage(3)
  }
});
