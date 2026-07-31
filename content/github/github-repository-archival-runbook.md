# GitHub repository archival runbook

This runbook provides a checklist for archiving a GitHub repository.
Archiving a repository makes it read-only and prevents any further changes, but it does not delete the repository or its contents.

## 1. confirm archiving is appropriate

Before archiving a repository, ensure that it is no longer actively maintained or needed for development. Consider the following mandatory and supporting signals

### Mandatory signals

1. verify no deployments or active development are occurring in the repository
2. verify in [cloud-platform](https://github.com/ministryofjustice/cloud-platform-environments/tree/main) the repository does not have any active resources
3. verify no CI/CD pipelines or workflows are actively running from the repository
4. verify that the repository is not a dependency for any other active projects or services

### Supporting signals

1. check if the repository has not had any commits to the main branch in the last 12 months
2. check if the repository has not had any pull requests merged in the last 12 months
3. check if the repository has any clear `CODEOWNERS` or maintainers listed, and if they are still active in the organization
4. check if the repository has any open issues or pull requests that have been inactive for a long time
5. check if the repository has any documentation or `README` files that indicate it is still in use or maintained

## 2. Pre-archival checklist

Once confirmed that archiving is appropriate, complete the following pre-archival checklist to minimize disruption and ensure information is preserved

1. confirm archival eligibility in line with the signals above
2. confirm no downstream dependencies exist that would be affected by archiving the repository
3. ensure `CODEOWNERS` is defined and up to date, and that all relevant stakeholders are aware of the archiving decision
4. close any open issues or pull requests, or communicate with contributors about the archiving plan
5. update the `README` or documentation to indicate that the repository is archived and no longer maintained
  5.1. include any relevant links to alternative resources or active repositories

## 3. Security and deactivation checklist

To ensure the process is carried out securely and that access is appropriately managed, complete the following security and deactivation checklist

1. remove all secrets associated with the repository, including GitHub Actions secrets and any other sensitive information
2. revoke any tokens, API keys, or credentials that are associated with the repository to prevent unauthorized access
3. disable GitHub Actions workflows to prevent any automated processes from running after the repository is archived
4. remove any webhooks or integrations that are connected to the repository to prevent external systems from interacting with it
5. decomission any associated services or applications that rely on the repository, ensuring that they are no longer active or accessible

## 4. Access control checklist

To ensure that access to the repository is appropriately managed after archiving, complete the following access control checklist

1. set repository visibility to private if it is currently public, to limit access to authorized users only
2. ensure no sensitive data or information is exposed in the repository before archiving, and remove any such data if necessary
3. restrict access to the repository by removing any unnecessary collaborators or teams, and ensure that only authorized personnel have access

## 5. Apply archival settings

Once the above checklists have been completed, apply the archival settings to the repository

1. apply the 'archive this repository' setting in the repository settings on GitHub. This will make the repository read-only and prevent any further changes
2. confirm the setting has been implemented and the repository is read-only by attempting to make a change or commit to the repository
  2.1. you should receive a message indicating that the repository is archived and cannot be modified

## 6. Post-archival checklist

After archiving the repository, complete the following post-archival checklist to ensure that all necessary information is preserved and that stakeholders are informed

1. ensure no workflows or automated processes are running from the repository after archiving, and that any scheduled tasks or cron jobs are disabled
2. the repository is non-operational and cannot be used for development or deployment, and that any attempts to access or modify the repository are blocked
3. the `CODEOWNERS` file reflects the current ownership and responsibilities for the archived repository
4. ensure all relevant stakeholders are aware of the archiving decision

## 7. Governance and compliance checklist

Post-archival, the repository should be reviewed on a quarterly basis to ensure that it remains compliant with organizational policies and governance standards
