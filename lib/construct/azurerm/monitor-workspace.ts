import { Construct } from 'constructs';
import { monitorWorkspace } from '@cdktf/provider-azurerm';

export interface MonitorWorkspaceProps {
  name: string;
  location: string;
  tags?: { [key: string]: string };
  resourceGroupName: string;
}

export class MonitorWorkspace extends Construct {
  public readonly monitorWorkspace: monitorWorkspace.MonitorWorkspace;
  constructor(scope: Construct, id: string, props: MonitorWorkspaceProps) {
    super(scope, id);

    // Resources
    this.monitorWorkspace = new monitorWorkspace.MonitorWorkspace(
      this,
      'monitor_workspace',
      {
        name: props.name,
        location: props.location,
        tags: props.tags,
        resourceGroupName: props.resourceGroupName,
      },
    );
  }
}
