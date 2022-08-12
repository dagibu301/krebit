import { ethers } from 'ethers';

import { ethereum } from '../src/lib';

describe('Krebit Class', () => {
  let wallet: ethers.Wallet;
  let ethProvider: ethers.providers.Provider;

  beforeAll(async () => {
    ethProvider = ethereum.getProvider();

    const pKey = ethers.Wallet.createRandom();
    wallet = new ethers.Wallet(pKey, ethProvider);
  });

  test('The user should be able to connect with her Wallet, EthProvider, and Address', async () => {
    console.log(wallet, ethProvider);
  });
});
