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
  },
  resourceGroup: {},
  aiFoundryProjects: [
    {
      location: 'eastus',
      deployments: [
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
      ],
    },
    {
      location: 'eastus2',
      deployments: [
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
      const aiFoundryProject = new AiFoundryProject(
        this,
        `AiFoundryProject-${project.location}`,
        {
          name: `ai-foundry-${props.name}-${project.location}`,
          location: project.location,
          tags: props.tags,
          resourceGroupId: resourceGroup.resourceGroup.id,
          customSubDomainName: `ai-foundry-${props.name}-${project.location}`,
        },
      );

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
