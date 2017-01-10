var fs = require("fs");
var path = require("path");
var through = require("through");
var extend = require("extend");
var pygments = require('pygmentize-bundled');
var tmp = require("tmp");
var childProcess = require("child_process");
var duplexer = require("duplexer");
var streamft = require("stream-from-to");

tmp.setGracefulCleanup();

function htmlBoilerplatePDF (opts) {
  opts = opts || {};
  opts.phantomPath = opts.phantomPath || require("phantomjs-prebuilt").path;
  opts.runningsPath = path.resolve(__dirname + "/..", opts.runningsPath || '') || __dirname + "/runnings.js";

  opts.cssPath = opts.cssPath || __dirname + "/../pdf.css";

  var relativeCssPath = path.resolve(process.cwd(), opts.cssPath);
  if (fs.existsSync(relativeCssPath)) {
    opts.cssPath = relativeCssPath;
  }

  opts.highlightCssPath = opts.highlightCssPath || __dirname + "/../highlight.css";

  var relativeHighlightCssPath = path.resolve(process.cwd(), opts.highlightCssPath);
  if (fs.existsSync(relativeHighlightCssPath)) {
    opts.highlightCssPath = relativeHighlightCssPath;
  }

  opts.paperFormat = opts.paperFormat || "A4";
  opts.paperOrientation = opts.paperOrientation || "portrait";
  opts.paperBorder = opts.paperBorder || "1cm";
  opts.renderDelay = opts.renderDelay || 500;
  opts.preProcessHtml = opts.preProcessHtml || function () { return through(); };

  var inputStream = through();
  var outputStream = through();

  // Stop input stream emitting data events until we're ready to read them
  inputStream.pause();

  // Create tmp file to save HTML for phantom to process
  tmp.file({postfix: ".html"}, function (er, tmpHtmlPath, tmpHtmlFd) {
    if (er) return outputStream.emit("error", er);
    fs.close(tmpHtmlFd);

    // Create tmp file to save PDF to
    tmp.file({postfix: ".pdf"}, function (er, tmpPdfPath, tmpPdfFd) {
      if (er) return outputStream.emit("error", er);
      fs.close(tmpPdfFd);

      var htmlToTmpHtmlFile = fs.createWriteStream(tmpHtmlPath);

      htmlToTmpHtmlFile.on("finish", function () {
        // Invoke phantom to generate the PDF
        var childArgs = [
          path.join(__dirname, "..", "lib-phantom", "pdf.js"),
          tmpHtmlPath,
          tmpPdfPath,
          opts.runningsPath,
          opts.cssPath,
          opts.highlightCssPath,
          opts.paperFormat,
          opts.paperOrientation,
          opts.paperBorder,
          opts.renderDelay,
        ];

        childProcess.execFile(opts.phantomPath, childArgs, function(er, stdout, stderr) {
          //if (stdout) console.log(stdout)
          //if (stderr) console.error(stderr)
          if (er) return outputStream.emit("error", er);
          fs.createReadStream(tmpPdfPath).pipe(outputStream);
        });
      });

      // Setup the pipeline
      inputStream.pipe(opts.preProcessHtml()).pipe(htmlToTmpHtmlFile);
      inputStream.resume();
    });
  });

  return extend(
    duplexer(inputStream, outputStream),
    streamft(function () {
      return htmlBoilerplatePDF(opts);
    })
  );
}

module.exports = htmlBoilerplatePDF;
