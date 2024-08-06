import { Text, View, StyleSheet, Alert, TextInput, Pressable } from "react-native";
import { useFonts } from "expo-font";
import { openURL } from "expo-linking";
import * as SplashScreen from "expo-splash-screen";
import { useEffect, useState } from "react";
import * as SystemUI from "expo-system-ui";
import { scale, verticalScale } from "react-native-size-matters";
import { Colors } from "@/constants/Colors";
import { GithubLink } from "@/constants/Constants";
import { isValidTeamNumber, teamNumberToIPAddress, isValidHost } from "@/components/frc/IPHandler";
import { Router, useRouter } from "expo-router";

SplashScreen.preventAutoHideAsync(); // Keep showing splash screen (until fonts loaded)

/**
 * Called once "Connect" button is pressed.
 * @param input The "team number" input value.
 */
function beginConnection(input: string, router: Router) {
  if (isValidTeamNumber(input)) {
    // User entered a team number
    input = teamNumberToIPAddress(input);
  } else if (!isValidHost(input)) {
    // Not a valid host address
    Alert.alert(
      "Invalid RoboRio Address", 
      "Please enter a valid team number (0 - 25599), ip address (such as 10.71.53.2), or hostname (such as roboRIO-0000-frc.local)");
    return;
  }

  // Go to controller tabs
  router.push("/controller/networktable");
}

/**
 * @returns The home (connection) page.
 */
export default function IndexScreen() {
  // Load fonts
  const [loaded, error] = useFonts({
    "SpaceMono-Regular": require("../assets/fonts/SpaceMono-Regular.ttf"),
    "Montserrat-Regular": require("../assets/fonts/Montserrat-Regular.ttf"),
    "Montserrat-Bold": require("../assets/fonts/Montserrat-Bold.ttf")
  });

  // Set background color (async)
  SystemUI.setBackgroundColorAsync(Colors.glass.background);

  // Hide splash screen once fonts are loaded
  useEffect(() => {
    if (loaded || error) {
      SplashScreen.hideAsync();
    }
  }, [loaded, error]);

  // Expo router
  const router = useRouter();

  // Team number entry state
  const [teamNumberInput, setTeamNumberInput] = useState("");

  // Button hover states
  const [connectBttnHover, setConnectBttnHover] = useState(false);
  const [githubBttnHover, setGithubBttnHover] = useState(false);

  return (
    // Full screen container
    <View style={styles.outerContainer}>
      { /* Vertical container */ }
      <View style={styles.verticalContainer}>
        { /* Header text */}
        <Text style={styles.header}>MobileDS</Text>
        { /* RobRIO details entry */}
        <TextInput 
          editable 
          style={styles.ipInput} 
          placeholder="Team # or IP"
          autoComplete="off"
          autoCorrect={false}
          autoCapitalize="none"
          spellCheck={false}
          onChangeText={ (text) => setTeamNumberInput(text) }
        />
        { /* Connect button */}
        <Pressable 
          style={[styles.buttonContainer, { backgroundColor: !connectBttnHover ? Colors.glass.accentColor : Colors.glass.accentColorDark }]}
          onPressIn={ () => setConnectBttnHover(true) }
          onPressOut={ () => setConnectBttnHover(false) }
          onPress={ () => beginConnection(teamNumberInput, router) }
        >
          <Text style={styles.button}>Connect</Text>
        </Pressable>
        { /* GitHub button */}
        <Pressable 
          style={[styles.buttonContainer, { backgroundColor: !githubBttnHover ? Colors.glass.accentColor : Colors.glass.accentColorDark }]}
          onPressIn={ () => setGithubBttnHover(true) }
          onPressOut={ () => setGithubBttnHover(false) }
          onPress={ () => openURL(GithubLink) }
        >
          <Text style={styles.button}>Open GitHub</Text>
        </Pressable>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  /** Full screen container */
  outerContainer: {
    position: "absolute",
    left: 0,
    right: 0,
    top: 0,
    bottom: 0,
    justifyContent: "center",
    alignItems: "center"
  },
  /** Vertical Container */
  verticalContainer: {
    width: scale(250),
    height: verticalScale(190),
    marginBottom: verticalScale(12),
    flexDirection: "column",
  },
  /** Header */
  header: {
    fontFamily: "Montserrat-Bold",
    color: Colors.glass.textColor,
    flex: 6,
    textAlign: "center",
    verticalAlign: "middle",
    fontSize: scale(40)
  },
  /** IP Address input entry */
  ipInput: {
    fontFamily: "Montserrat-Regular",
    backgroundColor: Colors.glass.inputBackground,
    color: Colors.glass.inputTextColor,
    margin: scale(6),
    borderWidth: 1.5,
    borderColor: Colors.glass.accentColor,
    borderRadius: scale(5),
    paddingHorizontal: scale(2),
    fontSize: scale(13),
    flex: 3
  },
  /** 'Connect' and 'Github' buttons */
  buttonContainer: {
    flex: 4,
    margin: scale(3),
    justifyContent: "center",
    borderRadius: scale(5)
  },
  button: {
    fontFamily: "Montserrat-Regular",
    textAlign: "center",
    color: Colors.glass.textColor,
    fontSize: scale(15)
  }
});