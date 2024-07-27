import { DecodeContext } from "../decode-context";
import { EncodeContext } from "../encode-context";
import { SchemaBase } from "./base";

export class StructSchema<T extends Record<string, SchemaBase>>
  implements SchemaBase
{
  public infer: { [K in keyof T]: T[K]["infer"] } = null as any;
  private keys: string[] = [];

  constructor(private types: T) {
    this.keys = Object.keys(types).sort();
  }

  public encode(obj: this["infer"], ctx?: EncodeContext): Uint8Array {
    ctx ??= new EncodeContext();

    for (const key of this.keys) {
      if (!(key in obj)) {
        throw new Error(`struct must contain field '${key}'`);
      }

      this.types[key].encode(obj[key], ctx);
    }

    return ctx.getArray();
  }

  public decode(buffer: Uint8Array | DecodeContext): this["infer"] {
    const ctx = DecodeContext.from(buffer);
    const out: Record<string, any> = {};

    for (const key of this.keys) {
      out[key] = this.types[key].decode(ctx);
    }

    return out as any;
  }
}
