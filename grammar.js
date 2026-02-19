/// <reference types="tree-sitter-cli/dsl" />

module.exports = grammar({
  name: "wfg",

  extras: ($) => [/\s/, $.comment],

  word: ($) => $.identifier,

  rules: {
    source_file: ($) =>
      seq(repeat($.use_declaration), $.scenario_declaration),

    // ── Comments ──
    comment: (_$) => token(seq("//", /.*/)),

    // ── Use declarations ──
    use_declaration: ($) => seq("use", $.string),

    // ── Scenario declaration ──
    scenario_declaration: ($) =>
      seq(
        "scenario",
        field("name", $.identifier),
        "seed",
        field("seed", $.number),
        "{",
        $.time_clause,
        $.total_clause,
        repeat($.stream_block),
        repeat($.inject_block),
        optional($.faults_block),
        optional($.oracle_block),
        "}",
      ),

    // ── Time clause ──
    time_clause: ($) =>
      seq("time", field("start", $.string), "duration", field("dur", $.duration)),

    // ── Total clause ──
    total_clause: ($) => seq("total", field("count", $.number)),

    // ── Stream block ──
    stream_block: ($) =>
      seq(
        "stream",
        field("alias", $.identifier),
        ":",
        field("window", $.identifier),
        field("rate", $.rate),
        optional(seq("{", repeat($.field_override), "}")),
      ),

    // ── Field override ──
    field_override: ($) =>
      seq(
        field("name", $.field_name),
        "=",
        field("value", $.gen_expr),
      ),

    field_name: ($) => choice($.quoted_identifier, $.identifier),

    quoted_identifier: (_$) => token(seq("`", /[^`]+/, "`")),

    // ── Gen expression ──
    gen_expr: ($) => choice($.gen_func, $.literal),

    gen_func: ($) =>
      seq(
        field("function", $.identifier),
        "(",
        optional(seq($._gen_arg, repeat(seq(",", $._gen_arg)))),
        ")",
      ),

    _gen_arg: ($) => choice($.named_arg, $.string, $.number),

    named_arg: ($) =>
      seq(
        field("key", $.identifier),
        ":",
        field("value", choice($.string, $.number)),
      ),

    literal: ($) => choice($.string, $.number, $.boolean),

    // ── Inject block ──
    inject_block: ($) =>
      seq(
        "inject",
        "for",
        field("rule", $.identifier),
        "on",
        $.stream_list,
        "{",
        repeat1($.inject_line),
        "}",
      ),

    stream_list: ($) =>
      seq("[", $.identifier, repeat(seq(",", $.identifier)), "]"),

    inject_line: ($) =>
      seq(
        field("mode", $.mode_keyword),
        field("percent", $.percent),
        repeat($.param_assign),
        ";",
      ),

    mode_keyword: (_$) => choice("hit", "near_miss", "non_hit"),

    // ── Param assignment (shared by inject and oracle) ──
    param_assign: ($) =>
      seq(
        field("key", $.identifier),
        "=",
        field("value", choice($.number, $.duration, $.string)),
      ),

    // ── Faults block ──
    faults_block: ($) =>
      seq("faults", "{", repeat($.fault_line), "}"),

    fault_line: ($) =>
      seq(
        field("name", $.identifier),
        field("percent", $.percent),
        ";",
      ),

    // ── Oracle block ──
    oracle_block: ($) =>
      seq("oracle", "{", repeat(seq($.param_assign, ";")), "}"),

    // ── Literals ──
    rate: (_$) => token(/\d+(\.\d+)?\/[smh]/),

    percent: (_$) => token(/\d+(\.\d+)?%/),

    duration: (_$) => token(/\d+[smhd]/),

    number: (_$) => token(/\d+(\.\d+)?/),

    string: (_$) =>
      token(seq('"', repeat(choice(/[^"\\]/, /\\./)), '"')),

    boolean: (_$) => choice("true", "false"),

    // ── Identifier ──
    identifier: (_$) => /[a-zA-Z_][a-zA-Z0-9_]*/,
  },
});
