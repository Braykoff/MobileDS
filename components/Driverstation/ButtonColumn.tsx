import { View, StyleSheet } from "react-native";
import { scale } from "react-native-size-matters";
import { ColoredPressableWithText } from "../ColoredPressable";
import { Colors } from "@/constants/Colors";

type ButtonColumnProps = {
  buttonLabels: string[],
  buttonSetters: ((value: boolean) => void)[]
}

type ButtonProps = {
  label: string,
  setter: (value: boolean) => void
}

/** A single button */
function Button({label, setter}: ButtonProps) {
  return (
    <ColoredPressableWithText 
      style={styles.button}
      defaultColor="gray"
      hoverColor={Colors.app.accentColor}
      text={label}
      textStyle={styles.buttonText}
      afterPressIn={() => setter(true) }
      afterPressOut={() => setter(false) }
    />
  );
}

/** A column of buttons for the driver. This will have 3 buttons, so each list should have 3 elements */
export function ButtonColumn({buttonLabels, buttonSetters}: ButtonColumnProps) {
  if (buttonLabels.length !== 3 || buttonSetters.length !== 3) {
    throw `ButtonColumn require 3 buttons (got ${buttonLabels.length} labels and ${buttonSetters.length} setters)`;
  }

  return (
    <View style={styles.container}>
      <Button label={buttonLabels[0]} setter={buttonSetters[0]} />
      <Button label={buttonLabels[1]} setter={buttonSetters[1]} />
      <Button label={buttonLabels[2]} setter={buttonSetters[2]} />
    </View>
  );
}

// Styles
const styles = StyleSheet.create({
  container: {
    width: scale(50),
    flexDirection: "column",
  },
  button: {
    flex: 1,
    justifyContent: "center",
    marginVertical: 5
  },
  buttonText: {
    fontFamily: "Montserrat-Bold",
    textAlign: "center"
  }
});
