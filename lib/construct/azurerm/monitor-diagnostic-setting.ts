import { Construct } from 'constructs';
import { monitorDiagnosticSetting } from '@cdktf/provider-azurerm';

export interface monitorDiagnosticSettingProps {
  name: string;
  targetResourceId: string;
  logAnalyticsWorkspaceId: string;
  enabledLog: monitorDiagnosticSetting.MonitorDiagnosticSettingEnabledLog[];
}

export class MonitorDiagnosticSetting extends Construct {
  public readonly monitorDiagnosticSetting: monitorDiagnosticSetting.MonitorDiagnosticSetting;
  constructor(
    scope: Construct,
    id: string,
    props: monitorDiagnosticSettingProps,
  ) {
    super(scope, id);

    // Resources
    this.monitorDiagnosticSetting =
      new monitorDiagnosticSetting.MonitorDiagnosticSetting(
        this,
        'monitor_diagnostic_setting',
        {
          name: props.name,
          targetResourceId: props.targetResourceId,
          logAnalyticsWorkspaceId: props.logAnalyticsWorkspaceId,
          enabledLog: props.enabledLog,
        },
      );
  }
}
