import React, { useState, useEffect } from "react";
import { Container, Box, Text, VStack } from "@chakra-ui/layout";
import { Button } from "@chakra-ui/button";
import { Input } from "@chakra-ui/input";
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
import { useToast } from "@chakra-ui/toast";
import { useHistory } from "react-router";
import axios from "axios";
import { socket } from "../../connection/socket";

const Multi = () => {
  const history = useHistory();
  const toast = useToast();

  const [rooms, setRooms] = useState([]);
  const [input, setInput] = useState();

  useEffect(() => {
    fetchRooms();
  }, []);

  const fetchRooms = async () => {
    const { data } = await axios.get("/api/v1/rooms");
    setRooms(data.data.rooms);
    console.log(data.data.rooms);
  };

  const createNewRoom = async () => {
    console.log("create new room");

    const { data } = await axios.post("/api/v1/rooms/");
    console.log(data);
    const roomId = data.data.room._id;
    socket.emit("CREATE", roomId);
    history.replace("/game", { roomId: roomId, isHost: true });
  };

  const joinRoom = async (roomId) => {
      console.log("join room");

      const { data } = await axios.patch(`/api/v1/rooms/join/${roomId}`)

      console.log(data);
      const room_id = data.data.newRoom._id;
      socket.emit("JOIN", room_id);
      history.replace("/game", { roomId: room_id });
  };

  return (
    <Container maxW="100%" maxH="100%" p={5} centerContent>
      <Box
        d="flex"
        justifyContent="center"
        w="50%"
        fontWeight="600"
        bg="white"
        mg="5px"
        borderRadius="15px"
        borderWidth="2px"
      >
        <Text fontSize="4xl" fontFamily="Work sans">
          Online-Othello
        </Text>
      </Box>

      <Box
        d="flex"
        marginTop="20px"
        marginBottom="50px"
        justifyContent="center"
        w="100%"
      >
        <Button colorScheme="teal" variant="solid" marginRight="10px" onClick={() => history.goBack()}>Back to main</Button>
        <Input
          placeholder="Enter Room ID"
          bg="white"
          w="50%"
          onChange={(e) => setInput(e.target.value)}
        />
        <Box marginLeft="20px">
          <Button
            colorScheme="teal"
            variant="solid"
            marginRight="20px"
            onClick={() => joinRoom(input)}
          >
            Join
          </Button>
          <Button
            colorScheme="teal"
            variant="solid"
            onClick={() => createNewRoom()}
          >
            Create
          </Button>
        </Box>

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
          {rooms?.map((room, index) => (
            <Tr key={index}>
              <Td>{index}</Td>
              <Td>{room._id}</Td>
              <Td>{room.host.username}</Td>
              <Td>{room.users[0].username}</Td>
              <Td>{}</Td>
              <Td>{room.users[1] ? room.users[1].username : ""}</Td>
              <Td>
                {room.state === "WAITING" ? (
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
          ))}
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
