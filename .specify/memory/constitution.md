<!--
Sync Impact Report
==================
Version change: (template / unpopulated) → 1.0.0
Bump type: MINOR — first population; all principles are newly defined.

Modified principles: N/A (initial population from template)

Added sections:
  - I. Code Quality (new)
  - II. Testing Standards (new)
  - III. User Experience Consistency (new)
  - IV. Performance Requirements (new)
  - Quality Gates (new)
  - Development Workflow (new)
  - Governance (new)

Removed sections: N/A

Templates requiring updates:
  ✅ .specify/memory/constitution.md — this file, fully populated
  ✅ .specify/templates/spec-template.md — Success Criteria and User Scenarios
       sections already align with UX consistency and testing principles
  ✅ .specify/templates/tasks-template.md — optional test tasks note and TDD
       phase ordering already align with Principle II (Testing Standards)
  ⚠  .specify/templates/plan-template.md — Constitution Check section currently
       uses generic placeholder gates; owners should update example gates to
       reference the four principles defined here (Code Quality, Testing
       Standards, UX Consistency, Performance Requirements)

Deferred TODOs:
  - TODO(PROJECT_NAME): "Project" used as placeholder — confirm actual product
    name and update the title line if different.
-->

# Project Constitution

## Core Principles

### I. Code Quality

All code MUST meet a consistently high standard before merging into any shared
branch. Code reviews are MANDATORY for every pull request; self-merges are
prohibited.

- Linting and static analysis MUST pass with zero errors on every commit.
- Functions and modules MUST be small, singularly purposeful, and documented
  with inline comments wherever the intent is not self-evident.
- Dead code, commented-out blocks, and unresolved TODO markers MUST NOT be
  committed without a corresponding linked issue.
- Naming MUST be unambiguous — abbreviations and single-letter identifiers are
  only permitted in well-understood local scopes (e.g., loop indices).
- All public APIs MUST include documentation comments covering purpose,
  parameters, return values, and error cases.

**Rationale**: Consistently high code quality reduces cognitive load, prevents
defect accumulation, and keeps the codebase maintainable as the team and
codebase grow.

### II. Testing Standards (NON-NEGOTIABLE)

Test-Driven Development MUST be followed: tests are written and approved before
any implementation begins. The Red-Green-Refactor cycle is strictly enforced.

- Every new feature MUST have unit tests with ≥ 80 % line coverage on changed
  code and at least one integration test covering the primary user journey.
- All tests MUST be deterministic — flaky tests MUST be fixed or removed
  immediately and MUST NOT be suppressed or skipped indefinitely.
- No single test suite MUST exceed 10 minutes in CI.
- Contract tests MUST cover every inter-service or external API boundary before
  that boundary is used in production code.
- Test files MUST be co-located or mirrored in a parallel `tests/` tree that
  follows the same structure as `src/`.

**Rationale**: Tests are the primary safety net and the primary design tool.
Skipping or deferring them trades short-term velocity for long-term breakage
and rework costs that are always higher.

### III. User Experience Consistency

All user-facing surfaces MUST conform to the established design system
(tokens, components, interaction patterns, and copy guidelines).

- Error messages MUST be human-readable, actionable, and free of raw stack
  traces or internal error codes.
- Loading states, success confirmations, and failure feedback MUST follow
  consistent patterns across every screen and flow.
- All UI MUST meet WCAG 2.1 Level AA accessibility requirements as a minimum.
- Any UX change that affects more than one screen or alters an established
  interaction pattern MUST undergo a design review before implementation begins.
- Components MUST NOT be duplicated; reuse from the shared component library
  is REQUIRED before creating a new component.

**Rationale**: Consistent UX reduces user confusion, lowers support burden,
and builds product trust. Divergent patterns compound over time into a
fragmented experience that is expensive to unify retroactively.

### IV. Performance Requirements

Features MUST satisfy defined performance budgets before release:

- **API latency**: p95 response time ≤ 200 ms under expected load.
- **Frontend**: Time-to-Interactive ≤ 3 s on a median device at a 4G
  connection.
- **Regression threshold**: Any performance regression ≥ 10 % versus the
  established baseline MUST be treated as a build failure.

Additional rules:

- Profiling evidence MUST be provided before introducing a caching layer,
  background queue, or infrastructure-level optimization — premature
  optimization is prohibited.
- All performance-sensitive paths MUST include load and stress test coverage
  as part of the testing suite.
- Performance budgets MUST be reviewed and updated at each major milestone.

**Rationale**: Performance is a product feature that users perceive directly.
Treating budgets as hard gates prevents the gradual degradation that occurs
when regressions are deferred.

## Quality Gates

Every pull request MUST pass the following gates before merge:

| Gate | Requirement | Enforcement |
|------|------------|-------------|
| Lint & Static Analysis | Zero lint errors; all type checks pass | CI (automated) |
| Unit Tests | Coverage ≥ 80 % on changed code; zero new failures | CI (automated) |
| Integration Tests | All integration tests for affected stories pass | CI (automated) |
| Performance Baseline | No regression ≥ 10 % on measured benchmarks | CI (automated) |
| UX Review | UX-impacting changes reviewed against design system | Branch protection (manual) |
| Peer Review | At least one approval from a team member other than the author | Branch protection (manual) |

Automated gates MUST be enforced via CI pipeline on every push to a pull
request branch. UX and Peer Review gates MUST be enforced via branch protection
rules on the main branch.

## Development Workflow

1. **Specify** — Produce a feature spec using `/speckit.specify` before any
   design or code work begins.
2. **Plan** — Produce an implementation plan using `/speckit.plan`; the
   Constitution Check section of the plan MUST confirm compliance with all four
   principles.
3. **Test First** — Write failing tests that encode acceptance scenarios from
   the spec before writing any implementation code (Principle II).
4. **Implement** — Build the smallest implementation that makes the tests pass
   while satisfying all Quality Gates.
5. **Review** — Open a pull request; all Quality Gates MUST pass; obtain at
   least one peer review approval.
6. **Merge** — Squash-merge to the main branch using a conventional commit
   message (`feat:`, `fix:`, `docs:`, `perf:`, etc.).
7. **Monitor** — Validate key performance and error metrics in production within
   24 hours of deployment; roll back immediately if performance budgets are
   breached.

## Governance

This constitution supersedes all informal conventions and is the authoritative
reference for all project standards. In any conflict between this document and
a team convention, this document prevails.

**Amendment procedure**:
1. Open a pull request with the proposed change to this file.
2. Log the discussion and rationale in the PR description.
3. Obtain at least two maintainer approvals before merging.
4. Increment the version according to the versioning policy below.

**Versioning policy**:
- **MAJOR**: Backward-incompatible governance change — removal or fundamental
  redefinition of an existing principle.
- **MINOR**: New principle or section added, or material expansion of existing
  guidance.
- **PATCH**: Clarifications, wording improvements, typo fixes, or non-semantic
  refinements.

**Compliance**:
- All pull request plans MUST include a "Constitution Check" section confirming
  adherence to each active principle.
- Any deliberate non-compliance MUST be documented in the plan's Complexity
  Tracking table and approved by a maintainer before the work begins.
- This document MUST be reviewed at every major product milestone and at
  minimum once per quarter.

**Version**: 1.0.0 | **Ratified**: 2026-02-25 | **Last Amended**: 2026-02-25
