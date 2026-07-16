# Resource Capacity Baseline — RosiHome

## Document Control

| Field | Value |
|---|---|
| Version | 0.1 (Working Draft) |
| Status | Provisional baseline pending pilot evidence and named assignments |
| Date | 2026-07-14 |
| Related methodology | `docs/cost_time_resources/estimation_methodology.md` |

## 1. Purpose

This document translates the currently available people, AI tools, machines, and working time into a provisional capacity baseline for the RosiHome MVP. It does not convert agent sessions into employee equivalents and does not treat theoretical concurrency as demonstrated throughput.

## 2. Human Capacity

The project has five full-stack student members. Each member is available for approximately 3–4 hours per day, five days per week.

| Measure | Minimum | Midpoint | Maximum |
|---|---:|---:|---:|
| Hours/member/day | 3.0 | 3.5 | 4.0 |
| Hours/member/week | 15.0 | 17.5 | 20.0 |
| Team-hours/day | 15.0 | 17.5 | 20.0 |
| Gross team-hours/week | 75.0 | 87.5 | 100.0 |

The 75–100 hours are the team's **total project capacity**, not coding-only capacity. Analysis, prompting, review, testing, integration, deployment, project management, meetings, and documentation all consume the same pool.

### 2.1 Provisional allocation envelope

Until actual time logs are available, the following allocation is used for pilot planning only:

| Activity | Provisional share | Minimum hours/week | Maximum hours/week |
|---|---:|---:|---:|
| Story analysis, prompting, and implementation supervision | 55% | 41.25 | 55.00 |
| Peer review, acceptance, and regression testing | 25% | 18.75 | 25.00 |
| Integration, CI/CD, deployment, and environment work | 10% | 7.50 | 10.00 |
| Project management and documentation | 10% | 7.50 | 10.00 |
| **Total** | **100%** | **75.00** | **100.00** |

This allocation is not a productivity claim. It must be replaced by observed time distribution after the pilot.

## 3. Skills and Role Constraints

| Attribute | Current position | Planning implication |
|---|---|---|
| Primary capability | All five members are basic-to-intermediate full-stack developers | Work can be rotated, but complex security, data, and deployment changes require extra review |
| Specialist roles | None formally assigned | PM, review, QA, integration, and deployment ownership must be named before the pilot |
| AI-assisted implementation | Team expects AI to generate approximately 90% of code | Treat as a hypothesis; measure human touch time, rework, and defect rate |
| Review independence | Reviewers come from the same five-person team | Reviewing time cannot also be counted as implementation capacity |
| Academic availability | Members work part-time alongside coursework | Daily availability and exam conflicts must be recorded in the resource calendar |

## 4. AI and Machine Capacity

| Cohort | Members | Product surface | Model assumption | Machines | Sessions/member | Theoretical sessions |
|---|---:|---|---|---:|---:|---:|
| OpenAI cohort | 2 | Codex desktop/CLI through ChatGPT Plus | GPT-5.6 Sol | 2 | 2 | 4 |
| Google cohort | 3 | Antigravity through Google AI Pro student access | Gemini 3.1 Pro | 3 | 3 | 9 |
| **Total** | **5** | Mixed provider | Mixed model | **5** | — | **13** |

Thirteen is a theoretical tool limit stated by the team. It is not the starting WIP limit and is not equivalent to thirteen developers. Provider allowances, machine load, story dependencies, merge conflicts, and five-person review capacity may reduce usable concurrency.

## 5. Initial WIP and Concurrency Baseline

| Resource constraint | Initial baseline |
|---|---:|
| Active implementation stories | Maximum 5 |
| Active implementation stories/member | Maximum 1 |
| Human review queue | Maximum 3 awaiting review |
| Integration changes | 1 shared integration change at a time |
| Controlled deployments | 1 at a time |
| Additional agent sessions | Permitted only as controlled C2/C3 experiment |

The concurrency stages are:

- C1: up to 5 active agent sessions;
- C2: up to 8, only if downstream queues and quality remain stable;
- C3: up to 13, only if account limits and work independence permit.

## 6. Capacity Accounting Rules

1. Human hours are recorded once, by activity and story.
2. Waiting for an agent is elapsed time, not automatically human effort; active supervision is human effort.
3. Multiple agent sessions do not add human hours unless a person actively supervises them.
4. Review, test, integration, PM, and documentation hours are not hidden inside a generic development total.
5. A story contributes to delivered capacity only after reaching `Accepted Done`.
6. Subscription-included usage and paid credits are recorded separately.
7. Google student access is zero incremental cash cost but remains a dependency with expiry, quota, and fallback-cost risk.
8. Provider/model results remain labeled until evidence supports aggregation.

## 7. Capacity Risks

| Risk | Effect | Initial response |
|---|---|---|
| Review bottleneck | Agent output accumulates faster than humans can verify it | WIP limit and cross-review allocation |
| Shared-file/schema conflict | Parallel work produces merge and integration rework | Vertical story slicing, contracts, worktrees, one integration lane |
| Usage allowance exhausted | Sessions stop or require additional credits | Record limit events; maintain provider fallback; include conservative cost scenario |
| Preview model changes | Performance or availability changes during measurement | Record exact model identifier and date for every pilot run |
| No specialist ownership | Security, testing, or deployment work is missed | Assign rotating accountable owners before pilot start |
| Academic schedule variation | Weekly capacity falls below 75 hours | Maintain resource calendar and update forecast with actual availability |

## 8. Data Required to Finalize the Baseline

- Names or stable member IDs M1–M5;
- Project Manager and technical integration owner;
- primary reviewer/test owner and deployment owner for the pilot;
- daily availability windows and exam/leave constraints;
- observed hours by activity from the pilot;
- actual account usage limits and reset behavior;
- actual stable agent concurrency on each machine;
- demonstrated throughput, rework, and deployment success by provider cohort.

## 9. Approval Condition

This baseline becomes approved only after named ownership, the pilot resource calendar, and actual pilot capacity are available. Until then, 75–100 gross team-hours/week and five initial active implementation stories are planning assumptions.
