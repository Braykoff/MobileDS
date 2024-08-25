import { CameraStream } from "@/components/CameraStream";
import { ColoredPressable } from "@/components/ColoredPressable";
import { Colors } from "@/constants/Colors";
import { createDrawerOptions } from "@/constants/ControllerDrawerScreenOptions";
import { getCamera, getNumberOfCameras, getStreamsOfCamera, getTitleOfCamera } from "@/util/nt/CameraStreamGetter";
import { getCurrentNTConnection } from "@/util/nt/NTComms";
import { useNTConnected } from "@/util/nt/NTHooks";
import { useNavigation } from "expo-router";
import { useEffect, useState } from "react";
import { Text, View, StyleSheet } from "react-native";
import { RFPercentage } from "react-native-responsive-fontsize";
import { SafeAreaView } from "react-native-safe-area-context";

/** Formats the text that displays the camera index */
function cameraIndexText(index: number, numberOfCameras: number): string {
  if (numberOfCameras == 0) { return "0/0"; }
  return `${index+1}/${numberOfCameras}`;
}

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

  // Currently viewed camera
  const [currentStream, setCurrentStream] = useState(0);
  const camera = getCamera(currentStream, ntConnection);
  
  return (
    <SafeAreaView style={styles.container}>
      <CameraStream 
        urls={ getStreamsOfCamera(camera) } 
        style={styles.stream}
      />
      <View style={styles.bottom}>
        {/* Previous button */}
        <ColoredPressable 
          defaultColor={Colors.app.accentColor} 
          hoverColor={Colors.app.accentColorDark}
          style={styles.switchFeedButton}
          onPress = { () => {
            var prev = currentStream - 1;
            if (prev < 0) { prev = getNumberOfCameras(ntConnection) - 1; }
            setCurrentStream(prev);
          }}
        >
          <Text style={styles.switchFeedButtonText}>&nbsp;&lt;&nbsp;</Text>
        </ColoredPressable>
        {/* Title */}
        <Text style={styles.videoTitle} numberOfLines={1}>
          { getTitleOfCamera(camera) } ({ cameraIndexText(currentStream, getNumberOfCameras(ntConnection)) })
        </Text>
        {/* Next button */}
        <ColoredPressable 
          defaultColor={Colors.app.accentColor} 
          hoverColor={Colors.app.accentColorDark}
          style={styles.switchFeedButton}
          onPress={ () => {
            var next = currentStream + 1;
            if (next >= getNumberOfCameras(ntConnection)) { next = 0; }
            setCurrentStream(next);
          }}
        >
          <Text style={styles.switchFeedButtonText}>&nbsp;&gt;&nbsp;</Text>
        </ColoredPressable>
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
    flex: 1, // WebViews always have a flex of 1 for some reason
  },
  bottom: {
    flexDirection: "row",
  },
  switchFeedButton: {
    paddingVertical: 5,
    paddingHorizontal: 7,
    marginTop: 3
  },
  switchFeedButtonText: {
    fontFamily: "Montserrat-Regular",
    fontSize: RFPercentage(1.5),
    color: Colors.app.lightTextColor,
  },
  videoTitle: {
    fontFamily: "Montserrat-Bold",
    fontSize: RFPercentage(2),
    color: Colors.app.lightTextColor,
    flex: 1,
    textAlign: "center"
  }
});
