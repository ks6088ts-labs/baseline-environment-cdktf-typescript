import { Construct } from 'constructs';
import { linuxFunctionApp } from '@cdktf/provider-azurerm';

export interface LinuxFunctionAppProps {
  name: string;
  location: string;
  tags?: { [key: string]: string };
  resourceGroupName: string;
  storageAccountName: string;
  storageAccountAccessKey: string;
  servicePlanId: string;
  applicationStack?: linuxFunctionApp.LinuxFunctionAppSiteConfigApplicationStack;
  applicationInsightsConnectionString?: string;
  applicationInsightsKey?: string;
}

export class LinuxFunctionApp extends Construct {
  public readonly linuxFunctionApp: linuxFunctionApp.LinuxFunctionApp;

  constructor(scope: Construct, id: string, props: LinuxFunctionAppProps) {
    super(scope, id);

    // Resources
    this.linuxFunctionApp = new linuxFunctionApp.LinuxFunctionApp(
      this,
      'linux_function_app',
      {
        name: props.name,
        location: props.location,
        tags: props.tags,
        resourceGroupName: props.resourceGroupName,
        storageAccountName: props.storageAccountName,
        storageAccountAccessKey: props.storageAccountAccessKey,
        servicePlanId: props.servicePlanId,
        siteConfig: {
          alwaysOn: true,
          applicationStack: props.applicationStack,
          applicationInsightsConnectionString:
            props.applicationInsightsConnectionString,
          applicationInsightsKey: props.applicationInsightsKey,
        },
        identity: {
          type: 'SystemAssigned',
        },
      },
    );
  }
}
