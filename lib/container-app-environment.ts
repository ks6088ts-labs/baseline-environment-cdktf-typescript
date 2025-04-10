import { Construct } from 'constructs';
import { TerraformStack } from 'cdktf';
import { provider, containerAppEnvironment } from '@cdktf/provider-azurerm';

interface ContainerAppEnvironmentStackProps {
  name: string;
  location: string;
  tags?: { [key: string]: string };
  resourceGroupName: string;
}

export class ContainerAppEnvironmentStack extends TerraformStack {
  public readonly containerAppEnvironment: containerAppEnvironment.ContainerAppEnvironment;

  constructor(
    scope: Construct,
    id: string,
    props: ContainerAppEnvironmentStackProps,
  ) {
    super(scope, id);

    // Providers
    new provider.AzurermProvider(this, 'azurerm', {
      features: [{}],
    });

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
