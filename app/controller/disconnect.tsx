import { createDrawerOptions } from "@/constants/ControllerDrawerScreenOptions";
import { getCurrentDSConnection } from "@/util/ds/DSComms";
import { useDSConnected } from "@/util/ds/DSHooks";
import { getCurrentNTConnection } from "@/util/nt/NTComms";
import { useNTConnected } from "@/util/nt/NTHooks";
import { useNavigation, useRouter } from "expo-router";
import { useEffect } from "react";
import { View, Text, StyleSheet } from "react-native";
import { RFPercentage } from "react-native-responsive-fontsize";

/** Screen that immediately disconnects all connections and redirect back to the index page */
export default function DisconnectScreen() {
  const navigation = useNavigation();
  const router = useRouter();
  
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
  
  // Disconnect
  useEffect(() => {
    ntConnection.disconnect();
    dsConnection.disconnect();
    console.log("Disconnected both connections");
    router.replace("/");
  });

  return (
    <View style={styles.container}>
      <Text style={styles.text}>Disconnecting...</Text>
    </View>
  );
}

// Styles
const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center"
  },
  text: {
    fontFamily: "Montserrat-Bold",
    color: "red",
    textAlign: "center",
    fontSize: RFPercentage(3)
  }
});
