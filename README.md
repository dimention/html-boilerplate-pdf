html-boilerplate-pdf [![Build Status](https://travis-ci.org/cabbiepete/html-boilerplate-pdf.svg)](https://travis-ci.org/cabbiepete/html-boilerplate-pdf) [![Dependency Status](https://david-dm.org/cabbiepete/html-boilerplate-pdf.svg)](https://david-dm.org/cabbiepete/html-boilerplate-pdf) [![Coverage Status](https://img.shields.io/coveralls/cabbiepete/html-boilerplate-pdf.svg)](https://coveralls.io/r/cabbiepete/html-boilerplate-pdf?branch=master)
===

Node module that converts HTML body documents strings to PDFs.

Using same process and similar options to [html-boilerplate-pdf](https://github.com/alanshaw/markdown-pdf)

The PDF looks great because it is styled by HTML5 Boilerplate. What? - Yes! Your HTML is pushed into the HTML5 Boilerplate `index.html`. Phantomjs renders the page and saves it to a PDF. You can even customise the style of the PDF by passing an optional path to your CSS _and_ you can pre-process your markdown file before it is converted to a PDF by passing in a pre-processing function, for templating.

Getting started
---

    npm install html-boilerplate-pdf

Example usage
----

```javascript
htmlBoilerplatePDF().from.string(html).to("/path/to/document.pdf", function () {
  console.log("Done")
})
```

### Options

Pass an options object (`htmlBoilerplatePDF({/* options */})`) to configure the output.

#### options.phantomPath
Type: `String`
Default value: `Path provided by phantomjs module`

Path to phantom binary

#### options.cssPath
Type: `String`
Default value: `[module path]/pdf.css`

Path to custom CSS file, relative to the current directory

#### options.highlightCssPath
Type: `String`
Default value: `[module path]/highlight.css`

Path to custom highlight CSS file (for code highlighting), relative to the current directory

#### options.paperFormat
Type: `String`
Default value: `A4`

'A3', 'A4', 'A5', 'Legal', 'Letter' or 'Tabloid'

#### options.paperOrientation
Type: `String`
Default value: `portrait`

'portrait' or 'landscape'

#### options.paperBorder
Type: `String`
Default value: `1cm`

Supported dimension units are: 'mm', 'cm', 'in', 'px'

#### options.runningsPath
Type: `String`
Default value: `runnings.js`

Path to CommonJS module which sets the page header and footer (see [runnings.js](lib/runnings.js))

#### options.renderDelay
Type: `Number`
Default value: `1000`

Delay in millis before rendering the PDF (give HTML and CSS a chance to load)

#### options.preProcessHtml
Type: `Function`
Default value: `function () { return through() }`

A function that returns a [through stream](https://npmjs.org/package/through) that transforms the HTML before it is converted to PDF.

API
---

### from.path(path, opts) / from(path, opts)

Create a readable stream from `path` and pipe to html-boilerplate-pdf. `path` can be a single path or array of paths.

### from.string(string)

Create a readable stream from `string` and pipe to html-boilerplate-pdf. `string` can be a single string or array of strings.

### concat.from.paths(paths, opts)

Create and concatinate readable streams from `paths` and pipe to html-boilerplate-pdf.

### concat.from.strings(strings, opts)

Create and concatinate readable streams from `strings` and pipe to html-boilerplate-pdf.

### to.path(path, cb) / to(path, cb)

Create a writeable stream to `path` and pipe output from html-boilerplate-pdf to it. `path` can be a single path, or array of output paths if you specified an array of inputs. The callback function `cb` will be invoked when data has finished being written.

### to.buffer(opts, cb)

Create a [concat-stream](https://npmjs.org/package/concat-stream) and pipe output from html-boilerplate-pdf to it. The callback function `cb` will be invoked when the buffer has been created.

### to.string(opts, cb)

Create a [concat-stream](https://npmjs.org/package/concat-stream) and pipe output from html-boilerplate-pdf to it. The callback function `cb` will be invoked when the string has been created.

More examples
---

### From string to path

```javascript
var htmlBoilerplatePDF = require("html-boilerplate-pdf")

var md = "foo===\n* bar\n* baz\n\nLorem ipsum dolor sit"
  , outputPath = "/path/to/doc.pdf"

htmlBoilerplatePDF().from.string(html).to(outputPath, function () {
  console.log("Created", outputPath)
})
```

### From multiple paths to multiple paths

```javascript
var htmlBoilerplatePDF = require("html-boilerplate-pdf")

var htmlDocs = ["home.html", "about.html", "contact.html"]
  , pdfDocs = mdDocs.map(function (d) { return "out/" + d.replace(".html", ".pdf") })

htmlBoilerplatePDF().from(htmlDocs).to(pdfDocs, function () {
  pdfDocs.forEach(function (d) { console.log("Created", d) })
})
```

### Concat from multiple paths to single path

```javascript
var htmlBoilerplatePDF = require("html-boilerplate-pdf")

var htmlDocs = ["chapter1.html", "chapter2.html", "chapter3.html"]
  , bookPath = "/path/to/book.pdf"

htmlBoilerplatePDF().concat.from(htmlDocs).to(bookPath, function () {
  console.log("Created", bookPath)
})
```

### Transform html before conversion

```javascript
var htmlBoilerplatePDF = require("html-boilerplate-pdf")
  , split = require("split")
  , through = require("through")
  , duplexer = require("duplexer")

function preProcessHTML () {
  // Split the input stream by lines
  var splitter = split()

  // Replace occurences of "foo" with "bar"
  var replacer = through(function (data) {
    this.queue(data.replace(/foo/g, "bar") + "\n")
  })

  splitter.pipe(replacer)
  return duplexer(splitter, replacer)
}

htmlBoilerplatePDF({preProcessHTML: preProcessHTML})
  .from("/path/to/document.html")
  .to("/path/to/document.pdf", function () { console.log("Done") })
```

CLI interface
---

### Installation

To use html-boilerplate-pdf as a standalone program from the terminal run

```sh
npm install -g html-boilerplate-pdf
```

### Usage

```sh
Usage: html-boilerplate-pdf [options] <markdown-file-path>

Options:

  -h, --help                             output usage information
  -V, --version                          output the version number
  <markdown-file-path>                   Path of the markdown file to convert
  -p, --phantom-path [path]              Path to phantom binary
  -h, --runnings-path [path]             Path to runnings (header, footer)
  -s, --css-path [path]                  Path to custom CSS file
  -z, --highlight-css-path [path]        Path to custom highlight-CSS file
  -f, --paper-format [format]            'A3', 'A4', 'A5', 'Legal', 'Letter' or 'Tabloid'
  -r, --paper-orientation [orientation]  'portrait' or 'landscape'
  -b, --paper-border [measurement]       Supported dimension units are: 'mm', 'cm', 'in', 'px'
  -d, --render-delay [millis]            Delay before rendering the PDF (give HTML and CSS a chance to load)
  -o, --out [path]                       Path of where to save the PDF
```

### TODO

- convert tests from markdown-pdf to this module
