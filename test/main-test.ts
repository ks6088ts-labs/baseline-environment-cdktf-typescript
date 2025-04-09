import { Testing } from "cdktf";
import { ResourceGroupStack } from "../lib/resource-group-stack";

describe("Unit testing using assertions", () => {
  it("should contain resource group", () => {
    const app = Testing.app();
    const stack = new ResourceGroupStack(app, "my-app", {
      name: "baseline-environment-on-azure-cdktf-typescript",
      location: "japaneast",
    });
    const synthesized = Testing.synth(stack);

    // FIXME: TORIAEZU
    expect(synthesized).toMatch(/"azurerm_resource_group"/);
    console.log(synthesized);
  });
});
