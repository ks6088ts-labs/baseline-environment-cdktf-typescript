#!/usr/bin/env node
import { App } from 'cdktf';
import { PlaygroundStack } from '../lib/stack/playground-stack';
import { BackendStack } from '../lib/stack/backend-stack';
import { AzureadStack } from '../lib/stack/azuread-stack';
import {
  devPlaygroundStackProps,
  devBackendStackProps,
  devAzureadStackProps,
  prodPlaygroundStackProps,
  prodBackendStackProps,
  prodAzureadStackProps,
} from '../parameter';

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
