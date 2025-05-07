#!/usr/bin/env node
import { App } from 'cdktf';
import {
  AzurermPlaygroundStack,
  devAzurermPlaygroundStackProps,
  prodAzurermPlaygroundStackProps,
} from '../lib/stack/azurerm-playground-stack';
import {
  BackendStack,
  devBackendStackProps,
  prodBackendStackProps,
} from '../lib/stack/backend-stack';
import {
  AzureadPlaygroundStack,
  devAzureadPlaygroundStackProps,
  prodAzureadPlaygroundStackProps,
} from '../lib/stack/azuread-playground-stack';
import {
  GithubStack,
  devGithubStackProps,
  prodGithubStackProps,
} from '../lib/stack/github-stack';
import {
  ServicePrincipalStack,
  devServicePrincipalStackProps,
  prodServicePrincipalStackProps,
} from '../lib/stack/service-principal-stack';
import {
  AwsPlaygroundStack,
  devAwsPlaygroundStackProps,
  prodAwsPlaygroundStackProps,
} from '../lib/stack/aws-playground-stack';
import {
  GooglePlaygroundStack,
  devGooglePlaygroundStackProps,
  prodGooglePlaygroundStackProps,
} from '../lib/stack/google-playground-stack';

const app = new App();

// Development Environment
new AzurermPlaygroundStack(
  app,
  `Dev-AzurermPlaygroundStack`,
  devAzurermPlaygroundStackProps,
);
new BackendStack(app, `Dev-BackendStack`, devBackendStackProps);
new AzureadPlaygroundStack(
  app,
  `Dev-AzureadPlaygroundStack`,
  devAzureadPlaygroundStackProps,
);
new GithubStack(app, `Dev-GithubStack`, devGithubStackProps);
new ServicePrincipalStack(
  app,
  `Dev-ServicePrincipalStack`,
  devServicePrincipalStackProps,
);
new AwsPlaygroundStack(
  app,
  `Dev-AwsPlaygroundStack`,
  devAwsPlaygroundStackProps,
);
new GooglePlaygroundStack(
  app,
  `Dev-GooglePlaygroundStack`,
  devGooglePlaygroundStackProps,
);

// Production Environment
new AzurermPlaygroundStack(
  app,
  `Prod-AzurermPlaygroundStack`,
  prodAzurermPlaygroundStackProps,
);
new BackendStack(app, `Prod-BackendStack`, prodBackendStackProps);
new AzureadPlaygroundStack(
  app,
  `Prod-AzureadPlaygroundStack`,
  prodAzureadPlaygroundStackProps,
);
new GithubStack(app, `Prod-GithubStack`, prodGithubStackProps);
new ServicePrincipalStack(
  app,
  `Prod-ServicePrincipalStack`,
  prodServicePrincipalStackProps,
);
new AwsPlaygroundStack(
  app,
  `Prod-AwsPlaygroundStack`,
  prodAwsPlaygroundStackProps,
);
new GooglePlaygroundStack(
  app,
  `Prod-GooglePlaygroundStack`,
  prodGooglePlaygroundStackProps,
);

app.synth();
