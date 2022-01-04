import React, { useState, useEffect } from "react";
import axios from "axios";
import { Box, Container, Grid, GridItem, Text } from "@chakra-ui/layout";
import { Button } from "@chakra-ui/button";
// import io from "socket.io-client";
import { socket } from "../connection/socket";
import { useHistory } from "react-router";
// const ENDPOINT = "http://localhost:8000";
// var socket;

const Game = (props) => {
  const history = useHistory();
  const room = props.location.state.room;
  const user = props.location.state.user;

  const [board, setBoard] = useState(room.board);
  const [users, setUsers] = useState(room.users);
  const [score, setScore] = useState([]);
  const [socketConnected, setSocketConnected] = useState(false);
  const [ready, setReady] = useState(false);
  const [isHost, setHost] = useState(false);
  const [turn, setTurn] = useState();

  // created -> joined
  //
  useEffect(() => {
    console.log(board);
  }, [board]);

  // useEffect(() => {
  //   console.log("--- 2");
   
  // }, []);

  socket.on("created", (data) => {
    console.log("Created new game");
    setHost(true);
    setTurn(data.turn);
    console.log(`Your turn: ${data.turn}`);
  });

  socket.on("joined", (data) => {
    console.log("Joined the game");
    setTurn(data.turn);
    console.log(`Your turn: ${data.turn}`);
  });

  socket.on("ready", async () => {
    console.log("one player has just joined");
    setReady(true);
    const { data } = await axios.get(`/api/v1/room/${room._id}`, {
      headers: {
        Authorization: `Bearer ${user.token}`,
      },
    });

    setUsers(data.users);
  });

  socket.on("new board", (room) => {
    setBoard(room.board);
  });

  socket.on("updated board", async (roomData) => {
    console.log("received updated board");

    console.log(roomData);
    // console.log(data);
    setBoard(roomData.data.board);
    console.log(`Your turn: ${turn}`);
    console.log(`Next turn: ${roomData.turn}`)
    if (roomData.turn === turn) {
      
      console.log("next is your turn");
      console.log(board);
      socket.emit("get available moves", { board: roomData.data.board, turn: turn });
    }
    // const config = {
    //   headers: {
    //     Authorization: `Bearer ${user.token}`,
    //   },
    // };

    // const room = await axios.patch(
    //   `/api/v1/room/${data._id}`,
    //   { board: data.board, turn: data.turn },
    //   config
    // );

    // console.log("updated board -----")
    // console.log(room)
  });

  socket.on("get available moves", (room) => {
    setBoard(room.board);
  })

  const startGame = () => {
    console.log("Start game");
    socket.emit("start", { data: room, turn: turn });
  };

  const handleQuitRoom = () => {
    socket.emit("quit", room);
    console.log("quit room");
    history.replace("/multi");
  };

  const makeMove = (index) => {
    console.log('you made move');
    // console.log("check make move indexed ", index);
    const row = Math.floor(index / 8);
    const col = index % 8;
    socket.emit("make move", { data: room, turn: turn, row: row, col: col });
  };

  return (
    <Container maxW="100%" maxH="100%" p={5} centerContent d="flex">
      <Box
        d="flex"
        justifyContent="center"
        w="50%"
        h="10%"
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
        h="20px"
        w="100%"
        marginBottom="20px"
        d="flex"
        justifyContent="center"
      >
        {users.length == 2 ? (
          <div>
            {users[0].username} {score[0]} - {score[1]} {users[0].username}{" "}
          </div>
        ) : (
          "Waiting for opponent..."
        )}
        {/* {users[0].username} {score[0]} - {score[1]} {users[1] ? users[1].username : ''} */}
      </Box>

      <Box
        h="680px"
        w="680px"
        bg="white"
        d="flex"
        justifyContent="center"
        alignItems="center"
        borderRadius="15px"
      >
        <Grid
          templateColumns="repeat(8, 1fr)"
          templateRows="repeat(8, 1fr)"
          gap={1}
          // bg="white"
        >
          {board.map((square, i) => {
            return (
              <GridItem
                w="80px"
                h="80px"
                bg="green.500"
                key={i}
                d="flex"
                justifyContent="center"
                alignItems="center"
                onClick={square === -1 ? () => makeMove(i) : () => ""}
              >
                {square === 1 ? (
                  <Box w="70%" h="70%" bg="white" borderRadius="50%"></Box>
                ) : square === 2 ? (
                  <Box w="70%" h="70%" bg="black" borderRadius="50%"></Box>
                ) : square === -1 ? (
                  <Box w="30%" h="30%" bg="red" borderRadius="50%"></Box>
                ) : (
                  <div></div>
                )}
              </GridItem>
            );
          })}
        </Grid>
      </Box>
      <Box>
        {isHost ? (
          <Button isDisabled={!ready} onClick={() => startGame()}>
            Start
          </Button>
        ) : (
          ""
        )}
        <Button onClick={() => handleQuitRoom()}>Quit</Button>
      </Box>
    </Container>
  );
};

export default Game;
