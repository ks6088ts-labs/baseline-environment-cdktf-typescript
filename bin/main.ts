#!/usr/bin/env node
import { App } from "cdktf";
import { PlaygroundStack } from "../lib/playground-stack";

const app = new App();

new PlaygroundStack(app, "baseline-environment-on-azure-cdktf-typescript", {
  resourceGroupName: "baseline-environment-on-azure-cdktf-typescript",
  location: "japaneast",
});

app.synth();
