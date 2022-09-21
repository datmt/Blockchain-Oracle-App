import { AfterContentInit, Component } from '@angular/core';
import { WillService } from './services/will.service';
import { WillDetails } from './interfaces/will-details';
import { Beneficiary } from './interfaces/beneficiary';
import { MatTableDataSource } from '@angular/material/table';
import { Router } from '@angular/router';
import Web3 from 'web3';
import { MatSnackBar } from '@angular/material/snack-bar';
@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css'],
})
export class AppComponent implements AfterContentInit {
  title = 'will-maker';
  contractAddress: string = '0x08A5D4B7566A89F87E98e574a2712368879bB33D';
  contractAbi: any = [
    {
      inputs: [
        {
          internalType: 'bytes32',
          name: 'myid',
          type: 'bytes32',
        },
        {
          internalType: 'string',
          name: 'result',
          type: 'string',
        },
      ],
      name: '__callback',
      outputs: [],
      stateMutability: 'nonpayable',
      type: 'function',
    },
    {
      inputs: [],
      name: 'checkAliveStatus',
      outputs: [],
      stateMutability: 'nonpayable',
      type: 'function',
    },
    {
      inputs: [
        {
          internalType: 'address payable',
          name: 'newBen',
          type: 'address',
        },
        {
          internalType: 'string',
          name: 'willer',
          type: 'string',
        },
      ],
      name: 'setContractData',
      outputs: [],
      stateMutability: 'nonpayable',
      type: 'function',
    },
    {
      stateMutability: 'payable',
      type: 'receive',
    },
    {
      inputs: [],
      name: 'transactionStatus',
      outputs: [
        {
          internalType: 'string',
          name: '',
          type: 'string',
        },
      ],
      stateMutability: 'view',
      type: 'function',
    },
    {
      inputs: [],
      name: 'willerId',
      outputs: [
        {
          internalType: 'string',
          name: '',
          type: 'string',
        },
      ],
      stateMutability: 'view',
      type: 'function',
    },
  ];
  will: WillDetails = {
    creatorEtherAddress: '0xe3F717e458F00B89dADA331DcCFf4524dF02FbE6',
    creatorSocialId: '123456',
    etherAmount: 0,
    beneficiaryList: [],
  };
  accountConnected: boolean = false;
  benLocked: boolean = false;
  benName: string = '';
  benAddress: string = '';
  benPercentage: number = 0.0;
  displayedColumns: string[] = ['name', 'etherAddress', 'percentage', 'action'];
  dataSource: MatTableDataSource<Beneficiary> =
    new MatTableDataSource<Beneficiary>();

  depositAmount: number = 0;
  web3: any;
  isLoading: boolean = false;

  requesterAddress: string = '0x7e4DbbB223675DcD713471F76DE35C0700a39EA5';

  private WillContract: any;

  constructor(private _snackBar: MatSnackBar) {}
  ngAfterContentInit(): void {
    //@ts-ignore
    this.web3 = new Web3(window.ethereum);
  }

  setBen() {
    this.benLocked = true;
  }

  editBen(benAddress: string) {
    if (!this.will.beneficiaryList) {
      return;
    }
    const benIndex = this.findIndexByEtherAddress(benAddress);
    if (benIndex === -1) {
      console.warn('Invalid ben');
      return;
    }

    const ben = this.will.beneficiaryList[benIndex];

    this.benPercentage = ben.percentage;
    this.benAddress = ben.etherAddress;
    this.benName = ben.name;
  }

  private async connectAccount(): Promise<boolean> {
    console.log('connecting account');
    //@ts-ignore
    return await window.ethereum
      .request({ method: 'eth_requestAccounts' })
      .then((data: any) => {
        console.log('got data', data);
        return true;
      })
      .catch((err: any) => {
        console.log('connect erro', err);
        return false;
      });
  }

  deleteBen(benAddress: string) {
    if (!this.will.beneficiaryList) return;
    console.log(
      'deleting ben:',
      benAddress,
      this.findIndexByEtherAddress(benAddress)
    );
    const index = this.findIndexByEtherAddress(benAddress);
    this.will.beneficiaryList?.splice(index, 1);
    this.dataSource.data = this.will.beneficiaryList;
  }

  private findIndexByEtherAddress(benAddress: string) {
    if (!this.will.beneficiaryList) {
      return -1;
    }
    for (let i = 0; i < this.will.beneficiaryList?.length; i++) {
      if (this.will.beneficiaryList[i].etherAddress === benAddress) return i;
    }

    return -1;
  }
  /*
  saveWill() {
    if (!this.will.creatorEtherAddress || !this.will.creatorSocialId) {
      alert('Your ether address or social id is not valid');
      return;
    }
    this.willService.saveWill(this.will).subscribe((data) => {
      console.log(data);
    });
  }
  */

  private loadContract() {
    this.WillContract = new this.web3.eth.Contract(
      this.contractAbi,
      this.contractAddress
    );
  }
  async sendToContract() {
    this.isLoading = true;
    if (!this.accountConnected) await this.connectAccount();

    this.loadContract();

    this.WillContract.methods
      .setContractData(this.benAddress, this.will.creatorSocialId)
      .send({
        from: this.will.creatorEtherAddress,
      })
      .then((data: any) => {
        console.log('contract send ok', data);
        this.showSnack('Data set to contract sucessfully');
        this.isLoading = false;
      })
      .catch((err: any) => {
        console.warn('erro', err);
        this.showSnack('Failed to set data to contract');
        this.isLoading = false;
      });
  }

  async depositAssets() {
    if (!this.web3) {
      console.warn('web3 not initialized!');
      return;
    }

    if (!this.will.creatorEtherAddress || !this.will.creatorSocialId) {
      alert("please set willer's details");
      return;
    }
    const txData = {
      from: this.will.creatorEtherAddress,
      to: this.contractAddress,
      value: this.web3.utils.numberToHex(
        this.web3.utils.toWei(this.depositAmount, 'ether')
      ),
    };
    this.isLoading = true;
    if (this.accountConnected) {
      this.web3.eth
        .sendTransaction(txData)
        .then((data: any) => {
          console.log('data', data);
          this.isLoading = false;
          this.showSnack('Deposit OK!');
        })
        .catch((err: any) => {
          console.log('got error', err);
          this.isLoading = false;
        });
    } else {
      const connectResult = await this.connectAccount();
      if (connectResult) {
        this.web3.eth
          .sendTransaction(txData)
          .then((data: any) => {
            console.log('data', data);
            this.isLoading = false;
            this.showSnack('Deposit OK!');
          })
          .catch((err: any) => {
            console.log('got error', err);
            this.isLoading = false;
          });
      }
    }
  }

  private showSnack(message: string) {
    this._snackBar.open(message, 'OK', {
      duration: 3000,
    });
  }

  async initiateDistribution() {
    const connect = await this.connectAccount();

    if (!connect) {
      alert('fail to connect');
      return;
    }

    if (!this.requesterAddress) {
      alert('enter a valid address');
      return;
    }
    this.loadContract();

    this.WillContract.methods
      .checkAliveStatus()
      .send({
        from: this.requesterAddress,
      })
      .then((data: any) => {
        console.log('contract send ok', data);
        this.showSnack('Your request has been sent');
        this.isLoading = false;
      })
      .catch((err: any) => {
        console.warn('erro', err);
        this.showSnack('Failed to send your request');
        this.isLoading = false;
      });
  }
}
