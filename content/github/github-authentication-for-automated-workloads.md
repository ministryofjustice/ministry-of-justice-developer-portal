# GitHub authentication for automated workloads

How to choose between `GITHUB_TOKEN`, Octo STS and GitHub Apps, with personal access tokens (PATs) reserved for limited edge cases.

## Summary

When an automated workload needs to authenticate with GitHub, use the following order of preference:

| Preference | Authentication method | Use when |
| --- | --- | --- |
| 1 | `GITHUB_TOKEN` | The workflow only needs access to its own repository |
| 2 | Octo STS | The workload needs authenticated access to other repositories |
| 3 | Dedicated GitHub App | `GITHUB_TOKEN` or Octo STS cannot meet the need |
| 4 | PAT | Edge cases only |

Use the option that gives the workload only the permissions and repository access it needs.

## Use `GITHUB_TOKEN` for the workflow repository

Use the built-in [`GITHUB_TOKEN`](https://docs.github.com/en/actions/tutorials/authenticate-with-github_token) when a GitHub Actions workflow only needs to access the repository containing the workflow.

Set only the permissions the workflow needs, for example:

```yaml
permissions:
  contents: read
```

The `GITHUB_TOKEN` is limited to the repository containing the workflow, so you cannot normally use it for cross-repository access.

## Use Octo STS for cross-repository access

Use [Octo STS](https://github.com/octo-sts/app) when an automated workload needs authenticated access to GitHub and can use OpenID Connect (OIDC) to identify itself.

For GitHub Actions, Octo STS should be the default option for cross-repository access when it supports the permissions the workflow needs. Check the [GitHub permissions available through Octo STS](https://github.com/octo-sts/app#octo-sts-github-permissions) before using it.

You can use Octo STS with public, internal and private repositories.

For example, you can use it to:

- check out another repository
- read shared configuration
- update another repository
- create pull requests in another repository
- make API requests for another repository

Octo STS exchanges the workload identity for a short-lived GitHub App token. You can restrict access to specific workloads, repositories and GitHub permissions through an [Octo STS trust policy](https://github.com/octo-sts/app#the-trust-policy), without storing a PAT or GitHub App private key.

You may not need authentication for read-only access to a public repository.

## Use a dedicated GitHub App for more complex integrations

Use a dedicated GitHub App when the other authentication options in this guidance cannot meet the needs of the workload.

For example, use a dedicated GitHub App if:

- the workload needs a GitHub [permission](https://github.com/octo-sts/app#octo-sts-github-permissions) that is not available through Octo STS
- the integration needs GitHub webhooks
- the workload needs its own application identity
- the workload does not fit the Octo STS trust model

A repository being private or internal is not by itself a reason to create a GitHub App.

## Use PATs only for limited edge cases

You should not normally use PATs for long-lived machine-to-machine authentication.

A PAT may be appropriate for short-lived testing or where the preferred authentication options cannot meet the needs of the workload.

If you use a PAT, use a fine-grained PAT where possible. Give it only the repository access and permissions it needs and set an appropriate expiry.

## Requesting a GitHub App

If, after reviewing this guidance, you need a GitHub App, raise an issue using this [template]().

The template will collect the information the Developer Experience team needs to review your request and create the app.