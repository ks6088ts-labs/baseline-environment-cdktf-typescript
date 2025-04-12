#!/usr/bin/env node
import { App } from 'cdktf';
import { PlaygroundStack } from '../lib/stack/playground-stack';
import {
  devPlaygroundStackParameter,
  prodPlaygroundStackParameter,
} from '../parameter';

const app = new App();

new PlaygroundStack(app, `Dev-PlaygroundStack`, devPlaygroundStackParameter);
new PlaygroundStack(app, `Prod-PlaygroundStack`, prodPlaygroundStackParameter);

app.synth();
