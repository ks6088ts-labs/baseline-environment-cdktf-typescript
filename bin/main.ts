#!/usr/bin/env node
import { App } from 'cdktf';
import { ResourceGroupStack } from '../lib/resource-group-stack';
import { AiServicesStack } from '../lib/ai-services-stack';

const app = new App();

const randomIdentifier = Math.random().toString(36).substring(2, 8);
const name = `cdktf-typescript-${randomIdentifier}`;
const location = 'japaneast';
const tags = {
  owner: 'ks6088ts',
};

const resourceGroupStack = new ResourceGroupStack(app, 'resourceGroupStack', {
  name: name,
  location: location,
  tags: tags,
});
new AiServicesStack(app, 'aiServicesStack', {
  name: `ai-services-${name}`,
  location: 'swedencentral',
  tags: tags,
  resourceGroupName: resourceGroupStack.resourceGroup.name,
  customSubdomainName: `ai-services-${name}`,
  skuName: 'S0',
  publicNetworkAccess: 'Enabled',
  deployments: [
    {
      name: 'gpt-4o',
      model: {
        name: 'gpt-4o',
        version: '2024-08-06',
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
  ],
});

app.synth();
