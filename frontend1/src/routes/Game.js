import React, { useState, useEffect } from "react";
import axios from "axios";
import { useHistory } from "react-router";
import { Box, Container, Grid, GridItem, Text } from "@chakra-ui/layout";
import { Button } from "@chakra-ui/button";
import { socket } from "../connection/socket";

const Game = (props) => {
  const roomId = props.location.state?.roomId;
  const isHost = props.location.state?.isHost;
  const _level = props.location.state?.level;
  const history = useHistory();

  const [board, setBoard] = useState([]);
  const [users, setUsers] = useState([]);
  const [score, setScore] = useState([]);
  const [state, setState] = useState();
  const [turn, setTurn] = useState(isHost ? 1 : 2);
  const [currentTurn, setCurrentTurn] = useState();
  const [initComponent, setInitComponent] = useState(false);
  const [host, setHost] = useState(isHost ? true : false);
  const [endpoint, setEndpoint] = useState("http://localhost:8000");
  const [showStart, setShowStart] = useState(false);
  const [level, setLevel] = useState(0);
  const [winner, setWinner] = useState();

  useEffect(() => {
    console.log("only one");
    setInitComponent(true);
    if (roomId) {
      console.log("HERE");
      getRoom();
    } else {
      console.log("SINGLE");
      socket.emit("SINGLE");
      setLevel(_level);

      socket.on("SINGLE", (data) => {
        console.log("EASY MODE");
        console.log(data);
        setBoard(data.board);
        setUsers([{ username: "You" }, { username: "Bot" }]);
        setScore([2, 2]);
        setCurrentTurn(1);
      });
      return () => socket.off("SINGLE");
    }
  }, []);

  useEffect(() => {
    if (initComponent) {
      console.log("check here");
      socket.on("READY", async () => {
        console.log("one player has just joined");

        const { data } = await axios.get(`/api/v1/rooms/${roomId}`);
        console.log(data);
        const room = data.data.room;
        setUsers(room.users);
        setScore(room.score);
        setState(room.state);
        isHost ? setShowStart(true) : setShowStart(false);
      });

      socket.on("START", (data) => {
        console.log(data);
        setBoard(data.board);
        setCurrentTurn(data.currentTurn);
        setState("PLAYING");
        setShowStart(false);
        console.log(`turn: ${turn}`);
        if (data.currentTurn === turn) {
          socket.emit("GET MOVES", {
            board: data.board,
            roomId: roomId,
            currentTurn: data.currentTurn,
          });
        }
      });

      socket.on("MOVE", (data) => {
        console.log("ON MOVE");
        console.log(data);
        setBoard(data.board);
        setScore(data.score);

        if (data.board.filter((square) => square === 0).length === 0) {
          setState("FINISH");
          socket.emit("END", roomId);
        } else if (data.currentTurn === turn) {
          console.log("-adfadskfla");
          socket.emit("GET MOVES", {
            board: data.board,
            roomId: roomId,
            currentTurn: data.currentTurn,
          });
        }
      });

      socket.on("GET MOVES", (data) => {
        console.log("GET MOVES");
        console.log(data);
        setBoard(data.board);
        setCurrentTurn(data.currentTurn);
      });

      socket.on("SINGLEMOVE", (data) => {
        setBoard(data.board);
        setScore(data.score);

        if (
          data.board.filter((square) => square === -1 || square === 0)
            .length === 0
        ) {
          setState("FINISH");
        }
      });

      socket.on("USER LEFT", (data) => {
        console.log("user left");

        // setUsers(data.users);
        // console.log(data);
        setWinner(data.users.username);

        setState("FINISH");

        console.log(users);
      });
    }
  }, [initComponent]);

  const getRoom = async () => {
    console.log("get room");

    const { data } = await axios.get(`/api/v1/rooms/${roomId}`);

    console.log(data);
    const room = data.data.room;
    setBoard(room.board);
    setUsers(room.users);
    setScore(room.score);
    setState(room.state);
  };

  const startGame = () => {
    console.log("START");
    socket.emit("START", {
      roomId: roomId,
      board: board,
      turn: turn,
      currentTurn: currentTurn,
    });
  };

  const makeMove = (index) => {
    console.log("make move");

    const row = Math.floor(index / 8);
    const col = index % 8;

    if (roomId) {
      socket.emit("MOVE", {
        roomId: roomId,
        board: board,
        turn: turn,
        row: row,
        col: col,
        currentTurn: currentTurn,
      });
    } else {
      console.log("SINGLE MOVE");
      console.log(initComponent);
      socket.emit("SINGLE MOVE", {
        board: board,
        row: row,
        col: col,
        level: level,
        currentTurn: currentTurn,
      });
    }
  };

  const playAgain = () => {
    console.log("PLAY AGAIN");

    setState("WAITING");
  };

  const handleQuitRoom = async () => {
    socket.emit("QUIT ROOM", { roomId: roomId, users: users, isHost: isHost });

    if (state === "FINISH" || state == "WAITING") {
      const { data } = await axios.delete(`/api/v1/rooms/${roomId}`);
    }

    history.replace("/multi");
  };

  return (
    <Container maxW="100%" maxH="100%" p={5} centerContent d="flex">
      <Box
        d="flex"
        justifyContent="center"
        alignItems="center"
        w="50%"
        fontWeight="600"
        bg="white"
        mg="5px"
        borderRadius="15px"
        borderWidth="2px"
        marginBottom="10px"
      >
        <Text fontSize="4xl" fontFamily="Work sans">
          Online-Othello
        </Text>
      </Box>

      <Box
        h="40px"
        w="400px"
        marginBottom="20px"
        d="flex"
        justifyContent="space-evenly"
        alignItems="center"
        bg="white"
        borderRadius="20px"
      >
        <Box
          borderRadius="50%"
          bg="white"
          borderColor="white"
          h="20px"
          w="20px"
          border="1px"
        ></Box>
        {users?.length == 2 ? (
          <Text fontFamily="Work sans" fontSize="xl">
            {users[0]?.username}{" "}
            <strong>
              {score[0]} - {score[1]}
            </strong>{" "}
            {users[1].username}
          </Text>
        ) : (
          ""
        )}

        <Box
          borderRadius="50%"
          bg="black"
          borderColor="white"
          h="20px"
          w="20px"
          border="1px"
        ></Box>

        {/* {users[0].username} {score[0]} - {score[1]} {users[1] ? users[1].username : ''} */}
      </Box>

      <Box
        h="680px"
        w="680px"
        bg="white"
        d="flex"
        justifyContent="center"
        alignItems="center"
      >
        <Box hidden={!showStart}>
          <Button
            w="100%"
            h="100%"
            colorScheme="teal"
            variant="outline"
            bg="white"
            position="absolute"
            left="50%"
            top="50%"
            w="20%"
            h="20%"
            d="flex"
            justifyContent="center"
            alignItems="center"
            transform="translate(-50%,-50%)"
            // isDisabled={state === "WAITING"}
            onClick={() => startGame()}
          >
            <Text fontFamily="Work sans" fontSize="4xl">
              Start
            </Text>
          </Button>
        </Box>

        <Box
          w="100%"
          h="100%"
          colorScheme="teal"
          variant="outline"
          bg="white"
          position="absolute"
          left="50%"
          top="50%"
          w="40%"
          h="20%"
          d="flex"
          justifyContent="center"
          alignItems="center"
          transform="translate(-50%,-50%)"
          hidden={state === "WAITING" ? false : true}
        >
          <Text fontFamily="Work sans" fontSize="2xl">
            Waiting for opponent...
          </Text>
        </Box>

        <Box
          w="100%"
          h="100%"
          colorScheme="teal"
          variant="outline"
          bg="white"
          position="absolute"
          left="50%"
          top="50%"
          w="40%"
          h="20%"
          d="flex"
          justifyContent="space-around"
          alignItems="center"
          transform="translate(-50%,-50%)"
          hidden={state === "FINISH" ? false : true}
          flexDirection="column"
          borderRadius="25px"
          border="2px"
          borderColor="green"
        >
          {}
          {winner ? (
            <Text fontFamily="Work sans" fontSize="3xl">
              {winner} won
            </Text>
          ) : score[0] > score[1] ? (
            <Text fontFamily="Work sans" fontSize="3xl">
              {users[0]?.username} won
            </Text>
          ) : score[0] < score[1] ? (
            <Text fontFamily="Work sans" fontSize="3xl">
              {users[1] ? users[1]?.username : ""} won
            </Text>
          ) : (
            <Text fontFamily="Work sans" fontSize="3xl">
              DEUCE
            </Text>
          )}
          <Box
            d="flex"
            justifyContent="space-evenly"
            alignItems="center"
            w="100%"
          >
            {/* <Button
              colorScheme="green"
              variant="solid"
              onClick={() => playAgain()}
            >
              <Text fontFamily="Work sans" fontSize="2xl">
                Play again
              </Text>
            </Button> */}
            <Button
              colorScheme="green"
              variant="solid"
              onClick={() => handleQuitRoom()}
            >
              <Text fontFamily="Work sans" fontSize="2xl">
                Quit
              </Text>
            </Button>
          </Box>
        </Box>
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
      <Box marginTop="5px">
        <Button onClick={() => handleQuitRoom()}>
          <Text fontFamily="Work sans" fontSize="xl">
            Quit
          </Text>
        </Button>
      </Box>
    </Container>
  );
};

export default Game;
