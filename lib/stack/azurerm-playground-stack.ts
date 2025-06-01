import { Construct } from 'constructs';
import { TerraformStack, TerraformOutput } from 'cdktf';
import { provider } from '@cdktf/provider-azurerm';
import { UserAssignedIdentity } from '../construct/azurerm/user-assigned-identity';
// import { RoleAssignment } from '../construct/azurerm/role-assignment';
import { KeyVault } from '../construct/azurerm/key-vault';
import { ResourceGroup } from '../construct/azurerm/resource-group';
import { Iothub } from '../construct/azurerm/iothub';
import { VirtualNetwork } from '../construct/azurerm/virtual-network';
import { Subnet } from '../construct/azurerm/subnet';
import { VirtualMachine } from '../construct/azurerm/virtual-machine';
import { BastionHost } from '../construct/azurerm/bastion';
import { PrivateDnsZone } from '../construct/azurerm/private-dns-zone';
import { PrivateEndpoint } from '../construct/azurerm/private-endpoint';
// import { MonitorDiagnosticSetting } from '../construct/azurerm/monitor-diagnostic-setting';
import { MonitorWorkspace } from '../construct/azurerm/monitor-workspace';
import { EventgridNamespace } from '../construct/azurerm/eventgrid-namespace';
// import { EventgridDomain } from '../construct/azurerm/eventgrid-domain';
// import { EventgridDomainTopic } from '../construct/azurerm/eventgrid-domain-topic';
import { EventgridTopic } from '../construct/azurerm/eventgrid-topic';
// import { EventgridEventSubscription } from '../construct/azurerm/eventgrid-event-subscription';
import { EventhubNamespace } from '../construct/azurerm/eventhub-namespace';
import { Eventhub } from '../construct/azurerm/eventhub';
import { DashboardGrafana } from '../construct/azurerm/dashboard-grafana';
import { convertName, getRandomIdentifier, createBackend } from '../utils';

export interface AzurermPlaygroundStackProps {
  name: string;
  location: string;
  tags?: { [key: string]: string };
  resourceGroup: {};
  userAssignedIdentity?: {};
  roleAssignment?: {};
  logAnalyticsWorkspace?: {
    location: string;
    sku: string | undefined;
  };
  keyVault?: {
    skuName: string;
  };
  iothub?: {
    location: string;
    skuName: string;
    capacity: number;
  };
  virtualNetwork?: {};
  subnet?: {
    name: string;
    addressPrefixes: string[];
  }[];
  virtualMachine?: {
    vmSize: string;
  };
  bastionHost?: {
    sku: string;
  };
  privateDnsZone?: {};
  privateEndpoint?: {};
  monitorDiagnosticSetting?: {};
  monitorWorkspace?: {};
  eventgridNamespace?: {};
  eventgridDomain?: {
    inputSchema: string;
  };
  eventgridDomainTopic?: {};
  eventgridEventSubscription?: {
    eventDeliverySchema: string;
  };
  eventgridTopic?: {
    inputSchema: string;
  };
  eventhubNamespace?: {
    sku: string;
  };
  eventhub?: {
    messageRetention: number;
    partitionCount: number;
  };
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
  keyVault: {
    skuName: 'standard',
  },
  iothub: {
    location: 'japaneast',
    skuName: 'S1',
    capacity: 1,
  },
  // FIXME: disable for now
  // monitorDiagnosticSetting: {},
  monitorWorkspace: {},
  eventgridNamespace: {},
  eventgridDomain: {
    inputSchema: 'CloudEventSchemaV1_0',
  },
  eventgridDomainTopic: {},
  eventgridEventSubscription: {
    eventDeliverySchema: 'CloudEventSchemaV1_0',
  },
  eventgridTopic: {
    inputSchema: 'EventGridSchema',
  },
  eventhubNamespace: {
    sku: 'Standard',
  },
  eventhub: {
    messageRetention: 1,
    partitionCount: 2,
  },
  dashboardGrafana: {},
};

export const prodAzurermPlaygroundStackProps: AzurermPlaygroundStackProps = {
  name: `Prod-AzurermPlaygroundStack-${getRandomIdentifier('Prod-AzurermPlaygroundStack')}`,
  location: 'japaneast',
  tags: {
    owner: 'ks6088ts',
  },
  resourceGroup: {},
  userAssignedIdentity: {},
  roleAssignment: {},
  keyVault: {
    skuName: 'standard',
  },
  virtualNetwork: {},
  subnet: [
    {
      name: 'VmSubnet',
      addressPrefixes: ['10.240.0.0/16'],
    },
    {
      name: 'AzureBastionSubnet',
      addressPrefixes: ['10.241.0.0/16'],
    },
    {
      name: 'PrivateEndpointSubnet',
      addressPrefixes: ['10.242.0.0/16'],
    },
  ],
  virtualMachine: {
    vmSize: 'Standard_DS2_v2',
  },
  bastionHost: {
    sku: 'Basic',
  },
  privateDnsZone: {},
  privateEndpoint: {},
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

    let userAssignedIdentity: UserAssignedIdentity | undefined = undefined;
    if (props.userAssignedIdentity) {
      userAssignedIdentity = new UserAssignedIdentity(
        this,
        `UserAssignedIdentity`,
        {
          name: `uai-${props.name}`,
          location: props.location,
          tags: props.tags,
          resourceGroupName: resourceGroup.resourceGroup.name,
        },
      );
    }

    let keyVault: KeyVault | undefined = undefined;
    if (props.keyVault) {
      keyVault = new KeyVault(this, `KeyVault`, {
        name: convertName(`kv-${props.name}`, 24),
        location: props.location,
        tags: props.tags,
        resourceGroupName: resourceGroup.resourceGroup.name,
        skuName: props.keyVault.skuName,
        purgeProtectionEnabled: false,
      });
    }

    if (props.iothub) {
      new Iothub(this, `Iothub`, {
        name: `iothub-${props.name}`,
        location: props.iothub.location,
        tags: props.tags,
        resourceGroupName: resourceGroup.resourceGroup.name,
        skuName: props.iothub.skuName,
        capacity: props.iothub.capacity,
      });
    }

    let virtualNetwork: VirtualNetwork | undefined = undefined;
    if (props.virtualNetwork) {
      virtualNetwork = new VirtualNetwork(this, `VirtualNetwork`, {
        name: `vnet-${props.name}`,
        location: props.location,
        tags: props.tags,
        resourceGroupName: resourceGroup.resourceGroup.name,
        addressSpace: ['10.0.0.0/8'],
      });
    }

    let subnet: Subnet | undefined = undefined;
    if (props.subnet && virtualNetwork) {
      subnet = new Subnet(this, `Subnet`, {
        subnets: props.subnet.map((subnet) => {
          return {
            name: subnet.name,
            resourceGroupName: resourceGroup.resourceGroup.name,
            virtualNetworkName: virtualNetwork.virtualNetwork.name,
            addressPrefixes: subnet.addressPrefixes,
          };
        }),
      });
    }

    if (props.virtualMachine && subnet) {
      new VirtualMachine(this, `VirtualMachine`, {
        name: `vm-${props.name}`,
        location: props.location,
        tags: props.tags,
        resourceGroupName: resourceGroup.resourceGroup.name,
        subnetId: subnet.subnets[0].id,
        vmSize: props.virtualMachine.vmSize,
        identityIds: userAssignedIdentity
          ? [userAssignedIdentity.userAssignedIdentity.id]
          : undefined,
      });
    }

    if (props.bastionHost && subnet) {
      new BastionHost(this, `BastionHost`, {
        name: `bastion-${props.name}`,
        location: props.location,
        tags: props.tags,
        resourceGroupName: resourceGroup.resourceGroup.name,
        sku: props.bastionHost.sku,
        subnetId: subnet.subnets[1].id,
      });
    }

    // Create Private DNS Zones for different services
    const privateDnsZones: { [key: string]: PrivateDnsZone } = {};
    if (props.privateDnsZone && virtualNetwork) {
      const dnsZoneConfigs = [
        { id: 'OpenAi', name: 'privatelink.openai.azure.com' },
        { id: 'StorageAccount', name: 'privatelink.blob.core.windows.net' },
        { id: 'KeyVault', name: 'privatelink.vaultcore.azure.net' },
        { id: 'ContainerRegistry', name: 'privatelink.azurecr.io' },
      ];

      dnsZoneConfigs.forEach((config) => {
        privateDnsZones[config.id] = new PrivateDnsZone(
          this,
          `PrivateDnsZone${config.id}`,
          {
            name: config.name,
            tags: props.tags,
            resourceGroupName: resourceGroup.resourceGroup.name,
            virtualNetworkId: virtualNetwork.virtualNetwork.id,
          },
        );
      });
    }

    // Create Private Endpoints
    if (props.privateEndpoint && subnet) {
      // Create Private Endpoints for AI Services
      if (privateDnsZones['OpenAi']) {
        // aiServicesArray.forEach((aiService) => {
        //   new PrivateEndpoint(
        //     this,
        //     `PrivateEndpoint-${aiService.aiServices.name}`,
        //     {
        //       name: `pe-${aiService.aiServices.name}`,
        //       location: props.location,
        //       tags: props.tags,
        //       resourceGroupName: resourceGroup.resourceGroup.name,
        //       subnetId: subnet.subnets[2].id,
        //       privateConnectionResourceId: aiService.aiServices.id,
        //       subresourceNames: ['account'],
        //       privateDnsZoneIds: [privateDnsZones['OpenAi'].privateDnsZone.id],
        //     },
        //   );
        // });
      }

      // Create Private Endpoints for other services
      const endpointConfigs = [
        // {
        //   id: 'StorageAccount',
        //   condition: !!storageAccount,
        //   resourceId: storageAccount?.storageAccount.id,
        //   subresource: 'blob',
        // },
        {
          id: 'KeyVault',
          condition: !!keyVault,
          resourceId: keyVault?.keyVault.id,
          subresource: 'vault',
        },
        // {
        //   id: 'ContainerRegistry',
        //   condition: !!containerRegistry,
        //   resourceId: containerRegistry?.containerRegistry.id,
        //   subresource: 'registry',
        // },
      ];

      endpointConfigs.forEach((config) => {
        if (
          config.condition &&
          privateDnsZones[config.id] &&
          config.resourceId
        ) {
          new PrivateEndpoint(this, `PrivateEndpoint${config.id}`, {
            name: `pe-${config.id.toLowerCase()}-${props.name}`,
            location: props.location,
            tags: props.tags,
            resourceGroupName: resourceGroup.resourceGroup.name,
            subnetId: subnet.subnets[2].id,
            privateConnectionResourceId: config.resourceId,
            subresourceNames: [config.subresource],
            privateDnsZoneIds: [privateDnsZones[config.id].privateDnsZone.id],
          });
        }
      });
    }

    // if (props.roleAssignment && userAssignedIdentity) {
    //   for (const aiService of aiServicesArray) {
    //     new RoleAssignment(
    //       this,
    //       `RoleAssignment-${aiService.aiServices.name}`,
    //       {
    //         principalId: userAssignedIdentity.userAssignedIdentity.principalId,
    //         roleDefinitionName: 'Cognitive Services OpenAI User',
    //         scope: aiService.aiServices.id,
    //       },
    //     );
    //   }
    // }

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

    if (props.eventgridNamespace) {
      new EventgridNamespace(this, `EventgridNamespace`, {
        name: `eg-${props.name}`,
        location: props.location,
        tags: props.tags,
        resourceGroupName: resourceGroup.resourceGroup.name,
        sku: 'Standard',
      });
    }

    if (props.eventgridDomain) {
      // const eventgridDomain = new EventgridDomain(this, `EventgridDomain`, {
      //   name: `eg-domain-${props.name}`,
      //   location: props.location,
      //   tags: props.tags,
      //   resourceGroupName: resourceGroup.resourceGroup.name,
      //   inputSchema: props.eventgridDomain.inputSchema,
      // });

      if (props.eventgridDomainTopic) {
        // const eventgridDomainTopic = new EventgridDomainTopic(
        //   this,
        //   `EventgridDomainTopic`,
        //   {
        //     name: `eg-domain-topic-${props.name}`,
        //     domainName: eventgridDomain.eventgridDomain.name,
        //     resourceGroupName: resourceGroup.resourceGroup.name,
        //   },
        // );
        // if (props.eventgridEventSubscription && storageAccount) {
        //   new EventgridEventSubscription(this, `EventgridEventSubscription`, {
        //     name: `eg-domain-topic-subscription-${props.name}`,
        //     scope: eventgridDomainTopic.eventgridDomainTopic.id,
        //     eventDeliverySchema:
        //       props.eventgridEventSubscription.eventDeliverySchema,
        //     storageQueueEndpoint: {
        //       queueName: storageAccount.storageQueue.name,
        //       storageAccountId: storageAccount.storageAccount.id,
        //     },
        //   });
        // }
      }
    }

    if (props.eventgridTopic) {
      new EventgridTopic(this, `EventgridTopic`, {
        name: `eg-topic-${props.name}`,
        location: props.location,
        tags: props.tags,
        resourceGroupName: resourceGroup.resourceGroup.name,
        inputSchema: props.eventgridTopic.inputSchema,
      });
    }

    if (props.eventhubNamespace) {
      const eventhubNamespace = new EventhubNamespace(
        this,
        `EventhubNamespace`,
        {
          name: `ehn-${props.name}`,
          location: props.location,
          tags: props.tags,
          resourceGroupName: resourceGroup.resourceGroup.name,
          sku: props.eventhubNamespace.sku,
        },
      );

      if (props.eventhub) {
        new Eventhub(this, `Eventhub`, {
          name: `eh-${props.name}`,
          namespaceId: eventhubNamespace.eventhubNamespace.id,
          messageRetention: props.eventhub.messageRetention,
          partitionCount: props.eventhub.partitionCount,
        });
      }
    }
  }
}
