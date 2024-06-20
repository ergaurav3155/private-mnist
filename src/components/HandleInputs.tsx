import * as React from "react"
import { useState } from "react";
import {
  VStack,
  Button,
  Heading,
  HStack,
  Input,
  InputGroup,
  InputLeftAddon,
  InputRightElement,
} from "@chakra-ui/react"

import { UserContext } from "../App";
import { storeSecretsInteger } from "../nillion/storeSecretsInteger";
import * as zip from "@zip.js/zip.js";

// const submitCalendar = async () => {
//   setLoading(true);
//   await storeSecretsInteger(
//     nillion,
//     nillionClient,
//     calender.flat().map((v, i) => { return {name: "calender_p" + partyBit + "_h" + i, value: (v+1).toString()} }),
//     programId,
//     "Party" + partyBit,
//     [], [], [],
//     (partyBit === 0) ? [] : [host],
//   ).then(async (store_id: string) => {
//     console.log("Secret stored at store_id:", store_id);
//     if (partyBit === 0)
//       setCal0store(store_id);
//     if (partyBit === 1) {
//       setCal1store(store_id);
//       setCal0store("hehe");
//       const SignalingChannel = require("../signalling/signaling");
//       const peerId = programId + "-other";
//       const signalingServerUrl = "http://kanav.eastus.cloudapp.azure.com:3030/";
//       const token = "SIGNALING123";
//       const channel = new SignalingChannel(peerId, signalingServerUrl, token);
//       channel.onMessage = (message: any) => {
//         console.log("Got message: ");
//         console.log(message);
//         if (message.from === programId) {
//           if (message.message) {
//             if (message.message.result) {
//               setResult(message.message.result)
//             }
//             if (message.message.fin)
//               nextPage();
//           }
//         }
//       };
//       channel.connect();
//       channel.sendTo(programId, {store_id, party_id: nillionClient.party_id});
//       setSignalingChannel(channel);
//     }
//     setLoading(false);
//     nextPage();
//   });
// }


interface HandleInputsProps {
  nextPage: () => void;
}

const readFile = async (f: any) => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();

    reader.onload = (event: any) => {
      resolve(event.target.result);
    };

    reader.onerror = (err) => {
      reject(err);
    };

    reader.readAsArrayBuffer(f);
  });
}

const InputModel: React.FC<HandleInputsProps> = ({nextPage}) => {

  const [loading, setLoading] = useState(false);
  const [weights, setWeights] = useState<Float32Array | null>(null);
  const [bias, setBias] = useState<Float32Array | null>(null);

  const handleFileChange = async (event: any) => {
    console.log(event.target.files[0]);
    const file = event.target.files[0];

    const zipReader = new zip.ZipReader(new zip.BlobReader(file));
    const entries = await zipReader.getEntries();
    for (const entry of entries) {
      if (entry.filename.endsWith("data/1")) {
        const data = await entry.getData!(new zip.BlobWriter());
        const biasBytes = await data.arrayBuffer();
        // convert to float
        const bias = new Float32Array(biasBytes);
        setBias(bias);
      }
      if (entry.filename.endsWith("data/0")) {
        const data = await entry.getData!(new zip.BlobWriter());
        const weightsBytes = await data.arrayBuffer();
        // convert to float
        const weights = new Float32Array(weightsBytes);
        setWeights(weights);
        console.log(weights);
      }
    }
  }

  const { nillion, nillionClient, setModelStore, programId, partyBit, host, setSignalingChannel } = React.useContext(UserContext);

  const submitModel = async () => {
    setLoading(true);

    // assert(weights?.length === 10*28*28);
    // assert(bias?.length === 10);

    let namedModel = [];

    for (let i = 0; i < weights!.length; i++) {
      namedModel.push({name: "w1_" + Math.floor(i / 784) + "_" + (i % 784) , value: Math.floor(weights![i] * 4096 + 20000).toString()});
    }

    for (let i = 0; i < bias!.length; i++) {
      namedModel.push({name: "b1_" + i, value: Math.floor(bias![i] * 4096 * 4096).toString()});
    }

    // console.log(namedModel);
    
    const store_id = await storeSecretsInteger(
      nillion,
      nillionClient,
      namedModel,
      programId,
      "Party" + partyBit,
      [], [], [],
      []
    );

    console.log("Secret stored at store_id:", store_id);
    setModelStore(store_id);
    setLoading(false);
    nextPage();
  }

  return <VStack paddingY={0} justify="space-around" alignItems="left">
    <VStack minH="100vh" minW="100vw" justify="space-evenly">
      <Heading fontSize={"5xl"}>Step 3: Upload Model</Heading>
      <HStack justify="flex-start" spacing={50}>
        <InputGroup size='md'>
          <InputLeftAddon>Event Code</InputLeftAddon>
          <Input value={(programId || "")} pr='4.5rem' readOnly></Input>
          <InputRightElement width='4.5rem'>
            <Button size='sm' h='1.75rem' onClick={() => navigator.clipboard.writeText(programId || "")}>Copy</Button>
          </InputRightElement>
        </InputGroup>
      </HStack>
      <input type="file" placeholder="Upload Model" onChange={handleFileChange}/>
      <Button onClick={submitModel} isLoading={loading} isDisabled={weights===null}>Continue</Button>
    </VStack>
  </VStack>;
}

const InputImage: React.FC<HandleInputsProps> = ({nextPage}) => {

  const [loading, setLoading] = useState(false);
  const [canvas, setCanvas] = useState<any>(null);
  // const [image, setImage] = useState<Float32Array | null>(null);
  const { nillion, nillionClient, setImageStore, programId, partyBit, host, setSignalingChannel, setResult } = React.useContext(UserContext);

  const submitImage = async () => {
    setLoading(true);
    let namedImage = [];

    let ctx = canvas.getContext('2d');
    // @ts-ignore
    const ctxScaled = document.getElementById('scaled-canvas').getContext('2d')
    ctxScaled.save();
    ctxScaled.clearRect(0, 0, ctxScaled.canvas.height, ctxScaled.canvas.width);
    ctxScaled.scale(28.0 / ctx.canvas.width, 28.0 / ctx.canvas.height)
    ctxScaled.drawImage(document.getElementById('canvas'), 0, 0)
    ctxScaled.restore();
    const {data} = ctxScaled.getImageData(0, 0, 28, 28)

    for (let i = 0; i < 28*28; i++) {
      namedImage.push({name: "x_" + i , value: (data[i * 4] + 1).toString()});
    }

    console.log(namedImage);
    
    const store_id = await storeSecretsInteger(
      nillion,
      nillionClient,
      namedImage,
      programId,
      "Party" + partyBit,
      [], [], [],
      [host]
    );

    console.log("Secret stored at store_id:", store_id);

    const SignalingChannel = require("../signalling/signaling");
    const peerId = "mnist-" + programId + "-other";
    const signalingServerUrl = "http://kanav.eastus.cloudapp.azure.com:3030/";
    const token = "SIGNALING123";
    const channel = new SignalingChannel(peerId, signalingServerUrl, token);
    channel.onMessage = (message: any) => {
      console.log("Got message: ");
      console.log(message);
      if (message.from === "mnist-" + programId) {
        if (message.message) {
          if (message.message.result) {
            setResult(message.message.result)
          }
          if (message.message.fin)
            nextPage();
        }
      }
    };
    channel.connect();
    channel.sendTo("mnist-" + programId, {store_id, party_id: nillionClient.party_id});
    setSignalingChannel(channel);
    setImageStore(store_id);
    setLoading(false);
    nextPage();
  }

  React.useEffect(() => {
    // @ts-ignore
    var canvas = new fabric.Canvas(document.getElementById('canvas'));
    setCanvas(canvas);
    canvas.isDrawingMode = true;
    canvas.freeDrawingBrush.width = 12;
    canvas.freeDrawingBrush.color = "#000000";
    canvas.backgroundColor = "#ffffff";
    canvas.renderAll();
  }, []);

  return <VStack paddingY={0} justify="space-around" alignItems="left">
  <VStack minH="100vh" minW="100vw" justify="space-evenly">
    <Heading fontSize={"5xl"}>Step 3: Draw a Number</Heading>
    <HStack justify="flex-start" spacing={50}>
      <InputGroup size='md'>
        <InputLeftAddon>Event Code</InputLeftAddon>
        <Input value={(programId || "")} pr='4.5rem' readOnly></Input>
        <InputRightElement width='4.5rem'>
          <Button size='sm' h='1.75rem' onClick={() => navigator.clipboard.writeText(programId || "")}>Copy</Button>
        </InputRightElement>
      </InputGroup>
    </HStack>
    <canvas id="canvas" width="100" height="100"></canvas>
    <canvas id="scaled-canvas" style={{display: "none"}} width="28" height="28"></canvas>
    <Button onClick={submitImage} isLoading={loading}>Continue</Button>
  </VStack>
</VStack>;
}

export const HandleInputs: React.FC<HandleInputsProps> = ({nextPage}) => {

  const { partyBit } = React.useContext(UserContext);

  if (partyBit === 0) {
    return <InputModel nextPage={nextPage} />;
  }
  else {
    return <InputImage nextPage={nextPage} />;
  }
}