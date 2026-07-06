import { fileSystemDependency } from '../infrastructure/filesystem-dependency.mjs';

/**
 * Returns a sorted list of workflow files from .github/workflows.
 * @param {string} workflowsDirectory
 * @returns {string[]}
 */
export function listWorkflowFiles(workflowsDirectory) {
  if (!fileSystemDependency.existsSync(workflowsDirectory)) return [];

  return fileSystemDependency
    .readdirWithFileTypesSync(workflowsDirectory)
    .filter((entry) => entry.isFile())
    .map((entry) => entry.name)
    .filter((name) => /\.(ya?ml)$/i.test(name))
    .sort((a, b) => a.localeCompare(b));
}
