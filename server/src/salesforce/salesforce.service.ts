import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as jsforce from 'jsforce';
import { Env } from '../config/interfaces';
import {
  Opportunity,
  OpportunityChangeEvent,
  OpportunityFuncStatus,
} from './types';
import PubSubApiClient from 'salesforce-pubsub-api-client';
import {
  getAdjustedGasPrice,
  getFactory,
  getOpportunityContract,
  getSignerWallet,
} from '../web3/web3Provider';
import { FACTORY_ADDR } from '../web3/consts';
import { ethers } from 'ethers';
import { createAccount, isAccountCreated } from '../web3/zkEmail';

@Injectable()
export class SalesforceService {
  private conn: jsforce.Connection;
  private readonly oauth2: jsforce.OAuth2;

  constructor(private readonly configService: ConfigService) {
    this.oauth2 = new jsforce.OAuth2({
      loginUrl: this.configService.get(Env.SALESFORCE_LOGIN_URL),
      clientId: this.configService.get(Env.SALESFORCE_CLIENT_ID),
      clientSecret: this.configService.get(Env.SALESFORCE_CLIENT_SECRET),
      redirectUri: this.configService.get(Env.SALESFORCE_REDIRECT_URI),
    });
    this.conn = new jsforce.Connection({
      instanceUrl: this.configService.get(Env.SALESFORCE_LOGIN_URL),
      oauth2: this.oauth2,
    });
  }

  async onModuleInit() {
    await this.authenticate();
  }

  async authorize(code: string) {
    await this.conn.authorize(code);
    // console.log('Authorized:', this.conn.accessToken);
    console.log('Instance URL:', this.conn.instanceUrl);
    await this.subscribeToOpportunityChanges();
  }

  async getOppStatusUpdate(
    opportunityId: string,
  ): Promise<{ id: string; status: OpportunityFuncStatus }> {
    try {
      console.log('Fetching opportunity:', opportunityId);
      const opportunity = await this.getOpportunity(opportunityId);
      let status = OpportunityFuncStatus.PENDING;
      if (opportunity.StageName === 'Closed Lost') {
        status = OpportunityFuncStatus.LOST;
      }
      if (opportunity.StageName === 'Closed Won') {
        status = OpportunityFuncStatus.WON;
      }
      console.log(`Fetched opportunity ${opportunityId} with status ${status}`);
      return { id: opportunityId, status };
    } catch (error) {
      console.error(
        `Received error while fetching opportunity ${opportunityId}: ${error}`,
      );
      console.warn(`Fallback to test data`);
      return { id: opportunityId, status: OpportunityFuncStatus.WON };
    }
  }

  async publishDescription(opportunityId: string, description: string) {
    try {
      const opportunity = await this.getOpportunity(opportunityId);
      const newDescription = opportunity.Description
        ? `${opportunity.Description}\n${description}`
        : description;
      console.log('Publishing description:', description);
      await this.conn.sobject('Opportunity').update({
        Id: opportunityId,
        Description: newDescription,
      });
    } catch (error) {
      console.error(
        `Received error while updating opportunity ${opportunityId}: ${error}`,
      );
    }
  }

  private async getOpportunity(opportunityId: string) {
    const oppObj = await this.conn
      .sobject('Opportunity')
      .retrieve(opportunityId);
    // console.log('Opportunity:', oppObj);
    return oppObj as Opportunity;
  }

  private async getOwnerEmail(ownerId: string) {
    const ownerObj = await this.conn
      .sobject('User')
      .retrieve(ownerId, ['Email']);
    // console.log('Owner:', ownerObj);
    return ownerObj.Email;
  }

  async handleOppChange(data: OpportunityChangeEvent) {
    const id = data.payload.ChangeEventHeader.recordIds[0];
    console.log('Handling Opportunity change event for ID:', id);
    // Safely log event as a JSON string
    // console.log(
    //   JSON.stringify(
    //     data,
    //     (key, value) =>
    //       /* Convert BigInt values into strings and keep other types unchanged */
    //       typeof value === 'bigint' ? value.toString() : value,
    //     2,
    //   ),
    // );

    if (data.payload.StageName === null) {
      console.log('Ignoring event, no stage change');
      return;
    }

    const opportunity = await this.getOpportunity(id);
    const signerWallet = getSignerWallet();
    const factoryContract = getFactory(FACTORY_ADDR, signerWallet);

    try {
      if (
        opportunity.StageName === 'Closed Lost' ||
        opportunity.StageName === 'Closed Won'
      ) {
        console.log(
          `Opportunity ${id} is in ${opportunity.StageName} stage. Triggering on-chain event`,
        );

        const gasPrice = await getAdjustedGasPrice();
        const tx = await factoryContract.verifyStatus(
          signerWallet.address, // for golden path to simplify registration
          opportunity.Id,
          { gasPrice: gasPrice, gasLimit: 2000000 },
        );

        console.log('Transaction hash:', tx.hash);

        await tx.wait();

        console.log('Transaction confirmed. Check the blockchain for updates:');
        console.log(`https://base-sepolia.blockscout.com/tx/${tx.hash}`);

        // wait for a while for the status completion, than check if we can update Opp Description
        // TODO: replace with the events streaming
        await new Promise((resolve) => setTimeout(resolve, 10000));

        const oppAddress = await factoryContract.getManagerOppAddress(
          signerWallet.address,
          opportunity.Id,
        );
        if (oppAddress === ethers.ZeroAddress) {
          console.warn("Didn't find opportunity addr to update description:(");
          return;
        }
        const oppContract = getOpportunityContract(oppAddress, signerWallet);
        const reward = await oppContract.reward();
        const parsedReward = ethers.formatEther(BigInt(reward));
        const numberValue = parseFloat(parsedReward)
          .toFixed(5)
          .replace(/\.?0+$/, '');

        const text = `Reward for this opportunity is ${numberValue} ETH. Paid with Tx: https://base-sepolia.blockscout.com/tx/${tx.hash}`;
        await this.publishDescription(opportunity.Id, text);

        return;
      }

      if (opportunity.StageName === 'Negotiation/Review') {
        console.log(
          'Opportunity is in Negotiation/Review stage, pushing on-chain:',
        );
        const owner = await this.getOwnerEmail(opportunity.OwnerId);
        console.log('Owner email:', owner);
        const corporateWallet = await createAccount(owner);

        if (!corporateWallet) {
          console.error('Failed to create corporate wallet');
          return;
        }

        const personalWallet = await factoryContract.managerPersonalWallet(
          signerWallet.address,
        ); // TODO: switch to email check
        console.log('Personal wallet:', personalWallet);

        // Select which account to use for rewards
        const targetAddress =
          personalWallet === ethers.ZeroAddress
            ? corporateWallet
            : personalWallet;

        // trigger create Opp on chain for further updates
        const config = {
          id: opportunity.Id,
          subject: opportunity.Name,
          amount: ethers.parseEther(opportunity.Amount.toString()), // convert to wei (1 USD = 10^18 wei)
          rewardPercentage: 1, // always 1% for now
        };

        console.log('Opportunity config:', config);

        const gasPrice = await getAdjustedGasPrice();
        const tx = await factoryContract.createOpportunity(
          signerWallet, // for golden path to simplify registration
          config,
          { gasPrice: gasPrice, gasLimit: 2000000 },
        );

        console.log('Transaction hash:', tx.hash);
        await tx.wait();
        console.log('Transaction confirmed. Check the blockchain for updates:');
        console.log(`https://base-sepolia.blockscout.com/tx/${tx.hash}`);

        return;
      }
    } catch (error) {
      console.error('Failed to handle opportunity change event:', error);
    }

    console.log('Ignoring event, stage not important for now');
  }

  private async authenticate() {
    console.log(
      this.oauth2.getAuthorizationUrl({
        scope: 'api full',
      }),
    );
  }

  private async subscribeToOpportunityChanges() {
    try {
      const client = new PubSubApiClient();
      await client.connectWithAuth(
        this.conn.accessToken,
        this.conn.instanceUrl,
        this.configService.get(Env.SALESFORCE_ORG_ID),
      );

      // Subscribe to account change events
      const eventEmitter = await client.subscribe(
        '/data/OpportunityChangeEvent',
      );

      // Handle incoming events
      eventEmitter.on('data', (event) => {
        console.log(
          `Handling ${event.payload.ChangeEventHeader.entityName} change event ` +
            `with ID ${event.replayId} `,
        );
        if (event.payload.ChangeEventHeader.entityName !== 'Opportunity') {
          console.log('Ignoring event, not interested for now');
          return;
        }

        this.handleOppChange(event);
      });
    } catch (error) {
      console.error(error);
    }
  }
}
