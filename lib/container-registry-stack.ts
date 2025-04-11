import { Construct } from 'constructs';
import { TerraformStack } from 'cdktf';
import { provider, containerRegistry } from '@cdktf/provider-azurerm';

export interface ContainerRegistryStackProps {
  name: string;
  location: string;
  tags?: { [key: string]: string };
  resourceGroupName: string;
  sku: string;
  adminEnabled?: boolean;
}

export class ContainerRegistryStack extends TerraformStack {
  constructor(
    scope: Construct,
    id: string,
    props: ContainerRegistryStackProps,
  ) {
    super(scope, id);

    // Providers
    new provider.AzurermProvider(this, 'azurerm', {
      features: [{}],
    });

    // Resources
    new containerRegistry.ContainerRegistry(this, 'container_registry', {
      name: props.name,
      location: props.location,
      tags: props.tags,
      resourceGroupName: props.resourceGroupName,
      sku: props.sku,
      adminEnabled: props.adminEnabled,
      identity: {
        type: 'SystemAssigned',
      },
    });
  }
}
