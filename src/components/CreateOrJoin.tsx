import * as React from "react";
import { useState } from "react";
import {
  VStack,
  Button,
  Heading,
  Text,
  Input,
  HStack,
} from "@chakra-ui/react";
import { storeProgram } from "../nillion/storeProgram";
import { UserContext } from "../App";

interface CreateOrJoinProps {
  nextPage: () => void;
}

export const CreateOrJoin: React.FC<CreateOrJoinProps> = ({nextPage}) => {
  const {nillionClient, setImageStore, setOtherPartyId, setProgramId, setPartyBit, setHost, setSignalingChannel} = React.useContext(UserContext);
  const [loading, setLoading] = useState(false);

  const [otherEvent, setOtherEvent] = useState<string>("");

  const createEvent = async () => {
    setLoading(true);
    const pId = await storeProgram(nillionClient, "mnist");
    setProgramId(pId);
    console.log(pId);
    setLoading(false);
    setPartyBit(0);
    setHost(pId.split("/")[0]);

    const SignalingChannel = require("../signalling/signaling");
    const peerId = "mnist-" + pId;
    const channel = new SignalingChannel(peerId, "http://kanav.eastus.cloudapp.azure.com:3030/", "SIGNALING123");
    
    channel.onMessage = (message: any) => {
      console.log(message);
      if (message.from === peerId + "-other") {
        if (message.message) {
          setImageStore(message.message.store_id);
          setOtherPartyId(message.message.party_id);
        }
      }
    };
    channel.connect();
    setSignalingChannel(channel);
    nextPage();
  }

  const joinEvent = async () => {
    setProgramId(otherEvent);
    setPartyBit(1);
    setHost(otherEvent.split("/")[0]);
    nextPage();
  }

  return <VStack paddingY={0} justify="space-around" alignItems="left">
    <VStack minH="100vh" justify="space-evenly" spacing={"-40vh"} minW="100vw">
      <Heading fontSize={"5xl"}>Step 2: Invite or Join</Heading>
      <HStack spacing="5vw" justify="space-between">
        <VStack alignItems="left" justifyItems="space-between" spacing="4vh">
          <Text>
            Do you own a trained model you would like to host?
          </Text>
          <Text>
            You will get an session code to share with the client.
          </Text>
          <Button onClick={createEvent} isLoading={loading}>
            Create Session
          </Button>
        </VStack>
        {/* Vertical line */}
        <VStack borderLeft="0.01px solid whitesmoke" height="50vh" />
        <VStack alignItems="left" justifyItems="space-between" spacing="4vh">
          <Text>
            Join as a client and validate an hosted model by providing a test image of your choice.
          </Text>
          <Text>
            Enter the session code provided by the host.
          </Text>
          <Input placeholder="Event Code" value={otherEvent} onChange={(e) => setOtherEvent(e.target.value) }/>
          <Button isDisabled={otherEvent===""} onClick={joinEvent}>
            Join Event
          </Button>
        </VStack>
      </HStack>
    </VStack>
  </VStack>;
}