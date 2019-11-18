import React from "react";
import { Menu, Icon } from "semantic-ui-react";
import { connect } from "react-redux";

import firebase from "../../firebase";

import { setCurrentChannel, setPrivateChannel } from "../../actions";

class Favourites extends React.Component {
  state = {
    user: this.props.currentUser,
    usersRef: firebase.database().ref("users"),
    activeChannel: "",
    favouritedChannels: []
  };

  componentDidMount() {
    if (this.state.user) {
      // only do this if we have a user
      this.addListeners(this.state.user.uid);
    }
  }

  componentWillUnmount() {
    this.removeListener();
  }

  removeListener = () => {
    this.state.usersRef.child(`${this.state.user.uid}/favourited`).off();
  };

  addListeners = userId => {
    this.state.usersRef
      .child(userId)
      .child("favourited")
      .on("child_added", snap => {
        const favouritedChannel = { id: snap.key, ...snap.val() };

        this.setState({
          favouritedChannels: [
            ...this.state.favouritedChannels,
            favouritedChannel
          ]
        });
      });

    this.state.usersRef
      .child(userId)
      .child("favourited")
      .on("child_removed", snap => {
        const channelToRemove = {
          id: snap.key,
          ...snap.val()
        };

        const filteredChannels = this.state.favouritedChannels.filter(
          channel => {
            return channel.id !== channelToRemove.id;
          }
        );

        this.setState({ favouritedChannels: filteredChannels });
      });
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
