import { DecodeContext } from "../decode-context";
import { EncodeContext } from "../encode-context";
import { SchemaBase } from "./base";

const RANGES = {
  "8": [-128, 127],
  "16": [-32768, 32767],
  "32": [-2147483648, 2147483647],
  "64": [-Infinity, Infinity],
} as const;

export class IntegerSchema<T extends "8" | "16" | "32" | "64">
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
      throw new Error(`${number} overflows i${this.size}`);

    if (this.size === "64")
      ctx.view.setBigInt64(ctx.alloc(64), number as bigint);
    else
      ctx.view[`setInt${this.size as "8" | "16" | "32"}`](
        ctx.alloc(this.bitCount),
        number as number
      );

    return ctx.getArray();
  }

  public decode(buffer: Uint8Array | DecodeContext): this["infer"] {
    const ctx = DecodeContext.from(buffer);

    if (this.size === "64") return ctx.view.getBigInt64(ctx.read(64)) as any;

    return ctx.view[`getInt${this.size as "8" | "16" | "32"}`](
      ctx.read(this.bitCount)
    ) as any;
  }
}
