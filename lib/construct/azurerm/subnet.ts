import { Construct } from 'constructs';
import { subnet } from '@cdktf/provider-azurerm';

interface SubnetProps {
  subnets: subnet.SubnetConfig[];
}

export class Subnet extends Construct {
  public readonly subnets: subnet.Subnet[];
  constructor(scope: Construct, id: string, props: SubnetProps) {
    super(scope, id);

    // Resources
    this.subnets = [];
    for (const subnetConfig of props.subnets) {
      this.subnets.push(
        new subnet.Subnet(this, `subnet-${subnetConfig.name}`, subnetConfig),
      );
    }
  }
}
