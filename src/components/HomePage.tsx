import {
  VStack,
  Button,
  HStack,
  Heading,
} from "@chakra-ui/react";

interface HomePageProps {
  appName: string;
  nextPage: () => void;
}

export const HomePage: React.FC<HomePageProps> = ({appName, nextPage}) => {

  return <>
    <VStack paddingY={0} justify="space-around" alignItems="left">
      <VStack minH="100vh" minW="100vw" justify="space-evenly">
        <VStack alignItems="left">
          <Heading fontSize={80}>Private Inference using Nillion</Heading>
        </VStack>
        <HStack justify="space-around">
          <Button onClick={nextPage} borderRadius={20}>Get Started</Button>
        </HStack>
      </VStack>
    </VStack>
  </>;
}