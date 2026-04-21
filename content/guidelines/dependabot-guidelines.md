# Dependabot Configuration and Usage Guidelines

## Overview

This document provides standardised guidance for configuring and managing Dependabot across Ministry of Justice repositories.
It aims to reduce PR noise, improve security posture and ensure teams manage dependency updates in a controlled and consistent way.

---

## Why Use Dependabot?

- **Security**: Automatically receive alerts and pull requests for known vulnerabilities in dependencies
- **Maintainability**: Keep dependencies up to date to reduce technical debt
- **Consistency**: Standardised configuration ensures all teams follow the same approach
- **Compliance**: Supports organisational policy for timely patching of third-party libraries

---

## Standard Configuration

### Recommended `dependabot.yml`

Place this file at `.github/dependabot.yml` in your repository:

```yaml
version: 2
updates:
  - package-ecosystem: "npm"
    directory: "/"
    schedule:
      interval: "daily"
    cooldown:
      default-days: 0
      semver-major-days: 14
      semver-minor-days: 7
      semver-patch-days: 2
    open-pull-requests-limit: 10
    reviewers:
      - "your-team-name"
    labels:
      - "dependencies"
    commit-message:
      prefix: "chore"
      include: "scope"
```

Adapt the `package-ecosystem` and `directory` fields to match your project. See [Supported Ecosystems](#supported-ecosystems) below.

### Multi-ecosystem Example

```yaml
version: 2
updates:
  - package-ecosystem: "npm"
    directory: "/"
    schedule:
      interval: "daily"
    cooldown:
      default-days: 0
      semver-major-days: 14
      semver-minor-days: 7
      semver-patch-days: 2
    labels:
      - "dependencies"
      - "npm"

  - package-ecosystem: "docker"
    directory: "/"
    schedule:
      interval: "daily"
    labels:
      - "dependencies"
      - "docker"

  - package-ecosystem: "github-actions"
    directory: "/"
    schedule:
      interval: "daily"
    labels:
      - "dependencies"
      - "github-actions"
```

---

## Security vs Version Updates

Dependabot handles two distinct types of updates:

### Security Updates (Alerts)

- Triggered automatically when a vulnerability is disclosed (via GitHub Advisory Database)
- **These bypass cooldown settings**, security PRs are always raised immediately
- Should be triaged and merged promptly
- Enable **Dependabot security updates** in your repository settings under _Settings → Code security and analysis_
(TODO: Is this already enabled for MOJ org at org level?)

### Version Updates

- Configured via `dependabot.yml` as described above
- Subject to cooldown and scheduling rules
- Focus on keeping dependencies current, not just secure
- Lower urgency than security updates

> **Recommendation**: Always enable both security updates _and_ version updates. Security updates catch known vulnerabilities;
version updates reduce the risk of falling so far behind that upgrades become painful.

---

## Configuration Options Explained

### Schedule

`daily` is the required default for all MoJ repositories. Longer intervals reduce the frequency at which version update PRs are generated,
which compounds dependency drift and delays awareness of newly available patches.

> **Important**: Schedule only affects version updates. Security alerts always bypass the schedule and are raised immediately regardless of this setting.
However, reducing schedule frequency increases the lag between a vulnerability being patched upstream and Dependabot raising a version update PR,
particularly relevant for dependencies not yet covered by the GitHub Advisory Database.

| Interval  | Guidance                                                                                                                                                    |
|-----------|-------------------------------------------------------------------------------------------------------------------------------------------------------------|
| `daily`   | **Required default.** Use for all repositories.                                                                                                             |
| `weekly`  | For purely development stage repositories only where daily checks add no practical value.                                                                   |
| `monthly` | **Strongly discouraged.** A 30-day check window is incompatible with the 48-hour security response target. Do not use for any actively maintained ecosystem.|

**The only justification for a non-`daily` schedule on application dependencies** is that the repository is not yet a live product and exists solely
in a development environment with no external exposure. Even then, `weekly` is the maximum acceptable interval. `monthly` should not be used.
Once a service moves toward production, the schedule must revert to `daily`.

Team bandwidth and PR noise are **not** valid justifications for longer schedules. Use [cooldown settings](#cooldown-strategy) and
[grouping](#grouping-related-updates) to manage volume without sacrificing visibility.

### Cooldown Strategy

The cooldown feature prevents Dependabot from immediately raising PRs for every new release, reducing noise while still keeping dependencies current.

| Cooldown Setting       | Days | Rationale                                                                                                   |
|------------------------|------|-------------------------------------------------------------------------------------------------------------|
| `default-days`         | 0    | No delay by default, security updates are raised immediately.                                               |
| `semver-major-days`    | 14   | Major versions may contain breaking changes; allow time for community feedback and changelogs to stabilise. |
| `semver-minor-days`    | 7    | Minor versions are generally backwards-compatible but benefit from a short stabilisation period.            |
| `semver-patch-days`    | 2    | Patches are low-risk but a brief delay helps avoid churn from rapid successive releases.                    |

### PR Limits

`open-pull-requests-limit` caps the number of concurrent open Dependabot version update PRs. It is a throttle on remediation throughput,
not on vulnerability discovery, lowering it does not reduce how many outdated or vulnerable dependencies you have,
it only delays when PRs are raised for them.

> **Hidden danger**: When the limit is reached, Dependabot stops opening new version update PRs entirely until existing ones are merged or closed.
Security alerts are subject to a separate internal limit of 10 and are unaffected. But any version update PRs that would have surfaced a
vulnerable dependency before an advisory is published will be silently queued.

#### Risk Trade-off

| Setting      | Risk                                                                                                                          |
|--------------|-------------------------------------------------------------------------------------------------------------------------------|
| **Too high** | Reviewer overload: PRs pile up, triage discipline breaks down, and important updates get lost in the backlog                  |
| **Too low**  | Remediation is silently delayed: new vulnerabilities may go unnoticed longer if the queue is full when Dependabot next checks |

#### MoJ Recommendations

`open-pull-requests-limit` is set **per `package-ecosystem` entry**, not globally. A repository with `npm`, `docker`, and `github-actions` each
at the default limit of 10 can have up to 30 open Dependabot PRs at once. Factor this in when deciding limits across multiple ecosystems.

| Ecosystem Type                                                                    | Recommended Limit per Entry                                                            |
|-----------------------------------------------------------------------------------|----------------------------------------------------------------------------------------|
| Application ecosystems (`npm`, `pip`, `bundler`, etc.)                            | **10** (default): high release cadence warrants full visibility                        |
| Infrastructure / low-cadence ecosystems (`docker`, `terraform`, `github-actions`) | **5–10**: fewer releases; lower limit is sufficient without risk of silencing updates  |
| Monorepo with multiple directories per ecosystem                                  | **15–20**: each directory generates its own PRs within the same ecosystem entry        |

As a rule of thumb: if your total open PR count across all ecosystems regularly exceeds what your team can triage in a week,
the solution is [grouping](#grouping-related-updates) and [cooldown settings](#cooldown-strategy), not reducing limits.
Reducing limits silently queues updates rather than making them visible.

Do not set any ecosystem entry below **5**. If the current limit feels overwhelming, the correct response is to improve triage cadence,
use [grouping](#grouping-related-updates) or adjust [cooldown settings](#cooldown-strategy), not to reduce the limit further.

---

## Supported Ecosystems

Configure a separate entry under `updates` for each ecosystem used in your project:

| Ecosystem         | `package-ecosystem` value | Common directory |
|-------------------|---------------------------|------------------|
| npm / Yarn        | `npm`                     | `/`              |
| Bundler (Ruby)    | `bundler`                 | `/`              |
| pip (Python)      | `pip`                     | `/`              |
| Docker            | `docker`                  | `/`              |
| GitHub Actions    | `github-actions`          | `/`              |
| Terraform         | `terraform`               | `/`              |
| NuGet (.NET)      | `nuget`                   | `/`              |
| Go modules        | `gomod`                   | `/`              |
| Composer (PHP)    | `composer`                | `/`              |

### Configuring `directory` Carefully

> **Warning**: `directory` is exclusive, not a starting point. Setting `directory: "/xyz"` means Dependabot **only** scans that path.
Any dependency manifests outside it receive no version updates and no security update PRs silently.

This is one of the highest-impact, lowest-visibility risks in Dependabot configuration. It is particularly dangerous in:

- **Monorepos**: multiple `package.json`, `requirements.txt`, or `pom.xml` files across services; only the configured path is scanned
- **Infrastructure directories**: `/.github/workflows`, `/terraform`, `/docker` are frequently omitted and receive no coverage unless explicitly configured
- **Polyglot repositories**: different ecosystems in different subdirectories each require their own entry

The result is a false sense of security: Dependabot appears enabled, but large portions of the repository are entirely unmonitored.

**For repositories with dependencies in multiple locations, add an entry per directory:** (TODO: verify monorepo config)

```yaml
updates:
  - package-ecosystem: "npm"
    directory: "/"
  - package-ecosystem: "npm"
    directory: "/services/api"
  - package-ecosystem: "npm"
    directory: "/services/web"
```

Limiting `directory` scope is only justified for gradual rollout on large legacy repositories, experimental sub-projects, or
vendored third-party code. In those cases the omission must be documented with a review date, treated the same way as an `ignore` rule.
Treat any repository where the number of configured directories is fewer than the number of directories containing dependency manifests as a security
finding requiring justification.

---

## How to Manage Dependabot PRs

### Triage Process

1. **Review the changelog and diff**: Understand what changed in the dependency
2. **Check the version type** using [Semantic Versioning](https://semver.org/):
   - **Patch** (e.g. 1.0.0 → 1.0.1): Bug fixes. Generally safe to merge after CI passes.
   - **Minor** (e.g. 1.0.0 → 1.1.0): New features, backwards-compatible. Review changelog, merge after CI passes.
   - **Major** (e.g. 1.0.0 → 2.0.0): Breaking changes possible. Requires careful review, testing, and potentially code changes.
3. **Ensure CI passes**: All automated tests and checks must be green before merging
4. **Perform smoke testing** for major updates: Verify core functionality is not broken ([What is smoke testing?](https://testlio.com/blog/smoke-testing-qa/))

### Merging Strategy

| Update Type     | Action                                                                                       |
|-----------------|----------------------------------------------------------------------------------------------|
| Security patch  | Merge as soon as CI passes. Treat as high priority.                                          |
| Patch           | Merge promptly after CI passes. Low risk.                                                    |
| Minor           | Review changelog. Merge after CI passes and brief review.                                    |
| Major           | Review changelog thoroughly. Test in a staging/preview environment. May require code changes.|

### Handling Noisy or Unwanted PRs

> **Warning**: Suppressing Dependabot PRs reduces your security visibility. `ignore`, `allow` and similar rule use should be rare,
deliberate and always temporary. Choose [grouping](#grouping-related-updates) and cooldown settings to manage PR volume.

#### When Ignoring an Update May Be Temporarily Justified

The vast majority of Dependabot PRs should be reviewed and merged. Ignoring or closing without merging is only warranted in a small number of scenarios:

| Scenario                                           | Justification                                                                                                                                    | Action                                                                                     |
|----------------------------------------------------|--------------------------------------------------------------------------------------------------------------------------------------------------|--------------------------------------------------------------------------------------------|
| **Confirmed breaking incompatibility**             | A version has been tested and breaks the application in a documented way; a fix is actively in progress.                                         | Ignore the specific breaking version range only. Remove the rule once the fix is in place. |
| **Internal fork or vendored package**              | You maintain a patched fork of a dependency; upstream updates would silently overwrite your security fixes.                                      | Ignore the package until the fork is reconciled or upstreamed.                             |
| **Active migration in progress**                   | The package is being replaced, raising PRs for the old package adds noise with no security benefit.                                              | Ignore the deprecated package for the duration of the migration only.                      |
| **Rapid release churn with no security relevance** | A package releases multiple patch versions within days (e.g. documentation or CI fixes). Use cooldown settings first; `ignore` is a last resort. | Ignore a narrow version range briefly while churn settles. Remove within days.             |

**What must never be ignored:**

- Any update raised as a **security alert**, these bypass cooldown by design and ignoring them creates a blind spot
- Updates you consider low-risk based on assumption, exploitability assessments change
- Major version updates purely to avoid review effort, use the cooldown and triage process instead

#### How to Use `ignore` Safely

When `ignore` is genuinely required, every entry must include a comment explaining the justification and a target removal date.
Undocumented `ignore` rules should be treated as stale and removed.

```yaml
updates:
  - package-ecosystem: "npm"
    directory: "/"
    schedule:
      interval: "daily"
    ignore:
      # REASON: v3.x breaks our custom session handling middleware (see issue #412).
      # Migration tracked in issue #415. Remove this rule once #415 is merged.
      # REVIEW BY: 2026-06-01
      - dependency-name: "express-session"
        versions: [">=3.0.0"]

      # REASON: Migrating away from 'request' to 'axios' (tracked in issue #389).
      # No security benefit in updating the package being replaced.
      # REVIEW BY: 2026-05-15
      - dependency-name: "request"
        versions: [">=3.0.0"]
```

#### PR comment based ignore and unignore

For one-off dismissals on a specific PR without modifying `dependabot.yml`, use PR comments:

| Command                                 | Effect                                         |
|-----------------------------------------|------------------------------------------------|
| `@dependabot ignore this major version` | Ignores this major version only                |
| `@dependabot ignore this minor version` | Ignores this minor version only                |
| `@dependabot ignore this dependency`    | Ignores all future updates (**use sparingly**) |

To reverse a PR comment dismissal, comment on any open or closed Dependabot PR for that package:

| Command                                   | Effect                                 |
|-------------------------------------------|----------------------------------------|
| `@dependabot unignore this major version` | Resumes updates for this major version |
| `@dependabot unignore this minor version` | Resumes updates for this minor version |
| `@dependabot unignore this dependency`    | Resumes all updates for the dependency |

Prefer PR comment dismissals over `dependabot.yml` entries for short-lived or one-off cases, as they are easier to audit and reverse via `unignore`.
See the [full list of Dependabot PR comment commands](https://docs.github.com/en/enterprise-server@3.19/code-security/reference/supply-chain-security/dependabot-pull-request-comment-commands#commands-for-grouped-version-updates).

#### Avoiding `allow` and When It May Be Acceptable

> **Warning**: `allow` creates security blind spots by design. Any dependency not matched by an `allow` rule will receive **no** security update PRs.
Avoid it unless you have a specific, documented reason.

The default Dependabot behaviour is updating all dependencies which is the most secure posture. `allow` inverts this into an opt-in model,
meaning newly added dependencies are silently excluded from updates until the allowlist is manually updated.

The only scenarios where `allow` may be acceptable at MoJ are:

- **Gradual adoption on a legacy repository**: A repo with a large number of severely outdated dependencies may be impractical to onboard all at
once. An explicit allowlist of a small, manageable set of packages can help teams build the practice incrementally, provided there is a tracked
plan to expand coverage and remove the restriction.
- **Compliance or change-controlled environments**: Where policy requires an auditable, explicit record of which third-party components are
actively maintained, `allow` makes that boundary visible in config-as-code. Prefer `dependency-type`-based rules (e.g. `direct`) over named
allowlists, as named lists require active maintenance whenever new dependencies are added.

In both cases, every `allow` rule must include a comment with a justification and a target removal or review date:

```yaml
updates:
  - package-ecosystem: "npm"
    directory: "/"
    schedule:
      interval: "daily"
    allow:
      # REASON: Gradual Dependabot adoption starting with direct production deps only.
      # Expand to include all dependency types once backlog is cleared.
      # REVIEW BY: 2026-08-01
      - dependency-type: "production"
```

Audit `allow` rules at the same time as `ignore` rules. Both represent deliberate gaps in your update coverage.

---

## Grouping Related Updates

Grouping combines multiple dependency updates into a single PR, reducing review burden. Used well, it improves efficiency. Used poorly, it can
obscure which dependency fixes a vulnerability and make PRs harder to reason about in terms of responsibility and isolation for tests.

### Security Impact

| Aspect      | Detail                                                                                                                                |
|-------------|---------------------------------------------------------------------------------------------------------------------------------------|
| **Benefit** | Fewer PRs to review, easier to batch low-risk updates                                                                                 |
| **Risk**    | A group PR can bury a security fix alongside unrelated changes, making it harder to identify, triage promptly, or revert in isolation |

> **Note**: Dependabot will not group security updates with non-security updates by default. However, if a grouped version update PR happens to
include a dependency with a known vulnerability, that vulnerability fix is not treated with the same urgency as a standalone security alert.
Keep groups small and predictable.

### Anti-pattern: One Giant Group

Avoid grouping all dependencies together. It creates large, difficult-to-review PRs, makes changelogs hard to interpret, and increases the
risk of a security fix being delayed or missed.

```yaml
# ❌ Avoid, this obscures changes, hard to revert individual updates
groups:
  all-dependencies:
    patterns:
      - "*"
```

### Recommended Grouping Strategy

Group by **purpose and risk level**, keeping groups small and predictable:

- **By dependency type**: separate production from development dependencies; production changes warrant closer scrutiny
- **By tooling family**: linting, testing, and build tools change together and are low-risk to group
- **By semver level**: keep major updates out of groups; they require individual review

```yaml
updates:
  - package-ecosystem: "npm"
    directory: "/"
    schedule:
      interval: "daily"
    groups:
      # Low-risk: dev tooling only, patch and minor updates
      linting:
        dependency-type: "development"
        patterns:
          - "eslint*"
          - "prettier*"
        update-types:
          - "minor"
          - "patch"

      # Low-risk: test tooling, patch and minor updates
      testing:
        dependency-type: "development"
        patterns:
          - "jest*"
          - "@testing-library/*"
        update-types:
          - "minor"
          - "patch"

      # Moderate-risk: all other dev dependencies, patch only
      dev-dependencies:
        dependency-type: "development"
        update-types:
          - "patch"

      # ⚠️ Production dependencies are NOT grouped here, those need to be reviewed individually
```

### MoJ Grouping Guidance

- **Do not group production dependencies** unless the team has a well-established, fast triage process. The risk of a security fix being
delayed in a batch PR is too high.
- **Do not group major version updates**: these require individual changelogs review and may need code changes.
- **Known-vulnerable dependencies must never be grouped**: if a dependency has an open security alert, its fix PR should be standalone
and treated as high priority regardless of any grouping rules.
- Keep group names descriptive so PR titles are immediately meaningful to reviewers.

---

## Versioning Strategy

The `versioning-strategy` option controls how Dependabot edits your manifest files when raising a version update PR. It is
supported by most application ecosystems (`npm`, `pip`, `bundler`, `cargo`, `composer`, etc.) but not infrastructure ecosystems like Docker or Terraform.

The default behaviour (`auto`) is appropriate for the vast majority of repositories and should not be changed without a specific reason.

| Strategy                | Behaviour                                                                                                 | Use Case                                                                        |
|-------------------------|-----------------------------------------------------------------------------------------------------------|---------------------------------------------------------------------------------|
| `auto`                  | Differentiates between apps and libraries; increases minimum version for apps, widens range for libraries | **Default. Use for all repositories unless there is a specific reason not to.** |
| `increase`              | Always increases the minimum version requirement to match the new version                                 | Apps where you want to prevent accidental downgrades                            |
| `increase-if-necessary` | Leaves the requirement unchanged if it already satisfies the new version                                  | Libraries with broad version ranges                                             |
| `widen`                 | Widens the allowed range to include both old and new versions                                             | Libraries where consumers need flexibility                                      |
| `lockfile-only`         | Only updates the lockfile; never changes the manifest                                                     | **Strongly discouraged — see below**                                            |

### Avoid `lockfile-only`

> **Warning**: `lockfile-only` is the most dangerous versioning strategy from a security perspective and should not be used in MoJ repositories.

With `lockfile-only`, Dependabot updates the resolved version in the lockfile but never changes the version constraint in the
manifest (e.g. `package.json`).
This means:

- The manifest continues to allow the old, potentially vulnerable version range
- Any developer running a fresh install without a lockfile (e.g. in CI, a new environment, or after a lockfile conflict resolution) may resolve to a
vulnerable version
- The security fix is fragile and it exists only in the lockfile and can be silently lost

The only scenario where `lockfile-only` is marginally acceptable is a **short-term, explicitly tracked tactical decision** during a complex
dependency resolution problem, with a tracked issue to remove it. It must never be used as a permanent configuration.

If the concern is avoiding manifest churn, use `increase-if-necessary` instead, it only updates the manifest when the existing constraint
would not satisfy the new version.

---

## Private Registries and Credentials

Dependabot supports a top-level `registries` block in `dependabot.yml`, allowing it to authenticate with private package registries (e.g. GitHub Packages,
AWS CodeArtifact, Artifactory) when fetching dependencies.

### Why Centralise Registry Configuration

Per-repo registry credentials are a common source of configuration drift and credential leakage. Centralising registry config at the organisation level:

- Reduces duplication and the risk of credentials being hardcoded inconsistently across repositories
- Ensures all repositories authenticate to the same trusted sources
- Makes it easier to rotate credentials in a single place rather than across dozens of repos

### Use OIDC Where Possible

GitHub supports **OIDC (OpenID Connect) authentication for Dependabot**, which removes the need for long-lived static credentials (e.g. PATs or passwords)
entirely.
With OIDC, Dependabot requests short-lived tokens at runtime, scoped to the operation, with no secret stored in the repository or organisation settings.

> **Recommendation**: Prefer OIDC authentication for any registry that supports it. Static credentials (tokens, passwords) must be stored as
[Dependabot secrets](https://docs.github.com/en/code-security/dependabot/working-with-dependabot/configuring-access-to-private-registries-for-dependabot#storing-credentials-for-dependabot-to-use)
 — never hardcoded in `dependabot.yml`.

### Example: Private npm Registry with a Token Secret

```yaml
version: 2
registries:
  npm-internal:
    type: npm-registry
    url: https://npm.pkg.github.com
    # Store the token in Settings → Secrets → Dependabot secrets, not inline
    token: ${{ secrets.DEPENDABOT_NPM_TOKEN }}

updates:
  - package-ecosystem: "npm"
    directory: "/"
    schedule:
      interval: "daily"
    registries:
      - npm-internal
```

If your organisation uses a centralised registry configuration managed at org level, individual repositories should reference org-level Dependabot
secrets rather than creating per-repo duplicates. Audit registry entries and rotate secrets on the same cadence as other service credentials.

---

## Good Practices: Pull Request Metadata

Configuring pull request metadata correctly is one of the highest-leverage things an organisation can do with Dependabot.
It determines whether PRs are visible, triaged promptly, and reviewed by the right people.

### Labels

Dependabot always adds a `dependencies` label and an ecosystem label (e.g. `npm`, `github-actions`) by default.
It also adds `major`, `minor`, or `patch` labels if those labels exist in the repository.

**Repositories MUST retain** the `dependencies` and ecosystem labels. **Repositories SHOULD** create `major`, `minor`, and `patch` labels to enable filtering
and automation. Additional labels can be configured per ecosystem:

```yaml
labels:
  - "dependencies"
  - "security-update"
```

Labels integrate cleanly with GitHub Actions workflows, project boards, and metrics pipelines, making them the primary mechanism for routing and prioritising
Dependabot PRs at scale.

### Assignees

Dependabot PRs have no assignees by default. Individual assignees can be added in `dependabot.yml`, but teams cannot be assigned this way. Do **not** rely on
assignees for ownership at scale. Assigning individuals increases PR abandonment risk and does not survive team changes. Use assignees only for documented
security on-call rotations. Prefer CODEOWNERS for all other ownership.

### Reviewers: Use CODEOWNERS

> **Important**: GitHub removed the `reviewers:` option from `dependabot.yml` in 2025. Repositories must use **CODEOWNERS** instead to assign reviewers
 to Dependabot PRs.

Every repository **MUST** have a valid `CODEOWNERS` file with team-based ownership (not individual usernames where avoidable). This ensures Dependabot PRs:

- Trigger required reviews automatically
- Follow the same review path as human-authored PRs
- Integrate correctly with branch protection rules

Without CODEOWNERS, Dependabot PRs have no required reviewers and can be merged without appropriate oversight. This is a compliance and security risk,
 not just a process gap.

---

## Team Responsibilities

- **All teams** should enable Dependabot on their repositories
- **Repository maintainers** are responsible for triaging and merging Dependabot PRs in a timely manner
- **Security updates** should be addressed within **48 hours** where possible
- **Version updates** should be reviewed at least **weekly**
- Teams should assign a **rota or DRI (Directly Responsible Individual)** for Dependabot PR management to prevent a backlog

---

## Checklist for Adopting Dependabot

- [ ] Add `.github/dependabot.yml` to your repository
- [ ] Configure entries for all relevant package ecosystems
- [ ] Enable Dependabot security updates in repository settings
- [ ] Set appropriate cooldown values (use the recommended defaults above)
- [ ] Add labels and reviewers to ensure PRs are visible to the right people
- [ ] Establish a team process for triaging and merging Dependabot PRs
- [ ] Consider grouping strategies to reduce PR noise

---

## Further Reading

- [GitHub Dependabot Documentation](https://docs.github.com/en/code-security/dependabot)
- [Dependabot Configuration Options](https://docs.github.com/en/code-security/dependabot/dependabot-version-updates/configuration-options-for-the-dependabot.yml-file)
- [Semantic Versioning (semver.org)](https://semver.org/)

## Text style tests

> [!NOTE] this is a note

message

> [!TIP] this is a tip

message

> [!IMPORTANT] this is important

message

> [!CAUTION] this is a caution

message

> [!WARNING] this is a warning

message

<span style="color:red">Your Text</span>

$\color{red}{Text}$

$$\color{green}{\text{Your Green Message}}$$

$$ \colorbox{darkblue}{\color{white}{\textsf{  Test Banner  }}}$$

```diff
+ This line is green (added)
- This line is red (removed)
! This line is orange (warning)
# This line is gray (comment)
```

$$\colorbox{yellow}{\color{black}Warning: This has a background}$$

$\colorbox{yellow}{\color{black}Warning: This has a background continues on the same line, this is very long piece of text, which will span over
multiple lines. Bay Lake is a city in Orange County, Florida, United States. The population was 29 at the 2020 census.[7] It is named after a lake that
lies east of Magic Kingdom. All four of the Walt Disney World Resort theme parks, and one of Walt Disney World's two water parks, are in Bay Lake, though all
 Disney parks in the region have mailing addresses in nearby Lake Buena Vista. Bay Lake is one of two Florida municipalities inside the Central Florida
 Tourism Oversight District (formerly the Reedy Creek Improvement District) which also includes Walt Disney World, the other being Lake Buena Vista.
 Bay Lake is part of the Orlando–Kissimmee–Sanford Metropolitan Statistical Area. }$

$\fbox{\color{Grey}Warning: This has a background. Bay Lake is a city in Orange County, Florida, United States. The population was 29 at the 2020 census.[7]
 It is named after a lake that lies east of Magic Kingdom. All four of the Walt Disney World Resort theme parks, and one of Walt Disney World's two water
 parks, are in Bay Lake, though all Disney parks in the region have mailing addresses in nearby Lake Buena Vista. Bay Lake is one of two Florida
 municipalities inside the Central Florida Tourism Oversight District (formerly the Reedy Creek Improvement District) which also includes Walt Disney
 World, the other being Lake Buena Vista. Bay Lake is part of the Orlando–Kissimmee–Sanford Metropolitan Statistical Area.}$

<div style="background-color: yellow; color: black; padding: 8px; text-align: left;">
Warning: This has a background. Bay Lake is a city in Orange County, Florida, United States. The population was 29 at the 2020 census.[7]
It is named after a lake that lies east of Magic Kingdom. All four of the Walt Disney World Resort theme parks, and one of Walt Disney World's two
water parks, are in Bay Lake, though all Disney parks in the region have mailing addresses in nearby Lake Buena Vista.

Bay Lake is one of two Florida municipalities inside the Central Florida Tourism Oversight District (formerly the Reedy Creek Improvement District)
which also includes Walt Disney World, the other being Lake Buena Vista. Bay Lake is part of the Orlando–Kissimmee–Sanford Metropolitan Statistical Area.

</div>

$\colorbox{yellow}{\color{black}Warning: This has a background}$ continues on the same line
