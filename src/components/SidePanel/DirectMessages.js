import React from "react";
import firebase from "../../firebase";
import { Menu, Icon } from "semantic-ui-react";

class DirectMessages extends React.Component {
  state = {
    user: this.props.currentUser,
    users: [],
    usersRef: firebase.database().ref("users"),
    presenceRef: firebase.database().ref("presence"),
    connectedRef: firebase.database().ref(".info/connected")
  };

  componentDidMount() {
    if (this.state.user) {
      this.addListeners(this.state.user.uid);
    }
  }

  addListeners = currentUserid => {
    let loadedUsers = [];
    this.state.usersRef.on("child_added", snap => {
      if (currentUserid !== snap.key) {
        let user = snap.val();
        user["uid"] = snap.key;
        user["status"] = "offline";
        loadedUsers.push(user);
        this.setState({ users: loadedUsers });
      }
    });

    this.state.connectedRef.on("value", snap => {
      if (snap.val() === true) {
        const ref = this.state.presenceRef.child(currentUserid);
        ref.set(true);
        ref.onDisconnect().remove(err => {
          if (err !== null) {
            console.error(err);
          }
        });
      }
    });

    this.state.presenceRef.on("child_added", snap => {
      if (currentUserid !== snap.key) {
        // add status to users
        this.addStatusToUsers(snap.key);
      }
    });

    this.state.presenceRef.on("child_removed", snap => {
      if (currentUserid !== snap.key) {
        // remove status to users
        this.addStatusToUsers(snap.key, false);
      }
    });
  };

  addStatusToUsers = (userId, connected = true) => {
    const updatedUsers = this.state.users.reduce((acc, user) => {
      if (user.uid === userId) {
        user["status"] = `${connected ? "online" : "offline"}`;
      }
      return acc.concat(user);
    }, []);
    this.setState({ users: updatedUsers });
  };

  isUserOnline = user => user.status === "online";

  render() {
    const { users } = this.state;

    return (
      <Menu.Menu className="menu">
        <Menu.Item>
          <span>
            <Icon name="mail" /> DIRECT MESSAGES
          </span>{" "}
        </Menu.Item>
        {/* Users to Direct messages */}
        {users.map(user => (
          <Menu.Item
            key={user.uid}
            onClick={() => console.log(user)}
            style={{ opacity: 0.7, fontStyle: "italic" }}
          >
            <Icon
              name="circle"
              color={this.isUserOnline(user) ? "green" : "red"}
            />
            @ {user.name}
          </Menu.Item>
        ))}
      </Menu.Menu>
    );
  }
}

export default DirectMessages;
