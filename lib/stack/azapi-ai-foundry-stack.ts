import { Construct } from 'constructs';
import { TerraformStack, TerraformOutput } from 'cdktf';
import { getRandomIdentifier, createBackend } from '../utils';
import { ResourceGroup } from '../construct/azurerm/resource-group';
import { provider as azurermProvider } from '@cdktf/provider-azurerm';
import { provider as azapiProvider } from '../../.gen/providers/azapi';
import { AiFoundryProject } from '../construct/azapi/ai-foundry-project';
import { AiFoundryDeployment } from '../construct/azurerm/ai-foundry-deployment';

interface AiFoundryDeploymentConfig {
  name: string;
  model: {
    name: string;
    version: string;
  };
  sku: {
    name: string;
    capacity: number;
  };
}

interface AiFoundryProjects {
  location: string;
  deployments: AiFoundryDeploymentConfig[];
}

export interface AzapiAiFoundryStackProps {
  name: string;
  location: string;
  tags?: { [key: string]: string };
  resourceGroup: {};
  aiFoundryProjects?: AiFoundryProjects[];
}

export const azapiAiFoundryStackProps: AzapiAiFoundryStackProps = {
  name: `AzapiAiFoundryStack-${getRandomIdentifier('AzapiAiFoundryStack')}`,
  location: 'japaneast',
  tags: {
    owner: 'ks6088ts',
    SecurityControl: 'Ignore',
    CostControl: 'Ignore',
  },
  resourceGroup: {},
  aiFoundryProjects: [
    {
      location: 'eastus2',
      deployments: [
        {
          name: 'gpt-5.2',
          model: {
            name: 'gpt-5.2',
            version: '2025-12-11',
          },
          sku: {
            name: 'GlobalStandard',
            capacity: 1000,
          },
        },
        {
          name: 'gpt-5',
          model: {
            name: 'gpt-5',
            version: '2025-08-07',
          },
          sku: {
            name: 'GlobalStandard',
            capacity: 1000,
          },
        },
        {
          name: 'gpt-5-mini',
          model: {
            name: 'gpt-5-mini',
            version: '2025-08-07',
          },
          sku: {
            name: 'GlobalStandard',
            capacity: 450,
          },
        },
        {
          name: 'gpt-5-nano',
          model: {
            name: 'gpt-5-nano',
            version: '2025-08-07',
          },
          sku: {
            name: 'GlobalStandard',
            capacity: 450,
          },
        },
        {
          name: 'gpt-5-chat',
          model: {
            name: 'gpt-5-chat',
            version: '2025-08-07',
          },
          sku: {
            name: 'GlobalStandard',
            capacity: 450,
          },
        },
        {
          name: 'codex-mini',
          model: {
            name: 'codex-mini',
            version: '2025-05-16',
          },
          sku: {
            name: 'GlobalStandard',
            capacity: 450,
          },
        },
        {
          name: 'sora',
          model: {
            name: 'sora',
            version: '2025-05-02',
          },
          sku: {
            name: 'GlobalStandard',
            capacity: 60,
          },
        },
        {
          name: 'model-router',
          model: {
            name: 'model-router',
            version: '2025-08-07',
          },
          sku: {
            name: 'GlobalStandard',
            capacity: 250,
          },
        },
        {
          name: 'gpt-4o',
          model: {
            name: 'gpt-4o',
            version: '2024-11-20',
          },
          sku: {
            name: 'GlobalStandard',
            capacity: 450,
          },
        },
        {
          name: 'text-embedding-3-small',
          model: {
            name: 'text-embedding-3-small',
            version: '1',
          },
          sku: {
            name: 'GlobalStandard',
            capacity: 1000,
          },
        },
        {
          name: 'text-embedding-3-large',
          model: {
            name: 'text-embedding-3-large',
            version: '1',
          },
          sku: {
            name: 'GlobalStandard',
            capacity: 1000,
          },
        },
        {
          name: 'gpt-5-codex',
          model: {
            name: 'gpt-5-codex',
            version: '2025-09-15',
          },
          sku: {
            name: 'GlobalStandard',
            capacity: 450,
          },
        },
        {
          name: 'gpt-realtime',
          model: {
            name: 'gpt-realtime',
            version: '2025-08-28',
          },
          sku: {
            name: 'GlobalStandard',
            capacity: 10,
          },
        },
      ],
    },
    {
      location: 'westus',
      deployments: [
        {
          name: 'o3-deep-research',
          model: {
            name: 'o3-deep-research',
            version: '2025-06-26',
          },
          sku: {
            name: 'GlobalStandard',
            capacity: 1,
          },
        },
      ],
    },
  ],
};

// Use Terraform to create Azure AI Foundry resource: https://learn.microsoft.com/en-us/azure/ai-foundry/how-to/create-resource-terraform
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

    props.aiFoundryProjects?.forEach((project) => {
      const name = `ai-foundry-${props.name}-${project.location}`;
      const aiFoundryProject = new AiFoundryProject(this, name, {
        name: name,
        location: project.location,
        tags: props.tags,
        resourceGroupId: resourceGroup.resourceGroup.id,
        customSubDomainName: name,
      });

      project.deployments.forEach((deployment) => {
        new AiFoundryDeployment(
          this,
          `AiFoundryDeployment-${project.location}-${deployment.name}`,
          {
            aiFoundryProjectId: aiFoundryProject.id,
            name: deployment.name,
            model: deployment.model,
            sku: deployment.sku,
          },
        );
      });
    });
  }
}
