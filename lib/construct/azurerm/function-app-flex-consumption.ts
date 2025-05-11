import { Construct } from 'constructs';
import { functionAppFlexConsumption } from '@cdktf/provider-azurerm';

export interface FunctionAppFlexConsumptionProps {
  name: string;
  location: string;
  tags?: { [key: string]: string };
  resourceGroupName: string;
  servicePlanId: string;
  storageContainerEndpoint: string;
  storageAccessKey: string;
  runtimeName: string;
  runtimeVersion: string;
  maximumInstanceCount?: number;
  instanceMemoryInMb?: number;
  applicationInsightsConnectionString?: string;
}

export class FunctionAppFlexConsumption extends Construct {
  public readonly functionAppFlexConsumption: functionAppFlexConsumption.FunctionAppFlexConsumption;

  constructor(
    scope: Construct,
    id: string,
    props: FunctionAppFlexConsumptionProps,
  ) {
    super(scope, id);

    // Resources
    this.functionAppFlexConsumption =
      new functionAppFlexConsumption.FunctionAppFlexConsumption(
        this,
        'function_app_flex_consumption',
        {
          name: props.name,
          location: props.location,
          tags: props.tags,
          resourceGroupName: props.resourceGroupName,
          servicePlanId: props.servicePlanId,
          storageContainerType: 'blobContainer',
          storageContainerEndpoint: props.storageContainerEndpoint,
          storageAuthenticationType: 'StorageAccountConnectionString',
          storageAccessKey: props.storageAccessKey,
          runtimeName: props.runtimeName,
          runtimeVersion: props.runtimeVersion,
          maximumInstanceCount: props.maximumInstanceCount,
          instanceMemoryInMb: props.instanceMemoryInMb,
          siteConfig: {
            applicationInsightsConnectionString:
              props.applicationInsightsConnectionString,
          },
          identity: {
            type: 'SystemAssigned',
          },
        },
      );
  }
}
