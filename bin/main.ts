#!/usr/bin/env node
import { App } from 'cdktf';
import { PlaygroundStack } from '../lib/stack/playground-stack';
import { BackendStack } from '../lib/stack/backend-stack';
import {
  devPlaygroundStackProps,
  devBackendStackProps,
  prodPlaygroundStackProps,
  prodBackendStackProps,
} from '../parameter';

const app = new App();

// Development Environment
new PlaygroundStack(app, `Dev-PlaygroundStack`, devPlaygroundStackProps);
new BackendStack(app, `Dev-BackendStack`, devBackendStackProps);

// Production Environment
new PlaygroundStack(app, `Prod-PlaygroundStack`, prodPlaygroundStackProps);
new BackendStack(app, `Prod-BackendStack`, prodBackendStackProps);

app.synth();
