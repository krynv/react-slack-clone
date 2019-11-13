import React from "react";
import { Grid } from "semantic-ui-react";
import { connect } from "react-redux";

import "./App.css";

import ColourPanel from "../ColourPanel";
import SidePanel from "../SidePanel";
import Messages from "../Messages";
import MetaPanel from "../MetaPanel";

const App = ({ currentUser }) => (
  <Grid columns="equal" className="app" style={{ background: "#eee" }}>
    <ColourPanel />
    <SidePanel currentUser={currentUser} />

    <Grid.Column style={{ marginLeft: 320 }}>
      <Messages />
    </Grid.Column>

    <Grid.Column width={4}>
      <MetaPanel />
    </Grid.Column>
  </Grid>
);

//can destructure this to ({ user })
const mapStateToProps = state => ({
  currentUser: state.user.currentUser
});

export default connect(mapStateToProps)(App);
