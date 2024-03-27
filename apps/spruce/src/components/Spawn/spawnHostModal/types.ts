export type FormState = {
  distro?: {
    adminOnly: boolean;
    isVirtualWorkstation: boolean;
    value: string;
  };
  region?: string;
  publicKeySection?: {
    useExisting: boolean;
    newPublicKey?: string;
    publicKeyNameDropdown?: string;
    savePublicKey?: boolean;
    newPublicKeyName?: string;
  };
  hostUptime?: {
    useDefault: boolean;
    sleepSchedule: {
      enabledWeekdays: boolean[];
      timeSelection: {
        startTime: string;
        endTime: string;
        runContinuously: boolean;
      };
    };
  };
  userdataScriptSection?: {
    runUserdataScript: boolean;
    userdataScript?: string;
  };
  setupScriptSection?: {
    defineSetupScriptCheckbox: boolean;
    setupScript?: string;
  };
  expirationDetails?: {
    noExpiration: boolean;
    expiration?: string;
  };
  homeVolumeDetails?: {
    selectExistingVolume: boolean;
    volumeSize?: number;
    volumeSelect?: string;
  };
  loadData?: {
    loadDataOntoHostAtStartup: boolean;
    runProjectSpecificSetupScript?: boolean;
    taskSync?: boolean;
    startHosts?: boolean;
  };
};
