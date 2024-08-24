import { Pressable, PressableProps, StyleProp, ViewStyle } from "react-native";

interface ColoredPressableProps extends PressableProps {
  defaultColor: string,
  hoverColor: string,
  style?: StyleProp<ViewStyle>
}

/** A Pressable component that will change colors when hovered over. */
export const ColoredPressable: React.FC<ColoredPressableProps> = ({ defaultColor, hoverColor, style, ...rest }) => {
  return (<Pressable 
    style={ (state) => {
      if (state.pressed) {
        // Currently hovered
        return [{backgroundColor: hoverColor}, style];
      } else {
        // Currently not hovered
        return [{backgroundColor: defaultColor}, style];
      }
    } }
    {...rest}
  />);
}
