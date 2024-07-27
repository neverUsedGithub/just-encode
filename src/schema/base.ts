import type { DecodeContext } from "../decode-context";
import type { EncodeContext } from "../encode-context";

export abstract class SchemaBase {
  public abstract infer: any;

  public abstract encode(value: any, context?: EncodeContext): Uint8Array;
  public abstract decode(buffer: Uint8Array | DecodeContext): this["infer"];
}
