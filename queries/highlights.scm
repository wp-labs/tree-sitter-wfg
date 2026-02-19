; WFG Syntax Highlighting (tree-sitter native)

; ── Keywords ──
[
  "use"
  "scenario"
  "seed"
  "time"
  "duration"
  "total"
  "stream"
  "inject"
  "for"
  "on"
  "faults"
  "oracle"
] @keyword

; ── Mode keywords ──
(mode_keyword) @keyword

; ── Boolean ──
(boolean) @constant.builtin

; ── Operators / Delimiters ──
[ "=" ] @operator
[ "(" ")" "{" "}" "[" "]" ] @punctuation.bracket
[ "," ";" ":" ] @punctuation.delimiter

; ── Comments ──
(comment) @comment

; ── String literals ──
(string) @string

; ── Number literals ──
(number) @number

; ── Duration ──
(duration) @number

; ── Rate ──
(rate) @number

; ── Percent ──
(percent) @number

; ── Scenario name ──
(scenario_declaration name: (identifier) @function.definition)

; ── Stream alias and window ──
(stream_block
  alias: (identifier) @variable
  window: (identifier) @type)

; ── Inject rule target ──
(inject_block rule: (identifier) @function)

; ── Field override name ──
(field_override name: (field_name (identifier) @property))
(field_override name: (field_name (quoted_identifier) @property))

; ── Gen function name ──
(gen_func function: (identifier) @function.builtin)

; ── Named arg key ──
(named_arg key: (identifier) @property)

; ── Param assign key ──
(param_assign key: (identifier) @property)

; ── Fault name ──
(fault_line name: (identifier) @variable)

; ── Plain identifier (fallback, must be last) ──
(identifier) @variable
