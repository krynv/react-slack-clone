import React from "react";
import { Segment, Accordion, Header, Icon } from "semantic-ui-react";

class MetaPanel extends React.Component {
  state = {
    privateChannel: this.props.isPrivateChannel,
    activeIndex: 0
  };

  setActiveIndex = (e, titleProps) => {
    const { index } = titleProps;
    const { activeIndex } = this.state;
    const newIndex = activeIndex === index ? -1 : index;

    this.setState({ activeIndex: newIndex });
  };

  render() {
    const { activeIndex, privateChannel } = this.state;

    // we don't want to see the meta panel for private channels
    if (privateChannel) return null;

    return (
      <Segment>
        <Header as="h3" attached="top">
          About Channel
        </Header>
        <Accordion styled attached="true">
          <Accordion.Title
            active={activeIndex === 0}
            index={0}
            onClick={this.setActiveIndex}
          >
            <Icon name="dropdown" />
            <Icon name="info" />
            Channel Details
          </Accordion.Title>
          <Accordion.Content active={activeIndex === 0}>
            [details]
          </Accordion.Content>

          <Accordion.Title
            active={activeIndex === 1}
            index={1}
            onClick={this.setActiveIndex}
          >
            <Icon name="dropdown" />
            <Icon name="user circle" />
            Top Contributors
          </Accordion.Title>
          <Accordion.Content active={activeIndex === 1}>
            [users]
          </Accordion.Content>

          <Accordion.Title
            active={activeIndex === 2}
            index={2}
            onClick={this.setActiveIndex}
          >
            <Icon name="dropdown" />
            <Icon name="pencil alternate" />
            Channel created by:
          </Accordion.Title>
          <Accordion.Content active={activeIndex === 2}>
            [user]
          </Accordion.Content>
        </Accordion>
      </Segment>
    );
  }
}

export default MetaPanel;
