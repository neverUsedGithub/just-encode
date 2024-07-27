# Just Encode

Encode and decode pre-defined schemas to a binary format with full
type safety.

## Installation

```sh
npm i just-encode
```

## Usage

### Supported data types

The currently supported data types are:

- strings
- integers
- unsigned integers
- floats
- booleans
- arrays
- structs
- maps
- variants

> [!TIP]
> You can create your own data types by implementing the interface `BaseSchema`.

### Examples

#### Basic

```ts
import * as s from "just-encode";

const MessageSchema = s.struct({
  user: s.struct({
    name: s.string
  }),
  message: s.string,
  createdAt: s.i32,
});

const encoded = MessageSchema.encode({
  user: {
    name: "John Doe"
  },
  message: "Hello, World!",
  createdAt: Date.now(),
});
// -> Uint8Array(...) [ ... ]

const decoded = MessageSchema.decode(encoded);
// -> { ... }
```

#### Variants

```ts
import * as s from "just-encode";

const Option = s.variant({
  Some: ["T"],
  None
});

const NumberOption = Option.get({ T: s.i32 });

const Schema = s.struct({ number: NumberOption });

const encoded = Schema.encode({
  number: NumberOption.Some(10)
});
// -> Uint8Array(...) [...]

const decoded = Schema.decode(encoded);
// -> {
//      number: { id: "Some", values: [10] }
//    }
```