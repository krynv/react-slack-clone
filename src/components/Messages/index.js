import React from "react";
import { Segment, Comment } from "semantic-ui-react";

import MessageForm from "../MessagesForm";
import MessagesHeader from '../MessagesHeader';

class Messages extends React.Component {
  render() {
    return (
      <React.Fragment>
        <MessagesHeader />
        <Segment>
          <Comment.Group className="messages"></Comment.Group>
        </Segment>
        <MessageForm />
      </React.Fragment>
    );
  }
}

export default Messages;
