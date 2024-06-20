import * as React from "react"
import { useState } from "react";
import {
  ChakraProvider,
  extendTheme,
} from "@chakra-ui/react";

const config = {
  initialColorMode: "dark",
  useSystemColorMode: false,
};

const theme = extendTheme({ 
  config,
});

const appName = "Private Inference using Nillion";

export const UserContext = React.createContext<any>(null);

export const App = () => {

  const [myUserKey, setMyUserKey] = useState<string | null>(null); // user key
  const [myUserId, setMyUserId] = useState<string | null>(null);
  const [programId, setProgramId] = useState<string | null>(null); // program id
  const [partyBit, setPartyBit] = useState<number | null>(null); // party bit
  const [host, setHost] = useState<string | null>(null);
  const [modelStore, setModelStore] = useState<any>(null);
  const [imageStore, setImageStore] = useState<any>(null);
  const [otherPartyId, setOtherPartyId] = useState<string | null>(null);

  const [nillion, setNillion] = useState<any>(null);
  const [nillionClient, setNillionClient] = useState<any>(null);
  const [signalingChannel, setSignalingChannel] = useState<any>(null);
  const [result, setResult] = React.useState<string>("");

  const d = {
    appName,
    myUserKey, setMyUserKey,
    programId, setProgramId,
    partyBit, setPartyBit,
    nillion, nillionClient,
    modelStore, setModelStore,
    imageStore, setImageStore,
    otherPartyId, setOtherPartyId,
    host, setHost,
    myUserId, setMyUserId,
    signalingChannel, setSignalingChannel,
    result, setResult,
  }

  React.useEffect(() => {
    if (myUserKey) {
      const getNillionClientLibrary = async () => {
        const nillionClientUtil = await import("./nillion/nillionClient");
        const libraries = await nillionClientUtil.getNillionClient(myUserKey);
        setNillion(libraries.nillion);
        setNillionClient(libraries.nillionClient);
        return libraries.nillionClient;
      };
      getNillionClientLibrary().then(nillionClient => {
        setMyUserId(nillionClient.user_id);
      });
    }
  }, [myUserKey]);


  return <ChakraProvider theme={theme}>
    <UserContext.Provider value={d}>
      Hello
    </UserContext.Provider>
  </ChakraProvider>
}