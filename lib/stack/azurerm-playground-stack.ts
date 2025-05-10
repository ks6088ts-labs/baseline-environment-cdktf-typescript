import { Construct } from 'constructs';
import {
  TerraformStack,
  TerraformOutput,
  TerraformResourceLifecycle,
} from 'cdktf';
import { UserAssignedIdentity } from '../construct/azurerm/user-assigned-identity';
import { RoleAssignment } from '../construct/azurerm/role-assignment';
import { LogAnalyticsWorkspace } from '../construct/azurerm/log-analytics-workspace';
import { AppConfiguration } from '../construct/azurerm/app-configuration';
import {
  provider,
  linuxFunctionApp,
  functionAppFunction,
  containerRegistry,
} from '@cdktf/provider-azurerm';
import { AiFoundryProject } from '../construct/azurerm/ai-foundry-project';
import { AiFoundry } from '../construct/azurerm/ai-foundry';
import { AiServices } from '../construct/azurerm/ai-services';
import { ContainerAppEnvironment } from '../construct/azurerm/container-app-environment';
import { ContainerApp } from '../construct/azurerm/container-app';
import { ContainerRegistry } from '../construct/azurerm/container-registry';
import { Cosmosdb } from '../construct/azurerm/cosmosdb';
import { ApiManagement } from '../construct/azurerm/api-management';
import { KeyVault } from '../construct/azurerm/key-vault';
import { KubernetesCluster } from '../construct/azurerm/kubernetes-cluster';
import { ResourceGroup } from '../construct/azurerm/resource-group';
import {
  StorageAccount,
  StorageContainerProps,
} from '../construct/azurerm/storage-account';
import { ServicePlan } from '../construct/azurerm/service-plan';
import { LinuxFunctionApp } from '../construct/azurerm/linux-function-app';
import { FunctionAppFunction } from '../construct/azurerm/function-app-function';
import { FunctionAppFlexConsumption } from '../construct/azurerm/function-app-flex-consumption';
import { Iothub } from '../construct/azurerm/iothub';
import { VirtualNetwork } from '../construct/azurerm/virtual-network';
import { Subnet } from '../construct/azurerm/subnet';
import { VirtualMachine } from '../construct/azurerm/virtual-machine';
import { BastionHost } from '../construct/azurerm/bastion';
import { PrivateDnsZone } from '../construct/azurerm/private-dns-zone';
import { PrivateEndpoint } from '../construct/azurerm/private-endpoint';
import { MonitorDiagnosticSetting } from '../construct/azurerm/monitor-diagnostic-setting';
import { MonitorWorkspace } from '../construct/azurerm/monitor-workspace';
import { ApplicationInsights } from '../construct/azurerm/application-insights';
import { EventgridNamespace } from '../construct/azurerm/eventgrid-namespace';
import { EventgridDomain } from '../construct/azurerm/eventgrid-domain';
import { DashboardGrafana } from '../construct/azurerm/dashboard-grafana';
import { convertName, getRandomIdentifier, createBackend } from '../utils';

interface AiServicesDeployment {
  name: string;
  model: {
    name: string;
    version: string;
  };
  sku: {
    name: string;
    capacity: number;
  };
}

export interface AzurermPlaygroundStackProps {
  name: string;
  location: string;
  tags?: { [key: string]: string };
  resourceGroup: {};
  userAssignedIdentity?: {};
  roleAssignment?: {};
  logAnalyticsWorkspace?: {
    location: string;
    sku: string | undefined;
  };
  appConfiguration?: {};
  aiServices?: {
    location: string;
    publicNetworkAccess?: string;
    deployments?: AiServicesDeployment[];
  }[];
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
  apiManagement?: {
    location: string;
    publisherEmail: string;
    publisherName: string;
    skuName: string;
  };
  storageAccount?: {
    accountTier: string;
    accountReplicationType: string;
    storageContainers?: StorageContainerProps[];
  };
  keyVault?: {
    skuName: string;
  };
  aiFoundry?: {};
  aiFoundryProject?: {};
  kubernetesCluster?: {
    nodeCount: number;
    vmSize: string;
    lifecycle?: TerraformResourceLifecycle;
  };
  containerRegistry?: {
    location: string;
    sku: string;
    adminEnabled: boolean;
  };
  cosmosdb?: {
    location: string;
    partitionKeyPaths: string[];
  };
  servicePlan?: {
    location: string;
    osType: string;
    skuName: string;
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
  iothub?: {
    location: string;
    skuName: string;
    capacity: number;
  };
  virtualNetwork?: {};
  subnet?: {
    name: string;
    addressPrefixes: string[];
  }[];
  virtualMachine?: {
    vmSize: string;
  };
  bastionHost?: {
    sku: string;
  };
  privateDnsZone?: {};
  privateEndpoint?: {};
  monitorDiagnosticSetting?: {};
  monitorWorkspace?: {};
  applicationInsights?: {};
  eventgridNamespace?: {};
  eventgridDomain?: {
    inputSchema: string;
  };
  dashboardGrafana?: {};
}

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

export const devAzurermPlaygroundStackProps: AzurermPlaygroundStackProps = {
  name: `Dev-AzurermPlaygroundStack-${getRandomIdentifier('Dev-AzurermPlaygroundStack')}`,
  location: 'japaneast',
  tags: {
    owner: 'ks6088ts',
  },
  resourceGroup: {},
  // ref. https://learn.microsoft.com/en-us/azure/ai-services/openai/concepts/models?tabs=global-standard%2Cstandard-chat-completions
  logAnalyticsWorkspace: {
    location: 'japaneast',
    sku: 'PerGB2018',
  },
  appConfiguration: {},
  aiServices: [
    {
      location: 'japaneast',
      deployments: [
        {
          name: 'o3-mini',
          model: {
            name: 'o3-mini',
            version: '2025-01-31',
          },
          sku: {
            name: 'GlobalStandard',
            capacity: 500,
          },
        },
        {
          name: 'o1',
          model: {
            name: 'o1',
            version: '2024-12-17',
          },
          sku: {
            name: 'GlobalStandard',
            capacity: 500,
          },
        },
        {
          name: 'gpt-4o',
          model: {
            name: 'gpt-4o',
            version: '2024-11-20',
          },
          sku: {
            name: 'GlobalStandard',
            capacity: 450,
          },
        },
        {
          name: 'gpt-4o-mini',
          model: {
            name: 'gpt-4o-mini',
            version: '2024-07-18',
          },
          sku: {
            name: 'GlobalStandard',
            capacity: 2000,
          },
        },
        {
          name: 'text-embedding-3-large',
          model: {
            name: 'text-embedding-3-large',
            version: '1',
          },
          sku: {
            name: 'Standard',
            capacity: 350,
          },
        },
        {
          name: 'text-embedding-3-small',
          model: {
            name: 'text-embedding-3-small',
            version: '1',
          },
          sku: {
            name: 'Standard',
            capacity: 350,
          },
        },
      ],
    },
    {
      location: 'eastus',
      deployments: [
        {
          name: 'o3-mini',
          model: {
            name: 'o3-mini',
            version: '2025-01-31',
          },
          sku: {
            name: 'GlobalStandard',
            capacity: 500,
          },
        },
        {
          name: 'o1',
          model: {
            name: 'o1',
            version: '2024-12-17',
          },
          sku: {
            name: 'GlobalStandard',
            capacity: 500,
          },
        },
        {
          name: 'gpt-4o',
          model: {
            name: 'gpt-4o',
            version: '2024-11-20',
          },
          sku: {
            name: 'GlobalStandard',
            capacity: 450,
          },
        },
        {
          name: 'gpt-4o-mini',
          model: {
            name: 'gpt-4o-mini',
            version: '2024-07-18',
          },
          sku: {
            name: 'GlobalStandard',
            capacity: 2000,
          },
        },
        {
          name: 'text-embedding-3-large',
          model: {
            name: 'text-embedding-3-large',
            version: '1',
          },
          sku: {
            name: 'Standard',
            capacity: 350,
          },
        },
        {
          name: 'text-embedding-3-small',
          model: {
            name: 'text-embedding-3-small',
            version: '1',
          },
          sku: {
            name: 'Standard',
            capacity: 350,
          },
        },
      ],
    },
    {
      location: 'eastus2',
      deployments: [
        {
          name: 'gpt-4.1',
          model: {
            name: 'gpt-4.1',
            version: '2025-04-14',
          },
          sku: {
            name: 'GlobalStandard',
            capacity: 1000,
          },
        },
        {
          name: 'gpt-4.5-preview',
          model: {
            name: 'gpt-4.5-preview',
            version: '2025-02-27',
          },
          sku: {
            name: 'GlobalStandard',
            capacity: 150,
          },
        },
        {
          name: 'o4-mini',
          model: {
            name: 'o4-mini',
            version: '2025-04-16',
          },
          sku: {
            name: 'GlobalStandard',
            capacity: 1000,
          },
        },
        {
          name: 'o3',
          model: {
            name: 'o3',
            version: '2025-04-16',
          },
          sku: {
            name: 'GlobalStandard',
            capacity: 1000,
          },
        },
        {
          name: 'o3-mini',
          model: {
            name: 'o3-mini',
            version: '2025-01-31',
          },
          sku: {
            name: 'GlobalStandard',
            capacity: 500,
          },
        },
        {
          name: 'o1',
          model: {
            name: 'o1',
            version: '2024-12-17',
          },
          sku: {
            name: 'GlobalStandard',
            capacity: 500,
          },
        },
        {
          name: 'gpt-4o',
          model: {
            name: 'gpt-4o',
            version: '2024-11-20',
          },
          sku: {
            name: 'GlobalStandard',
            capacity: 450,
          },
        },
        {
          name: 'gpt-4o-transcribe',
          model: {
            name: 'gpt-4o-transcribe',
            version: '2025-03-20',
          },
          sku: {
            name: 'GlobalStandard',
            capacity: 160,
          },
        },
        {
          name: 'gpt-4o-mini',
          model: {
            name: 'gpt-4o-mini',
            version: '2024-07-18',
          },
          sku: {
            name: 'GlobalStandard',
            capacity: 2000,
          },
        },
        {
          name: 'gpt-4o-mini-tts',
          model: {
            name: 'gpt-4o-mini-tts',
            version: '2025-03-20',
          },
          sku: {
            name: 'GlobalStandard',
            capacity: 160,
          },
        },
        {
          name: 'gpt-4o-mini-transcribe',
          model: {
            name: 'gpt-4o-mini-transcribe',
            version: '2025-03-20',
          },
          sku: {
            name: 'GlobalStandard',
            capacity: 160,
          },
        },
        {
          name: 'gpt-4o-mini-realtime-preview',
          model: {
            name: 'gpt-4o-mini-realtime-preview',
            version: '2024-12-17',
          },
          sku: {
            name: 'GlobalStandard',
            capacity: 6,
          },
        },
        {
          name: 'gpt-4o-mini-audio-preview',
          model: {
            name: 'gpt-4o-mini-audio-preview',
            version: '2024-12-17',
          },
          sku: {
            name: 'GlobalStandard',
            capacity: 2000,
          },
        },
        {
          name: 'text-embedding-3-large',
          model: {
            name: 'text-embedding-3-large',
            version: '1',
          },
          sku: {
            name: 'Standard',
            capacity: 350,
          },
        },
        {
          name: 'text-embedding-3-small',
          model: {
            name: 'text-embedding-3-small',
            version: '1',
          },
          sku: {
            name: 'Standard',
            capacity: 350,
          },
        },
        {
          name: 'whisper',
          model: {
            name: 'whisper',
            version: '001',
          },
          sku: {
            name: 'Standard',
            capacity: 3,
          },
        },
      ],
    },
    {
      location: 'westus3',
      deployments: [
        {
          name: 'gpt-image-1',
          model: {
            name: 'gpt-image-1',
            version: '2025-04-15',
          },
          sku: {
            name: 'GlobalStandard',
            capacity: 2,
          },
        },
      ],
    },
  ],
  containerAppEnvironment: {},
  containerApp: {
    containers: [
      {
        name: 'nginx',
        image: 'nginx:latest',
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
  apiManagement: {
    location: 'japaneast',
    publisherEmail: 'owner@example.com',
    publisherName: 'Owner Name',
    skuName: 'Consumption_0',
  },
  storageAccount: {
    accountTier: 'Standard',
    accountReplicationType: 'LRS',
    storageContainers: [
      {
        name: 'container1',
        containerAccessType: 'private',
      },
      {
        name: 'container2',
        containerAccessType: 'private',
      },
    ],
  },
  keyVault: {
    skuName: 'standard',
  },
  aiFoundry: {},
  aiFoundryProject: {},
  kubernetesCluster: {
    nodeCount: 1,
    vmSize: 'Standard_DS2_v2',
    lifecycle: {
      ignoreChanges: ['default_node_pool'],
    },
  },
  containerRegistry: {
    location: 'japaneast',
    sku: 'Basic',
    adminEnabled: true,
  },
  cosmosdb: {
    location: 'japaneast',
    partitionKeyPaths: ['/partitionKey'],
  },
  servicePlan: {
    location: 'japaneast',
    osType: 'Linux',
    skuName: 'B1',
  },
  linuxFunctionApp: {
    applicationStack: {
      pythonVersion: '3.11',
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
  // FIXME: Uncomment the following lines to enable Flex Consumption
  // servicePlanFlexConsumption: {
  //   // View currently supported regions: https://learn.microsoft.com/en-us/azure/azure-functions/flex-consumption-how-to?tabs=azure-cli%2Cvs-code-publish&pivots=programming-language-csharp#view-currently-supported-regions
  //   // $ az functionapp list-flexconsumption-locations --output table
  //   location: 'eastus',
  //   osType: 'Linux',
  //   skuName: 'FC1',
  // },
  // functionAppFlexConsumption: {
  //   runtimeName: 'python',
  //   runtimeVersion: '3.11',
  // },
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
  iothub: {
    location: 'japaneast',
    skuName: 'S1',
    capacity: 1,
  },
  monitorDiagnosticSetting: {},
  monitorWorkspace: {},
  applicationInsights: {},
  eventgridNamespace: {},
  eventgridDomain: {
    inputSchema: 'CloudEventSchemaV1_0',
  },
  dashboardGrafana: {},
};

export const prodAzurermPlaygroundStackProps: AzurermPlaygroundStackProps = {
  name: `Prod-AzurermPlaygroundStack-${getRandomIdentifier('Prod-AzurermPlaygroundStack')}`,
  location: 'japaneast',
  tags: {
    owner: 'ks6088ts',
  },
  resourceGroup: {},
  userAssignedIdentity: {},
  roleAssignment: {},
  aiServices: [
    {
      location: 'francecentral',
      publicNetworkAccess: 'Disabled',
      deployments: [
        {
          name: 'gpt-4o',
          model: {
            name: 'gpt-4o',
            version: '2024-11-20',
          },
          sku: {
            name: 'GlobalStandard',
            capacity: 450,
          },
        },
      ],
    },
    {
      location: 'westeurope',
      publicNetworkAccess: 'Disabled',
      deployments: [
        {
          name: 'gpt-4o',
          model: {
            name: 'gpt-4o',
            version: '2024-11-20',
          },
          sku: {
            name: 'GlobalStandard',
            capacity: 450,
          },
        },
      ],
    },
  ],
  storageAccount: {
    accountTier: 'Standard',
    accountReplicationType: 'LRS',
    storageContainers: [
      {
        name: 'container1',
        containerAccessType: 'private',
      },
      {
        name: 'container2',
        containerAccessType: 'private',
      },
    ],
  },
  keyVault: {
    skuName: 'standard',
  },
  containerRegistry: {
    location: 'japaneast',
    sku: 'Premium', // to use Private Endpoint, Premium is required
    adminEnabled: true,
  },
  virtualNetwork: {},
  subnet: [
    {
      name: 'VmSubnet',
      addressPrefixes: ['10.240.0.0/16'],
    },
    {
      name: 'AzureBastionSubnet',
      addressPrefixes: ['10.241.0.0/16'],
    },
    {
      name: 'PrivateEndpointSubnet',
      addressPrefixes: ['10.242.0.0/16'],
    },
  ],
  virtualMachine: {
    vmSize: 'Standard_DS2_v2',
  },
  bastionHost: {
    sku: 'Basic',
  },
  privateDnsZone: {},
  privateEndpoint: {},
};

export class AzurermPlaygroundStack extends TerraformStack {
  constructor(
    scope: Construct,
    id: string,
    props: AzurermPlaygroundStackProps,
  ) {
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

    let userAssignedIdentity: UserAssignedIdentity | undefined = undefined;
    if (props.userAssignedIdentity) {
      userAssignedIdentity = new UserAssignedIdentity(
        this,
        `UserAssignedIdentity`,
        {
          name: `uai-${props.name}`,
          location: props.location,
          tags: props.tags,
          resourceGroupName: resourceGroup.resourceGroup.name,
        },
      );
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

    if (props.appConfiguration) {
      new AppConfiguration(this, `AppConfiguration`, {
        name: `app-configuration-${props.name}`,
        location: props.location,
        tags: props.tags,
        resourceGroupName: resourceGroup.resourceGroup.name,
      });
    }

    let aiServicesArray: AiServices[] = [];
    if (props.aiServices) {
      aiServicesArray = props.aiServices.map((aiService, i) => {
        return new AiServices(this, `AiServices-${aiService.location}-${i}`, {
          name: `ai-services-${props.name}-${i}`,
          location: aiService.location,
          tags: props.tags,
          resourceGroupName: resourceGroup.resourceGroup.name,
          customSubdomainName: `ai-services-${props.name}-${i}`.toLowerCase(),
          skuName: 'S0',
          publicNetworkAccess: aiService.publicNetworkAccess,
          deployments: aiService.deployments,
        });
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

    let containerRegistry: ContainerRegistry | undefined = undefined;
    if (props.containerRegistry) {
      containerRegistry = new ContainerRegistry(this, `ContainerRegistry`, {
        name: convertName(`acr-${props.name}`),
        location: props.containerRegistry.location,
        tags: props.tags,
        resourceGroupName: resourceGroup.resourceGroup.name,
        sku: props.containerRegistry.sku,
        adminEnabled: props.containerRegistry.adminEnabled,
      });
    }

    if (props.cosmosdb) {
      new Cosmosdb(this, `Cosmosdb`, {
        name: convertName(`cosmosdb-${props.name}`, 50),
        location: props.cosmosdb.location,
        tags: props.tags,
        resourceGroupName: resourceGroup.resourceGroup.name,
        partitionKeyPaths: props.cosmosdb.partitionKeyPaths,
      });
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

    let keyVault: KeyVault | undefined = undefined;
    if (props.keyVault) {
      keyVault = new KeyVault(this, `KeyVault`, {
        name: convertName(`kv-${props.name}`, 24),
        location: props.location,
        tags: props.tags,
        resourceGroupName: resourceGroup.resourceGroup.name,
        skuName: props.keyVault.skuName,
        purgeProtectionEnabled: false,
      });
    }

    if (props.aiFoundry && storageAccount && keyVault) {
      const aiFoundry = new AiFoundry(this, `AiFoundry`, {
        name: convertName(`af-${props.name}`, 33),
        location: props.location,
        tags: props.tags,
        resourceGroupName: resourceGroup.resourceGroup.name,
        storageAccountId: storageAccount.storageAccount.id,
        keyVaultId: keyVault.keyVault.id,
      });

      if (props.aiFoundryProject) {
        new AiFoundryProject(this, `AiFoundryProject`, {
          name: convertName(`afp-${props.name}`, 32),
          location: props.location,
          tags: props.tags,
          aiServicesHubId: aiFoundry.aiFoundry.id,
        });
      }
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
      const servicePlan = new ServicePlan(this, `ServicePlanFlexConsumption`, {
        name: `aspfc-${props.name}`,
        location: props.servicePlanFlexConsumption.location,
        tags: props.tags,
        resourceGroupName: resourceGroup.resourceGroup.name,
        osType: props.servicePlanFlexConsumption.osType,
        skuName: props.servicePlanFlexConsumption.skuName,
      });

      if (props.functionAppFlexConsumption && storageAccount) {
        const functionAppFlexConsumption = new FunctionAppFlexConsumption(
          this,
          `FunctionAppFlexConsumption`,
          {
            name: `fafc-${props.name}`,
            location: props.location,
            tags: props.tags,
            resourceGroupName: resourceGroup.resourceGroup.name,
            servicePlanId: servicePlan.servicePlan.id,
            storageContainerEndpoint: `${storageAccount.storageAccount.primaryBlobEndpoint}container1`,
            storageAccessKey: storageAccount.storageAccount.primaryAccessKey,
            runtimeName: props.functionAppFlexConsumption.runtimeName,
            runtimeVersion: props.functionAppFlexConsumption.runtimeVersion,
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

    if (props.iothub) {
      new Iothub(this, `Iothub`, {
        name: `iothub-${props.name}`,
        location: props.iothub.location,
        tags: props.tags,
        resourceGroupName: resourceGroup.resourceGroup.name,
        skuName: props.iothub.skuName,
        capacity: props.iothub.capacity,
      });
    }

    let virtualNetwork: VirtualNetwork | undefined = undefined;
    if (props.virtualNetwork) {
      virtualNetwork = new VirtualNetwork(this, `VirtualNetwork`, {
        name: `vnet-${props.name}`,
        location: props.location,
        tags: props.tags,
        resourceGroupName: resourceGroup.resourceGroup.name,
        addressSpace: ['10.0.0.0/8'],
      });
    }

    let subnet: Subnet | undefined = undefined;
    if (props.subnet && virtualNetwork) {
      subnet = new Subnet(this, `Subnet`, {
        subnets: props.subnet.map((subnet) => {
          return {
            name: subnet.name,
            resourceGroupName: resourceGroup.resourceGroup.name,
            virtualNetworkName: virtualNetwork.virtualNetwork.name,
            addressPrefixes: subnet.addressPrefixes,
          };
        }),
      });
    }

    if (props.virtualMachine && subnet) {
      new VirtualMachine(this, `VirtualMachine`, {
        name: `vm-${props.name}`,
        location: props.location,
        tags: props.tags,
        resourceGroupName: resourceGroup.resourceGroup.name,
        subnetId: subnet.subnets[0].id,
        vmSize: props.virtualMachine.vmSize,
        identityIds: userAssignedIdentity
          ? [userAssignedIdentity.userAssignedIdentity.id]
          : undefined,
      });
    }

    if (props.bastionHost && subnet) {
      new BastionHost(this, `BastionHost`, {
        name: `bastion-${props.name}`,
        location: props.location,
        tags: props.tags,
        resourceGroupName: resourceGroup.resourceGroup.name,
        sku: props.bastionHost.sku,
        subnetId: subnet.subnets[1].id,
      });
    }

    // Create Private DNS Zones for different services
    const privateDnsZones: { [key: string]: PrivateDnsZone } = {};
    if (props.privateDnsZone && virtualNetwork) {
      const dnsZoneConfigs = [
        { id: 'OpenAi', name: 'privatelink.openai.azure.com' },
        { id: 'StorageAccount', name: 'privatelink.blob.core.windows.net' },
        { id: 'KeyVault', name: 'privatelink.vaultcore.azure.net' },
        { id: 'ContainerRegistry', name: 'privatelink.azurecr.io' },
      ];

      dnsZoneConfigs.forEach((config) => {
        privateDnsZones[config.id] = new PrivateDnsZone(
          this,
          `PrivateDnsZone${config.id}`,
          {
            name: config.name,
            tags: props.tags,
            resourceGroupName: resourceGroup.resourceGroup.name,
            virtualNetworkId: virtualNetwork.virtualNetwork.id,
          },
        );
      });
    }

    // Create Private Endpoints
    if (props.privateEndpoint && subnet) {
      // Create Private Endpoints for AI Services
      if (privateDnsZones['OpenAi']) {
        aiServicesArray.forEach((aiService) => {
          new PrivateEndpoint(
            this,
            `PrivateEndpoint-${aiService.aiServices.name}`,
            {
              name: `pe-${aiService.aiServices.name}`,
              location: props.location,
              tags: props.tags,
              resourceGroupName: resourceGroup.resourceGroup.name,
              subnetId: subnet.subnets[2].id,
              privateConnectionResourceId: aiService.aiServices.id,
              subresourceNames: ['account'],
              privateDnsZoneIds: [privateDnsZones['OpenAi'].privateDnsZone.id],
            },
          );
        });
      }

      // Create Private Endpoints for other services
      const endpointConfigs = [
        {
          id: 'StorageAccount',
          condition: !!storageAccount,
          resourceId: storageAccount?.storageAccount.id,
          subresource: 'blob',
        },
        {
          id: 'KeyVault',
          condition: !!keyVault,
          resourceId: keyVault?.keyVault.id,
          subresource: 'vault',
        },
        {
          id: 'ContainerRegistry',
          condition: !!containerRegistry,
          resourceId: containerRegistry?.containerRegistry.id,
          subresource: 'registry',
        },
      ];

      endpointConfigs.forEach((config) => {
        if (
          config.condition &&
          privateDnsZones[config.id] &&
          config.resourceId
        ) {
          new PrivateEndpoint(this, `PrivateEndpoint${config.id}`, {
            name: `pe-${config.id.toLowerCase()}-${props.name}`,
            location: props.location,
            tags: props.tags,
            resourceGroupName: resourceGroup.resourceGroup.name,
            subnetId: subnet.subnets[2].id,
            privateConnectionResourceId: config.resourceId,
            subresourceNames: [config.subresource],
            privateDnsZoneIds: [privateDnsZones[config.id].privateDnsZone.id],
          });
        }
      });
    }

    if (props.roleAssignment && userAssignedIdentity) {
      for (const aiService of aiServicesArray) {
        new RoleAssignment(
          this,
          `RoleAssignment-${aiService.aiServices.name}`,
          {
            principalId: userAssignedIdentity.userAssignedIdentity.principalId,
            roleDefinitionName: 'Cognitive Services OpenAI User',
            scope: aiService.aiServices.id,
          },
        );
      }
    }

    if (props.monitorDiagnosticSetting && logAnalyticsWorkspace) {
      for (const aiService of aiServicesArray) {
        const name = `MonitorDiagnosticSetting-${aiService.aiServices.name}`;
        new MonitorDiagnosticSetting(this, name, {
          name: name,
          targetResourceId: aiService.aiServices.id,
          logAnalyticsWorkspaceId:
            logAnalyticsWorkspace.logAnalyticsWorkspace.id,
          enabledLog: [
            {
              categoryGroup: 'Audit',
            },
          ],
        });
      }
    }

    if (props.monitorWorkspace) {
      const monitorWorkspace = new MonitorWorkspace(this, `MonitorWorkspace`, {
        name: convertName(`mw-${props.name}`, 44),
        location: props.location,
        tags: props.tags,
        resourceGroupName: resourceGroup.resourceGroup.name,
      });

      if (props.applicationInsights && logAnalyticsWorkspace) {
        new ApplicationInsights(this, `ApplicationInsights`, {
          name: `app-insights-${props.name}`,
          location: props.location,
          tags: props.tags,
          resourceGroupName: resourceGroup.resourceGroup.name,
          workspaceId: logAnalyticsWorkspace.logAnalyticsWorkspace.id,
        });
      }

      if (props.dashboardGrafana) {
        new DashboardGrafana(this, `DashboardGrafana`, {
          name: convertName(`grafana-${props.name}`, 23),
          location: props.location,
          tags: props.tags,
          resourceGroupName: resourceGroup.resourceGroup.name,
          azureMonitorWorkspaceIntegrations: [
            {
              resourceId: monitorWorkspace.monitorWorkspace.id,
            },
          ],
        });
      }

      if (props.eventgridNamespace) {
        new EventgridNamespace(this, `EventgridNamespace`, {
          name: `eg-${props.name}`,
          location: props.location,
          tags: props.tags,
          resourceGroupName: resourceGroup.resourceGroup.name,
          sku: 'Standard',
        });
      }

      if (props.eventgridDomain) {
        new EventgridDomain(this, `EventgridDomain`, {
          name: `eg-domain-${props.name}`,
          location: props.location,
          tags: props.tags,
          resourceGroupName: resourceGroup.resourceGroup.name,
          inputSchema: props.eventgridDomain.inputSchema,
        });
      }
    }
  }
}
