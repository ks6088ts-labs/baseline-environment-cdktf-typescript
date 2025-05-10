import { Construct } from 'constructs';
import { eventgridDomainTopic } from '@cdktf/provider-azurerm';

interface EventgridDomainTopicProps {
  name: string;
  domainName: string;
  resourceGroupName: string;
}

export class EventgridDomainTopic extends Construct {
  public readonly eventgridDomainTopic: eventgridDomainTopic.EventgridDomainTopic;
  constructor(scope: Construct, id: string, props: EventgridDomainTopicProps) {
    super(scope, id);

    // Resources
    this.eventgridDomainTopic = new eventgridDomainTopic.EventgridDomainTopic(
      this,
      'eventgrid_domain',
      {
        name: props.name,
        domainName: props.domainName,
        resourceGroupName: props.resourceGroupName,
      },
    );
  }
}
