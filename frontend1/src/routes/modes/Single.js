import React from "react";
import { Container, Box, Text, VStack } from "@chakra-ui/layout";
import { Button } from "@chakra-ui/button";
import { useHistory } from "react-router";
import { socket } from "../../connection/socket";

const Single = () => {
  const history = useHistory();

  const easyMode = () => {
    history.push("/game", { level: 1});
  };

  const mediumMode = () => {
    history.push("/game", { level: 2});
  }

  const hardMode = () => {
    history.push("/game", { level: 3});
  }

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

      <Container
        maxW="50%"
        h="100%"
        centerContent
        d="flex"
        justifyContent="center"
        alignItems="center"
      >
        <VStack w="100%" h="100%" d="flex" justifyContent="space-evenly">
          <Button w="60%" h="100px" onClick={() => easyMode()}>
            <Text fontSize="4xl" fontFamily="Work sans">
              Easy
            </Text>
          </Button>
          <Button w="60%" h="100px" onClick={() => mediumMode()}>
            <Text fontSize="4xl" fontFamily="Work sans">
              Medium
            </Text>
          </Button>
          <Button w="60%" h="100px" onClick={() => hardMode()}>
            <Text fontSize="4xl" fontFamily="Work sans">
              Hard
            </Text>
          </Button>
          <Button w="60%" h="100px" onClick={() => history.goBack()}>
            <Text fontSize="2xl" fontFamily="Work sans">
              Back to Menu
            </Text>
          </Button>
        </VStack>
      </Container>
    </Container>
  );
};

export default Single;
