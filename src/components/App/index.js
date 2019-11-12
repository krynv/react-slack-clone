import React from "react";
import { Grid } from "semantic-ui-react";

import "./App.css";

import ColourPanel from "../ColourPanel";
import SidePanel from "../SidePanel";
import Messages from "../Messages";
import MetaPanel from "../MetaPanel";

const App = () => (
  <Grid columns="equal" className="app" style={{ background: "#eee" }}>
    <ColourPanel />
    <SidePanel />

    <Grid.Column style={{ marginLeft: 320 }}>
      <Messages />
    </Grid.Column>

    <Grid.Column width={4}>
      <MetaPanel />
    </Grid.Column>
  </Grid>
);

export default App;
