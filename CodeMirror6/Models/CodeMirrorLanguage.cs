using System.Reflection;
using System.Text.Json.Serialization;
using GaelJ.BlazorCodeMirror6.Converters;

namespace GaelJ.BlazorCodeMirror6.Models;

/// <summary>
/// Available languages for the CodeMirror editor
/// </summary>
[JsonConverter(typeof(CustomizableJsonStringEnumConverter<CodeMirrorLanguage>))]
public enum CodeMirrorLanguage
{
    /// <summary>
    /// Plain text
    /// </summary>
    [JsonStringValue("Plain Text")] PlainText,

    /// <summary>
    /// APL
    /// </summary>
    [JsonStringValue("APL")] Apl,

    /// <summary>
    /// ASN.1
    /// </summary>
    [JsonStringValue("ASN.1")] Asn1,

    /// <summary>
    /// Asterisk
    /// </summary>
    [JsonStringValue("Asterisk")] Asterisk,

    /// <summary>
    /// Brainfuck
    /// </summary>
    [JsonStringValue("Brainfuck")] Brainfuck,

    /// <summary>
    /// Cobol
    /// </summary>
    [JsonStringValue("Cobol")] Cobol,

    /// <summary>
    /// Clojure
    /// </summary>
    [JsonStringValue("Clojure")] Clojure,

    /// <summary>
    /// ClojureScript
    /// </summary>
    [JsonStringValue("ClojureScript")] ClojureScript,

    /// <summary>
    /// Closure Stylesheets (GSS)
    /// </summary>
    [JsonStringValue("Closure Stylesheets (GSS)")] ClosureStylesheetsGss,

    /// <summary>
    /// CMake
    /// </summary>
    [JsonStringValue("CMake")] CMake,

    /// <summary>
    /// CoffeeScript
    /// </summary>
    [JsonStringValue("CoffeeScript")] CoffeeScript,

    /// <summary>
    /// Common Lisp
    /// </summary>
    [JsonStringValue("Common Lisp")] CommonLisp,

    /// <summary>
    /// Crystal
    /// </summary>
    [JsonStringValue("Crystal")] Crystal,

    /// <summary>
    /// Cypher
    /// </summary>
    [JsonStringValue("Cypher")] Cypher,

    /// <summary>
    /// Cython
    /// </summary>
    [JsonStringValue("Cython")] Cython,

    /// <summary>
    /// D
    /// </summary>
    [JsonStringValue("D")] D,

    /// <summary>
    /// Dart
    /// </summary>
    [JsonStringValue("Dart")] Dart,

    /// <summary>
    /// diff
    /// </summary>
    [JsonStringValue("diff")] Diff,

    /// <summary>
    /// Dockerfile
    /// </summary>
    [JsonStringValue("Dockerfile")] Dockerfile,

    /// <summary>
    /// DTD
    /// </summary>
    [JsonStringValue("DTD")] DTD,

    /// <summary>
    /// Dylan
    /// </summary>
    [JsonStringValue("Dylan")] Dylan,

    /// <summary>
    /// EBNF
    /// </summary>
    [JsonStringValue("EBNF")] Ebnf,

    /// <summary>
    /// ECL
    /// </summary>
    [JsonStringValue("ECL")] Ecl,

    /// <summary>
    /// edn
    /// </summary>
    [JsonStringValue("edn")] Edn,

    /// <summary>
    /// Eiffel
    /// </summary>
    [JsonStringValue("Eiffel")] Eiffel,

    /// <summary>
    /// Elm
    /// </summary>
    [JsonStringValue("Elm")] Elm,

    /// <summary>
    /// Erlang
    /// </summary>
    [JsonStringValue("Erlang")] Erlang,

    /// <summary>
    /// Esper
    /// </summary>
    [JsonStringValue("Esper")] Esper,

    /// <summary>
    /// Factor
    /// </summary>
    [JsonStringValue("Factor")] Factor,

    /// <summary>
    /// FCL
    /// </summary>
    [JsonStringValue("FCL")] Fcl,

    /// <summary>
    /// Forth
    /// </summary>
    [JsonStringValue("Forth")] Forth,

    /// <summary>
    /// Fortran
    /// </summary>
    [JsonStringValue("Fortran")] Fortran,

    /// <summary>
    /// F#
    /// </summary>
    [JsonStringValue("F#")] Fsharp,

    /// <summary>
    /// Gas
    /// </summary>
    [JsonStringValue("Gas")] Gas,

    /// <summary>
    /// Gherkin
    /// </summary>
    [JsonStringValue("Gherkin")] Gherkin,

    /// <summary>
    /// Go
    /// </summary>
    [JsonStringValue("Go")] Go,

    /// <summary>
    /// Groovy
    /// </summary>
    [JsonStringValue("Groovy")] Groovy,

    /// <summary>
    /// Haskell
    /// </summary>
    [JsonStringValue("Haskell")] Haskell,

    /// <summary>
    /// Haxe
    /// </summary>
    [JsonStringValue("Haxe")] Haxe,

    /// <summary>
    /// HXML
    /// </summary>
    [JsonStringValue("HXML")] Hxml,

    /// <summary>
    /// HTTP
    /// </summary>
    [JsonStringValue("HTTP")] Http,

    /// <summary>
    /// IDL
    /// </summary>
    [JsonStringValue("IDL")] Idl,

    /// <summary>
    /// JSON-LD
    /// </summary>
    [JsonStringValue("JSON-LD")] JsonLd,

    /// <summary>
    /// Jinja2
    /// </summary>
    [JsonStringValue("Jinja2")] Jinja2,

    /// <summary>
    /// Julia
    /// </summary>
    [JsonStringValue("Julia")] Julia,

    /// <summary>
    /// Kotlin
    /// </summary>
    [JsonStringValue("Kotlin")] Kotlin,

    /// <summary>
    /// LiveScript
    /// </summary>
    [JsonStringValue("LiveScript")] LiveScript,

    /// <summary>
    /// Lua
    /// </summary>
    [JsonStringValue("Lua")] Lua,

    /// <summary>
    /// mIRC
    /// </summary>
    [JsonStringValue("mIRC")] MIrc,

    /// <summary>
    /// Mathematica
    /// </summary>
    [JsonStringValue("Mathematica")] Mathematica,

    /// <summary>
    /// Modelica
    /// </summary>
    [JsonStringValue("Modelica")] Modelica,

    /// <summary>
    /// MUMPS
    /// </summary>
    [JsonStringValue("MUMPS")] MUMPS,

    /// <summary>
    /// Mbox
    /// </summary>
    [JsonStringValue("Mbox")] Mbox,

    /// <summary>
    /// Nginx
    /// </summary>
    [JsonStringValue("Nginx")] Nginx,

    /// <summary>
    /// NSIS
    /// </summary>
    [JsonStringValue("NSIS")] NSIS,

    /// <summary>
    /// NTriples
    /// </summary>
    [JsonStringValue("NTriples")] NTriples,

    /// <summary>
    /// Objective-C
    /// </summary>
    [JsonStringValue("Objective-C")] ObjectiveC,

    /// <summary>
    /// Objective-C++
    /// </summary>
    [JsonStringValue("Objective-C++")] ObjectiveCpp,

    /// <summary>
    /// OCaml
    /// </summary>
    [JsonStringValue("OCaml")] OCaml,

    /// <summary>
    /// Octave
    /// </summary>
    [JsonStringValue("Octave")] Octave,

    /// <summary>
    /// Oz
    /// </summary>
    [JsonStringValue("Oz")] Oz,

    /// <summary>
    /// Pascal
    /// </summary>
    [JsonStringValue("Pascal")] Pascal,

    /// <summary>
    /// Perl
    /// </summary>
    [JsonStringValue("Perl")] Perl,

    /// <summary>
    /// Pig
    /// </summary>
    [JsonStringValue("Pig")] Pig,

    /// <summary>
    /// PowerShell
    /// </summary>
    [JsonStringValue("PowerShell")] PowerShell,

    /// <summary>
    /// Properties files
    /// </summary>
    [JsonStringValue("Properties files")] PropertiesFiles,

    /// <summary>
    /// ProtoBuf
    /// </summary>
    [JsonStringValue("ProtoBuf")] ProtoBuf,

    /// <summary>
    /// Puppet
    /// </summary>
    [JsonStringValue("Puppet")] Puppet,

    /// <summary>
    /// Q
    /// </summary>
    [JsonStringValue("Q")] Q,

    /// <summary>
    /// R
    /// </summary>
    [JsonStringValue("R")] R,

    /// <summary>
    /// RPM Changes
    /// </summary>
    [JsonStringValue("RPM Changes")] RpmChanges,

    /// <summary>
    /// RPM Spec
    /// </summary>
    [JsonStringValue("RPM Spec")] RpmSpec,

    /// <summary>
    /// Ruby
    /// </summary>
    [JsonStringValue("Ruby")] Ruby,

    /// <summary>
    /// SAS
    /// </summary>
    [JsonStringValue("SAS")] Sas,

    /// <summary>
    /// Scala
    /// </summary>
    [JsonStringValue("Scala")] Scala,

    /// <summary>
    /// Scheme
    /// </summary>
    [JsonStringValue("Scheme")] Scheme,

    /// <summary>
    /// Shell
    /// </summary>
    [JsonStringValue("Shell")] Shell,

    /// <summary>
    /// Sieve
    /// </summary>
    [JsonStringValue("Sieve")] Sieve,

    /// <summary>
    /// Smalltalk
    /// </summary>
    [JsonStringValue("Smalltalk")] Smalltalk,

    /// <summary>
    /// Solr
    /// </summary>
    [JsonStringValue("Solr")] Solr,

    /// <summary>
    /// SML
    /// </summary>
    [JsonStringValue("SML")] Sml,

    /// <summary>
    /// SPARQL
    /// </summary>
    [JsonStringValue("SPARQL")] SparQl,

    /// <summary>
    /// Spreadsheet
    /// </summary>
    [JsonStringValue("Spreadsheet")] Spreadsheet,

    /// <summary>
    /// Squirrel
    /// </summary>
    [JsonStringValue("Squirrel")] Squirrel,

    /// <summary>
    /// Stylus
    /// </summary>
    [JsonStringValue("Stylus")] Stylus,

    /// <summary>
    /// Swift
    /// </summary>
    [JsonStringValue("Swift")] Swift,

    /// <summary>
    /// sTeX
    /// </summary>
    [JsonStringValue("sTeX")] STeX,

    /// <summary>
    /// LaTeX
    /// </summary>
    [JsonStringValue("LaTeX")] LaTeX,

    /// <summary>
    /// SystemVerilog
    /// </summary>
    [JsonStringValue("SystemVerilog")] SystemVerilog,

    /// <summary>
    /// Tcl
    /// </summary>
    [JsonStringValue("Tcl")] Tcl,

    /// <summary>
    /// Textile
    /// </summary>
    [JsonStringValue("Textile")] Textile,

    /// <summary>
    /// TiddlyWiki
    /// </summary>
    [JsonStringValue("TiddlyWiki")] TiddlyWiki,

    /// <summary>
    /// Tiki wiki
    /// </summary>
    [JsonStringValue("Tiki wiki")] Tikiwiki,

    /// <summary>
    /// TOML
    /// </summary>
    [JsonStringValue("TOML")] Toml,

    /// <summary>
    /// Troff
    /// </summary>
    [JsonStringValue("Troff")] Troff,

    /// <summary>
    /// TTCN
    /// </summary>
    [JsonStringValue("TTCN")] Ttcn,

    /// <summary>
    /// TTCN_CFG
    /// </summary>
    [JsonStringValue("TTCN_CFG")] TtcnCfg,

    /// <summary>
    /// Turtle
    /// </summary>
    [JsonStringValue("Turtle")] Turtle,

    /// <summary>
    /// Web IDL
    /// </summary>
    [JsonStringValue("Web IDL")] WebIdl,

    /// <summary>
    /// VB.NET
    /// </summary>
    [JsonStringValue("VB.NET")] VbNet,

    /// <summary>
    /// VBScript
    /// </summary>
    [JsonStringValue("VBScript")] VbScript,

    /// <summary>
    /// Velocity
    /// </summary>
    [JsonStringValue("Velocity")] Velocity,

    /// <summary>
    /// Verilog
    /// </summary>
    [JsonStringValue("Verilog")] Verilog,

    /// <summary>
    /// VHDL
    /// </summary>
    [JsonStringValue("VHDL")] Vhdl,

    /// <summary>
    /// XQuery
    /// </summary>
    [JsonStringValue("XQuery")] XQuery,

    /// <summary>
    /// Yacas
    /// </summary>
    [JsonStringValue("Yacas")] Yacas,

    /// <summary>
    /// Z80
    /// </summary>
    [JsonStringValue("Z80")] Z80,

    /// <summary>
    /// MscGen
    /// </summary>
    [JsonStringValue("MscGen")] MscGen,

    /// <summary>
    /// Xù
    /// </summary>
    [JsonStringValue("Xù")] Xù,

    /// <summary>
    /// MsGenny
    /// </summary>
    [JsonStringValue("MsGenny")] MsGenny,

    /// <summary>
    /// Vue
    /// </summary>
    [JsonStringValue("Vue")] Vue,

    /// <summary>
    /// Angular Template
    /// </summary>
    [JsonStringValue("Angular Template")] AngularTemplate,

    /// <summary>
    /// C++
    /// </summary>
    [JsonStringValue("C++")] Cpp,

    /// <summary>
    /// C#
    /// </summary>
    [JsonStringValue("C#")] Csharp,

    /// <summary>
    /// CSS style sheets
    /// </summary>
    [JsonStringValue("CSS")] Css,

    /// <summary>
    /// HTML
    /// </summary>
    [JsonStringValue("HTML")] Html,

    /// <summary>
    /// Java
    /// </summary>
    [JsonStringValue("Java")] Java,

    /// <summary>
    /// JavaScript
    /// </summary>
    [JsonStringValue("JavaScript")] Javascript,

    /// <summary>
    /// JSON
    /// </summary>
    [JsonStringValue("JSON")] Json,

    /// <summary>
    /// Lezer
    /// </summary>
    [JsonStringValue("Lezer")] Lezer,

    /// <summary>
    /// Markdown
    /// </summary>
    [JsonStringValue("Markdown")] Markdown,

    /// <summary>
    /// Mermaid
    /// </summary>
    [JsonStringValue("Mermaid")] Mermaid,

    /// <summary>
    /// Python
    /// </summary>
    [JsonStringValue("Python")] Python,

    /// <summary>
    /// Rust
    /// </summary>
    [JsonStringValue("Rust")] Rust,

    /// <summary>
    /// SASS
    /// </summary>
    [JsonStringValue("Sass")] Sass,

    /// <summary>
    /// SQL
    /// </summary>
    [JsonStringValue("SQL")] Sql,

    /// <summary>
    /// C
    /// </summary>
    [JsonStringValue("C")] C,

    /// <summary>
    /// CQL
    /// </summary>
    [JsonStringValue("CQL")] Cql,

    /// <summary>
    /// JSX
    /// </summary>
    [JsonStringValue("JSX")] Jsx,

    /// <summary>
    /// LESS
    /// </summary>
    [JsonStringValue("LESS")] Less,

    /// <summary>
    /// Liquid
    /// </summary>
    [JsonStringValue("Liquid")] Liquid,

    /// <summary>
    /// MariaDB SQL
    /// </summary>
    [JsonStringValue("MariaDB SQL")] MariaDbSql,

    /// <summary>
    /// MS SQL
    /// </summary>
    [JsonStringValue("MS SQL")] MsSql,

    /// <summary>
    /// MySQL
    /// </summary>
    [JsonStringValue("MySQL")] MySql,

    /// <summary>
    /// PHP
    /// </summary>
    [JsonStringValue("PHP")] Php,

    /// <summary>
    /// PLSQL
    /// </summary>
    [JsonStringValue("PLSQL")] PlSql,

    /// <summary>
    /// PGP
    /// </summary>
    [JsonStringValue("PGP")] Pgp,

    /// <summary>
    /// PostgreSQL
    /// </summary>
    [JsonStringValue("PostgreSQL")] PostgreSql,

    /// <summary>
    /// SCSS
    /// </summary>
    [JsonStringValue("SCSS")] Scss,

    /// <summary>
    /// SQLite
    /// </summary>
    [JsonStringValue("SQLite")] SqLite,

    /// <summary>
    /// TSX
    /// </summary>
    [JsonStringValue("TSX")] Tsx,

    /// <summary>
    /// TypeScript
    /// </summary>
    [JsonStringValue("TypeScript")] TypeScript,

    /// <summary>
    /// WebAssembly
    /// </summary>
    [JsonStringValue("WebAssembly")] WebAssembly,

    /// <summary>
    /// XML
    /// </summary>
    [JsonStringValue("XML")] Xml,

    /// <summary>
    /// YAML
    /// </summary>
    [JsonStringValue("YAML")] Yaml,
}

/// <summary>
/// Extension methods for the <see cref="CodeMirrorLanguage"/> enum
/// </summary>
public static class CodeMirrorLanguageExtensions
{
    /// <summary>
    /// Returns the display name of the language
    /// </summary>
    /// <param name="language"></param>
    /// <returns></returns>
    public static string DisplayName(this CodeMirrorLanguage language) =>
        language.GetType().GetField(language.ToString())?.GetCustomAttribute<JsonStringValueAttribute>()?.Value ?? language.ToString();
}
