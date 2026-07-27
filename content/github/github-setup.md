# GitHub Starter Guide

This guide explains how to get set up with GitHub as a new starter at the Ministry of Justice. It covers account creation, joining
the MOJ organisation, and the core setup steps needed before you can start contributing to repositories.

---

## Creating a GitHub Account

You'll need your own personal GitHub account. Follow [GitHub's documentation](https://docs.github.com/en/get-started/start-your-journey/creating-an-account-on-github)
if you don't already have one, or [sign up directly](https://github.com/signup?source=login).

If you already have a GitHub account from before joining MOJ, you can choose to use it here or create a new one. Some people prefer
continuity with their previous work; others prefer to keep things separate.

Your GitHub account is **personal to you**, not something MOJ sets up or manages on your behalf. If you ever lose access, recovery
is on you, so it's worth getting the basics right from day one:

- Set up an authenticator app for two-factor authentication (2FA), and store your recovery codes somewhere safe
- Use a personal recovery email address, kept separate from your work email

---

## Joining the MOJ GitHub Organisation

If you have a `@digital.justice.gov.uk` or `@justice.gov.uk` email address, you can use Single Sign-On (SSO) to join the organisation:

- [Join the Ministry of Justice organisation](https://github.com/orgs/ministryofjustice/sso)
- [Join the MoJ Analytical Services organisation](https://github.com/orgs/moj-analytical-services/sso)

If you don't yet have a GitHub account, you'll be prompted to create one at the end of the SSO process. Add your work email as your
**primary email** address in GitHub once you're set up.

Once you join, you're automatically added to the `all-org-members` team (Ministry of Justice) or `everyone` team (MoJ Analytical
Services). This gives you access to a number of shared MOJ tools and platforms.

---

## Getting Repository Access

Organisation membership alone **does not** give you access to individual repositories. Repository-level access is managed by each
delivery team, either directly or via a GitHub team.

To request access to a specific repository:

1. Check the repository's README or CODEOWNERS file for the responsible team
2. Contact the team's Maintainer or Admin directly. If you're unsure who owns a repository, ask in `#ask-developer-experience`

Some teams manage onboarding access through a dedicated repository (for example, team-specific `-access` repos). Check your team's
onboarding documentation or your lead for the exact process.

---

## Setting Up the GitHub CLI (Optional but Recommended)

Install the [GitHub CLI](https://cli.github.com/) and authenticate:

```bash
gh auth login --git-protocol ssh --hostname github.com --web
```

Follow the prompts to complete authentication.

---

## Setting Up SSH

We recommend setting up SSH for cloning and signing commits.

- [Generating a new SSH key and adding it to the ssh-agent](https://docs.github.com/en/authentication/connecting-to-github-with-ssh/generating-a-new-ssh-key-and-adding-it-to-the-ssh-agent)
- [Adding a new SSH key to your GitHub account](https://docs.github.com/en/authentication/connecting-to-github-with-ssh/adding-a-new-ssh-key-to-your-github-account)
- [About commit signature verification](https://docs.github.com/en/authentication/managing-commit-signature-verification/about-commit-signature-verification)

We **require** Git commit signing for all repositories.

---

## Using GitHub Apps for Automation

If your team needs to authenticate GitHub Actions workflows (for example, for CI/CD or Terraform), MOJ recommends using a GitHub App
rather than a personal access token. See the existing runbook for full setup steps:

- [GitHub App Setup Guide](https://ministryofjustice.github.io/developer-experience-documentation/runbooks/github-app-setup.html)

---

## Development Workflow

MOJ teams generally follow GitHub flow, a branch-based development workflow. See [GitHub's documentation on GitHub flow](https://docs.github.com/en/get-started/using-github/github-flow)
for more detail.

General conventions:

- Create feature branches from `main`, not from other feature branches
- Open pull requests in draft mode for early feedback if useful
- Convert to ready for review once checks pass and feedback is addressed
- Write a clear, concise PR description with relevant context
- Check the repository's own contributing guidelines, as these may vary by team

---

## Third-Party Suppliers

If you're a third-party supplier maintaining code on behalf of the Ministry of Justice, you'll need to be added as an
**Outside Collaborator**. Being an outside collaborator is for third party suppliers who are maintaining code on behalf of the MoJ.

Outside Collaborators can only access specific repositories and are limited in what they can do within the MOJ organisation. They
are **not able** to access private repositories outside of the ones they've been assigned to.

Users **do not require** an MOJ email address to be added as an Outside Collaborator.

Repository Admins can add collaborators directly to their repositories. It is the **repository Admin's responsibility** to remove
collaborators when access is no longer required.

---

## Getting Help

- General GitHub access or SSO issues: `#ask-developer-experience` or `#ask-about-github`
- Team-specific access or repository questions: contact your team directly
- Something not covered here: `#developer-experience-alerts` or email <DeveloperExperienceTeam@justice.gov.uk>

---

## Additional Resources

- [GitHub Terms of Service](https://developer-portal.service.justice.gov.uk/github/terms-of-service)
- [MOJ GitHub Organisation](https://github.com/ministryofjustice)
- [GitHub Docs](https://docs.github.com)
