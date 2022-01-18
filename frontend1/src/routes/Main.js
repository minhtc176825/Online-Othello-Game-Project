import React from "react";
import { Container, Box, Text, VStack } from "@chakra-ui/layout";
import { Button } from "@chakra-ui/button";
import { useHistory } from "react-router";

const Main = () => {
  const history = useHistory();

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
          <Button w="60%" h="100px" onClick={() => history.push("/single")}>
            <Text fontSize="4xl" fontFamily="Work sans">
              Singleplay
            </Text>
          </Button>
          <Button w="60%" h="100px" onClick={() => history.push("/multi")}>
            <Text fontSize="4xl" fontFamily="Work sans">
              Multiplay
            </Text>
          </Button>
          <Button w="60%" h="100px">
            <Text fontSize="4xl" fontFamily="Work sans">
              Log out
            </Text>
          </Button>
        </VStack>
      </Container>
    </Container>
  );
};

export default Main;
