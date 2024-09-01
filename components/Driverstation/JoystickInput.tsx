import { View, StyleSheet } from "react-native"

type JoystickInputProps = {
  xSetter: (value: number) => void,
  ySetter: (value: number) => void
}

/** Thumb pad for the joystick input */
export function JoystickInput({xSetter, ySetter}: JoystickInputProps) {
  return (
    <View style={styles.container}>
      
    </View>
  )
}

// Styles
const styles = StyleSheet.create({
  container: {
    flex: 1,
    margin: 5
  }
});
