# Site Knight unattended batch tester

Control panel: https://github.com/noahwilsonco-ui/sitesitter/actions/workflows/siteknight-qa.yml

The quick batch runs on each relevant push to main. The full batch runs daily at 13:23 UTC (09:23 Toronto during daylight time, 08:23 during standard time). GitHub can queue or delay scheduled jobs. No browser tab or local computer is required.

## Reports

Open a run for its plain-language summary. Under Artifacts download `siteknight-report`, extract the ZIP and open `index.html`. The report has failures first, elapsed time, reproduction steps, screenshots where a browser was available, a technical log, scan coverage, PDFs and `results.json`. Print the HTML report to save it as PDF. Reports expire after 30 days.

The source repository and Actions logs are public. These default batches use public websites and synthetic fixture data, no customer login or private content. This does not create a separate private dashboard. Report downloads use GitHub's artifact access controls.

## Batches and retry

Select Run workflow and choose quick or full. Saved checks and website samples are in `qa/batches.json`. To repeat only failed, timed out or untested checks, enter the old run ID in **Retry only failed/untested checks**. Reports and old successful results remain in the original run; retry reports identify only the checks rerun. An invalid/expired prior report fails setup and never silently runs a different batch.

Three checks run concurrently. Each has a hard time limit; the batch has a six-minute execution limit, excluding GitHub queue and browser installation. A stuck check cannot stop the others from producing results. Setup failures are reported Not tested. Passing requires successful process exit and completed assertions, not just opening a page.

Quick checks exercise actual scan submission against controlled responses, finding navigation, full print output, mobile map and inventory, isolated saved workspace/review/email/monitoring flows, and a deliberate-failure self-check. The full batch adds deployed-site smoke checks and two live Permaloc page samples. Live samples are not full-site scans; coverage lists exact URLs. No forms are submitted on external sites.

The self-check intentionally removes a fixture error and verifies that the test fails with a screenshot. Its expected failure is evidence that assertions work; it is not a Site Knight defect. Screenshot evidence is from Chromium, with responsive viewport sizes; Safari and real-device behaviour are not covered.

## Local use

Node 24+, Playwright 1.62.1 and Chromium are required. Install Playwright outside the application runtime, then run `node qa/run.cjs --batch quick`. `SITEKNIGHT_PLAYWRIGHT` may point to its module, `SITEKNIGHT_CHROME` to an installed Chromium executable and `SK_REPORT_DIR` to a new report directory. `node qa/run.cjs --from path/to/results.json` retries failed checks. Reports and local runner dependencies must not be committed.
