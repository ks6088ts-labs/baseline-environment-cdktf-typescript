import { Construct } from 'constructs';
import { TerraformStack } from 'cdktf';
import { LogAnalyticsWorkspace } from '../construct/azurerm/log-analytics-workspace';
import {
  provider,
  linuxFunctionApp,
  functionAppFunction,
} from '@cdktf/provider-azurerm';
import { AiFoundryProject } from '../construct/azurerm/ai-foundry-project';
import { AiFoundry } from '../construct/azurerm/ai-foundry';
import { AiServices } from '../construct/azurerm/ai-services';
import { ContainerAppEnvironment } from '../construct/azurerm/container-app-environment';
import { ContainerApp } from '../construct/azurerm/container-app';
import { ContainerRegistry } from '../construct/azurerm/container-registry';
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
import { VirtualNetwork } from '../construct/azurerm/virtual-network';
import { Subnet } from '../construct/azurerm/subnet';
import { VirtualMachine } from '../construct/azurerm/virtual-machine';
import { BastionHost } from '../construct/azurerm/bastion';
import { MonitorDiagnosticSetting } from '../construct/azurerm/monitor-diagnostic-setting';
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

export interface PlaygroundStackProps {
  name: string;
  location: string;
  tags?: { [key: string]: string };
  resourceGroup: {};
  logAnalyticsWorkspace?: {
    location: string;
    sku: string | undefined;
  };
  aiServices?: {
    location: string;
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
  };
  containerRegistry?: {
    location: string;
    sku: string;
    adminEnabled: boolean;
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
  virtualNetwork?: {};
  subnet?: {
    name: string;
    addressPrefixes: string[];
  }[];
  virtualMachine?: {
    vmSize: string;
  };
  bastionHost?: {};
  monitorDiagnosticSetting?: {};
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

export const devPlaygroundStackProps: PlaygroundStackProps = {
  name: `Dev-PlaygroundStack-${getRandomIdentifier('Dev-PlaygroundStack')}`,
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
  ],
  containerAppEnvironment: {},
  containerApp: {
    containers: [
      {
        name: 'nginx',
        image: 'nginx:latest',
        cpu: 0.5,
        memory: '1.0Gi',
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
  },
  containerRegistry: {
    location: 'japaneast',
    sku: 'Basic',
    adminEnabled: true,
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
  monitorDiagnosticSetting: {},
};

export const prodPlaygroundStackProps: PlaygroundStackProps = {
  name: `Prod-PlaygroundStack-${getRandomIdentifier('Prod-PlaygroundStack')}`,
  location: 'japaneast',
  tags: {
    owner: 'ks6088ts',
  },
  resourceGroup: {},
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
  ],
  virtualMachine: {
    vmSize: 'Standard_DS2_v2',
  },
  bastionHost: {},
};

export class PlaygroundStack extends TerraformStack {
  constructor(scope: Construct, id: string, props: PlaygroundStackProps) {
    super(scope, id);

    // Backend
    createBackend(this, 'PlaygroundStack');

    // Providers
    new provider.AzurermProvider(this, 'azurerm', {
      features: [{}],
    });

    // Resources
    const resourceGroup = new ResourceGroup(this, `ResourceGroup`, {
      name: `rg-${props.name}`,
      location: props.location,
      tags: props.tags,
    });

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

    let aiServicesArray: AiServices[] = [];
    if (props.aiServices) {
      aiServicesArray = props.aiServices.map((aiService, i) => {
        return new AiServices(this, `AiServices-${aiService.location}-${i}`, {
          name: `ai-services-${props.name}-${i}`,
          location: aiService.location,
          tags: props.tags,
          resourceGroupName: resourceGroup.resourceGroup.name,
          customSubdomainName: `ai-services-${props.name}-${i}`,
          skuName: 'S0',
          publicNetworkAccess: 'Enabled',
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
      new KubernetesCluster(this, `KubernetesCluster`, {
        name: `k8s-${props.name}`,
        location: props.location,
        tags: props.tags,
        resourceGroupName: resourceGroup.resourceGroup.name,
        nodeCount: props.kubernetesCluster.nodeCount,
        vmSize: props.kubernetesCluster.vmSize,
      });
    }

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
        name: `af-${props.name}`,
        location: props.location,
        tags: props.tags,
        resourceGroupName: resourceGroup.resourceGroup.name,
        storageAccountId: storageAccount.storageAccount.id,
        keyVaultId: keyVault.keyVault.id,
      });

      if (props.aiFoundryProject) {
        new AiFoundryProject(this, `AiFoundryProject`, {
          name: `afp-${props.name}`,
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
      });
    }

    if (props.bastionHost && subnet) {
      new BastionHost(this, `BastionHost`, {
        name: `bastion-${props.name}`,
        location: props.location,
        tags: props.tags,
        resourceGroupName: resourceGroup.resourceGroup.name,
        subnetId: subnet.subnets[1].id,
      });
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
  }
}
