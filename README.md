## WillMaker

This app demonstrate how to use oracle in Solidity.

## How to run the app

This application is an Angular application. You can run it locally using:

```shell
npm install

npm start
```

The app should be accessible at `http://localhost:4200`

## Parties

There are 4 parties involved in the process:

- Testator (The will maker)
- Smart contract
- Oracle (talks to a public API to check if someone is alive or not)
- Beneficiary (The one who gets the ETH)

## Contract code

The main functions of the contract are `updateContractData` and `checkAliveStatus`.

The testator can set the data (his social ID and the beneficiary address) any time.

The beneficiary later calls `checkAliveStatus` to check and initiate the fund distribution if the testator has passed away.

```solidity
// SPDX-License-Identifier: GPL-3.0

pragma solidity >=0.7.0 <0.9.0;
import "github.com/provable-things/ethereum-api/contracts/solc-v0.8.x/provableAPI.sol";

contract OracleContract is usingProvable {

   string public transactionStatus;
   string public willerId;
   address payable benAddress;

   function __callback(bytes32 myid, string memory result) public {
       transactionStatus = "[Ex]: Bad execution";

       if (msg.sender != provable_cbAddress()) revert();


       if (keccak256(abi.encodePacked(result)) == keccak256(abi.encodePacked("resting in peace"))) {
           transactionStatus = "[OK]: time to distribute";


            if (benAddress == address(0)) {
                transactionStatus = "Address is not set yet. ";
                return;
            }
            transactionStatus = "[OK]: Begin distribution...";
            (bool sent, bytes memory data) = benAddress.call{value: address(this).balance}("");

            if (sent == false) {
                transactionStatus = "[Ex]: Distribution failed!";
            }
            require(sent, "Failed to send Ether");

            transactionStatus = "[OK]: Distribution initiated!";
       } else if (keccak256(abi.encodePacked(result)) == keccak256(abi.encodePacked("alive and well"))) {
           transactionStatus = "continue mining...";
       } else {
           transactionStatus = "Exception thrown when calling API...";
       }

   }

   function setContractData(address payable newBen, string memory willer) public {
       benAddress = newBen;
       willerId = willer;
   }



   function checkAliveStatus() public {
       if (benAddress == address(0)) {
          transactionStatus = "Address is not set yet. ";
            return;
        }


        if (address(this).balance == 0) {
            transactionStatus = "Contract balance is 0. What's the point?";
            return;
        }

        if (keccak256(abi.encodePacked(willerId)) == keccak256(abi.encodePacked(""))) {
            transactionStatus = "Willer id is not set.";
            return;
        }
       if (provable_getPrice("URL") > address(this).balance) {
       } else {
           transactionStatus = "Start querying data";
           provable_query("URL", string.concat( "json(https://is-alive.free.beeceptor.com/", willerId, ").alive") );
       }
   }

    receive() payable external {}
}


```
