// Minimal normalized EVM provider
export class OrbisEVMProvider {
  #provider;

  constructor(provider) {
    this.#provider = provider;
  }

  async connect() {
    if (typeof this.#provider.enable === "function") {
      await this.#provider.enable();
      return;
    }

    if (typeof this.#provider.request === "function") {
      await this.#provider.request({
        method: "eth_requestAccounts",
        params: [],
      });
    }
  }

  async did() {
    return `did:pkh:eip155:1:${(await this.getAddress()).toLowerCase()}`;
  }

  async getAddress() {
    await this.connect();

    if (typeof this.#provider.getAddress === "function") {
      const address = await this.#provider.getAddress();
      if (typeof address === "string") {
        return address;
      }

      if (!address || !address.length) {
        throw "No eth accounts found";
      }
      return address[0];
    }

    const accounts = await this.#provider.request({
      method: "eth_accounts",
    });

    if (!accounts.length) {
      throw "No eth accounts found";
    }
    return accounts[0];
  }

  async signMessage(message) {
    await this.connect();

    if (typeof this.#provider.signMessage === "function") {
      const signature = await this.#provider.signMessage(message);
      if (typeof signature === "string") {
        return signature;
      }
      return signature.signature;
    }

    const signature = await this.#provider.request({
      method: "personal_sign",
      params: [message, await this.getAddress()],
    });
    return signature;
  }
}
