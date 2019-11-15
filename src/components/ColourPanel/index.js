import React from "react";
import {
  Sidebar,
  Menu,
  Divider,
  Button,
  Modal,
  Icon,
  Label,
  Segment
} from "semantic-ui-react";
import { SliderPicker } from "react-color";

import firebase from "../../firebase";

class ColourPanel extends React.Component {
  state = {
    modal: false,
    primary: "",
    secondary: "",
    user: this.props.currentUser,
    usersRef: firebase.database().ref("users")
  };

  openModal = () => this.setState({ modal: true });
  closeModal = () => this.setState({ modal: false });

  handleChangePrimary = colour => this.setState({ primary: colour.hex });
  handleChangeSecondary = colour => this.setState({ secondary: colour.hex });

  handleSaveColours = () => {
    // check if they actually exist
    if (this.state.primary && this.state.secondary) {
      this.saveColours(this.state.primary, this.state.secondary);
    }
  };

  saveColours = (primary, secondary) => {
    this.state.usersRef
      .child(`${this.state.user.uid}/colours`)
      .push()
      .update({
        primary,
        secondary
      })
      .then(() => {
        console.log("Successfully changed colours");
        this.closeModal();
      })
      .catch(err => console.error(err));
  };

  render() {
    const { modal, primary, secondary } = this.state;

    return (
      <Sidebar
        as={Menu}
        icon="labeled"
        inverted
        vertical
        visible
        width="very thin"
      >
        <Divider />
        <Button icon="add" size="small" color="blue" onClick={this.openModal} />

        <Modal basic open={modal} onClose={this.closeModal}>
          <Modal.Header>Choose your preferred colours</Modal.Header>

          <Modal.Content>
            <Segment inverted>
              <Label content="Primary Colour" />
              <SliderPicker
                color={primary}
                onChange={this.handleChangePrimary}
              />
            </Segment>

            <Segment inverted>
              <Label content="Secondary Colour" />
              <SliderPicker
                color={secondary}
                onChange={this.handleChangeSecondary}
              />
            </Segment>
          </Modal.Content>

          <Modal.Actions>
            <Button color="green" inverted onClick={this.handleSaveColours}>
              <Icon name="checkmark" /> Save Changes
            </Button>
            <Button color="red" inverted onClick={this.closeModal}>
              <Icon name="remove" /> Cancel
            </Button>
          </Modal.Actions>
        </Modal>
      </Sidebar>
    );
  }
}

export default ColourPanel;
