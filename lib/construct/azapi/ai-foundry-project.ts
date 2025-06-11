import { Construct } from 'constructs';
import { Resource } from '../../../.gen/providers/azapi/resource';

export interface AiFoundryProjectProps {
  name: string;
  location: string;
  tags?: { [key: string]: string };
  resourceGroupId: string;
  customSubDomainName: string;
}

export class AiFoundryProject extends Construct {
  constructor(scope: Construct, id: string, props: AiFoundryProjectProps) {
    super(scope, id);

    // Resources
    const account = new Resource(scope, 'ai_foundry_project_account', {
      type: 'Microsoft.CognitiveServices/accounts@2025-04-01-preview',
      name: `${props.name}-account`,
      parentId: props.resourceGroupId,
      location: props.location,
      tags: props.tags,
      body: {
        kind: 'AIServices',
        properties: {
          allowProjectManagement: true,
          customSubDomainName: props.customSubDomainName,
        },
        sku: {
          name: 'S0',
        },
        identity: {
          type: 'SystemAssigned',
        },
      },
    });

    new Resource(scope, 'ai_foundry_project_project', {
      type: 'Microsoft.CognitiveServices/accounts/projects@2025-04-01-preview',
      name: `${props.name}-project`,
      parentId: account.id,
      location: props.location,
      tags: props.tags,
      body: {
        properties: {
          description: 'AI Foundry Project',
          displayName: props.name,
        },
        identity: {
          type: 'SystemAssigned',
        },
      },
    });
  }
}
