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
  public readonly id: string;

  constructor(scope: Construct, id: string, props: AiFoundryProjectProps) {
    super(scope, id);

    // Resources
    const account = new Resource(scope, `ai_foundry_project_account_${id}`, {
      type: 'Microsoft.CognitiveServices/accounts@2025-04-01-preview',
      name: props.name,
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
      lifecycle: {
        // FIXME: ignore changes to properties for now
        // https://learn.microsoft.com/en-us/rest/api/aiservices/accountmanagement/accounts/create?view=rest-aiservices-accountmanagement-2024-10-01&tabs=HTTP#accountproperties
        ignoreChanges: ['body.properties'],
      },
    });
    this.id = account.id;

    new Resource(scope, `ai_foundry_project_project_${id}`, {
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
