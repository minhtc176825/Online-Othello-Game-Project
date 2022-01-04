import { Box, Container } from "@chakra-ui/layout";
import React, { useEffect } from "react";
import { Text } from "@chakra-ui/layout";
import { Image } from "@chakra-ui/react";
import { Button } from "@chakra-ui/button";
import { useHistory } from "react-router-dom";

const Single = () => {
  const property = {
    imageUrl: "https://bit.ly/2Z4KKcF",
    imageAlt: "Rear view of modern home with pool",
    beds: 3,
    baths: 2,
    title: "Modern home in city center in the heart of historic Los Angeles",
    formattedPrice: "$1,900.00",
    reviewCount: 34,
    rating: 4,
  };

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
        d="flex"
        maxW="100%"
        h="80%"
        marginTop="30px"
        justifyContent="space-around"
        alignItems="center"
      >
        <Box
          maxW="30%"
          borderWidth="1px"
          borderRadius="lg"
          overflow="hidden"
          bg="white"
        >
          <Image src={property.imageUrl} alt={property.imageAlt} />
          <Box p="10" d="flex" justifyContent="center">
            <Button colorScheme="teal" variant="solid" w="md">
              Easy
            </Button>
          </Box>
        </Box>

        <Box
          maxW="30%"
          borderWidth="1px"
          borderRadius="lg"
          overflow="hidden"
          bg="white"
        >
          <Image src={property.imageUrl} alt={property.imageAlt} />
          <Box p="10" d="flex" justifyContent="center">
            <Button colorScheme="teal" variant="solid" w="md">
              Medium
            </Button>
          </Box>
        </Box>

        <Box
          maxW="30%"
          borderWidth="1px"
          borderRadius="lg"
          overflow="hidden"
          bg="white"
        >
          <Image src={property.imageUrl} alt={property.imageAlt} />
          <Box p="10" d="flex" justifyContent="center">
            <Button colorScheme="teal" variant="solid" w="md">
              Hard
            </Button>
          </Box>
        </Box>
      </Container>

      <Box>
        <Button
          colorScheme="teal"
          variant="solid"
          w="sm"
          onClick={ () => history.push("/main")}
        >
          Back To Mainmenu
        </Button>
      </Box>
    </Container>
  );
};

export default Single;
