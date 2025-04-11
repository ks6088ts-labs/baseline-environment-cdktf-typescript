import { Construct } from 'constructs';
import { TerraformStack } from 'cdktf';
import { provider, aiFoundryProject } from '@cdktf/provider-azurerm';

export interface AiFoundryProjectStackProps {
  name: string;
  location: string;
  tags?: { [key: string]: string };
  aiServicesHubId: string;
}

export class AiFoundryProjectStack extends TerraformStack {
  public readonly AiFoundryProject: aiFoundryProject.AiFoundryProject;
  constructor(scope: Construct, id: string, props: AiFoundryProjectStackProps) {
    super(scope, id);

    // Providers
    new provider.AzurermProvider(this, 'azurerm', {
      features: [{}],
    });

    // Resources
    this.AiFoundryProject = new aiFoundryProject.AiFoundryProject(
      this,
      'ai_foundry',
      {
        name: props.name,
        location: props.location,
        tags: props.tags,
        aiServicesHubId: props.aiServicesHubId,
        identity: {
          type: 'SystemAssigned',
        },
      },
    );
  }
}
