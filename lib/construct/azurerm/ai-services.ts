import { Construct } from 'constructs';
import { aiServices, cognitiveDeployment } from '@cdktf/provider-azurerm';

interface AiServicesDeployment {
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

export interface AiServicesProps {
  name: string;
  location: string;
  tags?: { [key: string]: string };
  resourceGroupName: string;
  customSubdomainName: string;
  skuName: string;
  publicNetworkAccess?: string;
  deployments?: AiServicesDeployment[];
}

export class AiServices extends Construct {
  public readonly aiServices: aiServices.AiServices;

  constructor(scope: Construct, id: string, props: AiServicesProps) {
    super(scope, id);

    // Resources
    this.aiServices = new aiServices.AiServices(this, 'ai_services', {
      name: props.name,
      location: props.location,
      tags: props.tags,
      resourceGroupName: props.resourceGroupName,
      customSubdomainName: props.customSubdomainName,
      skuName: props.skuName,
      publicNetworkAccess: props.publicNetworkAccess,
      identity: {
        type: 'SystemAssigned',
      },
    });

    for (const deployment of props.deployments || []) {
      new cognitiveDeployment.CognitiveDeployment(this, deployment.name, {
        name: deployment.name,
        cognitiveAccountId: this.aiServices.id,
        model: {
          format: 'OpenAI',
          name: deployment.model.name,
          version: deployment.model.version,
        },
        sku: {
          name: deployment.sku.name,
          capacity: deployment.sku.capacity,
        },
      });
    }
  }
}
