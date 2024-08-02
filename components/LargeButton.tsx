import { TouchableHighlight } from "react-native";
import { Text ,View, StyleSheet } from "react-native";

export type LargeButtonProps = {
  onclick: () => void,
  color: string,
  label: string
}

export function LargeButton({onclick, label, color}: LargeButtonProps) {
  return (
    <TouchableHighlight onPress={onclick} underlayColor="gray" style={[stylesheet.buttonContainer, { backgroundColor: color }]}>
      <Text style={stylesheet.buttonText}>{label}</Text>
    </TouchableHighlight>
  );
}

const stylesheet = StyleSheet.create({
  buttonContainer: {
    flex: 1,
    margin: "1.5%",
    alignContent: "center",
    justifyContent: "center",
    borderRadius: 20
  },
  buttonText: {
    fontSize: 18,
    textAlign: "center"
  }
})