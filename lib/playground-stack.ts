import { Construct } from "constructs";
import { TerraformStack, TerraformOutput } from "cdktf";
import { provider, resourceGroup } from "@cdktf/provider-azurerm";

export interface PlaygroundStackProps {
  resourceGroupName: string;
  location: string;
}

export class PlaygroundStack extends TerraformStack {
  constructor(scope: Construct, id: string, props: PlaygroundStackProps) {
    super(scope, id);

    new provider.AzurermProvider(this, "azurerm", {
      features: [{}],
    });

    const rg = new resourceGroup.ResourceGroup(this, "rg", {
      name: props.resourceGroupName,
      location: props.location,
    });

    new TerraformOutput(this, "rg_name", {
      value: rg.name,
    });
  }
}
