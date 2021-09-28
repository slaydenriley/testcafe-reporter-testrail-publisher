# testcafe-reporter-testrail-publisher

This is the **testcafe-reporter-testrail-publisher** reporter plugin for [TestCafe](http://devexpress.github.io/testcafe).

<p align="center">
    <img src="https://raw.github.com/adilbenmoussa/testcafe-reporter-testrail-publisher/master/media/preview1.png" alt="preview success" />
</p>
<p align="center">
    <img src="https://raw.github.com/adilbenmoussa/testcafe-reporter-testrail-publisher/master/media/preview2.png" alt="preview failure" />
</p>

## Install

```
npm install testcafe-reporter-testrail-publisher
```

## Usage

When you run tests from the command line, specify the reporter name by using the `--reporter` option:

```
testcafe chrome 'path/to/test/file.js' --reporter testrail-publisher
```

When you use API, pass the reporter name to the `reporter()` method:

```js
testCafe
  .createRunner()
  .src('path/to/test/file.js')
  .browsers('chrome')
  .reporter('testcafe-reporter-testrail-publisher') // <-
  .run();
```

# Prerequisites

- All test cases should have a valid mapping between TestCafe and TestRail. 

Formatting your TestCafe test descriptions

```js 
test("<Test Type> | <Test Name> | <TestRail Test Case ID>", async t => {
  // Your test code goes here as usual.
});
```

Replace the following segments of the example above with your test case details:

- `<Test Type>`: The type of test (like "smoke" or "regression").
- `<Test Name>`: The name of your test, a description of what it does.
- `<TestRail Test Case ID>`: The test case ID from TestRail that will link with your TestCafe test.


# Configuration

Configuration can be provided via:

- ENV variables

| ENV Variable                   | Config             | Description                                                                                                                                                                                                                                                                                                        |           Default           | Required |
| ------------------------------ | ------------------ | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ | :-------------------------: | :------: |
| TESTRAIL_HOST                  | host               | URL of the TestRail instance.                                                                                                                                                                                                                                                                                      |                             |  `true`  |
| TESTRAIL_USER                  | user               | Account name which will be used to push results.                                                                                                                                                                                                                                                                   |                             |  `true`  |
| TESTRAIL_PASSWORD               | password             | Account password.                                                                                                                                                                                                                                                    |                             |  `true`  |
| PROJECT_NAME            | projectName          | Project name in which test cases are stored.                                                                                                                                                                                                                                                            |                             |  `true`  |
| PLAN_NAME              | planName            | Plan name in which test cases are stored.                                                                                                                                                                                                                                                              | TestPlan              |  `false`  |

## Author

Adil Ben Moussa (http://tt-tech.io)
