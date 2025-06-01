import { Construct } from 'constructs';
import {
  TerraformStack,
  TerraformOutput,
  TerraformResourceLifecycle,
} from 'cdktf';
import {
  provider,
  linuxFunctionApp,
  functionAppFunction,
  linuxWebApp,
} from '@cdktf/provider-azurerm';
import { getRandomIdentifier, createBackend, convertName } from '../utils';
import { ResourceGroup } from '../construct/azurerm/resource-group';
import { ContainerRegistry } from '../construct/azurerm/container-registry';
import { ContainerAppEnvironment } from '../construct/azurerm/container-app-environment';
import { ContainerApp } from '../construct/azurerm/container-app';
import { KubernetesCluster } from '../construct/azurerm/kubernetes-cluster';
import {
  StorageAccount,
  StorageContainerProps,
} from '../construct/azurerm/storage-account';
import { LogAnalyticsWorkspace } from '../construct/azurerm/log-analytics-workspace';
import { ApplicationInsights } from '../construct/azurerm/application-insights';
import { AppConfiguration } from '../construct/azurerm/app-configuration';
import { ServicePlan } from '../construct/azurerm/service-plan';
import { LinuxWebApp } from '../construct/azurerm/linux-web-app';
import { LinuxFunctionApp } from '../construct/azurerm/linux-function-app';
import { FunctionAppFunction } from '../construct/azurerm/function-app-function';
import { FunctionAppFlexConsumption } from '../construct/azurerm/function-app-flex-consumption';
import { ApiManagement } from '../construct/azurerm/api-management';

const pythonFunctionCode = `
import logging
import azure.functions as func

def main(req: func.HttpRequest) -> func.HttpResponse:
    logging.info('Python HTTP trigger function processed a request.')
    name = req.params.get('name')
    if not name:
        try:
            req_body = req.get_json()
        except ValueError:
            pass
        else:
            name = req_body.get('name')
    if name:
        return func.HttpResponse(f"Hello, {name}. This HTTP triggered function executed successfully.")
    else:
        return func.HttpResponse(
             "This HTTP triggered function executed successfully. Pass a name in the query string or in the request body for a personalized response.",
             status_code=200
        )
`;

const testData = JSON.stringify({
  name: 'Azure',
});

const configJson = JSON.stringify({
  scriptFile: '__init__.py',
  bindings: [
    {
      authLevel: 'function',
      direction: 'in',
      methods: ['get', 'post'],
      name: 'req',
      type: 'httpTrigger',
    },
    {
      direction: 'out',
      name: '$return',
      type: 'http',
    },
  ],
  disabled: false,
});

export interface AppAzurermStackProps {
  name: string;
  location: string;
  tags?: { [key: string]: string };
  resourceGroup: {};
  containerRegistry?: {
    location: string;
    sku: string;
    adminEnabled: boolean;
  };
  containerAppEnvironment?: {};
  containerApp?: {
    containers: [
      {
        name: string;
        image: string;
        cpu: number;
        memory: string;
        env: [
          {
            name: string;
            value: string;
          },
        ];
      },
    ];
  };
  kubernetesCluster?: {
    nodeCount: number;
    vmSize: string;
    lifecycle?: TerraformResourceLifecycle;
  };
  storageAccount?: {
    accountTier: string;
    accountReplicationType: string;
    storageContainers?: StorageContainerProps[];
  };
  logAnalyticsWorkspace?: {
    location: string;
    sku: string | undefined;
  };
  applicationInsights?: {};
  appConfiguration?: {};
  servicePlan?: {
    location: string;
    osType: string;
    skuName: string;
  };
  linuxWebApp?: {
    appCommandLine?: string;
    applicationStack?: linuxWebApp.LinuxWebAppSiteConfigApplicationStack;
  };
  linuxFunctionApp?: {
    applicationStack?: linuxFunctionApp.LinuxFunctionAppSiteConfigApplicationStack;
  };
  functionAppFunction?: {
    name: string;
    language: string;
    file: functionAppFunction.FunctionAppFunctionFile[];
    testData: string;
    configJson: string;
  };
  servicePlanFlexConsumption?: {
    location: string;
    osType: string;
    skuName: string;
  };
  functionAppFlexConsumption?: {
    location: string;
    runtimeName: string;
    runtimeVersion: string;
  };
  functionAppFunctionFlexConsumption?: {
    name: string;
    language: string;
    file: functionAppFunction.FunctionAppFunctionFile[];
    testData: string;
    configJson: string;
  };
  apiManagement?: {
    location: string;
    publisherEmail: string;
    publisherName: string;
    skuName: string;
  };
}

export const appAzurermStackProps: AppAzurermStackProps = {
  name: `AppAzurermStack-${getRandomIdentifier('AppAzurermStack')}`,
  location: 'japaneast',
  tags: {
    owner: 'ks6088ts',
  },
  resourceGroup: {},
  containerRegistry: {
    location: 'japaneast',
    sku: 'Basic',
    adminEnabled: true,
  },
  containerAppEnvironment: {},
  containerApp: {
    containers: [
      {
        name: 'azure-event-grid-viewer',
        image: 'microsoftlearning/azure-event-grid-viewer:latest',
        cpu: 0.5,
        memory: '1Gi',
        env: [
          {
            name: 'ENV_VAR1',
            value: 'value1',
          },
        ],
      },
    ],
  },
  kubernetesCluster: {
    nodeCount: 1,
    vmSize: 'Standard_DS2_v2',
    lifecycle: {
      ignoreChanges: ['default_node_pool'],
    },
  },
  storageAccount: {
    accountTier: 'Standard',
    accountReplicationType: 'LRS',
    storageContainers: [
      {
        name: 'functions',
        containerAccessType: 'private',
      },
    ],
  },
  // ref. https://learn.microsoft.com/en-us/azure/ai-services/openai/concepts/models?tabs=global-standard%2Cstandard-chat-completions
  logAnalyticsWorkspace: {
    location: 'japaneast',
    sku: 'PerGB2018',
  },
  applicationInsights: {},
  appConfiguration: {},
  servicePlan: {
    location: 'japaneast',
    osType: 'Linux',
    skuName: 'B1',
  },
  linuxWebApp: {
    appCommandLine:
      'gunicorn -w 2 -k uvicorn.workers.UvicornWorker -b 0.0.0.0:8000 main:app',
    applicationStack: {
      pythonVersion: '3.12',
    },
  },
  linuxFunctionApp: {
    applicationStack: {
      pythonVersion: '3.12',
    },
  },
  functionAppFunction: {
    name: 'helloFunction',
    language: 'Python',
    file: [
      {
        name: '__init__.py',
        content: pythonFunctionCode,
      },
    ],
    testData: testData,
    configJson: configJson,
  },
  servicePlanFlexConsumption: {
    location: 'japaneast',
    osType: 'Linux',
    skuName: 'FC1',
  },
  functionAppFlexConsumption: {
    location: 'japaneast',
    runtimeName: 'python',
    runtimeVersion: '3.12',
  },
  // FIXME: disable for now
  // functionAppFunctionFlexConsumption: {
  //   name: 'helloFunction',
  //   language: 'Python',
  //   file: [
  //     {
  //       name: '__init__.py',
  //       content: pythonFunctionCode,
  //     },
  //   ],
  //   testData: testData,
  //   configJson: configJson,
  // },
  apiManagement: {
    location: 'japaneast',
    publisherEmail: 'admin@example.com',
    publisherName: 'Admin',
    skuName: 'Consumption_0',
  },
};

export class AppAzurermStack extends TerraformStack {
  constructor(scope: Construct, id: string, props: AppAzurermStackProps) {
    super(scope, id);

    // Backend
    createBackend(this, id);

    // Providers
    new provider.AzurermProvider(this, 'azurerm', {
      features: [
        {
          resourceGroup: [
            {
              preventDeletionIfContainsResources: false,
            },
          ],
        },
      ],
    });

    // Resources
    const resourceGroup = new ResourceGroup(this, `ResourceGroup`, {
      name: `rg-${props.name}`,
      location: props.location,
      tags: props.tags,
    });
    new TerraformOutput(this, 'resource_group_name', {
      value: resourceGroup.resourceGroup.name,
    });

    if (props.containerRegistry) {
      new ContainerRegistry(this, `ContainerRegistry`, {
        name: convertName(`acr-${props.name}`),
        location: props.containerRegistry.location,
        tags: props.tags,
        resourceGroupName: resourceGroup.resourceGroup.name,
        sku: props.containerRegistry.sku,
        adminEnabled: props.containerRegistry.adminEnabled,
      });
    }

    if (props.containerAppEnvironment) {
      const containerAppEnvironment = new ContainerAppEnvironment(
        this,
        `ContainerAppEnvironment`,
        {
          name: `container-app-env-${props.name}`,
          location: props.location,
          tags: props.tags,
          resourceGroupName: resourceGroup.resourceGroup.name,
        },
      );

      if (props.containerApp) {
        new ContainerApp(this, `ContainerApp`, {
          name: convertName(`ca-${props.name}`),
          location: props.location,
          tags: props.tags,
          resourceGroupName: resourceGroup.resourceGroup.name,
          containerAppEnvironmentId:
            containerAppEnvironment.containerAppEnvironment.id,
          containerAppTemplateContainers: props.containerApp.containers,
        });
      }
    }

    if (props.kubernetesCluster) {
      const kubernetesCluster = new KubernetesCluster(
        this,
        `KubernetesCluster`,
        {
          name: convertName(`k8s-${props.name}`, 80),
          location: props.location,
          tags: props.tags,
          resourceGroupName: resourceGroup.resourceGroup.name,
          nodeCount: props.kubernetesCluster.nodeCount,
          vmSize: props.kubernetesCluster.vmSize,
          lifecycle: props.kubernetesCluster.lifecycle,
        },
      );

      new TerraformOutput(this, 'aks_cluster_name', {
        value: kubernetesCluster.kubernetesCluster.name,
      });
    }

    let storageAccount: StorageAccount | undefined = undefined;
    if (props.storageAccount) {
      storageAccount = new StorageAccount(this, `StorageAccount`, {
        name: convertName(`st-${props.name}`, 24),
        location: props.location,
        tags: props.tags,
        resourceGroupName: resourceGroup.resourceGroup.name,
        accountTier: props.storageAccount.accountTier,
        accountReplicationType: props.storageAccount.accountReplicationType,
      });
    }

    let logAnalyticsWorkspace: LogAnalyticsWorkspace | undefined = undefined;
    if (props.logAnalyticsWorkspace) {
      logAnalyticsWorkspace = new LogAnalyticsWorkspace(
        this,
        `LogAnalyticsWorkspace`,
        {
          name: `law-${props.name}`,
          location: props.logAnalyticsWorkspace?.location || props.location,
          tags: props.tags,
          resourceGroupName: resourceGroup.resourceGroup.name,
          sku: props.logAnalyticsWorkspace?.sku,
        },
      );
    }

    let applicationInsights: ApplicationInsights | undefined = undefined;
    if (props.applicationInsights && logAnalyticsWorkspace) {
      applicationInsights = new ApplicationInsights(
        this,
        `ApplicationInsights`,
        {
          name: `app-insights-${props.name}`,
          location: props.location,
          tags: props.tags,
          resourceGroupName: resourceGroup.resourceGroup.name,
          workspaceId: logAnalyticsWorkspace.logAnalyticsWorkspace.id,
        },
      );
    }

    if (props.appConfiguration) {
      new AppConfiguration(this, `AppConfiguration`, {
        name: `app-configuration-${props.name}`,
        location: props.location,
        tags: props.tags,
        resourceGroupName: resourceGroup.resourceGroup.name,
      });
    }

    if (props.servicePlan) {
      const servicePlan = new ServicePlan(this, `ServicePlan`, {
        name: `asp-${props.name}`,
        location: props.servicePlan.location,
        tags: props.tags,
        resourceGroupName: resourceGroup.resourceGroup.name,
        osType: props.servicePlan.osType,
        skuName: props.servicePlan.skuName,
      });

      if (props.linuxWebApp) {
        new LinuxWebApp(this, `LinuxWebApp`, {
          name: `wa-${props.name}`,
          location: props.location,
          tags: props.tags,
          resourceGroupName: resourceGroup.resourceGroup.name,
          servicePlanId: servicePlan.servicePlan.id,
          appCommandLine: props.linuxWebApp.appCommandLine,
          applicationStack: props.linuxWebApp.applicationStack,
        });
      }

      if (props.linuxFunctionApp && storageAccount) {
        const linuxFunctionApp = new LinuxFunctionApp(
          this,
          `LinuxFunctionApp`,
          {
            name: `fa-${props.name}`,
            location: props.location,
            tags: props.tags,
            resourceGroupName: resourceGroup.resourceGroup.name,
            storageAccountName: storageAccount.storageAccount.name,
            storageAccountAccessKey:
              storageAccount.storageAccount.primaryAccessKey,
            servicePlanId: servicePlan.servicePlan.id,
            applicationStack: props.linuxFunctionApp.applicationStack,
            applicationInsightsConnectionString: applicationInsights
              ? applicationInsights.applicationInsights.connectionString
              : undefined,
            applicationInsightsKey: applicationInsights
              ? applicationInsights.applicationInsights.instrumentationKey
              : undefined,
          },
        );

        if (props.functionAppFunction) {
          new FunctionAppFunction(this, `FunctionAppFunction`, {
            name: `py-${props.name}`,
            functionAppId: linuxFunctionApp.linuxFunctionApp.id,
            language: props.functionAppFunction.language,
            file: props.functionAppFunction.file,
            testData: props.functionAppFunction.testData,
            configJson: props.functionAppFunction.configJson,
          });
        }
      }
    }

    if (props.servicePlanFlexConsumption) {
      const servicePlanFlexConsumption = new ServicePlan(
        this,
        `ServicePlanFlexConsumption`,
        {
          name: `aspfc-${props.name}`,
          location: props.servicePlanFlexConsumption.location,
          tags: props.tags,
          resourceGroupName: resourceGroup.resourceGroup.name,
          osType: props.servicePlanFlexConsumption.osType,
          skuName: props.servicePlanFlexConsumption.skuName,
        },
      );

      if (props.functionAppFlexConsumption && storageAccount) {
        const functionAppFlexConsumption = new FunctionAppFlexConsumption(
          this,
          `FunctionAppFlexConsumption`,
          {
            name: `fafc-${props.name}`,
            location: props.functionAppFlexConsumption.location,
            tags: props.tags,
            resourceGroupName: resourceGroup.resourceGroup.name,
            servicePlanId: servicePlanFlexConsumption.servicePlan.id,
            storageContainerEndpoint: `${storageAccount.storageAccount.primaryBlobEndpoint}container1`,
            storageAccessKey: storageAccount.storageAccount.primaryAccessKey,
            runtimeName: props.functionAppFlexConsumption.runtimeName,
            runtimeVersion: props.functionAppFlexConsumption.runtimeVersion,
            applicationInsightsConnectionString: applicationInsights
              ? applicationInsights.applicationInsights.connectionString
              : undefined,
          },
        );

        if (props.functionAppFunctionFlexConsumption) {
          new FunctionAppFunction(this, `FunctionAppFunctionFlexConsumption`, {
            name: `fc-py-${props.name}`,
            functionAppId:
              functionAppFlexConsumption.functionAppFlexConsumption.id,
            language: props.functionAppFunctionFlexConsumption.language,
            file: props.functionAppFunctionFlexConsumption.file,
            testData: props.functionAppFunctionFlexConsumption.testData,
            configJson: props.functionAppFunctionFlexConsumption.configJson,
          });
        }
      }
    }

    if (props.apiManagement) {
      new ApiManagement(this, `ApiManagement`, {
        name: `apim-${props.name}`,
        location: props.apiManagement.location,
        tags: props.tags,
        resourceGroupName: resourceGroup.resourceGroup.name,
        publisherEmail: props.apiManagement.publisherEmail,
        publisherName: props.apiManagement.publisherName,
        skuName: props.apiManagement.skuName,
      });
    }
  }
}
