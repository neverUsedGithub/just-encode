import { DecodeContext } from "../decode-context";
import { EncodeContext } from "../encode-context";
import { SchemaBase } from "./base";

export class BooleanSchema implements SchemaBase {
  public infer: boolean = null as any;

  public encode(value: boolean, ctx?: EncodeContext): Uint8Array {
    ctx ??= new EncodeContext();

    ctx.view.setUint8(ctx.alloc(8), value ? 1 : 0);

    return ctx.getArray();
  }

  public decode(buffer: Uint8Array | DecodeContext): this["infer"] {
    const ctx = DecodeContext.from(buffer);

    return ctx.view.getUint8(ctx.read(8)) === 1;
  }
}
