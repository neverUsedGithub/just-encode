import { DecodeContext } from "../decode-context";
import { EncodeContext } from "../encode-context";
import { SchemaBase } from "./base";

export class ArraySchema<T extends SchemaBase> implements SchemaBase {
  public infer: T["infer"][] = null as any;

  constructor(private itemType: T) {}

  public encode(items: this["infer"][], ctx?: EncodeContext): Uint8Array {
    ctx ??= new EncodeContext();

    ctx.view.setUint32(ctx.alloc(32), items.length);

    for (const item of items) {
      this.itemType.encode(item, ctx);
    }

    return ctx.getArray();
  }

  public decode(buffer: Uint8Array | DecodeContext): this["infer"] {
    const ctx = DecodeContext.from(buffer);

    const itemCount = ctx.view.getUint32(ctx.read(32));
    const items: this["infer"] = [];

    for (let i = 0; i < itemCount; i++) {
      items.push(this.itemType.decode(ctx));
    }

    return items;
  }
}
