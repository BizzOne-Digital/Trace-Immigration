/** Normalizes a Buffer field from a Mongoose document (Buffer) or lean query (BSON Binary). */
export function toBuffer(value: unknown): Buffer {
  if (Buffer.isBuffer(value)) return value;
  const bin = value as { _bsontype?: string; buffer?: Uint8Array; position?: number } | null;
  if (bin && bin._bsontype === "Binary" && bin.buffer) {
    return Buffer.from(bin.buffer.subarray(0, bin.position ?? bin.buffer.length));
  }
  if (value instanceof Uint8Array) return Buffer.from(value);
  throw new Error("Unsupported binary value");
}
