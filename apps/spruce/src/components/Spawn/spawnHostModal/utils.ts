import { SpawnTaskQuery } from "gql/generated/types";
import { FormState } from "./types";

const daysInWeek = 7;
const hoursInDay = 24;
const minimumUptimeHours = (daysInWeek - 1) * hoursInDay;
const suggestedUptimeHours = (daysInWeek - 2) * hoursInDay;

export const validateTask = (taskData: SpawnTaskQuery["task"]) => {
  const {
    buildVariant,
    displayName: taskDisplayName,
    revision,
  } = taskData || {};
  return taskDisplayName && buildVariant && revision;
};

export const validateSpawnHostForm = (
  {
    distro,
    expirationDetails,
    homeVolumeDetails,
    hostUptime,
    publicKeySection,
    region,
    setupScriptSection,
    userdataScriptSection,
  }: FormState,
  isMigration?: boolean,
) => {
  const hasDistro = !!distro?.value;
  const hasRegion = !!region;
  const hasPublicKey = publicKeySection?.useExisting
    ? !!publicKeySection?.publicKeyNameDropdown
    : !!publicKeySection?.newPublicKey;
  const hasValidPublicKeyName = publicKeySection?.savePublicKey
    ? !!publicKeySection?.newPublicKeyName
    : true;
  const hasValidUserdataScript = userdataScriptSection?.runUserdataScript
    ? !!userdataScriptSection?.userdataScript
    : true;
  const hasValidSetupScript = setupScriptSection?.defineSetupScriptCheckbox
    ? !!setupScriptSection?.setupScript
    : true;
  const hasValidHomeVolumeDetails =
    isMigration ||
    (homeVolumeDetails?.selectExistingVolume
      ? !!homeVolumeDetails?.volumeSelect
      : !!homeVolumeDetails?.volumeSize);
  const hasValidExpiration = expirationDetails?.noExpiration
    ? true
    : !!expirationDetails?.expiration;

  const hasValidUptimeSchedule = hostUptime
    ? validateUptimeSchedule(hostUptime)
    : true;

  return (
    hasDistro &&
    hasRegion &&
    hasPublicKey &&
    hasValidPublicKeyName &&
    hasValidUserdataScript &&
    hasValidSetupScript &&
    (distro?.isVirtualWorkstation ? hasValidHomeVolumeDetails : true) &&
    hasValidExpiration
  );
};

const validateUptimeSchedule = ({
  sleepSchedule,
  useDefaultUptimeSchedule,
}: FormState["hostUptime"]): boolean => {
  if (useDefaultUptimeSchedule) {
    return true;
  }

  const {
    enabledWeekdays,
    timeSelection: { endTime, runContinuously, startTime },
  } = sleepSchedule ?? {};
  const enabledWeekdaysCount = enabledWeekdays.filter((day) => day).length;
  const enabledHoursCount = runContinuously
    ? enabledWeekdaysCount * hoursInDay
    : enabledWeekdaysCount * getDailyUptime({ startTime, endTime });
  if (enabledHoursCount < suggestedUptimeHours) {
    // No error
    return true;
  }
  if (enabledHoursCount < minimumUptimeHours) {
    // Return warning based on whether runContinuously enabled
    const hourlySuggestion = runContinuously
      ? suggestedUptimeHours / daysInWeek
      : suggestedUptimeHours / enabledWeekdaysCount;
    const warning = `Consider running your host for ${hourlySuggestion} hours per day.`;
    return false;
  }
  // Return error based on whether runContinously enabled
  const hourlyRequirement = runContinuously
    ? minimumUptimeHours / daysInWeek
    : minimumUptimeHours / enabledWeekdaysCount;
  const error = `Please increase your host uptime to at least ${hourlyRequirement} hours per day.`;
  return false;
};

const getDailyUptime = ({ endTime, startTime }) => endTime - startTime;
