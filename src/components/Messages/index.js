import React from "react";
import { Segment, Comment } from "semantic-ui-react";

import MessageForm from "../MessagesForm";
import MessagesHeader from "../MessagesHeader";

import firebase from "../../firebase";

class Messages extends React.Component {
  state = {
    messagesRef: firebase.database().ref("messages"),
    channel: this.props.currentChannel,
    user: this.props.currentUser
  };

  componentDidMount() {
    const { channel, user } = this.state;

    if (channel && user) {
      this.addListeners(channel.id);
    }
  }

  addListeners = channelId => {
    this.addMessageListener(channelId);
  };

  addMessageListener = channelId => {
    let loadedMessages = [];
    this.state.messagesRef.child(channelId).on("child_added", snap => {
      loadedMessages.push(snap.val());
      console.log(loadedMessages);
    });
  };

  render() {
    const { messagesRef, channel, user } = this.state;

    return (
      <React.Fragment>
        <MessagesHeader />
        <Segment>
          <Comment.Group className="messages"></Comment.Group>
        </Segment>
        <MessageForm
          messagesRef={messagesRef}
          currentChannel={channel}
          currentUser={user}
        />
      </React.Fragment>
    );
  }
}

export default Messages;
