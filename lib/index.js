"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __generator = (this && this.__generator) || function (thisArg, body) {
    var _ = { label: 0, sent: function() { if (t[0] & 1) throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t, g;
    return g = { next: verb(0), "throw": verb(1), "return": verb(2) }, typeof Symbol === "function" && (g[Symbol.iterator] = function() { return this; }), g;
    function verb(n) { return function (v) { return step([n, v]); }; }
    function step(op) {
        if (f) throw new TypeError("Generator is already executing.");
        while (_) try {
            if (f = 1, y && (t = op[0] & 2 ? y["return"] : op[0] ? y["throw"] || ((t = y["return"]) && t.call(y), 0) : y.next) && !(t = t.call(y, op[1])).done) return t;
            if (y = 0, t) op = [op[0] & 2, t.value];
            switch (op[0]) {
                case 0: case 1: t = op; break;
                case 4: _.label++; return { value: op[1], done: false };
                case 5: _.label++; y = op[1]; op = [0]; continue;
                case 7: op = _.ops.pop(); _.trys.pop(); continue;
                default:
                    if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) { _ = 0; continue; }
                    if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) { _.label = op[1]; break; }
                    if (op[0] === 6 && _.label < t[1]) { _.label = t[1]; t = op; break; }
                    if (t && _.label < t[2]) { _.label = t[2]; _.ops.push(op); break; }
                    if (t[2]) _.ops.pop();
                    _.trys.pop(); continue;
            }
            op = body.call(thisArg, _);
        } catch (e) { op = [6, e]; y = 0; } finally { f = t = 0; }
        if (op[0] & 5) throw op[1]; return { value: op[0] ? op[1] : void 0, done: true };
    }
};
Object.defineProperty(exports, "__esModule", { value: true });
var TestrailApi = require('testrail-api');
exports['default'] = function () {
    return {
        noColors: false,
        testResult: [],
        taskStartTime: '',
        testCount: 0,
        userAgents: '',
        fixtureName: '',
        fixturePath: '',
        skippedCount: 0,
        testRailTestCases: [],
        testrailConfig: {},
        taskRunDate: '',
        reportTaskStart: function (startTime, userAgents, testCount) {
            return __awaiter(this, void 0, void 0, function () {
                return __generator(this, function (_a) {
                    this.taskStartTime = startTime;
                    this.userAgents = userAgents;
                    this.testCount = testCount;
                    this.testrailConfig.projectName = process.env.PROJECT_NAME;
                    this.testrailConfig.host = process.env.TESTRAIL_HOST;
                    this.testrailConfig.password = process.env.TESTRAIL_PASSWORD;
                    this.testrailConfig.user = process.env.TESTRAIL_USER;
                    this.testrailConfig.testPlan = process.env.PLAN_NAME || 'TestPlan';
                    this.taskRunDate = this.moment(new Date()).format('MMMM Do YYYY, h:mm:ss a');
                    if (!Object.values(this.testrailConfig).every(function (entry) { return !!entry; })) {
                        this.newline().write(this.chalk.red.bold('Error:  TESTRAIL_HOST, TESTRAIL_USER, TESTRAIL_PASSWORD and PROJECT_NAME must be set as environment variables for the reporter plugin to push the result to the Testrail'));
                        process.exit(1);
                    }
                    logWithFormat.bind(this, "Running tests in: " + this.userAgents, this.chalk.greenBright)();
                    return [2];
                });
            });
        },
        reportFixtureStart: function (name, path) {
            return __awaiter(this, void 0, void 0, function () {
                return __generator(this, function (_a) {
                    this.fixtureName = name;
                    this.fixturePath = path;
                    logWithFormat.bind(this, "Fixture: " + this.fixtureName, this.chalk.yellowBright)();
                    return [2];
                });
            });
        },
        reportTestDone: function (name, testRunInfo) {
            return __awaiter(this, void 0, void 0, function () {
                var errs, skipped, testStatus, logger, error;
                var _this = this;
                return __generator(this, function (_a) {
                    errs = testRunInfo.errs, skipped = testRunInfo.skipped;
                    testStatus = skipped ? 'Skipped' : errs.length === 0 ? 'Passed' : 'Failed';
                    logger = errs.length === 0 ? this.chalk.green : this.chalk.red;
                    if (skipped) {
                        this.skippedCount++;
                    }
                    this.write(logger(testStatus) + " - " + name).newline();
                    error = '';
                    if (errs.length) {
                        errs.forEach(function (err, idx) {
                            error += _this.formatError(err, idx + 1 + ") ").replace(/[\u001b\u009b][[()#;?]*(?:[0-9]{1,4}(?:;[0-9]{0,4})*)?[0-9A-ORZcf-nqry=><]/g, '');
                        });
                    }
                    this.testResult.push({
                        name: name,
                        testStatus: testStatus,
                        error: error,
                        fixtureName: this.fixtureName,
                    });
                    return [2];
                });
            });
        },
        reportTaskDone: function (endTime, passed) {
            return __awaiter(this, void 0, void 0, function () {
                var duration, footer;
                return __generator(this, function (_a) {
                    switch (_a.label) {
                        case 0:
                            duration = this.moment
                                .duration(endTime - this.taskStartTime)
                                .format('h[h] mm[m] ss[s]');
                            if (this.skippedCount > 0) {
                                this.write(this.chalk.cyan(this.skippedCount + " Skipped")).newline();
                            }
                            footer = passed === this.testCount
                                ? this.testCount + " Passed"
                                : this.testCount - passed + "/" + this.testCount + " Failed";
                            footer += " (Duration: " + duration + ")";
                            this.write(footer).newline();
                            return [4, this._publishToTestrail()];
                        case 1:
                            _a.sent();
                            return [2];
                    }
                });
            });
        },
        _publishToTestrail: function () {
            return __awaiter(this, void 0, void 0, function () {
                var index, _a, name, testStatus, fixtureName, error, testCaseParts, testCaseType, testCaseDescription, testCaseIdString, testCaseId, testrailApi, project, plan, suite, userAgentsDetails, runName, runDetails, planEntryResult;
                return __generator(this, function (_b) {
                    switch (_b.label) {
                        case 0:
                            for (index = 0; index < this.testResult.length; index++) {
                                _a = this.testResult[index], name = _a.name, testStatus = _a.testStatus, fixtureName = _a.fixtureName, error = _a.error;
                                testCaseParts = name.split('|');
                                if (testCaseParts.length < 3) {
                                    this.newline()
                                        .write(this.chalk.red.bold(this.symbols.err))
                                        .write("Warning:  Test: " + this.chalk.red.bold(name) + " does not contains the correct format: \"<Test Type> | <Test Name> | <TestRail Test Case ID>\"");
                                    continue;
                                }
                                if (testCaseParts.length > 3) {
                                    this.newline()
                                        .write(this.chalk.red.bold(this.symbols.err))
                                        .write("Warning:  Test: " + this.chalk.red.bold(name) + " contains invalid character \"|\"");
                                    continue;
                                }
                                testCaseType = testCaseParts[0], testCaseDescription = testCaseParts[1], testCaseIdString = testCaseParts[2];
                                if (typeof testCaseIdString === 'undefined') {
                                    this.newline()
                                        .write(this.chalk.red.bold(this.symbols.err))
                                        .write("Warning:  Test: " + this.chalk.red.bold(name) + " missing the Testrail CaseId");
                                    continue;
                                }
                                testCaseId = String(testCaseIdString).toUpperCase().replace('C', '');
                                if (isNaN(Number(testCaseId))) {
                                    this.newline()
                                        .write(this.chalk.red.bold(this.symbols.err))
                                        .write("Warning:  Test: " + this.chalk.red.bold(name) + " contains invalid Testrail CaseId");
                                    continue;
                                }
                                this.testRailTestCases.push({
                                    case_id: String(testCaseId).trim(),
                                    status_id: testStatus === 'Passed' ? 1 : testStatus === 'Skipped' ? 1 : 5,
                                    comment: testStatus === 'Passed'
                                        ? 'Test Passed'
                                        : testStatus === 'Skipped'
                                            ? 'Test passed'
                                            : error,
                                });
                            }
                            if (this.testRailTestCases.length === 0) {
                                this.newline()
                                    .write(this.chalk.red.bold(this.symbols.err))
                                    .write('No test case data found to publish');
                                return [2];
                            }
                            testrailApi = new TestrailApi({
                                host: this.testrailConfig.host,
                                user: this.testrailConfig.user,
                                password: this.testrailConfig.password,
                            });
                            return [4, this._getProjectOrThrowAndExit(testrailApi, this.testrailConfig)];
                        case 1:
                            project = _b.sent();
                            this.newline()
                                .write(this.chalk.blue.bold('Project name(id) '))
                                .write(this.chalk.yellow(project.name + '(' + project.id + ')'));
                            return [4, this._getPlanOrThrowAndExit(testrailApi, this.testrailConfig, project)];
                        case 2:
                            plan = _b.sent();
                            this.newline()
                                .write(this.chalk.green('New Plan is created'))
                                .newline()
                                .write(this.chalk.blue.bold('Plan name(id) '))
                                .write(this.chalk.yellow(plan.name + '(' + plan.id + ')'));
                            return [4, this._getSuiteOrThrowAndExit(testrailApi, this.testrailConfig, project)];
                        case 3:
                            suite = _b.sent();
                            userAgentsDetails = this.userAgents[0].split('/');
                            runName = 'Run_' +
                                this.taskRunDate +
                                '(' +
                                userAgentsDetails[0] +
                                '_' +
                                userAgentsDetails[1] +
                                ')';
                            runDetails = {
                                suite_id: suite.id,
                                include_all: false,
                                case_ids: this.testRailTestCases.map(function (testCase) { return testCase.case_id; }),
                                name: runName,
                            };
                            return [4, this._addPlanEntryOrThrowAndExit(testrailApi, plan, runDetails)];
                        case 4:
                            planEntryResult = _b.sent();
                            this.newline()
                                .write('------------------------------------------------------')
                                .write(this.chalk.green('Run added successfully.'))
                                .newline()
                                .write(this.chalk.blue.bold('Run name:  '))
                                .write(this.chalk.yellow(runName));
                            return [4, this._addLocalResultsCasesToTestrailCasesOrThrowAndExit(testrailApi, planEntryResult.runs[0], this.testRailTestCases)];
                        case 5:
                            _b.sent();
                            this.newline()
                                .write('------------------------------------------------------')
                                .newline()
                                .write(this.chalk.green('Result added to the testrail Successfully'));
                            return [2];
                    }
                });
            });
        },
        _getProjectOrThrowAndExit: function (testrailApi, testRailConfig) {
            return __awaiter(this, void 0, void 0, function () {
                var project, body, e_1;
                return __generator(this, function (_a) {
                    switch (_a.label) {
                        case 0:
                            _a.trys.push([0, 2, , 3]);
                            return [4, testrailApi.getProjects()];
                        case 1:
                            body = (_a.sent()).body;
                            project = body.projects.find(function (_project) { return _project.name === testRailConfig.projectName; });
                            return [3, 3];
                        case 2:
                            e_1 = _a.sent();
                            this.newline()
                                .write(this.chalk.red.bold(this.symbols.err))
                                .write(this.chalk.red("Error getting the project " + testRailConfig.projectName))
                                .newline()
                                .write(this.chalk.red("Error: " + e_1.message));
                            process.exit(1);
                            return [3, 3];
                        case 3: return [2, project];
                    }
                });
            });
        },
        _getPlanOrThrowAndExit: function (testrailApi, testRailConfig, project) {
            return __awaiter(this, void 0, void 0, function () {
                var plan, body, result, e_2;
                return __generator(this, function (_a) {
                    switch (_a.label) {
                        case 0:
                            _a.trys.push([0, 4, , 5]);
                            return [4, testrailApi.getPlans(project.id)];
                        case 1:
                            body = (_a.sent()).body;
                            plan = body.plans.find(function (_plan) { return _plan.name === testRailConfig.testPlan; });
                            if (!!plan) return [3, 3];
                            return [4, testrailApi.addPlan(project.id, {
                                    name: testRailConfig.testPlan,
                                    desription: 'Added From Automation reporter plugin',
                                })];
                        case 2:
                            result = _a.sent();
                            plan = result.body;
                            _a.label = 3;
                        case 3: return [3, 5];
                        case 4:
                            e_2 = _a.sent();
                            this.newline()
                                .write(this.chalk.red.bold(this.symbols.err))
                                .write(this.chalk.red("Error getting the plans"))
                                .newline()
                                .write(this.chalk.red("Error: " + e_2.message));
                            process.exit(1);
                            return [3, 5];
                        case 5: return [2, plan];
                    }
                });
            });
        },
        _getSuiteOrThrowAndExit: function (testrailApi, testRailConfig, project) {
            return __awaiter(this, void 0, void 0, function () {
                var suite, body, e_3;
                return __generator(this, function (_a) {
                    switch (_a.label) {
                        case 0:
                            _a.trys.push([0, 2, , 3]);
                            return [4, testrailApi.getSuites(project.id)];
                        case 1:
                            body = (_a.sent()).body;
                            if (body.length === 0) {
                                this.newline()
                                    .write(this.chalk.red.bold(this.symbols.err))
                                    .write(this.chalk.red("The project doesnt contain any suite"));
                                process.exit(1);
                            }
                            else {
                                suite = body[0];
                            }
                            return [3, 3];
                        case 2:
                            e_3 = _a.sent();
                            this.newline()
                                .write(this.chalk.red.bold(this.symbols.err))
                                .write(this.chalk.red("Error getting suites"))
                                .newline()
                                .write(this.chalk.red("Error: " + e_3.message));
                            process.exit(1);
                            return [3, 3];
                        case 3: return [2, suite];
                    }
                });
            });
        },
        _addPlanEntryOrThrowAndExit: function (testrailApi, plan, runDetails) {
            return __awaiter(this, void 0, void 0, function () {
                var planEntryResult, body, e_4;
                return __generator(this, function (_a) {
                    switch (_a.label) {
                        case 0:
                            _a.trys.push([0, 2, , 3]);
                            return [4, testrailApi.addPlanEntry(plan.id, runDetails)];
                        case 1:
                            body = (_a.sent()).body;
                            planEntryResult = body;
                            return [3, 3];
                        case 2:
                            e_4 = _a.sent();
                            this.newline()
                                .write(this.chalk.red.bold(this.symbols.err))
                                .write(this.chalk.red("Error at AddPlanEntry"))
                                .newline()
                                .write(this.chalk.red("Error: " + e_4.message));
                            process.exit(1);
                            return [3, 3];
                        case 3: return [2, planEntryResult];
                    }
                });
            });
        },
        _addLocalResultsCasesToTestrailCasesOrThrowAndExit: function (testrailApi, run, localCases) {
            return __awaiter(this, void 0, void 0, function () {
                var body, e_5;
                return __generator(this, function (_a) {
                    switch (_a.label) {
                        case 0:
                            _a.trys.push([0, 2, , 3]);
                            return [4, testrailApi.addResultsForCases(run.id, localCases)];
                        case 1:
                            body = (_a.sent()).body;
                            if (body.length === 0) {
                                this.newline()
                                    .write(this.chalk.red.bold(this.symbols.err))
                                    .write(this.chalk.red("No Data has been published to Testrail."));
                            }
                            return [3, 3];
                        case 2:
                            e_5 = _a.sent();
                            this.newline()
                                .write(this.chalk.red.bold(this.symbols.err))
                                .write(this.chalk.red("Error at Adding results"))
                                .newline()
                                .write(this.chalk.red("Error: " + e_5.message));
                            process.exit(1);
                            return [3, 3];
                        case 3: return [2];
                    }
                });
            });
        },
    };
};
module.exports = exports['default'];
function logWithFormat(text, colorHandler) {
    colorHandler = colorHandler || this.chalk.black;
    this.write(colorHandler("**********************************************"))
        .newline()
        .write(colorHandler(text))
        .newline()
        .write(colorHandler("**********************************************"))
        .newline();
}
//# sourceMappingURL=index.js.map