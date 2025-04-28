import { Construct } from 'constructs';
import { applicationInsights } from '@cdktf/provider-azurerm';

export interface ApplicationInsightsProps {
  name: string;
  location: string;
  tags?: { [key: string]: string };
  resourceGroupName: string;
  workspaceId: string;
}

export class ApplicationInsights extends Construct {
  public readonly applicationInsights: applicationInsights.ApplicationInsights;
  constructor(scope: Construct, id: string, props: ApplicationInsightsProps) {
    super(scope, id);

    // Resources
    this.applicationInsights = new applicationInsights.ApplicationInsights(
      this,
      'application_insights',
      {
        name: props.name,
        location: props.location,
        tags: props.tags,
        resourceGroupName: props.resourceGroupName,
        applicationType: 'web',
        workspaceId: props.workspaceId,
      },
    );
  }
}
