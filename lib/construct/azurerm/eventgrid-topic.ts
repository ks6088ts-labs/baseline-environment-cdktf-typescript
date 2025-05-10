import { Construct } from 'constructs';
import { eventgridTopic } from '@cdktf/provider-azurerm';

interface EventgridTopicProps {
  name: string;
  location: string;
  tags?: { [key: string]: string };
  resourceGroupName: string;
  inputSchema: string;
}

export class EventgridTopic extends Construct {
  public readonly eventgridTopic: eventgridTopic.EventgridTopic;
  constructor(scope: Construct, id: string, props: EventgridTopicProps) {
    super(scope, id);

    // Resources
    this.eventgridTopic = new eventgridTopic.EventgridTopic(
      this,
      'eventgrid_topic',
      {
        name: props.name,
        location: props.location,
        tags: props.tags,
        resourceGroupName: props.resourceGroupName,
        identity: {
          type: 'SystemAssigned',
        },
        inputSchema: props.inputSchema,
      },
    );
  }
}
