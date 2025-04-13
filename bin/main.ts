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

const app = new App();

// Development Environment
new PlaygroundStack(app, `Dev-PlaygroundStack`, devPlaygroundStackProps);
new BackendStack(app, `Dev-BackendStack`, devBackendStackProps);
new AzureadStack(app, `Dev-AzureadStack`, devAzureadStackProps);

// Production Environment
new PlaygroundStack(app, `Prod-PlaygroundStack`, prodPlaygroundStackProps);
new BackendStack(app, `Prod-BackendStack`, prodBackendStackProps);
new AzureadStack(app, `Prod-AzureadStack`, prodAzureadStackProps);

app.synth();
