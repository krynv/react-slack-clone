import React from "react";
import { Grid } from "semantic-ui-react";
import { connect } from "react-redux";

import "./App.css";

import ColourPanel from "../ColourPanel";
import SidePanel from "../SidePanel";
import Messages from "../Messages";
import MetaPanel from "../MetaPanel";

const App = ({
  currentUser,
  currentChannel,
  isPrivateChannel,
  userPosts,
  primaryColour,
  secondaryColour
}) => (
  <Grid columns="equal" className="app" style={{ background: secondaryColour }}>
    <ColourPanel
      key={currentUser && currentUser.name}
      currentUser={currentUser}
    />
    <SidePanel
      key={currentUser && currentUser.uid}
      currentUser={currentUser}
      primaryColour={primaryColour}
    />
    <Grid.Column style={{ marginLeft: 320 }}>
      <Messages
        key={currentChannel && currentChannel.id}
        currentChannel={currentChannel}
        currentUser={currentUser}
        isPrivateChannel={isPrivateChannel}
      />
    </Grid.Column>

    <Grid.Column width={4}>
      <MetaPanel
        key={currentChannel && currentChannel.name} // pass a different prop for key cause we don't wanna confuse things
        userPosts={userPosts}
        currentChannel={currentChannel}
        isPrivateChannel={isPrivateChannel}
      />
    </Grid.Column>
  </Grid>
);

//can destructure this to ({ user })
const mapStateToProps = state => ({
  currentUser: state.user.currentUser,
  currentChannel: state.channel.currentChannel,
  isPrivateChannel: state.channel.isPrivateChannel,
  userPosts: state.channel.userPosts,
  primaryColour: state.colours.primaryColour,
  secondaryColour: state.colours.secondaryColour
});

export default connect(mapStateToProps)(App);
