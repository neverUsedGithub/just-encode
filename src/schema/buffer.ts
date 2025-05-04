import { DecodeContext } from "../decode-context";
import { EncodeContext } from "../encode-context";
import { SchemaBase } from "./base";

export class BufferSchema implements SchemaBase {
  public infer: Uint8Array = null as any;

  constructor(private length: number) {
    if (length < 0) throw new Error("length cannot be less than zero");
  }

  public encode(data: Uint8Array, ctx?: EncodeContext): Uint8Array {
    ctx ??= new EncodeContext();

    for (let i = 0; i < this.length; i++) {
      if (i < data.length) {
        ctx.view.setUint8(ctx.alloc(8), data[i]);
      } else {
        ctx.view.setUint8(ctx.alloc(8), 0);
      }
    }

    return ctx.getArray();
  }

  public decode(buffer: Uint8Array | DecodeContext): this["infer"] {
    const ctx = DecodeContext.from(buffer);
    const data: Uint8Array = new Uint8Array(this.length);

    for (let i = 0; i < this.length; i++) {
      data[i] = ctx.view.getUint8(ctx.read(8));
    }

    return data;
  }
}
