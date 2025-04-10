#!/usr/bin/env node
import { App } from 'cdktf';
import { ResourceGroupStack } from '../lib/resource-group-stack';
import { AiServicesStack } from '../lib/ai-services-stack';

const app = new App();

// ----------------------- Load context variables ------------------------------
// Environment Key (dev,stage,prod...) from environment variable `CDKTF_ENVIRONMENT`
const envKey = process.env.CDKTF_ENVIRONMENT;
if (envKey == undefined)
  throw new Error(
    `Please specify environment from environment variable. e.g.: CDKTF_ENVIRONMENT=dev cdktf synth`,
  );

// Array of environment variables. These values should be defined in cdktf.json
const envVals = app.node.tryGetContext(envKey);
if (envVals == undefined) throw new Error('Invalid environment.');

const randomIdentifier = Math.random().toString(36).substring(2, 8);
const name = `${envVals['name']}-${envKey}-${randomIdentifier}`;
const location = envVals['location'];
const tags = envVals['tags'];

// ----------------------- Create stacks ------------------------------
const resourceGroupStack = new ResourceGroupStack(app, `ResourceGroupStack`, {
  name: envVals['ResourceGroupStack']['name'] || `rg-${name}`,
  location: envVals['ResourceGroupStack']['location'] || location,
  tags: envVals['ResourceGroupStack']['tags'] || tags,
});

new AiServicesStack(app, `AiServicesStack`, {
  name: `ai-services-${name}`,
  location: envVals['AiServicesStack']['location'] || location,
  tags: tags,
  resourceGroupName: resourceGroupStack.resourceGroup.name,
  customSubdomainName: `ai-services-${name}`,
  skuName: 'S0',
  publicNetworkAccess: 'Enabled',
  deployments: envVals['AiServicesStack']['deployments'] || [],
});

app.synth();
