import { Controller, Get, Post, Query } from '@nestjs/common';
import { SalesforceService } from './salesforce.service';
import { OpportunityChangeEvent, OpportunityFuncStatus } from './types';

@Controller('salesforce')
export class SalesforceController {
  constructor(private readonly salesforce: SalesforceService) {}

  @Get('callback')
  async salesforceAuthCallback(@Query('code') code: string) {
    console.log('Salesforce auth callback:', code);
    this.salesforce.authorize(code);
  }

  @Post('mock')
  async triggerMockOppUpdate() {
    const mockMessage: OpportunityChangeEvent = {
      replayId: 4044,
      payload: {
        ChangeEventHeader: {
          entityName: 'Opportunity',
          recordIds: ['006bm000002WNhtAAG'],
          changeType: 'UPDATE',
          changeOrigin: 'com/salesforce/api/soap/61.0;client=SfdcInternalAPI/',
          transactionKey: '00010f89-ac42-d2ff-5d99-21b34d9c8303',
          sequenceNumber: 1,
          commitTimestamp: 1720911231000,
          commitNumber: '1720911231762341890',
          commitUser: '005bm0000037f9ZAAQ',
          nulledFields: [],
          diffFields: [],
          changedFields: [
            'StageName',
            'Probability',
            'ExpectedRevenue',
            'IsClosed',
            'ForecastCategory',
            'ForecastCategoryName',
            'LastModifiedDate',
            'LastStageChangeDate',
          ],
        },
        AccountId: null,
        IsPrivate: null,
        Name: null,
        Description: null,
        StageName: 'Closed Lost',
        Amount: null,
        Probability: 0,
        ExpectedRevenue: 0,
        TotalOpportunityQuantity: null,
        CloseDate: null,
        Type: null,
        NextStep: null,
        LeadSource: null,
        IsClosed: true,
        IsWon: null,
        ForecastCategory: 'Omitted',
        ForecastCategoryName: 'Omitted',
        CampaignId: null,
        HasOpportunityLineItem: null,
        Pricebook2Id: null,
        OwnerId: null,
        CreatedDate: null,
        CreatedById: null,
        LastModifiedDate: 1720911231000,
        LastModifiedById: null,
        LastStageChangeDate: 1720911231000,
        ContactId: null,
        ContractId: null,
        LastAmountChangedHistoryId: null,
        LastCloseDateChangedHistoryId: null,
        DeliveryInstallationStatus__c: null,
        TrackingNumber__c: null,
        OrderNumber__c: null,
        CurrentGenerators__c: null,
        MainCompetitors__c: null,
      },
    };
    this.salesforce.handleOppChange(mockMessage);
  }

  @Get('opp-status')
  async getOpportunityStatus(
    @Query('oppId') id: string,
  ): Promise<{ id: string; status: OpportunityFuncStatus }> {
    return this.salesforce.getOppStatusUpdate(id);
  }

  @Post('opp-description')
  async updateOpportunityDescription(
    @Query('oppId') id: string,
    @Query('description') description: string,
  ) {
    return this.salesforce.publishDescription(id, description);
  }
}
