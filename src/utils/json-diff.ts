import * as JsonDiff from "json-diff-ts"

export function prepareObjToApplyChanges(obj: any, changes: JsonDiff.IChange[], path: string[] = []): any {
  changes.forEach((change) => {
    const { key } = change as any;

    // if (changeType === "UPDATE" && 'changes' in change && Array.isArray((change as any).changes)) {
    if ('changes' in change && Array.isArray((change as any).changes)) {
      // It's a branch change, recurse
      // Need to traverse: ensure obj[key] is an object
      if (!obj[key] || typeof obj[key] !== 'object' || obj[key] === null || Array.isArray(obj[key])) {
        obj[key] = {};
      }
      prepareObjToApplyChanges(obj[key], (change as any).changes, [...path, key]);
    } else {
      // It's a leaf change, no need to create structure
      // The skeleton just needs the parent objects to exist
      // If the key already exists (e.g., sibling of a leaf we'll add), respect it
    }
  });

  return obj;
}

export function buildSkeletonFromChanges(changes: JsonDiff.IChange[], path: string[] = []): any {
  return prepareObjToApplyChanges({}, changes, path);
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
