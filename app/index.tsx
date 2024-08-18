import { Text, View, StyleSheet, Alert, TextInput, Pressable } from "react-native";
import { openURL } from "expo-linking";
import { useEffect, useState } from "react";
import * as SystemUI from "expo-system-ui";
import { scale, verticalScale } from "react-native-size-matters";
import { Colors } from "@/constants/Colors";
import { GithubLink } from "@/constants/Constants";
import { isValidTeamNumber, teamNumberToIPAddress, isValidHost } from "@/util/IPHandler";
import { NTConnection, setCurrentNTConnection } from "@/util/nt/NTComms";
import { RFPercentage } from "react-native-responsive-fontsize";
import { getStoredData, setStoredData, StorageKeys } from "@/util/StorageManager";
import { Router, useRouter } from "expo-router";

/**
 * Called once "Connect" button is pressed.
 * @param input The "team number" input value.
 */
function beginConnection(input: string, router: Router) {
  // Save this input
  setStoredData(StorageKeys.lastAddress, input);

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

  // Connect to robot
  setCurrentNTConnection(new NTConnection(input));

  // Go to controller tabs
  router.replace("/controller");
}

/**
 * @returns The home (connection) page.
 */
export default function IndexScreen() {
  // Set background color (async)
  SystemUI.setBackgroundColorAsync(Colors.app.background);

  // Get expo router
  const router = useRouter();

  // Team number entry state
  const [teamNumberInput, setTeamNumberInput] = useState("");

  // Button hover states
  const [connectBttnHover, setConnectBttnHover] = useState(false);
  const [githubBttnHover, setGithubBttnHover] = useState(false);

  // Try to load previous input from storage
  useEffect(() => {
    const loadLastInput = async () => {
      const val = await getStoredData(StorageKeys.lastAddress, "");
      setTeamNumberInput(val);
    }

    loadLastInput();
  }, []);

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
          value={ teamNumberInput }
          onChangeText={ (text) => setTeamNumberInput(text) }
        />
        { /* Connect button */}
        <Pressable 
          style={[styles.buttonContainer, { backgroundColor: !connectBttnHover ? Colors.app.accentColor : Colors.app.accentColorDark }]}
          onPressIn={ () => setConnectBttnHover(true) }
          onPressOut={ () => setConnectBttnHover(false) }
          onPress={ () => beginConnection(teamNumberInput, router) }
        >
          <Text style={styles.button}>Connect</Text>
        </Pressable>
        { /* GitHub button */}
        <Pressable 
          style={[styles.buttonContainer, { backgroundColor: !githubBttnHover ? Colors.app.accentColor : Colors.app.accentColorDark }]}
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

// Styles
const styles = StyleSheet.create({
  // Full screen container
  outerContainer: {
    position: "absolute",
    left: 0,
    right: 0,
    top: 0,
    bottom: 0,
    justifyContent: "center",
    alignItems: "center"
  },
  // Vertical container
  verticalContainer: {
    width: scale(250),
    height: verticalScale(190),
    marginBottom: verticalScale(12),
    flexDirection: "column",
  },
  // Header
  header: {
    fontFamily: "Montserrat-Bold",
    color: Colors.app.lightTextColor,
    flex: 6,
    textAlign: "center",
    verticalAlign: "middle",
    fontSize: RFPercentage(6)
  },
  // IP Address input entry
  ipInput: {
    fontFamily: "Montserrat-Regular",
    backgroundColor: Colors.index.inputBackground,
    color: Colors.index.inputTextColor,
    margin: scale(6),
    borderWidth: 1.5,
    borderColor: Colors.app.accentColor,
    borderRadius: scale(5),
    paddingHorizontal: scale(2),
    fontSize: RFPercentage(1.75),
    flex: 3
  },
  // 'Connect' and 'Github' buttons
  buttonContainer: {
    flex: 4,
    margin: scale(3),
    justifyContent: "center",
    borderRadius: scale(5)
  },
  button: {
    fontFamily: "Montserrat-Regular",
    textAlign: "center",
    color: Colors.app.lightTextColor,
    fontSize: RFPercentage(2)
  }
});
