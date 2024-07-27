import * as s from "../src";

function buf2hex(buffer: ArrayBufferLike) {
  return [...new Uint8Array(buffer)]
    .map((x) => x.toString(16).padStart(2, "0"))
    .join(" ");
}

const Option = s.Enum({
  Some: ["T"],
  None: [],
} as const);

const Result = s.Enum({
  Ok: ["TOk"],
  Err: ["TErr"],
} as const);

const TestResult = Result.get({ TOk: s.i32, TErr: s.string });
const NumberOption = Option.get({ T: s.i32 });

const schema = s.struct({
  name: s.string,
  other: s.struct({
    inner: s.i32,
  }),
  array: s.array(s.f32),
  map: s.map(s.i32),
  enum: NumberOption,
  result: TestResult,
  boolean: s.bool,
});

const encoded = schema.encode({
  name: "Hello, World!",
  other: {
    inner: 23,
  },
  array: [10],
  map: {
    test: 5354,
    foo: 123,
  },
  enum: NumberOption.Some(75345),
  result: TestResult.Err("something went wrong"),
  boolean: true,
});
console.log("ENCODED:", encoded);
console.log("ENCODED:", buf2hex(encoded));

const decoded = schema.decode(encoded);
console.log("DECODED:", decoded);
