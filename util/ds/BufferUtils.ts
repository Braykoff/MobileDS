/** Unpacks a number into a buffer, starting at 'start' (little-endian) */
function packUint32(buffer: ArrayBuffer, value: number, start: number) {
  const dv = new DataView(buffer, start, 4);
  dv.setUint32(0, value, true);
}