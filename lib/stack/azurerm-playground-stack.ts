import { Construct } from 'constructs';
import { TerraformStack, TerraformOutput } from 'cdktf';
import { provider } from '@cdktf/provider-azurerm';
import { ResourceGroup } from '../construct/azurerm/resource-group';
// import { MonitorDiagnosticSetting } from '../construct/azurerm/monitor-diagnostic-setting';
import { MonitorWorkspace } from '../construct/azurerm/monitor-workspace';
import { DashboardGrafana } from '../construct/azurerm/dashboard-grafana';
import { convertName, getRandomIdentifier, createBackend } from '../utils';

export interface AzurermPlaygroundStackProps {
  name: string;
  location: string;
  tags?: { [key: string]: string };
  resourceGroup: {};
  logAnalyticsWorkspace?: {
    location: string;
    sku: string | undefined;
  };
  monitorDiagnosticSetting?: {};
  monitorWorkspace?: {};
  dashboardGrafana?: {};
}

export const devAzurermPlaygroundStackProps: AzurermPlaygroundStackProps = {
  name: `Dev-AzurermPlaygroundStack-${getRandomIdentifier('Dev-AzurermPlaygroundStack')}`,
  location: 'japaneast',
  tags: {
    owner: 'ks6088ts',
  },
  resourceGroup: {},
  // ref. https://learn.microsoft.com/en-us/azure/ai-services/openai/concepts/models?tabs=global-standard%2Cstandard-chat-completions
  logAnalyticsWorkspace: {
    location: 'japaneast',
    sku: 'PerGB2018',
  },
  // FIXME: disable for now
  // monitorDiagnosticSetting: {},
  monitorWorkspace: {},
  dashboardGrafana: {},
};

export const prodAzurermPlaygroundStackProps: AzurermPlaygroundStackProps = {
  name: `Prod-AzurermPlaygroundStack-${getRandomIdentifier('Prod-AzurermPlaygroundStack')}`,
  location: 'japaneast',
  tags: {
    owner: 'ks6088ts',
  },
  resourceGroup: {},
};

export class AzurermPlaygroundStack extends TerraformStack {
  constructor(
    scope: Construct,
    id: string,
    props: AzurermPlaygroundStackProps,
  ) {
    super(scope, id);

    // Backend
    createBackend(this, id);

    // Providers
    new provider.AzurermProvider(this, 'azurerm', {
      features: [
        {
          resourceGroup: [
            {
              preventDeletionIfContainsResources: false,
            },
          ],
        },
      ],
    });

    // Resources
    const resourceGroup = new ResourceGroup(this, `ResourceGroup`, {
      name: `rg-${props.name}`,
      location: props.location,
      tags: props.tags,
    });
    new TerraformOutput(this, 'resource_group_name', {
      value: resourceGroup.resourceGroup.name,
    });

    // if (props.monitorDiagnosticSetting && logAnalyticsWorkspace) {
    //   for (const aiService of aiServicesArray) {
    //     const name = `MonitorDiagnosticSetting-${aiService.aiServices.name}`;
    //     new MonitorDiagnosticSetting(this, name, {
    //       name: name,
    //       targetResourceId: aiService.aiServices.id,
    //       logAnalyticsWorkspaceId:
    //         logAnalyticsWorkspace.logAnalyticsWorkspace.id,
    //       enabledLog: [
    //         {
    //           categoryGroup: 'Audit',
    //         },
    //       ],
    //     });
    //   }
    // }

    if (props.monitorWorkspace) {
      const monitorWorkspace = new MonitorWorkspace(this, `MonitorWorkspace`, {
        name: convertName(`mw-${props.name}`, 44),
        location: props.location,
        tags: props.tags,
        resourceGroupName: resourceGroup.resourceGroup.name,
      });

      if (props.dashboardGrafana) {
        new DashboardGrafana(this, `DashboardGrafana`, {
          name: convertName(`grafana-${props.name}`, 23),
          location: props.location,
          tags: props.tags,
          resourceGroupName: resourceGroup.resourceGroup.name,
          azureMonitorWorkspaceIntegrations: [
            {
              resourceId: monitorWorkspace.monitorWorkspace.id,
            },
          ],
        });
      }
    }
  }
}
