import { Platform, StyleProp, ViewStyle } from "react-native";
import WebView from "react-native-webview";

type CameraStreamProps = {
  urls: string[],
  style?: StyleProp<ViewStyle>
}

/** Camera stream component. */
export function CameraStream({urls, style} : CameraStreamProps) {
  // Set up source (platform dependent)
  const source = (Platform.OS === "android") ?
    { uri: "file:///android_asset/html/CameraStream.html" } :
    require("./../assets/html/CameraStream.html");

  return (
    <WebView 
      source={ source }
      style={style}
      bounces={false}
      scrollEnabled={false}
      textInteractionEnabled={false}
      setBuiltInZoomControls={false}
      injectedJavaScript={ formatInjectedJS(urls) }
      onError={ () => { console.log("Error!"); } }
      onMessage={() => {}}
    />
  );
}

/** Formats js that will add each of the camera streams to the WebView. */
function formatInjectedJS(urls: string[]): string {
  var formatted = "(function() {";

  for (let url of urls) {
    formatted += `addCameraSource('${btoa(url)}'); `;
  }

  return formatted + "})();";
}
