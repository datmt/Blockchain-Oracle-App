import {Beneficiary} from "./beneficiary";

export interface WillDetails {
  creatorEtherAddress: string;
  creatorSocialId?: string;
  etherAmount?: number;
  beneficiaryList?: Beneficiary[]
}
