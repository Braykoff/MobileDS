import { DSConnection } from "@/util/ds/DSComms"
import { useState } from "react";
import { StyleSheet, View, Text, TextInput, Alert } from "react-native"
import { RFPercentage } from "react-native-responsive-fontsize";
import { scale } from "react-native-size-matters";

type JoystickIndexInputProps = {
  connection: DSConnection
}

/** Handles the joystick change logic */
function changeJoystick(connection: DSConnection, newValue: string, inputSetter: (val: string) => void) {
  const val = parseInt(newValue);

  if (isNaN(val) || val < 0 || val > 5) {
    // Invalid input
    Alert.alert(
      "Invalid input",
      "Joystick index must be an integer from 0 to 5."
    );
  } else {
    // Set new index
    connection.setEnabled(false);
    connection.state.joystickIndex = val;
    connection.socketTCP.sendJoystickPacket(); // Resend packet
    connection.socketUDP.reformatUDPPacketTags(); // Reformat UDP packet
  }

  inputSetter(connection.state.joystickIndex.toString());
  return;
}

/** The input to change the joystick index */
export function JoystickIndexInput({connection}: JoystickIndexInputProps) {
  const [currentValue, setCurrentValue] = useState(connection.state.joystickIndex.toString());

  return (
    <View style={styles.container}>
      <Text style={styles.label}>JOYSTICK</Text>
      <TextInput 
        editable
        autoComplete="off"
        autoCorrect={false}
        autoCapitalize="none"
        spellCheck={false}
        keyboardType="numeric"
        returnKeyType="done"
        style={styles.input}
        maxLength={1}
        defaultValue={currentValue}
        onFocus={ () => connection.setEnabled(false) }
        onChangeText={ (text: string) => setCurrentValue(text) }
        onSubmitEditing={ (event) => changeJoystick(connection, event.nativeEvent.text, setCurrentValue) }
      />
    </View>
  )
}

// Styles
const styles = StyleSheet.create({
  container: {
    height: scale(65),
    flex: 1,
    margin: 5,
    justifyContent: "center",
    flexDirection: "column",
    backgroundColor: "gray"
  },
  label: {
    fontFamily: "Montserrat",
    textAlign: "center",
    fontSize: RFPercentage(1.5),
    margin: 5
  },
  input: {
    fontFamily: "Montserrat-Bold",
    textAlign: "center",
    flex: 1,
    fontSize: RFPercentage(4)
  }
});
