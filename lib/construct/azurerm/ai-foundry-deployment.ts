import { Construct } from 'constructs';
import { cognitiveDeployment } from '@cdktf/provider-azurerm';

export interface AiFoundryDeploymentProps {
  aiFoundryProjectId: string;
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

export class AiFoundryDeployment extends Construct {
  constructor(scope: Construct, id: string, props: AiFoundryDeploymentProps) {
    super(scope, id);

    // Resources
    new cognitiveDeployment.CognitiveDeployment(
      this,
      `ai_foundry_deployment_${id}_${props.name}`,
      {
        name: props.name,
        cognitiveAccountId: props.aiFoundryProjectId,
        model: {
          format: 'OpenAI',
          name: props.model.name,
          version: props.model.version,
        },
        sku: {
          name: props.sku.name,
          capacity: props.sku.capacity,
        },
      },
    );
  }
}
