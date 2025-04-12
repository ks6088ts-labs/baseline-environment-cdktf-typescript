import { Construct } from 'constructs';
import { apiManagement } from '@cdktf/provider-azurerm';

interface ApiManagementProps {
  name: string;
  location: string;
  tags?: { [key: string]: string };
  resourceGroupName: string;
  publisherEmail: string;
  publisherName: string;
  skuName: string;
}

export class ApiManagement extends Construct {
  constructor(scope: Construct, id: string, props: ApiManagementProps) {
    super(scope, id);

    // Resources
    new apiManagement.ApiManagement(this, 'api_management', {
      name: props.name,
      location: props.location,
      resourceGroupName: props.resourceGroupName,
      tags: props.tags,
      publisherEmail: props.publisherEmail,
      publisherName: props.publisherName,
      skuName: props.skuName,
      identity: {
        type: 'SystemAssigned',
      },
    });
  }
}
