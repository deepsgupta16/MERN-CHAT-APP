import {
  Box,
  Button,
  Tooltip,
  Text,
  Menu,
  MenuButton,
  MenuList,
  Avatar,
  MenuItem,
  MenuDivider,
  Drawer,
  DrawerOverlay,
  DrawerContent,
  DrawerHeader,
  DrawerBody,
  Input,
  useToast,
  Spinner,
  Badge,
  HStack,
} from "@chakra-ui/react";
import React from "react";
import { useState } from "react";
import { BellIcon, ChevronDownIcon } from "@chakra-ui/icons";
import { ChatState } from "../../Context/ChatProvider";
import ProfileModal from "./ProfileModal";
import { useDisclosure } from "@chakra-ui/hooks";
import axios from "axios";
import ChatLoading from "../ChatLoading";
import UserListItem from "../UserAvatar/UserListItem";
import { getSender } from "../../config/ChatLogics";

const SideDrawer = () => {
  const [search, setSearch] = useState("");
  const [searchResults, setSearchResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const [loadingChat, setLoadingChat] = useState();
  const [noResults, setNoResults] = useState(false);
  const [isSearched, setIsSearched] = useState(false);

  const {
    user,
    setSelectedChat,
    chats,
    setChats,
    notification,
    setNotification,
  } = ChatState();
  const toast = useToast();
  const { isOpen, onOpen, onClose } = useDisclosure();

  const logoutHandler = async () => {
    const userInfo = JSON.parse(localStorage.getItem("userInfo"));
    if (!userInfo || !userInfo.token) {
      throw new Error("No user token found");
    }

    if (user.email === "guest@example.com") {
      // Show confirmation toast for guest users
      toast({
        position: "top",
        duration: null,
        isClosable: false,
        // Custom toast component
        render: () => (
          <Box
            p={4}
            bg="white"
            borderRadius="md"
            boxShadow="lg"
            border="1px"
            borderColor="red.200"
          >
            <Text fontSize="lg" fontWeight="bold" mb={3}>
              Confirm Logout
            </Text>
            {/* Warning message box */}
            <Box
              p={3}
              bg="red.50"
              borderRadius="md"
              borderLeft="4px"
              borderColor="red.400"
              mb={4}
            >
              <Text fontWeight="bold" color="red.600" mb={2}>
                ⚠️ Important Notice
              </Text>
              <Text color="red.600" fontSize="sm">
                All your chats, groups, and messages will be permanently
                deleted. Guest user data cannot be recovered after logout.
              </Text>
            </Box>
            {/* Confirmation buttons */}
            <Button
              colorScheme="red"
              mr={3}
              onClick={async () => {
                try {
                  await axios.post(
                    "/api/user/logout",
                    {},
                    {
                      headers: {
                        Authorization: `Bearer ${user.token}`,
                      },
                    }
                  );
                  toast.closeAll();
                  localStorage.removeItem("userInfo");
                  window.location.href = "/";
                } catch (error) {
                  toast({
                    title: "Error Occurred!",
                    description:
                      error.response?.data?.message || "Failed to logout",
                    status: "error",
                    duration: 5000,
                    isClosable: true,
                    position: "top",
                  });
                }
              }}
            >
              Yes, Logout
            </Button>
            <Button variant="ghost" onClick={() => toast.closeAll()}>
              Cancel
            </Button>
          </Box>
        ),
      });
      return; // Return early if guest user cancels
    }

    try {
      await axios.post(
        "/api/user/logout",
        {},
        {
          headers: {
            Authorization: `Bearer ${user.token}`,
          },
        }
      );

      localStorage.removeItem("userInfo");
      // history.push("/");
      window.location.href = "/";
    } catch (error) {
      console.error("Full error:", error);
      console.error("Error response:", error.response?.data); // This will show the backend error
      toast({
        title: "Error Occurred!",
        description: error.response?.data?.message || "Failed to logout",
        status: "error",
        duration: 5000,
        isClosable: true,
        position: "top",
      });
    }
  };

  // drawer close handler
  const handleDrawerClose = () => {
    setSearch("");
    setSearchResults([]);
    setIsSearched(false);
    onClose();
  };

  // search handler
  const handleSearchInputChange = (e) => {
    setSearch(e.target.value);
    if (e.target.value === "") {
      setSearchResults([]);
      setIsSearched(false);
    }
  };

  const handleSearch = async () => {
    setNoResults(false);

    if (!search) {
      toast({
        title: "Please Enter something in search",
        status: "info",
        duration: 5000,
        isClosable: true,
        position: "top-left",
      });
      return;
    }

    try {
      setLoading(true);
      setIsSearched(true);
      const config = {
        headers: {
          Authorization: `Bearer ${user.token}`,
        },
      };
      const { data } = await axios.get(`/api/user?search=${search}`, config);
      setLoading(false);
      setSearchResults(data);
      setNoResults(data.length === 0); // Set to true if no results found
    } catch {
      toast({
        title: "Error Occured!",
        description: "Failed to Load the Search Results",
        status: "error",
        duration: 5000,
        isClosable: true,
        position: "top-left",
      });
      setLoading(false);
      setNoResults(false);
    }
  };

  const accessChat = async (userId) => {
    try {
      setLoadingChat(true);
      const config = {
        headers: {
          "Content-type": "application/json",
          Authorization: `Bearer ${user.token}`,
        },
      };
      const { data } = await axios.post(`/api/chat`, { userId }, config);
      if (!chats.find((c) => c._id === data._id)) setChats([data, ...chats]);
      setSelectedChat(data);
      setLoadingChat(false);
      onClose();
    } catch (error) {
      toast({
        title: "Error fetching the chat",
        description: error.message,
        status: "error",
        duration: 5000,
        isClosable: true,
        position: "top-left",
      });
      setLoadingChat(false);
    }
  };

  return (
    <>
      <Box
        display="flex"
        justifyContent="space-between"
        alignItems="center"
        bg="white"
        w="100%"
        p="5px 10px 5px 10px"
        borderWidth="5px"
      >
        <Tooltip label="Search Users to chat" hasArrow placement="bottom-end">
          <Button variant={"ghost"} onClick={onOpen}>
            <i className="fa-solid fa-magnifying-glass"></i>
            <Text display={{ base: "none", md: "flex" }} px="4">
              Search User
            </Text>
          </Button>
        </Tooltip>

        <Text fontSize="2xl" fontFamily="Work sans">
          Talk-A-Tive
        </Text>
        <HStack spacing={4}>
          <Menu>
            <MenuButton p={1} position="relative">
              {notification.length > 0 && (
                <Badge
                  position="absolute"
                  top="-2"
                  right="-2"
                  colorScheme="red"
                  bg="red.500"
                  color="white"
                  borderRadius="full"
                  fontSize="xs"
                  px={2}
                  transform="scale(1)"
                  animation="pulse 2s infinite"
                  _hover={{
                    bg: "red.600",
                  }}
                  sx={{
                    "@keyframes pulse": {
                      "0%": {
                        transform: "scale(0.95)",
                        boxShadow: "0 0 0 0 rgba(255, 82, 82, 0.7)",
                      },
                      "70%": {
                        transform: "scale(1)",
                        boxShadow: "0 0 0 10px rgba(255, 82, 82, 0)",
                      },
                      "100%": {
                        transform: "scale(0.95)",
                        boxShadow: "0 0 0 0 rgba(255, 82, 82, 0)",
                      },
                    },
                  }}
                >
                  {notification.length}
                </Badge>
              )}
              <Box position="relative">
                <BellIcon
                  fontSize="2xl"
                  m={1}
                  transition="all 0.2s"
                  _hover={{
                    color: "blue.500",
                    transform: "scale(1.1)",
                  }}
                />
              </Box>
            </MenuButton>

            <MenuList pl={2}>
              {/* check if notification is empty */}
              {!notification.length && "No New Messages"}
              {notification.map((notif) => (
                <MenuItem
                  key={notif._id}
                  onClick={() => {
                    setSelectedChat(notif.chat);
                    setNotification(notification.filter((n) => n !== notif));
                  }}
                >
                  {notif.chat.isGroupChat
                    ? `New Message in ${notif.chat.chatName}`
                    : `New Message from ${getSender(user, notif.chat.users)}`}
                </MenuItem>
              ))}
            </MenuList>
          </Menu>
          <Menu>
            <MenuButton as={Button} rightIcon={<ChevronDownIcon />}>
              <Avatar
                size="sm"
                cursor="pointer"
                name={user.name}
                src={user.pic}
              ></Avatar>
            </MenuButton>
            <MenuList>
              <ProfileModal user={user}>
                <MenuItem>My Profile</MenuItem>
              </ProfileModal>
              <MenuDivider />
              <MenuItem onClick={logoutHandler}>Logout</MenuItem>
            </MenuList>
          </Menu>
        </HStack>
      </Box>

      <Drawer isOpen={isOpen} placement="left" onClose={handleDrawerClose}>
        <DrawerOverlay />
        <DrawerContent>
          <DrawerHeader borderBottomWidth="1px">Search Users</DrawerHeader>
          <DrawerBody>
            <Box display="flex" pb={2}>
              <Input
                placeholder="Search by name or email"
                mr={2}
                value={search}
                // onChange={(e) => setSearch(e.target.value)}
                onChange={handleSearchInputChange}
              />
              <Button onClick={handleSearch}>Go</Button>
            </Box>
            {loading ? (
              <ChatLoading />
            ) : (
              <>
                {searchResults?.length > 0
                  ? searchResults.map((user) => (
                      <UserListItem
                        key={user._id}
                        user={user}
                        handleFunction={() => accessChat(user._id)}
                      />
                    ))
                  : noResults &&
                    isSearched &&
                    search && (
                      <Box
                        p={3}
                        bg="blue.50"
                        borderRadius="md"
                        borderLeft="4px solid"
                        borderColor="blue.400"
                      >
                        <Text
                          fontSize="md"
                          color="blue.700"
                          fontWeight="medium"
                        >
                          It looks like there aren't any users that match your
                          search.
                        </Text>
                        <Text fontSize="sm" color="blue.600" mt={1}>
                          Try something else?
                        </Text>
                      </Box>
                    )}
              </>
            )}
            {loadingChat && <Spinner ml="auto" display="flex" />}
          </DrawerBody>
        </DrawerContent>
      </Drawer>
    </>
  );
};

export default SideDrawer;
