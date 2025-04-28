import { Construct } from 'constructs';
import { appConfiguration } from '@cdktf/provider-azurerm';

export interface appConfigurationProps {
  name: string;
  location: string;
  tags?: { [key: string]: string };
  resourceGroupName: string;
}

export class AppConfiguration extends Construct {
  public readonly appConfiguration: appConfiguration.AppConfiguration;
  constructor(scope: Construct, id: string, props: appConfigurationProps) {
    super(scope, id);

    // Resources
    this.appConfiguration = new appConfiguration.AppConfiguration(
      this,
      'app_configuration',
      {
        name: props.name,
        location: props.location,
        tags: props.tags,
        resourceGroupName: props.resourceGroupName,
      },
    );
  }
}
