import { Construct } from 'constructs';
import { logAnalyticsWorkspace } from '@cdktf/provider-azurerm';

export interface LogAnalyticsWorkspaceProps {
  name: string;
  location: string;
  tags?: { [key: string]: string };
  resourceGroupName: string;
  sku: string | undefined;
}

export class LogAnalyticsWorkspace extends Construct {
  public readonly logAnalyticsWorkspace: logAnalyticsWorkspace.LogAnalyticsWorkspace;
  constructor(scope: Construct, id: string, props: LogAnalyticsWorkspaceProps) {
    super(scope, id);

    // Resources
    this.logAnalyticsWorkspace =
      new logAnalyticsWorkspace.LogAnalyticsWorkspace(
        this,
        'log_analytics_workspace',
        {
          name: props.name,
          location: props.location,
          tags: props.tags,
          resourceGroupName: props.resourceGroupName,
          sku: props.sku,
          identity: {
            type: 'SystemAssigned',
          },
        },
      );
  }
}
