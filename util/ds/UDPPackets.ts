
/** Shared text encoder */
const textEncoder = new TextEncoder();

/** Tries to get the user's current timezone */
function getTimeZone(): string {
  var tz = (new Date()).toLocaleTimeString(undefined, {timeZoneName: "short"}).split(" ").pop();
  return (tz == undefined || tz.length > 5) ? "UCT" : tz;
}

/** Creates a new buffer containing the date and timezone, for the initial packet */
export function createSingleUDPTimestampPacket(): Uint8Array {
  const tz = textEncoder.encode(getTimeZone());
  const buffer = new Uint8Array(20 + tz.length);

  buffer[0] = 0; // Sequence number (1)
  buffer[1] = 1;
  buffer[2] = 0x02; // Comm version
  buffer[3] = 0x0; // Teleop disabled, no FMS, no E-stop
  buffer[4] = 0x0; // Not requesting reboot
  buffer[5] = 0x0; // Red 1 DS position

  buffer[6] = 10 + 2; // Tag 1 size
  buffer[7] = 0x0f; // Tag 1 id (Date)

  // Add each time unit for Tag 1 (leave microseconds as 0, because we don't have that accuracy)
  var now = Date.now();
  const denominations = [3.154e+10, 2.628e+9, 8.64e+7, 3.6e+6, 6e+4, 1e+3] // Years, months, days, hours, minutes, seconds

  for (let [x, multiplier] of denominations.entries()) {
    let period = Math.floor(now/multiplier);
    now -= period;
    buffer[17 - x] = period;
  }

  buffer[18] = tz.length + 2; // Tag 2 size
  buffer[19] = 0x10; // Tag 2 id (Timezone)

  buffer.set(tz, 20) // Tag 2 data

  return buffer;
}