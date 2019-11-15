import React from "react";
import { Menu, Icon } from "semantic-ui-react";
import { connect } from "react-redux";

import { setCurrentChannel, setPrivateChannel } from "../../actions";

class Favourites extends React.Component {
  state = {
    activeChannel: "",
    favouritedChannels: []
  };

  setActiveChannel = channel => {
    this.setState({ activeChannel: channel.id });
  };

  changeChannel = channel => {
    this.setActiveChannel(channel);
    this.props.setCurrentChannel(channel);
    this.props.setPrivateChannel(false);
  };

  displayChannels = favouritedChannels =>
    favouritedChannels.length > 0 &&
    favouritedChannels.map(channel => (
      <Menu.Item
        key={channel.id}
        onClick={() => this.changeChannel(channel)}
        name={channel.name}
        style={{ opacity: 0.7 }}
        active={channel.id === this.state.activeChannel}
      >
        # {channel.name}
      </Menu.Item>
    ));

  render() {
    const { favouritedChannels } = this.state;

    return (
      <Menu.Menu className="menu">
        <Menu.Item>
          <span>
            <Icon name="star" /> FAVOURITES
          </span>{" "}
          ({favouritedChannels.length})
        </Menu.Item>
        {this.displayChannels(favouritedChannels)}
      </Menu.Menu>
    );
  }
}

export default connect(null, { setCurrentChannel, setPrivateChannel })(
  Favourites
);
