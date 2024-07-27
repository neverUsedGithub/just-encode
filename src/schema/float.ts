import { DecodeContext } from "../decode-context";
import { EncodeContext } from "../encode-context";
import { SchemaBase } from "./base";

export class FloatSchema<T extends "32" | "64"> implements SchemaBase {
  public infer: number = null as any;
  private bitCount: number;

  constructor(private size: T) {
    this.bitCount = Number(this.size);
  }

  public encode(
    number: T extends "64" ? bigint : number,
    ctx?: EncodeContext
  ): Uint8Array {
    ctx ??= new EncodeContext();

    ctx.view[`setFloat${this.size}`](
      ctx.alloc(this.bitCount),
      number as number
    );

    return ctx.getArray();
  }

  public decode(buffer: Uint8Array | DecodeContext): this["infer"] {
    const ctx = DecodeContext.from(buffer);

    return ctx.view[`getFloat${this.size}`](ctx.read(this.bitCount));
  }
}
