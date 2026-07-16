# AI-Assisted Development Pilot Plan — RosiHome

## Document Control

| Field | Value |
|---|---|
| Version | 0.1 (Working Draft) |
| Status | Draft pending backlog selection and named assignments |
| Planned duration | Five working days, plus setup/dry run |
| Planned human capacity | 75–100 team-hours |
| Initial WIP | Maximum five active implementation stories |
| Related methodology | `docs/cost_time_resources/estimation_methodology.md` |
| Related capacity baseline | `docs/cost_time_resources/resource_capacity_baseline.md` |

## 1. Pilot Purpose

The pilot will establish an empirical baseline for how quickly and at what cost the RosiHome team can move representative user stories from `Ready for Agent` to `Accepted Done` using Codex desktop/CLI and Antigravity.

The pilot is not a model benchmark in isolation. It measures the complete delivery system: requirements, agent execution, human review, testing, integration, deployment, rework, and documentation.

## 2. Questions the Pilot Must Answer

1. How many representative stories can be accepted and deployed in five working days?
2. What are the cycle time and human touch time by work-item class?
3. How much provider usage and cash cost is consumed per accepted story?
4. Does increasing concurrency above five improve accepted throughput?
5. Where is the primary bottleneck: implementation, review, testing, integration, deployment, or usage limits?
6. How do the Codex and Antigravity cohorts differ in cycle time, acceptance yield, and rework?
7. Is the sponsor's 8–10 week target consistent with demonstrated capacity and the remaining backlog?

## 3. Pilot Hypotheses

| ID | Hypothesis | Validation measure |
|---|---|---|
| H1 | AI-assisted delivery can complete multiple production-quality stories within one week | Accepted throughput and story-class mix |
| H2 | Human review and integration, rather than raw agent execution, will constrain throughput | Queue time and effort distribution by workflow state |
| H3 | More than one agent session per member will not produce linear throughput growth | Concurrency efficiency from C1/C2/C3 stages |
| H4 | Mixed providers can produce usable code under one common DoD | Acceptance yield, rework, defects, and deployment success by cohort |
| H5 | The team's 90% AI-generated-code expectation does not remove substantial human accountability | Human touch time and review findings per story |

## 4. Entry Criteria

The pilot may start only when:

- at least 10 candidate stories satisfy the Definition of Ready;
- selected stories cover at least three work-item classes;
- every story has testable acceptance criteria;
- the repository builds and the baseline test suite passes;
- branch/worktree conventions are defined;
- the test and deployment environments are available;
- M1–M5, reviewers, integration owner, and deployment owner are assigned;
- each account's actual product surface, selectable model, allowance, and reset behavior are recorded;
- time, usage, cost, and result logging templates are ready;
- synthetic or approved non-sensitive test data is available.

## 5. Sample Selection

Prepare 10–15 Ready stories so agents can pull new work without waiting. The candidate set should contain:

- two or more simple application-flow stories;
- two or more business-rule stories;
- two or more cross-layer integration stories;
- at least one authentication/authorization story;
- at least one external, storage, CI/CD, or deployment story; and
- automated testing and a real deployment path.

Stories must be small enough to finish within a few working days. Large stories are split before the pilot. Selection must not be limited to easy CRUD work.

## 6. Cohort and Review Assignment

| Cohort | Members | Implementation surface | Initial maximum active stories |
|---|---:|---|---:|
| O — OpenAI | 2 | Codex desktop/CLI | 2 |
| G — Google | 3 | Antigravity | 3 |
| **Total C1** | **5** | Mixed provider | **5** |

Where practical, a story implemented by Cohort O should be reviewed by a member of Cohort G, and vice versa. Cross-review reduces provider-specific confirmation bias and distributes system knowledge.

No member may approve their own story as the sole reviewer.

## 7. Pilot Schedule

### Day 0 — Setup and dry run

- Freeze the pilot backlog and acceptance criteria.
- Record repository revision, environments, account plans, models, and limits.
- Verify worktrees/branches and CI/CD.
- Test the measurement log using one non-scored dry-run item.
- Confirm baseline build, tests, and deployment.

### Day 1 — C1 baseline

- Maximum five active sessions, one story per member.
- Use normal provider/model choices planned for the project.
- Record every workflow transition, effort block, usage event, and failure.
- Do not add concurrency even if implementation appears fast.

### Day 2 — Continue C1 and inspect flow

- Finish work already in progress before pulling more work.
- Review queue, blocked time, acceptance yield, and integration conflicts.
- Maintain C1 if downstream work is unstable.

### Day 3 — Conditional C2 experiment

- Increase to a maximum of eight sessions only if C1 quality and queues are stable.
- Add sessions only on independent stories or bounded subtasks.
- Stop increasing concurrency if review, testing, or integration WIP exceeds its limit.

### Day 4 — Validate sustainable concurrency

- Continue the last stable stage.
- C3, up to 13 sessions, is optional and requires sufficient independent work, account allowance, and reviewer capacity.
- Prioritize finishing and integrating over starting additional work.

### Day 5 — Stabilization and measurement close

- Establish a cutoff for starting new stories.
- Complete review, regression testing, integration, and deployment.
- Run post-deployment smoke tests.
- Close or classify unfinished work as carried over, split, failed, or blocked.
- Export usage/cost evidence and validate time logs.

## 8. Workflow and WIP Limits

```text
Backlog
  → Ready for Agent
  → AI Implementing
  → Human Review
  → Testing / Acceptance
  → Integration
  → Deployment
  → Accepted Done
```

| State | Pilot WIP limit |
|---|---:|
| AI Implementing | 5 initially; 8 or 13 only through approved experiment stage |
| Human Review | 3 waiting for review |
| Testing / Acceptance | 3 |
| Integration | 1 shared integration change |
| Deployment | 1 controlled deployment |

Blocked stories remain visible in their current state. Block reason and duration are mandatory.

## 9. Per-Story Measurement Log

| Field group | Fields |
|---|---|
| Story | ID, title, class, acceptance criteria, dependencies, components |
| Assignment | Member, cohort, provider, product surface, exact model, session/worktree |
| Time | Ready, start, code complete, review complete, deploy, accepted timestamps |
| Human effort | Analysis/prompting, review, test, correction, integration, deployment, documentation hours |
| Provider usage | Credits/tokens when exposed, task/session count, active duration, limit/reset events, paid overage |
| Flow | Queue time, active time, blocked time, workflow returns |
| Quality | Tests, acceptance result, review findings, defects, severity, rework hours |
| Delivery | CI attempts, deployment attempts, deployment result, rollback/hotfix |
| Outcome | Accepted Done, carried over, split, failed, cancelled, or blocked |

If a subscription surface does not expose raw tokens, record the actual exposed unit. Do not estimate or fabricate token counts.

## 10. Daily Team Log

At the end of each pilot day, record:

- member availability and actual hours;
- active and completed stories;
- WIP by state;
- provider allowance or rate-limit incidents;
- CI/deployment incidents;
- blocked stories and causes;
- review and test queues;
- cash spend and purchased credits;
- process or configuration changes.

The daily review should be brief and evidence-focused. It is not used to re-estimate unfinished work subjectively.

## 11. Metrics

The pilot report must calculate:

- accepted throughput overall and by cohort/class;
- median and observed range of cycle time;
- work-item age for unfinished stories;
- human touch time per accepted story;
- acceptance yield;
- deployment success rate;
- rework ratio;
- carry-over rate;
- provider usage and cash cost per accepted story;
- concurrency efficiency where comparable stages exist;
- percentage of measured code generated by AI, if a defensible measurement mechanism exists.

The code-generation percentage is secondary. It must not replace delivery and quality measures.

## 12. Stage-Gate Rules

Concurrency may increase only when all of the following hold for the current stage:

- no severity-1 or severity-2 defect remains open;
- no failed deployment remains unresolved;
- review and testing queues are within WIP limits;
- shared integration is not blocked;
- available provider allowance is sufficient;
- at least one member is available for integration/deployment control;
- added stories are independent enough to avoid known file/schema conflicts.

If these conditions fail, the team stops starting work and helps finish or unblock existing work.

## 13. Pilot Validity and Exit Criteria

The pilot is considered usable for an initial forecast when:

- at least five stories reach `Accepted Done`;
- accepted stories represent at least three work-item classes;
- at least one end-to-end deployment succeeds;
- required measurement fields are at least 90% complete;
- actual human hours are available for all accepted stories;
- provider/product/model attribution is available for all scored stories;
- excluded, split, or carried-over work is disclosed;
- no unresolved severity-1 defect invalidates the deployed increment.

If these criteria are not met, the result remains a process-learning pilot and must not be extrapolated as the final project forecast.

## 14. Cost Treatment

- Record the actual allocated cost of two ChatGPT Plus subscriptions for the pilot period.
- Record purchased Codex credits or other paid overage separately.
- Record Google AI Pro student access as zero incremental cash outflow and document benefit validity; include paid fallback cost later in the conservative TCO scenario.
- Record hosting, database, storage, domain, CI/CD, notification, and other pilot expenses from actual invoices or official rate cards.
- Calculate economic labor cost only after the shadow hourly-rate basis is approved.
- Do not include runtime AI-product cost because runtime AI is outside the MVP.

## 15. Security and Data Rules

- Do not provide production secrets, real tenant identity documents, bank credentials, or unapproved personal data to any model.
- Use synthetic test data during development and pilot measurement.
- Keep secrets in approved environment/secret-management facilities.
- Human reviewers remain accountable for authentication, authorization, data access, and payment-state logic.
- Record the provider and product surface used for code that processes personal or payment-related data.

## 16. Pilot Outputs

The pilot produces:

1. Completed per-story and daily measurement logs;
2. Accepted and deployed pilot increment;
3. Pilot Results and Forecast Report;
4. Updated Resource Capacity Baseline;
5. Developer duration forecast for the remaining backlog;
6. AI development cost-per-story evidence;
7. Recommended sustainable WIP and concurrency limit;
8. Sponsor-versus-developer variance for SOW reconciliation.

## 17. Open Items Before Execution

| ID | Item | Status |
|---|---|---|
| P-01 | Assign stable member IDs/names and pilot roles | Open |
| P-02 | Approve 10–15 candidate user stories and acceptance criteria | Open |
| P-03 | Choose pilot start date and daily working windows | Open |
| P-04 | Confirm exact models and allowances visible on all five accounts | Open |
| P-05 | Confirm repository, architecture baseline, test environment, and deployment target | Open |
| P-06 | Create measurement log artifact and assign data owner | Open |
| P-07 | Approve labor shadow-rate basis or defer economic labor cost | Open |
| P-08 | Assign integration, QA/acceptance, and deployment owners | Open |

## 18. References

- Cost–Time–Resources Estimation Methodology: `docs/cost_time_resources/estimation_methodology.md`
- Resource Capacity Baseline: `docs/cost_time_resources/resource_capacity_baseline.md`
- OpenAI, using Codex with a ChatGPT plan: <https://help.openai.com/en/articles/11369540-using-codex-with-your-chatgpt-plan>
- OpenAI, GPT-5.6 in ChatGPT and Codex: <https://help.openai.com/en/articles/20001354-gpt-56-in-chatgpt/>
- Google AI Pro benefits: <https://support.google.com/googleone/answer/14534406>
- Google, Gemini Apps usage limits: <https://support.google.com/gemini/answer/16275805>
- Google, Gemini 3.1 Pro Preview: <https://ai.google.dev/gemini-api/docs/models/gemini-3.1-pro-preview>
