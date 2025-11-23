import * as JsonDiff from "json-diff-ts"

export function buildSkeletonFromChanges(changes: JsonDiff.IChange[], path: string[] = []): any {
  const skeleton: any = {};

  changes.forEach((change) => {
    const { key } = change as any;

    // if (changeType === "UPDATE" && 'changes' in change && Array.isArray((change as any).changes)) {
    if ('changes' in change && Array.isArray((change as any).changes)) {
      // It's a branch change, recurse
      skeleton[key] = buildSkeletonFromChanges((change as any).changes, [...path, key]);
    } else {
      // It's a leaf change, no need to create structure
      // The skeleton just needs the parent objects to exist
    }
  });

  return skeleton;
}

export function flattenChanges(changes: JsonDiff.IChange[], path: string[] = []): string[] {
  const result: string[] = [];

  changes.forEach((change) => {
    const { key, type: changeType, value } = change as any;
    const currentPath = [...path, key];

    if ('changes' in change && Array.isArray((change as any).changes)) {
      // It's a branch change, recurse
      result.push(...flattenChanges((change as any).changes, currentPath));
    } else {
      // It's a leaf change, format it
      const pathStr = currentPath.join('.');
      const valueStr = value !== undefined ? ` = ${JSON.stringify(value)}` : '';
      result.push(`${changeType} ${pathStr}${valueStr}`);
    }
  });

  return result;
}
