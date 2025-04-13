import { Construct } from 'constructs';
import { containerApp } from '@cdktf/provider-azurerm';

interface ContainerAppProps {
  name: string;
  location: string;
  tags?: { [key: string]: string };
  resourceGroupName: string;
  containerAppEnvironmentId: string;
  containerAppTemplateContainers: containerApp.ContainerAppTemplateContainer[];
}

export class ContainerApp extends Construct {
  constructor(scope: Construct, id: string, props: ContainerAppProps) {
    super(scope, id);

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
