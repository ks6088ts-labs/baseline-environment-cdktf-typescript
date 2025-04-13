import { Construct } from 'constructs';
import { aiFoundryProject } from '@cdktf/provider-azurerm';

export interface AiFoundryProjectProps {
  name: string;
  location: string;
  tags?: { [key: string]: string };
  aiServicesHubId: string;
}

export class AiFoundryProject extends Construct {
  public readonly aiFoundryProject: aiFoundryProject.AiFoundryProject;
  constructor(scope: Construct, id: string, props: AiFoundryProjectProps) {
    super(scope, id);

    // Resources
    this.aiFoundryProject = new aiFoundryProject.AiFoundryProject(
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
