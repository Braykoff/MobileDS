import { ExceptionText } from "@/components/ExceptionText";
import { createDrawerOptions } from "@/constants/ControllerDrawerScreenOptions";
import { OptionalCustomEmitterSubscription } from "@/util/CustomEventEmitter";
import { getCurrentNTConnection, NTConnectionEvents } from "@/util/nt/NTComms";
import { useNavigation } from "expo-router";
import { View, Text } from "react-native";

var ConnectionStatusListener: OptionalCustomEmitterSubscription = null;

/** The screen for viewing camera streams. */
export default function CamerasScreen() {
  const navigation = useNavigation();
  
  // Get NTConnection
  const ntConnection = getCurrentNTConnection();
  
  if (ntConnection == null) {
    // This should never run
    return ExceptionText("There is no current NT connection");
  }
  
  // Listen for status change
  if (ConnectionStatusListener != null) {
    ConnectionStatusListener.remove();
  }

  ConnectionStatusListener = ntConnection.events.addListener(NTConnectionEvents.ConnectionStatusChanged, () => {
    navigation.setOptions(createDrawerOptions(ntConnection));
  });
  
  return (
    <View>
    <Text>Bogus</Text>
    </View>
  );
}
