<script>
  import { DIDSession } from "did-session";
  import { CeramicClient } from "@ceramicnetwork/http-client";
  import { ModelInstanceDocument } from "@ceramicnetwork/stream-model-instance";
  import { StreamID } from "@ceramicnetwork/streamid";

  const ceramic = new CeramicClient("https://YOUR_TESTNET_CERAMIC_NODE_URL");

  let logs = [];

  const log = (message) =>
    (logs = [
      ...logs,
      `[${Date.now()}] ${typeof message !== "string" ? JSON.stringify(message) : message}`,
    ]);

  const requestSession = async () => {
    // Request reference, can be an hmac or something
    // It can be used to verify the response further down
    // (in case an external site is being used for the callback)
    const request_id = crypto.randomUUID();

    // Max timeout before the callback rejects
    // Set to 0 to disable
    const timeout = 15; // seconds

    // Call the IPC method we exposed in `/electron/preload.js` (`signature:request`)
    let response;
    try {
      const callbackResponse = await electron.requestSignature(
        request_id,
        timeout
      );

      response = callbackResponse.response;
    } catch (err) {
      log("[ERROR] " + err);
      return;
    }

    // Parse the JSON from the response (encoded in `/browser-frontend/src/App.svelte`)
    const { session, did } = JSON.parse(decodeURIComponent(response));

    // you could verify the response (signature, address, hmac here)
    // const isValid = await validateResponse(session)

    // Create a did session from the serialized version passed by the callback
    const didSession = await DIDSession.fromSession(session);

    log(`Your DID session's did:key is: ${didSession.did.id}`);

    // Authorize the Ceramic client (attach the DID to it)
    await ceramic.setDID(didSession.did);

    // This is the did:pkh that signed/authorized the above did session
    // You could recover this from didSession.cacao's signature
    // or use it to verify the address did sign it
    const didPkh = did;

    log(`did:pkh that authorized the above did:key is: ${didPkh}`);

    // You can store the serialized session locally to prevent authentication every time
    // the user launches the app (it's valid for up to 3 months by default)
    // localStorage.setItem("ceramic:session", didSession.serialize())
  };

  const createStream = async () => {
    // This is the simplest model I could find on testnet
    // https://cerscan.com/testnet-clay/stream/kjzl6hvfrbw6c6ngtt7harvn6qb4g1t5rt7wa1yt4giolyi6pxbyti1gjf9tv8k
    try {
      const document = await ModelInstanceDocument.create(
        ceramic,
        {
          source: `Hello from the Ceramic Electron test at ${new Date().toUTCString()}`,
        },
        {
          model: StreamID.fromString(
            "kjzl6hvfrbw6c6ngtt7harvn6qb4g1t5rt7wa1yt4giolyi6pxbyti1gjf9tv8k"
          ),
        }
      );

      log(
        `Successfully created a stream. Check it out on Cerscan ${`https://cerscan.com/testnet-clay/stream/${document.id.toString()}`}`
      );
    } catch (err) {
      console.error(err);
      log(`[ERROR] Error creating a stream ${err}`);
    }
  };
</script>

<main>
  <h1>This is the Electron part</h1>
  <button on:click={() => requestSession()}>Authenticate DID</button>
  <button on:click={() => createStream()}>Create a stream</button>
  {#each logs as log}
    <div style="margin-top: .5rem">
      <code style="background: #EFEFEF;">{log}</code>
    </div>
  {/each}
</main>
