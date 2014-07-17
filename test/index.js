var htmlBoilerplatePDF = require("../");
var assert = require("assert");
var fs = require("fs");
var tmp = require("tmp");
var through = require("through");
var pdfText = require("pdf-text");

tmp.setGracefulCleanup();

describe("htmlBoilerplatePDF", function() {

  it("should generate a nonempty PDF from ipsum.html", function (done) {
    this.timeout(5000);

    tmp.file({postfix: ".pdf"}, function (er, tmpPdfPath, tmpPdfFd) {
      assert.ifError(er);
      fs.close(tmpPdfFd);

      htmlBoilerplatePDF().from(__dirname + "/fixtures/ipsum.html").to(tmpPdfPath, function (er) {
        assert.ifError(er);

        // Read the file
        fs.readFile(tmpPdfPath, {encoding: "utf8"}, function (er, data) {
          assert.ifError(er);
          // Test not empty
          assert.ok(data.length > 0);
          done();
        });
      });
    });
  });

  it("should have a header and footer", function (done) {
    this.timeout(5000);

    tmp.file({postfix: ".pdf"}, function (er, tmpPdfPath, tmpPdfFd) {
      assert.ifError(er);
      fs.close(tmpPdfFd);

      htmlBoilerplatePDF({runningsPath: __dirname+'/fixtures/runnings.js'}).from(__dirname + "/fixtures/ipsum.html").to(tmpPdfPath, function (er) {
        assert.ifError(er);

        // Read the file
        fs.readFile(tmpPdfPath, {encoding: "utf8"}, function (er, data) {
          console.log('readfile done: ');
          assert.ifError(er);
          // Test not empty
          assert.ok(data.length > 0);

          // Header and footer included?
          pdfText(tmpPdfPath, function (er, chunks) {
            console.log('pdfText done: '+chunks.join(''));
            assert.ifError(er);

            assert.ok(/Some\s?Header/.test(chunks.join('')));
            assert.ok(/Some\s?Footer/.test(chunks.join('')));
            done();
          });
        });
      });
    });
  });

  it("should call preProcessHtml hook", function (done) {
    this.timeout(5000);

    var writeCount = 0;
    var preProcessHtml = function () { return through(function (data) { writeCount++; this.queue(data); }); };

    htmlBoilerplatePDF({preProcessHtml: preProcessHtml}).from(__dirname + "/fixtures/ipsum.html").to.string(function (er, pdfStr) {
      assert.ifError(er);

      // Test not empty
      assert.ok(pdfStr.length > 0);
      assert(writeCount > 0, "Write count expected to be > 0");
      done();
    });
  });

  it("should concatenate source files", function (done) {
    this.timeout(5000);

    var files = [
      __dirname + "/fixtures/first.html",
      __dirname + "/fixtures/second.html"
    ];

    tmp.file({postfix: ".pdf"}, function (er, tmpPdfPath, tmpPdfFd) {
      assert.ifError(er);
      fs.close(tmpPdfFd);

      htmlBoilerplatePDF().concat.from(files).to(tmpPdfPath, function (er) {
        assert.ifError(er);

        // Read the file
        fs.readFile(tmpPdfPath, {encoding: "utf8"}, function (er, data) {
          assert.ifError(er);
          // Test not empty
          assert.ok(data.length > 0);
          done();
        });
      });
    });
  });

  it("should write to multiple paths when converting multiple files", function (done) {
    this.timeout(5000);

    var files = [
      __dirname + "/fixtures/first.html",
      __dirname + "/fixtures/second.html"
    ];

    tmp.file({postfix: ".pdf"}, function (er, tmpPdfPath0, tmpPdfFd0) {
      assert.ifError(er);
      fs.close(tmpPdfFd0);

      tmp.file({postfix: ".pdf"}, function (er, tmpPdfPath1, tmpPdfFd1) {
        assert.ifError(er);
        fs.close(tmpPdfFd1);

        htmlBoilerplatePDF().from.paths(files).to.paths([tmpPdfPath0, tmpPdfPath1], function (er) {
          assert.ifError(er);

          // Read the file
          var content0 = fs.readFileSync(tmpPdfPath0, {encoding: "utf8"});
          var content1 = fs.readFileSync(tmpPdfPath1, {encoding: "utf8"});

          assert.ok(content0.length > 0);
          assert.ok(content1.length > 0);
          assert.ok(content0.length != content1.length);

          done();
        });
      });
    });
  });

});
