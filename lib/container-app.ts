import { Construct } from 'constructs';
import { TerraformStack } from 'cdktf';
import { provider, containerApp } from '@cdktf/provider-azurerm';

interface ContainerAppStackProps {
  name: string;
  location: string;
  tags?: { [key: string]: string };
  resourceGroupName: string;
  containerAppEnvironmentId: string;
  containerAppTemplateContainers: containerApp.ContainerAppTemplateContainer[];
}

export class ContainerAppStack extends TerraformStack {
  constructor(scope: Construct, id: string, props: ContainerAppStackProps) {
    super(scope, id);

    // Providers
    new provider.AzurermProvider(this, 'azurerm', {
      features: [{}],
    });

    // Resources
    new containerApp.ContainerApp(this, 'container_app', {
      name: props.name,
      containerAppEnvironmentId: props.containerAppEnvironmentId,
      resourceGroupName: props.resourceGroupName,
      revisionMode: 'Single',
      tags: props.tags,
      template: {
        container: props.containerAppTemplateContainers,
      },
      ingress: {
        targetPort: 80,
        externalEnabled: true,
        trafficWeight: [
          {
            latestRevision: true,
            percentage: 100,
          },
        ],
      },
    });
  }
}
