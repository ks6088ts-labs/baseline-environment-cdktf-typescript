import { Construct } from 'constructs';
import { TerraformStack, TerraformOutput } from 'cdktf';
import { getRandomIdentifier, createBackend } from '../utils';
import { ResourceGroup } from '../construct/azurerm/resource-group';
import { provider as azurermProvider } from '@cdktf/provider-azurerm';
import { provider as azapiProvider } from '../../.gen/providers/azapi';
import { AiFoundryProject } from '../construct/azapi/ai-foundry-project';

export interface AzapiAiFoundryStackProps {
  name: string;
  location: string;
  tags?: { [key: string]: string };
  resourceGroup: {};
}

export const azapiAiFoundryStackProps: AzapiAiFoundryStackProps = {
  name: `AzapiAiFoundryStack-${getRandomIdentifier('AzapiAiFoundryStack')}`,
  location: 'japaneast',
  tags: {
    owner: 'ks6088ts',
  },
  resourceGroup: {},
};

export class AzapiAiFoundryStack extends TerraformStack {
  constructor(scope: Construct, id: string, props: AzapiAiFoundryStackProps) {
    super(scope, id);

    // Backend
    createBackend(this, id);

    // Providers
    new azurermProvider.AzurermProvider(this, 'azurerm', {
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
    new azapiProvider.AzapiProvider(this, 'azapi', {});

    // Resources
    const resourceGroup = new ResourceGroup(this, `ResourceGroup`, {
      name: `rg-${props.name}`,
      location: props.location,
      tags: props.tags,
    });
    new TerraformOutput(this, 'resource_group_name', {
      value: resourceGroup.resourceGroup.name,
    });

    new AiFoundryProject(this, `AiFoundryProject`, {
      name: `ai-foundry-${props.name}`,
      location: props.location,
      tags: props.tags,
      resourceGroupId: resourceGroup.resourceGroup.id,
      customSubDomainName: `ai-foundry-${props.name}`,
    });
  }
}
