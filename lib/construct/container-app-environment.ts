import { Construct } from 'constructs';
import { containerAppEnvironment } from '@cdktf/provider-azurerm';

interface ContainerAppEnvironmentProps {
  name: string;
  location: string;
  tags?: { [key: string]: string };
  resourceGroupName: string;
}

export class ContainerAppEnvironment extends Construct {
  public readonly containerAppEnvironment: containerAppEnvironment.ContainerAppEnvironment;

  constructor(
    scope: Construct,
    id: string,
    props: ContainerAppEnvironmentProps,
  ) {
    super(scope, id);

    // Resources
    this.containerAppEnvironment =
      new containerAppEnvironment.ContainerAppEnvironment(
        this,
        'container_app_environment',
        {
          name: props.name,
          location: props.location,
          resourceGroupName: props.resourceGroupName,
          tags: props.tags,
        },
      );
  }
}
