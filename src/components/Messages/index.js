import React from "react";
import { Segment, Comment } from "semantic-ui-react";
import { connect } from "react-redux";

import Message from "../Message";
import MessageForm from "../MessagesForm";
import MessagesHeader from "../MessagesHeader";
import TypingIndicator from "../TypingIndicator";
import LoadingSkeleton from "../LoadingSkeleton";

import { setUserPosts } from "../../actions";

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
    listeners: [],
    typingRef: firebase.database().ref("typing"),
    typingUsers: []
  };

  componentDidMount() {
    const { channel, user, listeners } = this.state;

    if (channel && user) {
      this.removeListeners(listeners);
      this.addListeners(channel.id);
      this.addUserFavouritedListener(channel.id, user.uid);
    }
  }

  componentDidUpdate(prevProps, prevState) {
    if (this.messagesEnd) {
      this.scrollToBottom();
    }
  }

  scrollToBottom = () => {
    this.messagesEnd.scrollIntoView({ behaviour: "smooth" });
  };

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
    this.addTypingListener(channelId);
  };

  addTypingListener = channelId => {
    let typingUsers = [];

    this.state.typingRef.child(channelId).on("child_added", snap => {
      if (snap.key !== this.state.user.uid) {
        typingUsers = typingUsers.concat({
          id: snap.key,
          name: snap.val()
        });

        this.setState({ typingUsers });
      }
    });

    this.addToListeners(channelId, this.state.typingRef, "child_added");

    this.state.typingRef.child(channelId).on("child_removed", snap => {
      const index = typingUsers.findIndex(user => user.id === snap.key);

      if (index !== -1) {
        typingUsers = typingUsers.filter(user => user.id !== snap.key);
        this.setState({ typingUsers });
      }
    });

    this.addToListeners(channelId, this.state.typingRef, "child_removed");

    this.state.connectedRef.on("value", snap => {
      if (snap.val() === true) {
        this.state.typingRef
          .child(channelId)
          .child(this.state.user.uid)
          .onDisconnect()
          .remove(err => {
            if (err !== null) {
              console.error(err);
            }
          });
      }
    });
  };

  componentWillUnmount() {
    this.removeListeners(this.state.listeners);
    this.state.connectedRef.off();
  }

  addToListeners = (id, ref, e) => {
    const index = this.state.listeners.findIndex(listener => {
      return listener.id === id && listener.ref === ref && listener.event === e;
    });

    if (index === -1) {
      const newListener = { id, ref, e };

      this.setState({ listeners: this.state.listeners.concat(newListener) });
    }
  };

  removeListeners = listeners => {
    listeners.forEach(listener => {
      listener.ref.child(listener.id).off(listener.event);
    });
  };

  addUserFavouritedListener = (channelId, userId) => {
    this.state.usersRef
      .child(userId)
      .child("favourited")
      .once("value")
      .then(data => {
        if (data.val() !== null) {
          const channelIds = Object.keys(data.val());
          const prevFavourited = channelIds.includes(channelId);

          this.setState({ isChannelFavourited: prevFavourited });
        }
      });
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
      this.countUserPosts(loadedMessages);
    });

    this.addToListeners(channelId, ref, "child_added");
  };

  countUserPosts = messages => {
    let userPosts = messages.reduce((accumulator, message) => {
      if (message.user.name in accumulator) {
        accumulator[message.user.name].count += 1;
      } else {
        accumulator[message.user.name] = {
          avatar: message.user.avatar,
          count: 1
        };
      }
      return accumulator;
    }, {});
    this.props.setUserPosts(userPosts);
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

  displayTypingUsers = users =>
    users.length > 0 &&
    users.map(user => (
      <div
        style={{
          display: "flex",
          alignItems: "center",
          marginBottom: "0.2em"
        }}
        key={user.id}
      >
        <span className="user__typing">{user.name} is typing</span>
        <TypingIndicator />
      </div>
    ));

  displayMessagesSkeleton = loading =>
    loading ? (
      <React.Fragment>
        {[...Array(10)].map((_, index) => (
          <LoadingSkeleton key={index} />
        ))}
      </React.Fragment>
    ) : null;

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
      isChannelFavourited,
      typingUsers,
      messagesLoading
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
            style={{ maxWidth: "100%" }}
            className={progressBar ? "messages__progress" : "messages"}
          >
            {this.displayMessagesSkeleton(messagesLoading)}
            {searchTerm
              ? this.displayMessages(searchResults)
              : this.displayMessages(messages)}
            {this.displayTypingUsers(typingUsers)}
            <div ref={node => (this.messagesEnd = node)}></div>
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

export default connect(null, { setUserPosts })(Messages);
