export enum PatchPageQueryParams {
  MergeQueue = "mergeQueue",
  PatchName = "patchName",
  Statuses = "statuses",
  Page = "page",
  Limit = "limit",
  Hidden = "hidden",
  Requesters = "requesters",
}

export enum PatchStatus {
  Unconfigured = "unconfigured",
  Created = "created",
  Failed = "failed",
  Started = "started",
  // TODO EVG-20032: Remove legacy status
  LegacySucceeded = "succeeded",
  Success = "success",
  Aborted = "aborted",
}

export enum PatchTab {
  Tasks = "tasks",
  Changes = "changes",
  Parameters = "parameters",
  Downstream = "downstream-projects",
  TaskDuration = "task-duration",
  Configure = "configure",
}

export const ALL_PATCH_STATUS = "all";
