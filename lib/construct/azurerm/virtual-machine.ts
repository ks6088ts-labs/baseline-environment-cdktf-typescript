import { Construct } from 'constructs';
import { networkInterface, virtualMachine } from '@cdktf/provider-azurerm';

interface VirtualMachineProps {
  name: string;
  location: string;
  tags?: { [key: string]: string };
  resourceGroupName: string;
  subnetId: string;
  vmSize: string;
}

export class VirtualMachine extends Construct {
  constructor(scope: Construct, id: string, props: VirtualMachineProps) {
    super(scope, id);

    // Resources
    const networkInterfaceResource = new networkInterface.NetworkInterface(
      this,
      'network_interface',
      {
        name: `${props.name}-nic`,
        location: props.location,
        resourceGroupName: props.resourceGroupName,
        tags: props.tags,
        ipConfiguration: [
          {
            name: `${props.name}-ipconfig`,
            subnetId: props.subnetId,
            privateIpAddressAllocation: 'Dynamic',
          },
        ],
      },
    );

    new virtualMachine.VirtualMachine(this, 'virtual_machine', {
      name: props.name,
      location: props.location,
      resourceGroupName: props.resourceGroupName,
      tags: props.tags,
      networkInterfaceIds: [networkInterfaceResource.id],
      vmSize: props.vmSize,
      storageImageReference: {
        // az vm image list --publisher Canonical
        publisher: 'Canonical',
        offer: '0001-com-ubuntu-server-jammy',
        sku: '22_04-lts-gen2',
        version: 'latest',
      },
      storageOsDisk: {
        name: `${props.name}-osdisk`,
        caching: 'ReadWrite',
        createOption: 'FromImage',
      },
      osProfile: {
        computerName: props.name,
        adminUsername: 'adminuser',
        adminPassword: 'P@ssw0rd1234',
      },
      osProfileLinuxConfig: {
        disablePasswordAuthentication: false,
      },
      identity: {
        type: 'SystemAssigned',
      },
    });
  }
}
