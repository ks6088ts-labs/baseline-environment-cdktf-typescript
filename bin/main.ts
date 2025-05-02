#!/usr/bin/env node
import { App } from 'cdktf';
import {
  PlaygroundStack,
  devPlaygroundStackProps,
  prodPlaygroundStackProps,
} from '../lib/stack/playground-stack';
import {
  BackendStack,
  devBackendStackProps,
  prodBackendStackProps,
} from '../lib/stack/backend-stack';
import {
  AzureadStack,
  devAzureadStackProps,
  prodAzureadStackProps,
} from '../lib/stack/azuread-stack';
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
new PlaygroundStack(app, `Dev-PlaygroundStack`, devPlaygroundStackProps);
new BackendStack(app, `Dev-BackendStack`, devBackendStackProps);
new AzureadStack(app, `Dev-AzureadStack`, devAzureadStackProps);
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
new PlaygroundStack(app, `Prod-PlaygroundStack`, prodPlaygroundStackProps);
new BackendStack(app, `Prod-BackendStack`, prodBackendStackProps);
new AzureadStack(app, `Prod-AzureadStack`, prodAzureadStackProps);
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
