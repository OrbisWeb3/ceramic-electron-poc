import { randomString } from "@stablelib/random";
import { SiweMessage } from "@didtools/cacao";

const THREE_MONTHS = 90 * 24 * 60 * 60 * 1000;

export function createCeramicSiweMessage({ address, siwxOpts = {} }) {
  const statement = `Give this application access to some of your data on Ceramic.`;

  const domain =
    siwxOpts.domain ||
    (typeof window !== "undefined" && window?.location?.host) ||
    "localhost";

  if (!domain) {
    throw 'No "domain" has been set';
  }
  const uri =
    siwxOpts.uri ||
    (typeof window !== "undefined" && window?.location?.href) ||
    "http://localhost";

  if (!uri) {
    throw 'No "uri" has been set';
  }

  const newSiwxOpts = {
    domain,
    address,
    statement,
    uri,
    version: "1",
    nonce: siwxOpts.nonce || randomString(10),
    issuedAt: siwxOpts.issuedAt || new Date().toISOString(),
    expirationTime:
      siwxOpts.expirationTime ||
      new Date(Date.now() + THREE_MONTHS).toISOString(),
    chainId: siwxOpts.chainId || "1",
    resources: siwxOpts.resources || ["ceramic://*"],
    ...siwxOpts,
  };

  return new SiweMessage(newSiwxOpts);
}
