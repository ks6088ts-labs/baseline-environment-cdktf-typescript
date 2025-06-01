import { Construct } from 'constructs';
import { TerraformStack, TerraformOutput } from 'cdktf';
import { provider } from '@cdktf/provider-azurerm';
import { getRandomIdentifier, createBackend } from '../utils';
import { ResourceGroup } from '../construct/azurerm/resource-group';

export interface NetworkAzurermStackProps {
  name: string;
  location: string;
  tags?: { [key: string]: string };
  resourceGroup: {};
}

export const networkAzurermStackProps: NetworkAzurermStackProps = {
  name: `NetworkAzurermStack-${getRandomIdentifier('NetworkAzurermStack')}`,
  location: 'japaneast',
  tags: {
    owner: 'ks6088ts',
  },
  resourceGroup: {},
};

export class NetworkAzurermStack extends TerraformStack {
  constructor(scope: Construct, id: string, props: NetworkAzurermStackProps) {
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
  }
}
