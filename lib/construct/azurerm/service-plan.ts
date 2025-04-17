import { Construct } from 'constructs';
import { servicePlan } from '@cdktf/provider-azurerm';

export interface ServicePlanProps {
  name: string;
  location: string;
  tags?: { [key: string]: string };
  resourceGroupName: string;
  osType: string;
  skuName: string;
}

export class ServicePlan extends Construct {
  public readonly servicePlan: servicePlan.ServicePlan;

  constructor(scope: Construct, id: string, props: ServicePlanProps) {
    super(scope, id);

    // Resources
    this.servicePlan = new servicePlan.ServicePlan(this, 'service_plan', {
      name: props.name,
      location: props.location,
      tags: props.tags,
      resourceGroupName: props.resourceGroupName,
      osType: props.osType,
      skuName: props.skuName,
    });
  }
}
