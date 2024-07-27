import { DecodeContext } from "../decode-context";
import { EncodeContext } from "../encode-context";
import { SchemaBase } from "./base";

export class StringSchema implements SchemaBase {
  public infer: string = null as any;

  public encode(message: string, ctx?: EncodeContext): Uint8Array {
    ctx ??= new EncodeContext();

    for (const char of message) {
      if (char === "\0") throw new Error("string to encode contains \\0");
      ctx.view.setUint16(ctx.alloc(16), char.charCodeAt(0));
    }

    ctx.view.setUint16(ctx.alloc(16), 0);

    return ctx.getArray();
  }

  public decode(buffer: Uint8Array | DecodeContext): this["infer"] {
    const ctx = DecodeContext.from(buffer);
    const codes: number[] = [];
    let char: number;

    while ((char = ctx.view.getUint16(ctx.read(16))) != 0) {
      codes.push(char);
    }

    return String.fromCharCode.apply(null, codes);
  }
}
