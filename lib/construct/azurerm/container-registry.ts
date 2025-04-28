import { Construct } from 'constructs';
import { containerRegistry } from '@cdktf/provider-azurerm';

export interface ContainerRegistryProps {
  name: string;
  location: string;
  tags?: { [key: string]: string };
  resourceGroupName: string;
  sku: string;
  adminEnabled?: boolean;
}

export class ContainerRegistry extends Construct {
  public readonly containerRegistry: containerRegistry.ContainerRegistry;
  constructor(scope: Construct, id: string, props: ContainerRegistryProps) {
    super(scope, id);

    // Resources
    this.containerRegistry = new containerRegistry.ContainerRegistry(
      this,
      'container_registry',
      {
        name: props.name,
        location: props.location,
        tags: props.tags,
        resourceGroupName: props.resourceGroupName,
        sku: props.sku,
        adminEnabled: props.adminEnabled,
        identity: {
          type: 'SystemAssigned',
        },
      },
    );
  }
}
