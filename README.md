# tree-sitter-wfg

[Tree-sitter](https://tree-sitter.github.io/tree-sitter/) grammar for **WFG (WarpFusion Scenario)** — a domain-specific language for describing test scenarios, data stream generation, fault injection, and oracle specifications.

## Overview

WFG defines reproducible test scenarios for the WarpFusion project. A scenario specifies time bounds, data streams with configurable rates and field generators, fault injection rules with hit/miss modes, fault probability distributions, and oracle validators.

## Language Structure

A WFG file consists of optional `use` declarations followed by a single `scenario` block:

```wfg
use "module_path"

scenario my_scenario seed 42 {
    time "2024-01-01T00:00:00Z" duration 10h
    total 100000

    // stream definitions
    // inject blocks
    // faults block
    // oracle block
}
```

## Language Features

### Use Declarations

Import external modules:

```wfg
use "rules/detection.wfr"
use "generators/network.wfg"
```

### Scenario

The top-level block with a name and a seed for reproducibility:

```wfg
scenario brute_force_test seed 12345 {
    time "2024-01-01T00:00:00Z" duration 24h
    total 500000
    // ...
}
```

### Time and Total

```wfg
time "2024-06-01T08:00:00Z" duration 2h
total 50000
```

Duration units: `s` (seconds), `m` (minutes), `h` (hours), `d` (days).

### Stream Blocks

Define data streams with a window type and emission rate:

```wfg
stream login_events : TumblingWindow 100/s
stream dns_queries : SlidingWindow 50/s {
    src_ip = random()
    dst_ip = uniform(min: 1, max: 255)
    `user agent` = choice("curl", "wget", "firefox")
}
```

- **alias** — stream name
- **window** — window type (e.g. `TumblingWindow`, `SlidingWindow`)
- **rate** — emission frequency (`100/s`, `10/m`, `5/h`)
- **field overrides** — optional block to customize field values with generator functions or literals

Generator functions accept named arguments (`key: value`) or positional arguments.

### Inject Blocks

Configure fault injection for a specific rule across target streams:

```wfg
inject for brute_force on [login_events, auth_stream] {
    hit 60% delay=5s retries=3;
    near_miss 25% offset=2;
    non_hit 15%;
}
```

Three injection modes:
- **hit** — events that should trigger the rule
- **near_miss** — events that are close but should not trigger
- **non_hit** — normal events that should not trigger

Each line specifies a percentage and optional parameter assignments.

### Faults Block

Define system-level faults with probabilities:

```wfg
faults {
    network_drop 5%;
    clock_skew 2.5%;
    duplicate_event 1%;
}
```

### Oracle Block

Specify expected outcomes and validation parameters:

```wfg
oracle {
    alert_count = 42;
    max_latency = 500;
    expected_label = "brute_force";
    tolerance = "5s";
}
```

## Full Example

```wfg
use "rules/brute_force.wfr"

scenario brute_force_detection seed 42 {
    time "2024-01-01T00:00:00Z" duration 1h
    total 100000

    stream login_events : TumblingWindow 200/s {
        src_ip = random()
        username = choice("admin", "root", "user1")
        status = weighted(fail: 80, success: 20)
    }

    stream normal_traffic : SlidingWindow 50/s

    inject for brute_force on [login_events] {
        hit 60% delay=2s;
        near_miss 25%;
        non_hit 15%;
    }

    faults {
        network_drop 3%;
        clock_skew 1%;
    }

    oracle {
        alert_count = 15;
        max_latency = 200;
    }
}
```

## Usage

### Rust

Add to your `Cargo.toml`:

```toml
[dependencies]
tree-sitter = ">=0.22.6"
tree-sitter-wfg = "0.0.1"
```

```rust
let language = tree_sitter_wfg::language();
let mut parser = tree_sitter::Parser::new();
parser.set_language(&language).unwrap();

let source = r#"scenario test seed 1 {
    time "2024-01-01T00:00:00Z" duration 1h
    total 1000
}"#;
let tree = parser.parse(source, None).unwrap();
println!("{}", tree.root_node().to_sexp());
```

### Node.js

```javascript
const Parser = require("tree-sitter");
const WFG = require("tree-sitter-wfg");

const parser = new Parser();
parser.setLanguage(WFG);

const tree = parser.parse(`scenario test seed 1 {
    time "2024-01-01T00:00:00Z" duration 1h
    total 1000
}`);
console.log(tree.rootNode.toString());
```

### Python

```python
import tree_sitter_wfg

language = tree_sitter_wfg.language()
```

### Go

```go
import tree_sitter_wfg "github.com/tree-sitter/tree-sitter-wfg"

language := tree_sitter.NewLanguage(tree_sitter_wfg.Language())
```

### Swift

Add via Swift Package Manager:

```swift
.package(url: "https://github.com/wp-labs/wp-reactor", from: "0.1.0")
```

### WASM

A pre-compiled `tree-sitter-wfg.wasm` is included for browser-based usage.

## Development

### Prerequisites

- [Node.js](https://nodejs.org/) (for `tree-sitter-cli`)
- [Rust toolchain](https://rustup.rs/) (for building the Rust binding)

### Building

```bash
# Install dependencies
npm install

# Generate the parser from grammar.js
npx tree-sitter generate

# Run tests
npx tree-sitter test

# Build the Rust binding
cargo build

# Run Rust tests
cargo test

# Build C library
make
```

### Project Structure

```
tree-sitter-wfg/
├── grammar.js              # Grammar definition
├── queries/
│   └── highlights.scm      # Syntax highlighting queries
├── bindings/
│   ├── rust/                # Rust binding
│   ├── node/                # Node.js binding
│   ├── python/              # Python binding
│   ├── go/                  # Go binding
│   ├── c/                   # C header and pkg-config
│   └── swift/               # Swift binding
├── src/
│   ├── parser.c             # Generated parser
│   ├── grammar.json         # Generated grammar schema
│   └── node-types.json      # AST node type definitions
├── Cargo.toml               # Rust package manifest
├── package.json             # Node.js package manifest
├── pyproject.toml           # Python package manifest
├── Package.swift            # Swift package manifest
├── Makefile                 # C library build rules
└── tree-sitter.json         # Tree-sitter configuration
```

## Editor Support

### Zed

The `queries/highlights.scm` file provides syntax highlighting for the [Zed editor](https://zed.dev/). See the companion Zed extension for integration.

## License

Apache License 2.0 — see [LICENSE](LICENSE) for details.
