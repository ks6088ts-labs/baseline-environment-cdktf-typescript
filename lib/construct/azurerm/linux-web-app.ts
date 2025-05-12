import { Construct } from 'constructs';
import { linuxWebApp } from '@cdktf/provider-azurerm';

export interface linuxWebAppProps {
  name: string;
  location: string;
  tags?: { [key: string]: string };
  resourceGroupName: string;
  servicePlanId: string;
  appCommandLine?: string;
  applicationStack?: linuxWebApp.LinuxWebAppSiteConfigApplicationStack;
}

export class LinuxWebApp extends Construct {
  public readonly linuxWebApp: linuxWebApp.LinuxWebApp;
  constructor(scope: Construct, id: string, props: linuxWebAppProps) {
    super(scope, id);

    // Resources
    this.linuxWebApp = new linuxWebApp.LinuxWebApp(this, 'linux_web_app', {
      name: props.name,
      location: props.location,
      tags: props.tags,
      resourceGroupName: props.resourceGroupName,
      servicePlanId: props.servicePlanId,
      siteConfig: {
        appCommandLine: props.appCommandLine,
        applicationStack: props.applicationStack,
      },
      appSettings: {
        SCM_DO_BUILD_DURING_DEPLOYMENT: 'true',
      },
      identity: {
        type: 'SystemAssigned',
      },
    });
  }
}
