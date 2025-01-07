import { WaterfallVersionFragment } from "gql/generated/types";
import { WaterfallVersion } from "./types";

export const groupInactiveVersions = (
  versions: WaterfallVersionFragment[],
  versionHasActiveBuild: (version: WaterfallVersionFragment) => boolean,
  limit?: number,
) => {
  const filteredVersions: WaterfallVersion[] = [];
  let activeVersionsCount = 0;

  const pushInactive = (v: WaterfallVersionFragment) => {
    if (!filteredVersions?.[filteredVersions.length - 1]?.inactiveVersions) {
      filteredVersions.push({ version: null, inactiveVersions: [] });
    }
    filteredVersions[filteredVersions.length - 1].inactiveVersions?.push(v);
  };

  const pushActive = (v: WaterfallVersionFragment) => {
    activeVersionsCount += 1;
    filteredVersions.push({
      inactiveVersions: null,
      version: v,
    });
  };

  versions.forEach((version) => {
    if (limit && activeVersionsCount >= limit) {
      return;
    }
    if (version.activated && versionHasActiveBuild(version)) {
      pushActive(version);
    } else {
      pushInactive(version);
    }
  });

  return filteredVersions;
};
