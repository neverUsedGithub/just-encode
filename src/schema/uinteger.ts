import { DecodeContext } from "../decode-context";
import { EncodeContext } from "../encode-context";
import { SchemaBase } from "./base";

const RANGES = {
  "8": [0, 255],
  "16": [0, 65535],
  "32": [0, 4294967295],
  "64": [0, Infinity],
} as const;

export class UIntegerSchema<T extends "8" | "16" | "32" | "64">
  implements SchemaBase
{
  public infer: T extends "64" ? bigint : number = null as any;
  private bitCount: number;

  constructor(private size: T) {
    this.bitCount = Number(this.size);
  }

  public encode(
    number: T extends "64" ? bigint : number,
    ctx?: EncodeContext
  ): Uint8Array {
    ctx ??= new EncodeContext();

    const range = RANGES[this.size];

    if (number < range[0] || number > range[1])
      throw new Error(`${number} overflows u${this.size}`);

    if (this.size === "64")
      ctx.view.setBigUint64(ctx.alloc(64), number as bigint);
    else
      ctx.view[`setUint${this.size as "8" | "16" | "32"}`](
        ctx.alloc(Number(this.size)),
        number as number
      );

    return ctx.getArray();
  }

  public decode(buffer: Uint8Array | DecodeContext): this["infer"] {
    const ctx = DecodeContext.from(buffer);

    if (this.size === "64") return ctx.view.getBigUint64(ctx.read(64)) as any;

    return ctx.view[`getUint${this.size as "8" | "16" | "32"}`](
      ctx.read(this.bitCount)
    ) as any;
  }
}
