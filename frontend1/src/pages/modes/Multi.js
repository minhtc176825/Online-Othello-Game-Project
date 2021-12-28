import React, { useEffect, useState } from "react";
import axios from "axios";
import {
  Table,
  TableCaption,
  Thead,
  Tr,
  Th,
  Td,
  Tbody,
  Tfoot,
} from "@chakra-ui/table";
import { Box, Container, Text } from "@chakra-ui/layout";
import { useHistory } from "react-router";
import { Input } from "@chakra-ui/input";
import { Button } from "@chakra-ui/button";
import { useToast } from "@chakra-ui/toast";

const Multi = () => {
  const toast = useToast();
  const history = useHistory();
  const user = JSON.parse(localStorage.getItem("userInfo"));
  const [rooms, setRooms] = useState();

  useEffect(() => {
    fetchRooms();
  }, []);

  const fetchRooms = async () => {
    try {
      const config = {
        headers: {
          Authorization: `Bearer ${user.token}`,
        },
      };

      const { data } = await axios.get("/api/v1/room/", config);
      setRooms(data);
      console.log(data);
    } catch (error) {
      toast({
        title: "Error Occured!",
        description: "Failed to Load the chats",
        status: "error",
        duration: 5000,
        isClosable: true,
        position: "bottom-left",
      });
    }
  };

  const joinRoom = async (roomID) => {
    console.log("joi room");
    console.log(roomID);

    try {
      const config = {
        headers: {
          Authorization: `Bearer ${user.token}`,
        },
      };

      const { data } = await axios.put(
        `http://127.0.0.1:8000/api/v1/room/${roomID}`,
        config
      );
      console.log("joined room");
    } catch (error) {
      toast({
        title: "Error Occured!",
        description: "Failed to join the rooms",
        status: "error",
        duration: 5000,
        isClosable: true,
        position: "bottom-left",
      });
    }
  };

  return (
    <Container maxW="100%" maxH="100%" p={5} centerContent d="flex">
      <Box
        d="flex"
        justifyContent="center"
        w="50%"
        fontWeight="600"
        bg="white"
        mg="5px"
        borderRadius="15px"
        borderWidth="2px"
        marginBottom="30px"
      >
        <Text fontSize="4xl" fontFamily="Work sans">
          Online-Othello
        </Text>
      </Box>

      <Box
        d="flex"
        marginTop="10px"
        marginBottom="50px"
        w="30%"
        justifyContent="space-between"
      >
        <Input placeholder="Enter Room ID" bg="white" maxW="80%" />
        <Button colorScheme="teal" variant="solid" w="15%">
          Join
        </Button>
      </Box>

      <Table
        variant="simple"
        bg="white"
        borderRadius="15px"
        maxW="80%"
        maxH="80%"
      >
        <TableCaption>Imperial to metric conversion factors</TableCaption>
        <Thead>
          <Tr>
            <Th>No.</Th>
            <Th>Room ID</Th>
            <Th>Host</Th>
            <Th>Player 1</Th>
            <Th>Score</Th>
            <Th>Player 2</Th>
            <Th></Th>
          </Tr>
        </Thead>
        <Tbody overflow="scroll">
          {rooms ? (
            rooms.map((room, index) => (
              <Tr key={index}>
                <Td>{index}</Td>
                <Td>{room._id}</Td>
                <Td>{room.host.username}</Td>
                <Td>{room.users[0].username}</Td>
                <Td>{}</Td>
                <Td>{room.users[1] ? room.users[1].username : ""}</Td>
                <Td>
                  {room.state === 0 ? (
                    <Button
                      colorScheme="teal"
                      variant="solid"
                      onClick={() => joinRoom(room._id)}
                    >
                      Join
                    </Button>
                  ) : (
                    <Button colorScheme="teal" variant="solid">
                      Spectate
                    </Button>
                  )}
                </Td>
              </Tr>
            ))
          ) : (
            <Tr></Tr>
          )}
        </Tbody>
        <Tfoot>
          <Tr>
            <Th>No.</Th>
            <Th>Room ID</Th>
            <Th>Host</Th>
            <Th>Player 1</Th>
            <Th>Score</Th>
            <Th>Player 2</Th>
            <Th></Th>
          </Tr>
        </Tfoot>
      </Table>
    </Container>
  );
};

export default Multi;
