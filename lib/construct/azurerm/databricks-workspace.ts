import { Construct } from 'constructs';
import { databricksWorkspace } from '@cdktf/provider-azurerm';

export interface DatabricksWorkspaceProps {
  name: string;
  location: string;
  tags?: { [key: string]: string };
  resourceGroupName: string;
  sku: string;
}

export class DatabricksWorkspace extends Construct {
  constructor(scope: Construct, id: string, props: DatabricksWorkspaceProps) {
    super(scope, id);

    // Resources
    new databricksWorkspace.DatabricksWorkspace(this, 'databricks_workspace', {
      name: props.name,
      location: props.location,
      tags: props.tags,
      resourceGroupName: props.resourceGroupName,
      sku: props.sku,
    });
  }
}
