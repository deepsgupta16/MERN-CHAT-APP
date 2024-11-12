/**
 * Returns the name of the sender in a one-on-one chat.
 *
 * @param {Object} loggedUser - The currently logged-in user.
 * @param {Array} users - An array of two users involved in the chat.
 * @returns {string} The name of the other user in the chat.
 */
export const getSender = (loggedUser, users) => {
  return users[0]._id === loggedUser._id ? users[1].name : users[0].name;
};

/**
 * Returns the full details of the sender in a one-on-one chat.
 *
 * @param {Object} loggedUser - The currently logged-in user.
 * @param {Array} users - An array of two user objects involved in the chat.
 * @returns {Object} The user object of the other user in the chat.
 */
export const getSenderFull = (loggedUser, users) => {
  return users[0]._id === loggedUser._id ? users[1] : users[0];
};

// export const getSenderFull = (loggedUser, users) => {
//   console.log("getSenderFull - loggedUser:", loggedUser);
//   console.log("getSenderFull - users:", users);

//   if (!loggedUser || !Array.isArray(users) || users.length < 2) {
//     console.warn("Invalid input for getSenderFull:", { loggedUser, users });
//     return null;
//   }

//   const user1 = users[0];
//   const user2 = users[1];

//   console.log("getSenderFull - user1:", user1);
//   console.log("getSenderFull - user2:", user2);

//   if (!user1 || !user2) {
//     console.warn("One of the users is undefined:", { user1, user2 });
//     return null;
//   }

//   return user1._id === loggedUser._id ? user2 : user1;
// };

export const isSameSender = (messages, m, i, userId) => {
  return (
    i < messages.length - 1 &&
    (messages[i + 1].sender._id !== m.sender._id ||
      messages[i + 1].sender._id === undefined) &&
    messages[i].sender._id !== userId
  );
};

export const isLastMessage = (messages, i, userId) => {
  return (
    i === messages.length - 1 &&
    messages[messages.length - 1].sender._id !== userId &&
    messages[messages.length - 1].sender._id
  );
};

export const isSameSenderMargin = (messages, m, i, userId) => {
  if (
    i < messages.length - 1 &&
    messages[i + 1].sender._id === m.sender._id &&
    messages[i].sender._id !== userId
  )
    return 33;
  else if (
    (i < messages.length - 1 &&
      messages[i + 1].sender._id !== m.sender._id &&
      messages[i].sender._id !== userId) ||
    (i === messages.length - 1 && messages[i].sender._id !== userId)
  )
    return 0;
  else return "auto";
};

export const isSameUser = (messages, m, i) => {
  return i > 0 && messages[i - 1].sender._id === m.sender._id;
};
