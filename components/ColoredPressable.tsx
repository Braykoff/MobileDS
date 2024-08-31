import { useState } from "react";
import { Pressable, PressableProps, StyleProp, TextStyle, ViewStyle, Text } from "react-native";

interface ColoredPressableProps extends PressableProps {
  defaultColor: string,
  hoverColor: string,
  style?: StyleProp<ViewStyle>,
  notHoveredStyle?: StyleProp<ViewStyle>,
  hoveredStyle?: StyleProp<ViewStyle>
}

/** A Pressable component that will change colors when hovered over. */
export function ColoredPressable({ defaultColor, hoverColor, style, notHoveredStyle, hoveredStyle, ...rest }: ColoredPressableProps) {
  return (<Pressable 
    style={ (state) => {
      if (state.pressed) {
        // Currently hovered
        return [style, hoveredStyle, {backgroundColor: hoverColor}];
      } else {
        // Currently not hovered
        return [style, notHoveredStyle, {backgroundColor: defaultColor}];
      }
    } }
    {...rest}
  />);
}

interface ColoredPressableWithTextProps extends ColoredPressableProps {
  text: string,
  textStyle: StyleProp<TextStyle>,
  textHoveredStyle?: StyleProp<TextStyle>,
  textNotHoveredStyle?: StyleProp<TextStyle>
}

/** A Pressable component with text that will change colors when hovered over. */
export function ColoredPressableWithText({ defaultColor, hoverColor, style, notHoveredStyle, hoveredStyle, text, textStyle, textHoveredStyle, textNotHoveredStyle, ...rest }: ColoredPressableWithTextProps) {
  const [isHovered, setIsHovered] = useState(false);
  
  return (
    <Pressable 
      onHoverIn={ () => setIsHovered(true) }
      onPressIn={ () => setIsHovered(true) }
      onHoverOut={ () => setIsHovered(false) }
      onPressOut={ () => setIsHovered(false) }
      style={[
        {backgroundColor: isHovered ? hoverColor : defaultColor},
        isHovered ? hoveredStyle : notHoveredStyle,
        style
      ]}
      {...rest}
    >
      <Text
        style={[
          isHovered ? textHoveredStyle : textNotHoveredStyle,
          textStyle
        ]}
      >
        {text}
      </Text>
    </Pressable>
  );
}
