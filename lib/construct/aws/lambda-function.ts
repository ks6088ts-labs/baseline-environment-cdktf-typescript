import { Construct } from 'constructs';
import { lambdaFunction } from '@cdktf/provider-aws';

export interface lambdaFunctionProps {
  name: string;
  handler: string;
  runtime: string;
  fileName: string;
  sourceCodeHash: string;
  role: string;
}

export class LambdaFunction extends Construct {
  public readonly lambdaFunction: lambdaFunction.LambdaFunction;

  constructor(scope: Construct, id: string, props: lambdaFunctionProps) {
    super(scope, id);

    // Resources
    this.lambdaFunction = new lambdaFunction.LambdaFunction(
      this,
      'lambda_function',
      {
        functionName: props.name,
        handler: props.handler,
        runtime: props.runtime,
        filename: props.fileName,
        sourceCodeHash: props.sourceCodeHash,
        role: props.role,
      },
    );
  }
}
