import { Testing } from 'cdktf';
import { PlaygroundStack } from '../lib/stack/playground-stack';
import { devPlaygroundStackParameter } from '../parameter';

describe('Unit testing using assertions', () => {
  it('should contain resource group', () => {
    const app = Testing.app();
    const stack = new PlaygroundStack(
      app,
      'my-app',
      devPlaygroundStackParameter,
    );
    const synthesized = Testing.synth(stack);

    // FIXME: TORIAEZU
    expect(synthesized).toMatch(/"azurerm_resource_group"/);
    console.log(synthesized);
  });
});
