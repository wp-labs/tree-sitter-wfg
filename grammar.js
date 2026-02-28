/// <reference types="tree-sitter-cli/dsl" />

module.exports = grammar({
  name: "wfg",

  extras: ($) => [/\s/, $.comment],

  word: ($) => $.identifier,

  rules: {
    source_file: ($) =>
      seq(
        repeat($.use_declaration),
        optional($.scenario_attributes),
        $.scenario_declaration,
      ),

    comment: (_$) => token(seq("//", /.*/)),

    use_declaration: ($) => seq("use", field("path", $.string)),

    scenario_attributes: ($) => seq("#[", $.annotation_list, "]"),

    scenario_declaration: ($) =>
      seq(
        "scenario",
        field("name", $.identifier),
        optional(seq("<", field("params", $.annotation_list), ">")),
        "{",
        $.traffic_block,
        optional($.injection_block),
        optional($.expect_block),
        "}",
      ),

    annotation_list: ($) =>
      seq($.annotation_item, repeat(seq(",", $.annotation_item))),

    annotation_item: ($) =>
      seq(field("key", $.identifier), "=", field("value", $.value)),

    traffic_block: ($) => seq("traffic", "{", repeat($.stream_statement), "}"),

    stream_statement: ($) =>
      seq(
        "stream",
        field("stream", $.identifier),
        "gen",
        field("rate", $.rate_expression),
      ),

    rate_expression: ($) =>
      choice(
        $.rate_constant,
        $.wave_expression,
        $.burst_expression,
        $.timeline_expression,
      ),

    rate_constant: (_$) => token(/\d+(\.\d+)?\/s/),

    wave_expression: ($) =>
      seq(
        "wave",
        "(",
        "base",
        "=",
        field("base", $.rate_constant),
        ",",
        "amp",
        "=",
        field("amp", $.rate_constant),
        ",",
        "period",
        "=",
        field("period", $.duration),
        optional(seq(",", "shape", "=", field("shape", $.wave_shape))),
        ")",
      ),

    wave_shape: (_$) => choice("sine", "triangle", "square"),

    burst_expression: ($) =>
      seq(
        "burst",
        "(",
        "base",
        "=",
        field("base", $.rate_constant),
        ",",
        "peak",
        "=",
        field("peak", $.rate_constant),
        ",",
        "every",
        "=",
        field("every", $.duration),
        ",",
        "hold",
        "=",
        field("hold", $.duration),
        ")",
      ),

    timeline_expression: ($) =>
      seq("timeline", "{", repeat($.timeline_segment), "}"),

    timeline_segment: ($) =>
      seq(
        field("start", $.duration),
        "..",
        field("end", $.duration),
        "=",
        field("rate", $.rate_constant),
      ),

    injection_block: ($) => seq("injection", "{", repeat($.injection_case), "}"),

    injection_case: ($) =>
      seq(
        field("mode", $.mode_keyword),
        "<",
        field("percent", $.percent),
        ">",
        field("stream", $.identifier),
        "{",
        $.sequence_block,
        "}",
      ),

    mode_keyword: (_$) => choice("hit", "near_miss", "miss"),

    sequence_block: ($) =>
      seq(
        field("entity", $.identifier),
        "seq",
        "{",
        $.use_statement,
        repeat($.use_statement),
        "}",
      ),

    use_statement: ($) =>
      seq(
        "use",
        "(",
        field("predicates", $.predicate_list),
        ")",
        "with",
        "(",
        field("count", $.number),
        ",",
        field("window", $.duration),
        ")",
      ),

    predicate_list: ($) => seq($.predicate, repeat(seq(",", $.predicate))),

    predicate: ($) =>
      seq(field("key", $.identifier), "=", field("value", $.literal)),

    expect_block: ($) => seq("expect", "{", repeat($.expect_statement), "}"),

    expect_statement: ($) =>
      seq(
        field("metric", $.expect_function),
        "(",
        field("rule", $.identifier),
        ")",
        field("operator", $.comparison_operator),
        field("threshold", $.percent),
      ),

    expect_function: (_$) => choice("hit", "near_miss", "miss"),

    comparison_operator: (_$) => token(choice(">=", "<=", ">", "<", "==")),

    value: ($) => choice($.literal, $.duration),

    literal: ($) => choice($.string, $.number, $.boolean),

    percent: (_$) => token(/\d+(\.\d+)?%/),

    duration: (_$) => token(/\d+[smhd]/),

    number: (_$) => token(/\d+(\.\d+)?/),

    string: (_$) => token(seq("\"", repeat(choice(/[^"\\]/, /\\./)), "\"")),

    boolean: (_$) => choice("true", "false"),

    identifier: (_$) => /[a-zA-Z_][a-zA-Z0-9_]*/,
  },
});
