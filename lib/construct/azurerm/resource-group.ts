import { Construct } from 'constructs';
import { resourceGroup } from '@cdktf/provider-azurerm';

export interface ResourceGroupProps {
  name: string;
  location: string;
  tags?: { [key: string]: string };
}

export class ResourceGroup extends Construct {
  public readonly resourceGroup: resourceGroup.ResourceGroup;

  constructor(scope: Construct, id: string, props: ResourceGroupProps) {
    super(scope, id);

    // Resources
    this.resourceGroup = new resourceGroup.ResourceGroup(
      this,
      'resource_group',
      {
        name: props.name,
        location: props.location,
        tags: props.tags,
      },
    );
  }
}
