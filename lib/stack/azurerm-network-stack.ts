import { Construct } from 'constructs';
import { TerraformStack, TerraformOutput } from 'cdktf';
import { provider } from '@cdktf/provider-azurerm';
import { getRandomIdentifier, createBackend, convertName } from '../utils';
import { ResourceGroup } from '../construct/azurerm/resource-group';
import { VirtualNetwork } from '../construct/azurerm/virtual-network';
import { Subnet } from '../construct/azurerm/subnet';
import { VirtualMachine } from '../construct/azurerm/virtual-machine';
import { BastionHost } from '../construct/azurerm/bastion';
import { PrivateDnsZone } from '../construct/azurerm/private-dns-zone';
import { PrivateEndpoint } from '../construct/azurerm/private-endpoint';

export interface AzurermNetworkStackPropsPrivateEndpointConfig {
  id: string;
  name: string;
  resourceId: string;
  subresource: string;
}

export interface AzurermNetworkStackProps {
  name: string;
  location: string;
  tags?: { [key: string]: string };
  resourceGroup: {};
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
  privateDnsZone?: {
    configs?: {
      id: string;
      name: string;
    }[];
  };
  privateEndpoint?: {
    configs?: AzurermNetworkStackPropsPrivateEndpointConfig[];
  };
}

export function createAzurermNetworkStackProps(
  privateEndpointConfigs: AzurermNetworkStackPropsPrivateEndpointConfig[],
): AzurermNetworkStackProps {
  return {
    name: `AzurermNetworkStack-${getRandomIdentifier('AzurermNetworkStack')}`,
    location: 'japaneast',
    tags: {
      owner: 'ks6088ts',
      SecurityControl: 'Ignore',
      CostControl: 'Ignore',
    },
    resourceGroup: {},
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
    // virtualMachine: {
    //   vmSize: 'Standard_DS2_v2',
    // },
    // bastionHost: {
    //   sku: 'Basic',
    // },
    privateDnsZone: {
      configs: [
        { id: 'OpenAi', name: 'privatelink.openai.azure.com' },
        { id: 'StorageAccount', name: 'privatelink.blob.core.windows.net' },
        { id: 'KeyVault', name: 'privatelink.vaultcore.azure.net' },
        { id: 'ContainerRegistry', name: 'privatelink.azurecr.io' },
      ],
    },
    privateEndpoint: {
      configs: privateEndpointConfigs,
    },
  };
}

export class AzurermNetworkStack extends TerraformStack {
  constructor(scope: Construct, id: string, props: AzurermNetworkStackProps) {
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
      const privateDnsZoneConfigs = props.privateDnsZone.configs || [];
      privateDnsZoneConfigs.forEach((config) => {
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
      const privateEndpointConfigs = props.privateEndpoint.configs || [];
      privateEndpointConfigs.forEach((config) => {
        if (privateDnsZones[config.id] && config.resourceId) {
          new PrivateEndpoint(this, `PrivateEndpoint${config.name}`, {
            name: convertName(`pe-${config.name}-${props.name}`, 80),
            location: props.location,
            tags: props.tags,
            resourceGroupName: resourceGroup.resourceGroup.name,
            subnetId: subnet.subnets[2].id, // assuming this is the subnet for private endpoints
            privateConnectionResourceId: config.resourceId,
            subresourceNames: [config.subresource],
            privateDnsZoneIds: [privateDnsZones[config.id].privateDnsZone.id],
          });
        }
      });
    }
  }
}
