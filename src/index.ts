Object.defineProperty(exports, "__esModule", { value: true });

const TestrailApi = require('testrail-api');
exports['default'] = () => {
  return {
    noColors: false,
    testResult: [], // array of {name, status, fixtureName, error?},
    taskStartTime: '',
    testCount: 0,
    userAgents: '',
    fixtureName: '',
    fixturePath: '',
    skippedCount: 0,
    testRailTestCases: [], // array of {case_id: string, status_id: number, comment: string}
    testrailConfig: {}, //  object of shape {projectName: '',host: '',user: '',password: '', testPlan: ''}
    taskRunDate: '',

    async reportTaskStart(startTime: string, userAgents: string, testCount: number) {
      this.taskStartTime = startTime;
      this.userAgents = userAgents;
      this.testCount = testCount;
      this.testrailConfig.projectName = process.env.PROJECT_NAME;
      this.testrailConfig.host = process.env.TESTRAIL_HOST;
      this.testrailConfig.password = process.env.TESTRAIL_PASSWORD;
      this.testrailConfig.user = process.env.TESTRAIL_USER;
      this.testrailConfig.testPlan = process.env.PLAN_NAME || 'TestPlan';
      this.taskRunDate = this.moment(new Date()).format('MMMM Do YYYY, h:mm:ss a');

      if (!Object.values(this.testrailConfig).every(entry => !!entry)) {
        this.newline().write(
          this.chalk.red.bold(
            'Error:  TESTRAIL_HOST, TESTRAIL_USER, TESTRAIL_PASSWORD and PROJECT_NAME must be set as environment variables for the reporter plugin to push the result to the Testrail',
          ),
        );
        process.exit(1);
      }

      logWithFormat.bind(
        this,
        `Running tests in: ${this.userAgents}`,
        this.chalk.greenBright,
      )();
    },

    async reportFixtureStart(name: string, path: string) {
      this.fixtureName = name;
      this.fixturePath = path;
      logWithFormat.bind(this, `Fixture: ${this.fixtureName}`, this.chalk.black)();
    },

    async reportTestDone(name: string, testRunInfo: {errs, skipped}) {
      const { errs, skipped } = testRunInfo;
      const testStatus = skipped ? 'Skipped' : errs.length === 0 ? 'Passed' : 'Failed';
      const logger = errs.length === 0 ? this.chalk.green : this.chalk.red;

      if (skipped) {
        this.skippedCount++;
      }

      this.write(`${logger(testStatus)} - ${name}`).newline();
      let error = '';
      if (errs.length) {
        errs.forEach((err, idx) => {
          error += this.formatError(err, `${idx + 1}) `).replace(
            /[\u001b\u009b][[()#;?]*(?:[0-9]{1,4}(?:;[0-9]{0,4})*)?[0-9A-ORZcf-nqry=><]/g,
            '',
          );
        });
      }

      this.testResult.push({
        name,
        testStatus,
        error,
        fixtureName: this.fixtureName,
      });
    },

    async reportTaskDone(endTime: number, passed: number /*, warnings*/) {
      const duration = this.moment
        .duration(endTime - this.taskStartTime)
        .format('h[h] mm[m] ss[s]');

      if (this.skippedCount > 0) {
        this.write(this.chalk.cyan(`${this.skippedCount} Skipped`)).newline();
      }

      let footer =
        passed === this.testCount
          ? `${this.testCount} Passed`
          : `${this.testCount - passed}/${this.testCount} Failed`;
      footer += ` (Duration: ${duration})`;
      this.write(footer).newline();

      await this._publishToTestrail();
    },

    async _publishToTestrail() {
      for (let index = 0; index < this.testResult.length; index++) {
        const { name, testStatus, fixtureName, error } = this.testResult[index];

        // Handle the case error of configuration
        const testCaseParts = name.split('|');

        if (testCaseParts.length < 3) {
          this.newline()
            .write(this.chalk.red.bold(this.symbols.err))
            .write(
              `Warning:  Test: ${this.chalk.red.bold(
                name,
              )} does not contains the correct format: "<Test Type> | <Test Name> | <TestRail Test Case ID>"`,
            );
          continue;
        }

        // Handle the case error of invalid character |
        if (testCaseParts.length > 3) {
          this.newline()
            .write(this.chalk.red.bold(this.symbols.err))
            .write(
              `Warning:  Test: ${this.chalk.red.bold(
                name,
              )} contains invalid character "|"`,
            );
          continue;
        }

        // Handle the case error of invalid case Id |
        const [testCaseType, testCaseDescription, testCaseIdString] = testCaseParts;
        // handle the CaseId  presence in the test
        if (typeof testCaseIdString === 'undefined') {
          this.newline()
            .write(this.chalk.red.bold(this.symbols.err))
            .write(
              `Warning:  Test: ${this.chalk.red.bold(name)} missing the Testrail CaseId`,
            );
          continue;
        }

        const testCaseId = String(testCaseIdString).toUpperCase().replace('C', '');
        if (isNaN(Number(testCaseId))) {
          this.newline()
            .write(this.chalk.red.bold(this.symbols.err))
            .write(
              `Warning:  Test: ${this.chalk.red.bold(
                name,
              )} contains invalid Testrail CaseId`,
            );
          continue;
        }

        this.testRailTestCases.push({
          case_id: String(testCaseId).trim(),
          status_id: testStatus === 'Passed' ? 1 : testStatus === 'Skipped' ? 1 : 5,
          comment:
            testStatus === 'Passed'
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
        return;
      }

      const testrailApi = new TestrailApi({
        host: this.testrailConfig.host,
        user: this.testrailConfig.user,
        password: this.testrailConfig.password,
      });

      // get the project
      const project = await this._getProjectOrThrowAndExit(
        testrailApi,
        this.testrailConfig,
      );
      this.newline()
        .write(this.chalk.blue.bold('Project name(id) '))
        .write(this.chalk.yellow(project.name + '(' + project.id + ')'));

      // get/add plan
      const plan = await this._getPlanOrThrowAndExit(
        testrailApi,
        this.testrailConfig,
        project,
      );
      this.newline()
        .write(this.chalk.green('New Plan is created'))
        .newline()
        .write(this.chalk.blue.bold('Plan name(id) '))
        .write(this.chalk.yellow(plan.name + '(' + plan.id + ')'));

      // get/add suite
      const suite = await this._getSuiteOrThrowAndExit(
        testrailApi,
        this.testrailConfig,
        project,
      );

      const userAgentsDetails = this.userAgents[0].split('/');

      const runName =
        `Run_${this.taskRunDate} (${userAgentsDetails[0]}_${userAgentsDetails[1]})`;
      const runDetails = {
        suite_id: suite.id,
        include_all: false,
        case_ids: this.testRailTestCases.map((testCase) => testCase.case_id),
        name: runName,
      };

      const planEntryResult = await this._addPlanEntryOrThrowAndExit(
        testrailApi,
        plan,
        runDetails,
      );
      this.newline()
        .write('------------------------------------------------------')
        .write(this.chalk.green('Run added successfully.'))
        .newline()
        .write(this.chalk.blue.bold('Run name:  '))
        .write(this.chalk.yellow(runName));

      // publish the local cases to testrail
      await this._addLocalResultsCasesToTestrailCasesOrThrowAndExit(
        testrailApi,
        planEntryResult.runs[0],
        this.testRailTestCases,
      );

      this.newline()
        .write('------------------------------------------------------')
        .newline()
        .write(this.chalk.green('Result added to the testrail Successfully'));
    },

    async _getProjectOrThrowAndExit(testrailApi, testRailConfig) {
      let project;
      try {
        const { body } = await testrailApi.getProjects();
        project = body.projects.find((_project) => _project.name === testRailConfig.projectName);
      } catch (e) {
        this.newline()
          .write(this.chalk.red.bold(this.symbols.err))
          .write(
            this.chalk.red(`Error getting the project ${testRailConfig.projectName}`),
          )
          .newline()
          .write(this.chalk.red(`Error: ${e.message}`));
        process.exit(1);
      }

      return project;
    },

    async _getPlanOrThrowAndExit(testrailApi, testRailConfig, project) {
      let plan;
      try {
        const { body } = await testrailApi.getPlans(project.id);
        plan = body.plans.find((_plan) => _plan.name === testRailConfig.testPlan);

        if (!plan) {
          const result = await testrailApi.addPlan(project.id, {
            name: testRailConfig.testPlan,
            desription: 'Added From Automation reporter plugin',
          });

          plan = result.body;
        }
      } catch (e) {
        this.newline()
          .write(this.chalk.red.bold(this.symbols.err))
          .write(this.chalk.red(`Error getting the plans`))
          .newline()
          .write(this.chalk.red(`Error: ${e.message}`));
        process.exit(1);
      }

      return plan;
    },

    async _getSuiteOrThrowAndExit(testrailApi, testRailConfig, project) {
      let suite;
      try {
        const { body } = await testrailApi.getSuites(project.id);
        if (body.length === 0) {
          this.newline()
            .write(this.chalk.red.bold(this.symbols.err))
            .write(this.chalk.red(`The project doesnt contain any suite`));
          process.exit(1);
        } else {
          suite = body[0];
        }
      } catch (e) {
        this.newline()
          .write(this.chalk.red.bold(this.symbols.err))
          .write(this.chalk.red(`Error getting suites`))
          .newline()
          .write(this.chalk.red(`Error: ${e.message}`));
        process.exit(1);
      }

      return suite;
    },

    async _addPlanEntryOrThrowAndExit(testrailApi, plan, runDetails) {
      let planEntryResult;
      try {
        const { body } = await testrailApi.addPlanEntry(plan.id, runDetails);
        planEntryResult = body;
      } catch (e) {
        this.newline()
          .write(this.chalk.red.bold(this.symbols.err))
          .write(this.chalk.red(`Error at AddPlanEntry`))
          .newline()
          .write(this.chalk.red(`Error: ${e.message}`));
        process.exit(1);
      }

      return planEntryResult;
    },

    async _addLocalResultsCasesToTestrailCasesOrThrowAndExit(
      testrailApi,
      run,
      localCases,
    ) {
      try {
        const { body } = await testrailApi.addResultsForCases(run.id, localCases);

        if (body.length === 0) {
          this.newline()
            .write(this.chalk.red.bold(this.symbols.err))
            .write(this.chalk.red(`No Data has been published to Testrail.`));
        }
      } catch (e) {
        this.newline()
          .write(this.chalk.red.bold(this.symbols.err))
          .write(this.chalk.red(`Error at Adding results`))
          .newline()
          .write(this.chalk.red(`Error: ${e.message}`));
        process.exit(1);
      }
    },
  };
};

module.exports = exports['default'];

function logWithFormat(text, colorHandler) {
  colorHandler = colorHandler || this.chalk.black;
  this.write(colorHandler(`**********************************************`))
    .newline()
    .write(colorHandler(text))
    .newline()
    .write(colorHandler(`**********************************************`))
    .newline();
}
