import React from "react";
import { Segment, Comment } from "semantic-ui-react";

import Message from "../Message";
import MessageForm from "../MessagesForm";
import MessagesHeader from "../MessagesHeader";

import firebase from "../../firebase";

class Messages extends React.Component {
  state = {
    privateMessagesRef: firebase.database().ref("privateMessages"),
    privateChannel: this.props.isPrivateChannel,
    messagesRef: firebase.database().ref("messages"),
    connectedRef: firebase.database().ref(".info/connected"),
    messages: [],
    messagesLoading: true,
    channel: this.props.currentChannel,
    user: this.props.currentUser,
    usersRef: firebase.database().ref("users"),
    numUniqueUsers: "",
    searchTerm: "",
    searchResults: [],
    searchLoading: false,
    progressBar: false,
    isChannelFavourited: false,
    listeners: []
  };

  componentDidMount() {
    const { channel, user, listeners } = this.state;

    if (channel && user) {
      this.removeListeners(listeners);
      this.addListeners(channel.id);
    }
  }

  handleFavourite = () => {
    this.setState(
      prevState => ({
        isChannelFavourited: !prevState.isChannelFavourited
      }),
      () => {
        this.favouriteChannel();
      }
    );
  };

  favouriteChannel = () => {
    if (this.state.isChannelFavourited) {
      this.state.usersRef.child(`${this.state.user.uid}/favourited`).update({
        [this.state.channel.id]: {
          name: this.state.channel.name,
          details: this.state.channel.details,
          createdBy: {
            name: this.state.channel.createdBy.name,
            avatar: this.state.channel.createdBy.avatar
          }
        }
      });
    } else {
      this.state.usersRef
        .child(`${this.state.user.uid}/favourited`)
        .child(this.state.channel.id)
        .remove(err => {
          if (err !== null) {
            console.error(err);
          }
        });
    }
  };

  addListeners = channelId => {
    this.addMessageListener(channelId);
  };

  componentWillUnmount() {
    this.removeListeners(this.state.listeners);
    this.state.connectedRef.off();
  }

  removeListeners = listeners => {
    listeners.forEach(listener => {
      listener.ref.child(listener.id).off(listener.event);
    });
  };

  addListeners = channelId => {
    this.addMessageListener(channelId);
  };

  addMessageListener = channelId => {
    let loadedMessages = [];
    let ref = this.getMessagesRef(); // get whichever ref we're working with (either private or public)

    ref.child(channelId).on("child_added", snap => {
      loadedMessages.push(snap.val());
      this.setState({
        messages: loadedMessages,
        messagesLoading: false
      });

      this.countUniqueUsers(loadedMessages);
    });
  };

  getMessagesRef = () => {
    const { messagesRef, privateMessagesRef, privateChannel } = this.state;

    return privateChannel ? privateMessagesRef : messagesRef;
  };

  countUniqueUsers = messages => {
    const uniqueUsers = messages.reduce((accumulator, message) => {
      if (!accumulator.includes(message.user.name)) {
        accumulator.push(message.user.name);
      }
      return accumulator;
    }, []);

    const plural = uniqueUsers.length > 1 || uniqueUsers.length === 0;
    const numUniqueUsers = `${uniqueUsers.length} user${plural ? "s" : ""}`;

    this.setState({ numUniqueUsers });
  };

  handleSearchChange = e => {
    this.setState(
      {
        searchTerm: e.target.value,
        searchLoading: true
      },
      () => this.handleSearchMessages()
    );
  };

  handleSearchMessages = () => {
    //make a copy first
    const channelMessages = [...this.state.messages];
    const regex = new RegExp(this.state.searchTerm, "gi"); // globally and case sensitively

    const searchResults = channelMessages.reduce((accumulator, message) => {
      if (
        (message.content && message.content.match(regex)) ||
        message.user.name.match(regex)
      ) {
        // have to make sure we check for images too
        accumulator.push(message);
      }
      return accumulator;
    }, []);

    this.setState({ searchResults });
    setTimeout(() => this.setState({ searchLoading: false }), 1000);
  };

  displayMessages = messages =>
    messages.length > 0 &&
    messages.map(message => (
      <Message
        key={message.timestamp}
        message={message}
        user={this.state.user}
      />
    ));

  isProgressBarVisible = percent => {
    if (percent > 0) {
      this.setState({ progressBar: true });
    }
  };

  displayChannelName = channel => {
    return channel
      ? `${this.state.privateChannel ? "@" : "#"}${channel.name}`
      : "";
  };

  render() {
    const {
      messagesRef,
      messages,
      channel,
      user,
      progressBar,
      numUniqueUsers,
      searchTerm,
      searchResults,
      searchLoading,
      privateChannel,
      isChannelFavourited
    } = this.state;

    return (
      <React.Fragment>
        <MessagesHeader
          channelName={this.displayChannelName(channel)}
          numUniqueUsers={numUniqueUsers}
          handleSearchChange={this.handleSearchChange}
          searchLoading={searchLoading}
          isPrivateChannel={privateChannel}
          handleFavourite={this.handleFavourite}
          isChannelFavourited={isChannelFavourited}
        />

        <Segment>
          <Comment.Group
            className={progressBar ? "messages__progress" : "messages"}
          >
            {searchTerm
              ? this.displayMessages(searchResults)
              : this.displayMessages(messages)}
          </Comment.Group>
        </Segment>

        <MessageForm
          messagesRef={messagesRef}
          currentChannel={channel}
          currentUser={user}
          isProgressBarVisible={this.isProgressBarVisible}
          isPrivateChannel={privateChannel}
          getMessagesRef={this.getMessagesRef}
        />
      </React.Fragment>
    );
  }
}

export default Messages;
