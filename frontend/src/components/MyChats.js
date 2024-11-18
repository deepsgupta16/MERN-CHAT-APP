import React from "react";
import { ChatState } from "../Context/ChatProvider";
import axios from "axios";
import {
  AlertDialog,
  AlertDialogBody,
  AlertDialogContent,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogOverlay,
  Button,
  Stack,
  useToast,
} from "@chakra-ui/react";
import { Box, Text } from "@chakra-ui/react";
import { AddIcon, CloseIcon } from "@chakra-ui/icons";
import ChatLoading from "./ChatLoading";
import { getSender } from "../config/ChatLogics";
import GroupChatModel from "../components/Miscellaneous/GroupChatModel";

const { useState, useEffect } = React;

/**
 * Component that displays the user's chats and allows for creating new group chats.
 * Fetches the user's chats from the server and renders them in a list.
 */
const MyChats = (fetchAgain) => {
  const [loggedUser, setLoggedUser] = useState(
    JSON.parse(localStorage.getItem("userInfo"))
  );
  const { user, selectedChat, setSelectedChat, chats, setChats } = ChatState();
  const toast = useToast();
  // Deleting the chat
  const [isDeleteAlertOpen, setIsDeleteAlertOpen] = useState(false);
  const [chatToDelete, setChatToDelete] = useState(null);

  /**
   * Fetches the user's chats from the server and updates the state with the fetched chats.
   * If an error occurs, a toast notification is displayed with the error message.
   */
  const fetchChats = async () => {
    try {
      const config = {
        headers: {
          Authorization: `Bearer ${user.token}`,
        },
      };
      const { data } = await axios.get("/api/chat", config);
      setChats(data);
      // console.log("Fetched chats:", data);
    } catch (error) {
      toast({
        title: "Error fetching the chats",
        description: error.message,
        status: "error",
        duration: 5000,
        isClosable: true,
        position: "top-left",
      });
    }
  };

  useEffect(() => {
    // setLoggedUser(JSON.parse(localStorage.getItem("userInfo")));
    fetchChats();
  }, [fetchAgain]);

  const handleDeleteClick = (chat) => {
    setChatToDelete(chat);
    setIsDeleteAlertOpen(true);
  };

  // Delete handler
  const handleDeleteConfirm = async () => {
    if (!chatToDelete) return;

    try {
      const config = {
        headers: {
          "Content-type": "application/json",
          Authorization: `Bearer ${user.token}`,
        },
      };

      await axios.delete("/api/chat/delete", {
        headers: config.headers,
        data: { chatId: chatToDelete._id },
      });

      setChats(chats.filter((c) => c._id !== chatToDelete._id));

      if (selectedChat?._id === chatToDelete._id) {
        setSelectedChat(null);
      }

      toast({
        title: "Chat Deleted Successfully",
        status: "success",
        duration: 3000,
        isClosable: true,
        position: "top",
      });
    } catch (error) {
      toast({
        title: "Error Deleting Chat",
        description: error.response?.data?.message || "Something went wrong",
        status: "error",
        duration: 3000,
        isClosable: true,
        position: "top",
      });
    } finally {
      // NEW: Clean up states
      setIsDeleteAlertOpen(false);
      setChatToDelete(null);
    }
  };

  return (
    <Box
      display={{ base: selectedChat ? "none" : "flex", md: "flex" }}
      flexDir="column"
      alignItems="center"
      p={3}
      bg="white"
      w={{ base: "100%", md: "31%" }}
      borderRadius="lg"
      borderWidth="1px"
    >
      <Box
        pb={3}
        px={3}
        fontSize={{ base: "28px", md: "30px" }}
        fontFamily="Work Sans"
        display="flex"
        w="100%"
        justifyContent="space-between"
        alignItems="center"
      >
        My Chats
        <GroupChatModel>
          <Button
            display="flex"
            fontSize={{ base: "17px", md: "10px", lg: "17px" }}
            rightIcon={<AddIcon />}
          >
            New Group Chat
          </Button>
        </GroupChatModel>
      </Box>

      <Box
        display="flex"
        flexDir="column"
        p={3}
        bg="#F8F8F8"
        w="100%"
        h="100%"
        borderRadius="lg"
        overflowY="hidden"
      >
        {chats ? (
          <Stack overflowY="scroll">
            {chats.map((chat) => (
              <Box
                onClick={() => setSelectedChat(chat)}
                cursor="pointer"
                bg={selectedChat === chat ? "#4FB0FF" : "#E8E8E8"}
                color={selectedChat === chat ? "white" : "black"}
                px={3}
                py={2}
                borderRadius="lg"
                key={chat._id}
                display="flex"
                width="100%"
                justifyContent="space-between"
                _hover={{
                  "& .delete-button": {
                    opacity: 1,
                  },
                }}
              >
                  <Text display="flex" alignItems="center" fontSize={"lg"}>
                    {/* {!chat.isGroupChat
                    ? getSender(loggedUser, chat.users)
                    : chat.chatName} */}

                    {!chat.isGroupChat && loggedUser && chat.users
                      ? getSender(loggedUser, chat.users)
                      : chat.chatName}
                  </Text>

                {/* For deleting the chat */}
                <Button
                  className="delete-button"
                  opacity={0}
                  transition="opacity 0.2s"
                  size="sm"
                  colorScheme="red"
                  onClick={(e) => {
                    e.stopPropagation();
                    handleDeleteClick(chat);
                  }}
                  ml={2} // Add margin to the left of button
                >
                  <CloseIcon boxSize="3" />
                </Button>
                {/* Add this AlertDialog component */}
                <AlertDialog
                  isOpen={isDeleteAlertOpen}
                  // leastDestructiveRef={cancelRef}
                  onClose={() => setIsDeleteAlertOpen(false)}
                >
                  <AlertDialogOverlay>
                    <AlertDialogContent>
                      <AlertDialogHeader fontSize="lg" fontWeight="bold">
                        Do you want to delete the Chat!
                      </AlertDialogHeader>

                      <AlertDialogBody>
                        This will permanently delete the chat.
                      </AlertDialogBody>

                      <AlertDialogFooter>
                        <Button
                          // ref={cancelRef}
                          onClick={() => setIsDeleteAlertOpen(false)}
                        >
                          Cancel
                        </Button>
                        <Button
                          colorScheme="red"
                          onClick={handleDeleteConfirm}
                          ml={3}
                        >
                          Delete
                        </Button>
                      </AlertDialogFooter>
                    </AlertDialogContent>
                  </AlertDialogOverlay>
                </AlertDialog>
              </Box>
            ))}
          </Stack>
        ) : (
          <ChatLoading />
        )}
      </Box>
    </Box>
  );
};

export default MyChats;
