#!/usr/bin/env node
import { App } from 'cdktf';
import { ResourceGroupStack } from '../lib/resource-group-stack';
import { AiServicesStack } from '../lib/ai-services-stack';
import { ContainerAppEnvironmentStack } from '../lib/container-app-environment';
import { ContainerAppStack } from '../lib/container-app';

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

const location = envVals['location'];
const tags = envVals['tags'];

// derive randomIdentifier from a pair of envKey and location
const randomIdentifier = (envKey + location)
  .split('')
  .reduce((acc, char) => {
    acc = (acc << 5) - acc + char.charCodeAt(0);
    return acc & acc; // Convert to 32bit integer
  }, 0)
  .toString(36)
  .substring(2, 8);
// const randomIdentifier = Math.random().toString(36).substring(2, 8);

const name = `${envVals['name']}-${envKey}-${randomIdentifier}`;

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

const containerAppEnvironmentStack = new ContainerAppEnvironmentStack(
  app,
  `ContainerAppEnvironmentStack`,
  {
    name: `container-app-env-${name}`,
    location: envVals['ContainerAppEnvironmentStack']['location'] || location,
    tags: tags,
    resourceGroupName: resourceGroupStack.resourceGroup.name,
  },
);

new ContainerAppStack(app, `ContainerAppStack`, {
  // "name" must consist of lower case alphanumeric characters or '-', start with an alphabetic character, and end with an alphanumeric character and cannot have '--'. The length must not be more than 32 characters
  name: `ca-${name}`
    .replace(/[^a-z0-9]/g, '')
    .toLowerCase()
    .substring(0, 32),
  location: envVals['ContainerAppStack']['location'] || location,
  tags: tags,
  resourceGroupName: resourceGroupStack.resourceGroup.name,
  containerAppEnvironmentId:
    containerAppEnvironmentStack.containerAppEnvironment.id,
  containerAppTemplateContainers:
    envVals['ContainerAppStack']['containers'] || [],
});

app.synth();
