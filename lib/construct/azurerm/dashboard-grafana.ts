import { Construct } from 'constructs';
import { dashboardGrafana } from '@cdktf/provider-azurerm';

export interface DashboardGrafanaProps {
  name: string;
  location: string;
  tags?: { [key: string]: string };
  resourceGroupName: string;
  azureMonitorWorkspaceIntegrations: dashboardGrafana.DashboardGrafanaAzureMonitorWorkspaceIntegrations[];
}

export class DashboardGrafana extends Construct {
  public readonly dashboardGrafana: dashboardGrafana.DashboardGrafana;

  constructor(scope: Construct, id: string, props: DashboardGrafanaProps) {
    super(scope, id);

    // Resources
    this.dashboardGrafana = new dashboardGrafana.DashboardGrafana(
      this,
      'dashboard_grafana',
      {
        name: props.name,
        location: props.location,
        tags: props.tags,
        resourceGroupName: props.resourceGroupName,
        apiKeyEnabled: true,
        grafanaMajorVersion: '11',
        identity: {
          type: 'SystemAssigned',
        },
        azureMonitorWorkspaceIntegrations:
          props.azureMonitorWorkspaceIntegrations,
      },
    );
  }
}
