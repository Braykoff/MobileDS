import { CameraStream } from "@/components/CameraStream";
import { createDrawerOptions } from "@/constants/ControllerDrawerScreenOptions";
import { getCurrentNTConnection } from "@/util/nt/NTComms";
import { useNTConnected } from "@/util/nt/NTHooks";
import { useNavigation } from "expo-router";
import { useEffect } from "react";
import { Text, View, StyleSheet } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

/** The screen for viewing camera streams. */
export default function CamerasScreen() {
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
    <SafeAreaView style={styles.container}>
      <CameraStream 
        urls={["http://laptop-80.local:1181/?action=stream"]} 
        style={styles.stream}
      />
      <View style={styles.bottom}>
        <Text>a</Text>
      </View>
    </SafeAreaView>
  );
}

// Styles
const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  stream: {
    flex: 1,
  },
  bottom: {
    flex: 0.3,
  }
});
