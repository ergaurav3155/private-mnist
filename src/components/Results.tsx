import * as React from "react";
import {
    Text,
    VStack,
    Button,
    Heading,
    InputGroup,
    InputLeftAddon,
    InputRightElement,
    Input,
    HStack,
  } from "@chakra-ui/react";
  
import { UserContext } from "../App";
import { compute } from "../nillion/compute";
import { ReactTyped } from "react-typed";
  
  interface ResultsProps {
    nextPage: () => void;
  }
  
  export const Results: React.FC<ResultsProps> = ({nextPage}) => {

    const {modelStore, imageStore, nillion, nillionClient, programId, otherPartyId, partyBit, signalingChannel, result, setResult} = React.useContext(UserContext);

    const [loading, setLoading] = React.useState<boolean>(false);
    
    const computeInference = async () => {
      setLoading(true);
      // nextPage();
      signalingChannel.sendTo("mnist-" + programId + "-other", {fin: true});
      const result = await compute(nillion, nillionClient, otherPartyId, [modelStore, imageStore], programId, "label");
      setResult(result);
      setLoading(false);
      console.log(signalingChannel.sendTo("mnist-" + programId + "-other", {result: result}));
    }

    return <>
      <VStack paddingY={0} justify="space-around" alignItems="left">
        <VStack minH="100vh" minW="100vw" justify="space-evenly">
          <VStack spacing={"5vh"}>

          <Heading fontSize={"5xl"}>Results</Heading>
          <InputGroup size='md'>
            <InputLeftAddon>Event Code</InputLeftAddon>
            <Input value={(programId || "")} pr='4.5rem' readOnly></Input>
            <InputRightElement width='4.5rem'>
              <Button size='sm' h='1.75rem' onClick={() => navigator.clipboard.writeText(programId || "")}>Copy</Button>
            </InputRightElement>
          </InputGroup>
          <HStack>
            <InputGroup size='md'>
              <InputLeftAddon>Host</InputLeftAddon>
              <Input value={(modelStore === null ? "Pending   🟡" : "Ready   ✅")} pr='4.5rem' readOnly></Input>
            </InputGroup>
            <InputGroup size='md'>
              <InputLeftAddon>Client</InputLeftAddon>
              <Input value={(imageStore === null ? "Pending   🟡" : "Ready   ✅")} pr='4.5rem' readOnly></Input>
            </InputGroup>
          </HStack>
          {((partyBit === 1) && (result === "")) && <Text>Waiting for host<ReactTyped strings={[".", "..", "..."]} typeSpeed={80} showCursor={false} loop/></Text>}
          {(partyBit === 0) && (imageStore === null) && <Text>Waiting for client<ReactTyped strings={[".", "..", "..."]} typeSpeed={80} showCursor={false} loop/></Text>}
          {(partyBit === 0) && <Button onClick={computeInference} isLoading={loading} isDisabled={(partyBit === 1) || !(modelStore !== null && imageStore !== null)}>Compute Inference!</Button>}
          {(result !== "") && <Text>The image looks like a {result}!</Text>}
          </VStack>
        </VStack>
      </VStack>
    </>;
  }