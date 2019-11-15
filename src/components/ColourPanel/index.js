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

class ColourPanel extends React.Component {
  state = {
    modal: false,
    primary: "",
    secondary: ""
  };

  openModal = () => this.setState({ modal: true });
  closeModal = () => this.setState({ modal: false });

  handleChangePrimary = colour => this.setState({ primary: colour.hex });
  handleChangeSecondary = colour => this.setState({ secondary: colour.hex });

  render() {
    const { modal } = this.state;

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
              <SliderPicker onChange={this.handleChangePrimary} />
            </Segment>

            <Segment inverted>
              <Label content="Secondary Colour" />
              <SliderPicker onChange={this.handleChangeSecondary} />
            </Segment>
          </Modal.Content>

          <Modal.Actions>
            <Button color="green" inverted>
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
