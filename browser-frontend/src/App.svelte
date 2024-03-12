<script>
  import { DIDSession, createDIDCacao, createDIDKey } from "did-session";
  import { createCeramicSiweMessage } from "./ceramicSiwe.js";
  import { OrbisEVMProvider } from "./ethProvider.js";
  import { randomBytes } from "crypto";
  import { Cacao } from "@didtools/cacao";

  // Wrap the metamask(-like) provider
  const provider = new OrbisEVMProvider(window.ethereum);

  const url = new URL(window.location);
  // Get the protocol the app is using
  const appProtocol = url.searchParams.get("protocol");
  // Get the request ID to pass it to the deeplink
  // This is used so the callback can be initiated inside the app
  const requestId = url.searchParams.get("request_id");
  // Get the timeout in order to close the tab if the timeout is reached
  // The timeout is passed in seconds (not sure why I did that, but here we are)
  const timeout = Number(url.searchParams.get("executionTimeout"));
  if (timeout) {
    setTimeout(() => window.close(), timeout * 1000);
  }

  // Alternatively, you could replace this with an
  // OrbisDB or ComposeDB authentication/session
  const getDIDSession = async () => {
    // Connect/Enable the provider
    await provider.connect();

    const address = await provider.getAddress();
    const didPkh = await provider.did();

    // Create a did:key using a random seed
    const keySeed = randomBytes(32);
    const didKey = await createDIDKey(keySeed);

    // Build the SIWE
    const siwe = createCeramicSiweMessage({
      address,
      siwxOpts: {
        // above generated did:key (string)
        uri: didKey.id,

        // session expiration time
        // by default the below will be set to 3 months
        // ceramicSiwe.js L34
        // expirationTime: new Date("expiration_date_here").toISOString(),

        // provide custom resources
        // by default this will fall back to ceramic://* (all Ceramic resources)
        // instead you can narrow down the scope by providing
        // an array of Stream and/or Model IDs to which DIDSession will have
        // write access to
        // ceramicSiwe.js L38
        // resources: [],
      },
    });

    // Sign the message to authorized the above did:key
    // By default expires after 3 months
    const messageToSign = siwe.signMessage();
    siwe.signature = await provider.signMessage(messageToSign);

    // Create a Cacao from a signed CACAO
    const cacao = Cacao.fromSiweMessage(siwe);
    // Create an authorized with the above did:key and the signed CACAO
    const did = await createDIDCacao(didKey, cacao);
    // Create a did session
    const didSession = new DIDSession({ keySeed, cacao, did });

    // Encode the serialized did session and the did:pkh that signed it
    const response = encodeURIComponent(
      JSON.stringify({
        session: didSession.serialize(),
        did: didPkh,
      })
    );

    // Open the deeplink that'll trigger the callback in the app
    window.open(
      `${appProtocol}://session/?request_id=${requestId}&response=${response}`,
      "_blank"
    );

    // Close the current window (tab)
    window.close();
  };
</script>

<main>
  <h1>This is the browser part</h1>
  <button on:click={() => getDIDSession()}>Authorize a DID Session</button>
</main>
