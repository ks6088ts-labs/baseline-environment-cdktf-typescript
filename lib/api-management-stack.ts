import { Construct } from 'constructs';
import { TerraformStack } from 'cdktf';
import { provider, apiManagement } from '@cdktf/provider-azurerm';

interface ApiManagementStackProps {
  name: string;
  location: string;
  tags?: { [key: string]: string };
  resourceGroupName: string;
  publisherEmail: string;
  publisherName: string;
  sku_name: string;
}

export class ApiManagementStack extends TerraformStack {
  constructor(scope: Construct, id: string, props: ApiManagementStackProps) {
    super(scope, id);

    // Providers
    new provider.AzurermProvider(this, 'azurerm', {
      features: [{}],
    });

    // Resources
    new apiManagement.ApiManagement(this, 'api_management', {
      name: props.name,
      location: props.location,
      resourceGroupName: props.resourceGroupName,
      tags: props.tags,
      publisherEmail: props.publisherEmail,
      publisherName: props.publisherName,
      skuName: props.sku_name,
      identity: {
        type: 'SystemAssigned',
      },
    });
  }
}
