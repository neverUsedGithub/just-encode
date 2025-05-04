import type { SchemaBase } from "./schema";
export type infer<T extends SchemaBase> = T["infer"];
export type Infer<T extends SchemaBase> = T["infer"];

export * from "./schema";
export { EncodeContext } from "./encode-context";
export { DecodeContext } from "./decode-context";
