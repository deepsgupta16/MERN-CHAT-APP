import React from "react";
import { Tag } from "@chakra-ui/react";
import { CloseIcon } from "@chakra-ui/icons";
/**
 * Component that displays a user's name in a badge format.
 * @param {Object} user - The user object containing the name.
 * @param {Function} handleFunction - The function to be called when the badge is clicked.
 */
const UserBadgeItem = ({ user, handleFunction }) => {
  return (
    <Tag
      px={2}
      py={1}
      borderRadius="lg"
      bg="purple.600"
      cursor="pointer"
      color="white"
      m={1}
      mb={2}
      variant="solid"
      colorScheme="purple"
      fontSize={12}
      onClick={handleFunction}
      alignItems="center"
    >
      {user.name}
      <CloseIcon pl={1} />
    </Tag>
  );
};

export default UserBadgeItem;
