#!/usr/bin/env node
import { App } from "cdktf";
import { ResourceGroupStack } from "../lib/resource-group-stack";

const app = new App();

const randomIdentifier = Math.random().toString(36).substring(2, 8);
const name = `baseline-environment-on-azure-cdktf-typescript-${randomIdentifier}`;
const location = "japaneast";
const tags = {
  owner: "ks6088ts",
};

new ResourceGroupStack(app, "resourceGroupStack", {
  name: name,
  location: location,
  tags: tags,
});

app.synth();
