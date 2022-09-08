import express from 'express';
import { CeramicClient } from '@ceramicnetwork/http-client';
import LitJsSdk from 'lit-js-sdk/build/index.node.js';
import krebit from '@krebitdao/reputation-passport';

import { connect, getVeriffDecision } from '../../utils';

const {
  SERVER_EXPIRES_YEARS,
  SERVER_TRUST,
  SERVER_STAKE,
  SERVER_PRICE,
  SERVER_CERAMIC_URL
} = process.env;

const ceramicClient = new CeramicClient(SERVER_CERAMIC_URL);

export const VeriffController = async (
  request: express.Request,
  response: express.Response,
  next: express.NextFunction
) => {
  try {
    if (!request?.body) {
      throw new Error('Body not defined');
    }

    if (!request?.body?.claimedCredential) {
      throw new Error(`No claimedCredential in body`);
    }

    const { claimedCredential } = request.body;
    if (claimedCredential?.credentialSubject?.type !== 'legalName') {
      throw new Error(`claimedCredential type is not legalName`);
    }

    const { wallet, ethProvider } = await connect();

    // Log in with wallet to Ceramic DID
    const Issuer = new krebit.core.Krebit({
      wallet,
      ethProvider,
      address: wallet.address,
      ceramicUrl: SERVER_CERAMIC_URL,
      litSdk: LitJsSdk
    });
    const did = await Issuer.connect();
    console.log('DID:', did);

    console.log('Verifying veriff with claimedCredential: ', claimedCredential);

    // TODO: check self-signature
    // TODO: Check if the claim already has verifications by me
    // TODO: Check if the proofValue of the sent VC is OK
    console.log(
      'checkCredential: ',
      await Issuer.checkCredential(claimedCredential)
    );

    // get the claimValue
    let claimValue = null;
    //Decrypt
    if (claimedCredential.credentialSubject.encrypted === 'lit') {
      claimValue = JSON.parse(await Issuer.decryptClaim(claimedCredential));
      console.log('Decrypted claim value: ', claimValue);
    } else {
      claimValue = JSON.parse(claimedCredential.credentialSubject.value);
      console.log('Claim value: ', claimValue);
    }

    // If claim is digitalProperty "veriff"
    if (claimedCredential?.credentialSubject?.type === 'legalName') {
      // Connect to veriff and get decision status for the session ID (claimedCredential.id)
      const veriffDecision = await getVeriffDecision(claimedCredential.id);
      console.log('veriffDecision: ', veriffDecision);

      // If valid veriffID
      if (
        veriffDecision.status === 'approved' &&
        claimValue.person.firstName === veriffDecision.person.firstName &&
        claimValue.person.lastName === veriffDecision.person.lastName
      ) {
        console.log('Valid veriff ID:', veriffDecision);

        const expirationDate = new Date();
        const expiresYears = parseInt(SERVER_EXPIRES_YEARS, 10);
        expirationDate.setFullYear(expirationDate.getFullYear() + expiresYears);
        console.log('expirationDate: ', expirationDate);

        const claim = {
          id: claimedCredential.id,
          ethereumAddress: claimedCredential.credentialSubject.ethereumAddress,
          type: claimedCredential.credentialSubject.type,
          typeSchema: claimedCredential.credentialSubject.typeSchema,
          tags: claimedCredential.type.slice(2),
          value: claimValue,
          trust: parseInt(SERVER_TRUST, 10), // How much we trust the evidence to sign this?
          stake: parseInt(SERVER_STAKE, 10), // In KRB
          price: parseInt(SERVER_PRICE, 10) * 10 ** 18, // charged to the user for claiming KRBs
          expirationDate: new Date(expirationDate).toISOString(),
          encrypt: 'hash' as 'hash'
        };
        console.log('claim: ', claim);

        // Issue Verifiable credential

        const issuedCredential = await Issuer.issue(claim);
        console.log('issuedCredential: ', issuedCredential);

        if (issuedCredential) {
          return response.json(issuedCredential);
        }
      } else {
        throw new Error(`Wrong veriff ID: ${veriffDecision}`);
      }
    }
  } catch (err) {
    next(err);
  }
};
