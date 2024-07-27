import { DecodeContext } from "../decode-context";
import { EncodeContext } from "../encode-context";
import { SchemaBase } from "./base";
import { StringSchema } from "./string";

const stringSchema = new StringSchema();

export class MapSchema<T extends SchemaBase> implements SchemaBase {
  public infer: Record<string, T["infer"]> = null as any;

  constructor(private valueType: T) {}

  public encode(obj: this["infer"], ctx?: EncodeContext): Uint8Array {
    ctx ??= new EncodeContext();
    const keyCount = Object.keys(obj).length;

    ctx.view.setUint32(ctx.alloc(32), keyCount);

    for (const key in obj) {
      stringSchema.encode(key, ctx);
      this.valueType.encode(obj[key], ctx);
    }

    return ctx.getArray();
  }

  public decode(buffer: Uint8Array | DecodeContext): this["infer"] {
    const ctx = DecodeContext.from(buffer);

    const keyCount = ctx.view.getUint32(ctx.read(32));
    const out: Record<string, any> = {};

    for (let i = 0; i < keyCount; i++) {
      const key = stringSchema.decode(ctx);
      const value = this.valueType.decode(ctx);

      out[key] = value;
    }

    return out;
  }
}
