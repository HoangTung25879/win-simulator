export type CompleteAction = "rename" | "updateUrl";

export type NewPath = (
  fileName: string,
  buffer?: Buffer,
  completeAction?: CompleteAction,
) => Promise<string>;
