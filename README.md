# testcafe-reporter-testrail

[![Build Status](https://travis-ci.org/adilbenmoussa/testcafe-reporter-testrail.svg)](https://travis-ci.org/adilbenmoussa/testcafe-reporter-testrail)

This is the **testcafe-reporter-testrail** reporter plugin for [TestCafe](http://devexpress.github.io/testcafe).

<p align="center">
    <img src="https://raw.github.com/adilbenmoussa/testcafe-reporter-testrail/master/media/preview1.png" alt="preview success" />
</p>
<p align="center">
    <img src="https://raw.github.com/adilbenmoussa/testcafe-reporter-testrail/master/media/preview2.png" alt="preview failure" />
</p>

## Install

```
npm install testcafe-reporter-testrail
```

## Usage

When you run tests from the command line, specify the reporter name by using the `--reporter` option:

```
testcafe chrome 'path/to/test/file.js' --reporter testrail
```

When you use API, pass the reporter name to the `reporter()` method:

```js
testCafe
  .createRunner()
  .src('path/to/test/file.js')
  .browsers('chrome')
  .reporter('testcafe-reporter-testrail') // <-
  .run();
```

## Author

Adil Ben Moussa (http://tt-tech.io)
