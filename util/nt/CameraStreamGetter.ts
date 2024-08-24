import { NTConnection } from "./NTComms";
import { NTTable } from "./NTData";
import { NTArrayTopic } from "./NTTypes";

/** Used to represent cameras: either an NTTable, or null */
export type NTCamera = (NTTable | null);

/** Returns the number of cameras under the CameraPublisher table */
export function getNumberOfCameras(connection: NTConnection): number {
  const cams = connection.rootNetworkTable.subtables["CameraPublisher"];
  if (cams === undefined) { return 0; }

  return Object.keys(cams.subtables).length;
}

/** Gets a camera table from the CameraPublisher, or null if it doesn't exist */
export function getCamera(index: number, connection: NTConnection): NTCamera {
  const cams = connection.rootNetworkTable.subtables["CameraPublisher"];
  if (cams === undefined) { return null; }

  const keys = Object.keys(cams.subtables);
  if (index >= keys.length) { return null; }

  return cams.subtables[keys[index]];
}

/** Gets the name of the camera, or default if it doesn't exist */
export function getTitleOfCamera(camera: NTCamera, defaultText = "[No camera found]") {
  if (camera === null) { return defaultText; }
  return camera.name;
}

/** Gets the stream urls for a camera */
export function getStreamsOfCamera(camera: NTCamera): string[] {
  if (camera === null) { return []; }

  const streams = camera.topics["streams"];
  if (streams === null || !(streams instanceof NTArrayTopic)) { return []; }

  var formattedStreams: string[] = [];

  for (let s of streams.getValueAsStringArray()) {
    // Remove mjpg: and mjpeg: prefixes
    if (s.substring(0, 5) === "mjpg:") { s = s.substring(5); }
    else if (s.substring(0, 6) === "mjpeg:") { s = s.substring(6); }

    formattedStreams.push(s);
  }

  return formattedStreams;
}
