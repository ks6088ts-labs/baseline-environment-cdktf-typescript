import { Construct } from 'constructs';
import { TerraformStack } from 'cdktf';
import { provider, resourceGroup } from '@cdktf/provider-azurerm';

export interface ResourceGroupStackProps {
  name: string;
  location: string;
  tags?: { [key: string]: string };
}

export class ResourceGroupStack extends TerraformStack {
  public readonly resourceGroup: resourceGroup.ResourceGroup;

  constructor(scope: Construct, id: string, props: ResourceGroupStackProps) {
    super(scope, id);

    // Providers
    new provider.AzurermProvider(this, 'azurerm', {
      features: [{}],
    });

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
