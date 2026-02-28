# tree-sitter-wfg

[Tree-sitter](https://tree-sitter.github.io/tree-sitter/) grammar for **WFG (WarpFusion Scenario DSL)**.

This grammar implements the **new WFG syntax** described in `docs/wfg-design.md`.

## Language overview

A WFG file contains:

1. zero or more `use` declarations
2. optional scenario attributes `#[...]`
3. a single `scenario` block

```wfg
use "../schemas/security.wfs"
use "../rules/brute_force.wfl"

#[duration=10m]
scenario brute_force_detect<seed=42> {
  traffic {
    stream auth_events gen 100/s
    stream auth_events gen wave(base=80/s, amp=40/s, period=2m, shape=sine)
    stream auth_events gen burst(base=20/s, peak=120/s, every=5m, hold=30s)
    stream auth_events gen timeline {
      0s..2m=20/s
      2m..6m=120/s
    }
  }

  injection {
    hit<30%> auth_events {
      user seq {
        use(login="failed") with(3,2m)
        use(action="port_scan") with(1,1m)
      }
    }

    near_miss<10%> auth_events {
      user seq {
        use(login="failed") with(2,2m)
      }
    }

    miss<60%> auth_events {
      user seq {
        use(login="success") with(1,30s)
      }
    }
  }

  expect {
    hit(brute_force_then_scan) >= 95%
    near_miss(brute_force_then_scan) <= 1%
    miss(brute_force_then_scan) <= 0.1%
  }
}
```

## Supported grammar elements

- `use "..."`
- `#[key=value, ...]`
- `scenario name<key=value, ...> { ... }`
- `traffic { stream <name> gen <rate_expr> }`
- rate expressions:
  - constant rate: `100/s`
  - `wave(base=..., amp=..., period=..., shape=...)`
  - `burst(base=..., peak=..., every=..., hold=...)`
  - `timeline { 0s..2m=20/s ... }`
- `injection { hit|near_miss|miss<xx%> <stream> { <entity> seq { ... } } }`
- `use(predicates...) with(count,duration)`
- `expect { hit|near_miss|miss(rule) <cmp> <percent> }`

## Usage

### Rust

```toml
[dependencies]
tree-sitter = ">=0.22.6"
tree-sitter-wfg = "0.0.1"
```

```rust
let language = tree_sitter_wfg::language();
let mut parser = tree_sitter::Parser::new();
parser.set_language(&language).unwrap();

let source = r#"scenario test {
  traffic {
    stream auth_events gen 100/s
  }
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

const tree = parser.parse(`scenario test {
  traffic {
    stream auth_events gen 100/s
  }
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

## Development

```bash
npm install
npx tree-sitter generate
npx tree-sitter test
cargo test
```
