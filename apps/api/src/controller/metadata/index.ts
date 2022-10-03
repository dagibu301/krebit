import express from 'express';
import { ethers } from 'ethers';
import krebit from '@krebitdao/reputation-passport';

import { connect, getNFTCredentialTypes } from '../../utils';

const { SERVER_NFT_METADATA_IPFS, SERVER_CERAMIC_URL } = process.env;

export const MetadataController = async (
  request: express.Request,
  response: express.Response,
  next: express.NextFunction
) => {
  console.log(request.params);
  try {
    if (!request?.params) {
      throw new Error('params not defined');
    }

    if (!request?.params?.tokenId) {
      throw new Error(`No tokenId in params`);
    }

    const types = getNFTCredentialTypes();
    const tokenId = request.params.tokenId;
    if (tokenId === 'all') {
      return response.json(types);
    }

    const tokenType = types[tokenId];
    if (!tokenType) return response.status(404).send('Not found.');
    console.log('Credential type:', tokenType);

    /* TODO get credential types from getIssuers
    const { wallet, ethProvider } = await connect();
     
    // Log in with wallet to Ceramic DID
    const Issuer = new krebit.core.Krebit({
      wallet,
      ethProvider,
      address: wallet.address,
      ceramicUrl: SERVER_CERAMIC_URL
    });
    const did = await Issuer.connect();
    console.log('DID:', did);
    const issuers = await Issuer.getIssuers({type: "VerifiableCredentials"});
    console.log('List of issuers:', issuers);
*/
    let tokenNumber = tokenId;
    if (isNaN(Number(tokenId))) {
      tokenNumber = ethers.BigNumber.from('0x' + tokenId).toString();
    }

    const result = {
      name: tokenType,
      description: `Verified ${tokenType} Credential (Non-Transferable NFT for Krebit's Verifiable Credential)`,
      image: `${SERVER_NFT_METADATA_IPFS}/${tokenNumber}.jpg`,
      external_url: 'https://krebit.id',
      attributes: [
        { trait_type: 'Creator', value: 'krebit.eth' },
        { trait_type: 'Website', value: 'https://krebit.id' },
        { trait_type: 'Twitter', value: 'https://twitter.com/KrebitID' }
      ]
    };

    return response.json(result);
  } catch (err) {
    next(err);
  }
};
