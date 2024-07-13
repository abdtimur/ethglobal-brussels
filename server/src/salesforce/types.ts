export enum OpportunityFuncStatus {
  PENDING = 0,
  LOST = 1,
  WON = 2,
}

export interface Opportunity {
  Id: string;
  IsDeleted: boolean;
  AccountId: string;
  IsPrivate: boolean;
  Name: string;
  Description: string | null;
  StageName: string;
  Amount: number | null;
  Probability: number | null;
  ExpectedRevenue: number | null;
  TotalOpportunityQuantity: number | null;
  CloseDate: string | null;
  Type: string | null;
  NextStep: string | null;
  LeadSource: string | null;
  IsClosed: boolean;
  IsWon: boolean;
  ForecastCategory: string | null;
  ForecastCategoryName: string | null;
  CampaignId: string | null;
  HasOpportunityLineItem: boolean | null;
  Pricebook2Id: string | null;
  OwnerId: string | null;
  CreatedDate: string | null;
  CreatedById: string | null;
  LastModifiedDate: string | null;
  LastModifiedById: string | null;
  SystemModstamp: string | null;
  LastActivityDate: string | null;
  FiscalQuarter: number | null;
  FiscalYear: number | null;
  Fiscal: string | null;
  LastViewedDate: string | null;
  LastReferencedDate: string | null;
  HasOpenActivity: boolean | null;
  HasOverdueTask: boolean | null;
  DeliveryInstallationStatus__c: string | null;
  TrackingNumber__c: string | null;
  OrderNumber__c: string | null;
  CurrentGenerators__c: string | null;
  MainCompetitors__c: string | null;
}

export interface OpportunityChangeEvent {
  replayId: number;
  payload: {
    ChangeEventHeader: {
      entityName: string;
      recordIds: string[];
      changeType: string;
      changeOrigin: string;
      transactionKey: string;
      sequenceNumber: number;
      commitTimestamp: number;
      commitNumber: string;
      commitUser: string;
      nulledFields: string[];
      diffFields: string[];
      changedFields: string[];
    };
    StageName: string;
    IsClosed: boolean;
    IsWon: boolean;

    [key: string]: any;
  };
}

// {
//   "replayId": 4044,
//   "payload": {
//     "ChangeEventHeader": {
//       "entityName": "Opportunity",
//       "recordIds": [
//         "006bm000002WNhtAAG"
//       ],
//       "changeType": "UPDATE",
//       "changeOrigin": "com/salesforce/api/soap/61.0;client=SfdcInternalAPI/",
//       "transactionKey": "00010f89-ac42-d2ff-5d99-21b34d9c8303",
//       "sequenceNumber": 1,
//       "commitTimestamp": 1720911231000,
//       "commitNumber": "1720911231762341890",
//       "commitUser": "005bm0000037f9ZAAQ",
//       "nulledFields": [],
//       "diffFields": [],
//       "changedFields": [
//         "StageName",
//         "Probability",
//         "ExpectedRevenue",
//         "IsClosed",
//         "ForecastCategory",
//         "ForecastCategoryName",
//         "LastModifiedDate",
//         "LastStageChangeDate"
//       ]
//     },
//     "AccountId": null,
//     "IsPrivate": null,
//     "Name": null,
//     "Description": null,
//     "StageName": "Closed Lost",
//     "Amount": null,
//     "Probability": 0,
//     "ExpectedRevenue": 0,
//     "TotalOpportunityQuantity": null,
//     "CloseDate": null,
//     "Type": null,
//     "NextStep": null,
//     "LeadSource": null,
//     "IsClosed": true,
//     "IsWon": null,
//     "ForecastCategory": "Omitted",
//     "ForecastCategoryName": "Omitted",
//     "CampaignId": null,
//     "HasOpportunityLineItem": null,
//     "Pricebook2Id": null,
//     "OwnerId": null,
//     "CreatedDate": null,
//     "CreatedById": null,
//     "LastModifiedDate": 1720911231000,
//     "LastModifiedById": null,
//     "LastStageChangeDate": 1720911231000,
//     "ContactId": null,
//     "ContractId": null,
//     "LastAmountChangedHistoryId": null,
//     "LastCloseDateChangedHistoryId": null,
//     "DeliveryInstallationStatus__c": null,
//     "TrackingNumber__c": null,
//     "OrderNumber__c": null,
//     "CurrentGenerators__c": null,
//     "MainCompetitors__c": null
//   }
// }
