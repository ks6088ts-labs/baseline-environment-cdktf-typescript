import { Construct } from 'constructs';
import { subnet } from '@cdktf/provider-azurerm';

interface SubnetProps {
  subnets: subnet.SubnetConfig[];
}

export class Subnet extends Construct {
  constructor(scope: Construct, id: string, props: SubnetProps) {
    super(scope, id);

    // Resources
    for (const subnetConfig of props.subnets) {
      new subnet.Subnet(this, `subnet-${subnetConfig.name}`, subnetConfig);
    }
  }
}
