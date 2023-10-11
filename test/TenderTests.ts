import { ethers, network } from "hardhat";
import { setBalance } from "@nomicfoundation/hardhat-toolbox/network-helpers";
import { expect } from "chai";
import { int } from "hardhat/internal/core/params/argumentTypes";
import { randomBytes } from 'crypto';
import { keccak256 } from "@ethersproject/keccak256";
import { defaultAbiCoder, AbiCoder } from "@ethersproject/abi";

function generate32ByteValue(): string {
    const randomBytesBuffer = randomBytes(32);
    // Convert the buffer to a hexadecimal string
    const hexValue = randomBytesBuffer.toString('hex');
    return '0x' + hexValue;
}

function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => {
    setTimeout(resolve, ms);
  });
}

// Usage
async function myAsyncFunction() {
  console.log("Start");
  await sleep(2000); // Sleep for 2 seconds (2000 milliseconds)
  console.log("End");
}




describe("Tender Tests", function () {

    async function deployContract() {

        const w1 = "0x60FaAe176336dAb62e284Fe19B885B095d29fB7F";
        const w2 = "0x690B9A9E9aa1C9dB991C7721a92d351Db4FaC990";

        const bidder1 = await ethers.getImpersonatedSigner(w1);
        await setBalance(w1, 10 * 10 ** 18);
        const bidder2 = await ethers.getImpersonatedSigner(w2);
        await setBalance(w2, 10 * 10 ** 18);

        const revealEndTime = Math.floor(Date.now() / 1000) + 10;
        const tenderContract = (await ethers.deployContract("TenderContract", [revealEndTime]));

        return {
            tenderContract,
            bidder1,
            bidder2,
        };
    }
1697027256
1697027287

    it("Should deploy contract", async function () {
        const { tenderContract, bidder1, bidder2 } = await deployContract();

        console.log("Now", BigInt(Math.floor(Date.now() / 1000)))
        console.log("revealEndTime", await tenderContract.revealEndTime())

        const bid1 = 11;
        const salt1 = generate32ByteValue();
        console.log("salt1 ->", salt1);
        
        const bid2 = 12;
        const salt2 = generate32ByteValue();
        console.log("salt2 ->", salt2);


        const commitment1 = await tenderContract.getCommitment(bid1, salt1, bidder1.address);
        const commitment2 = await tenderContract.getCommitment(bid2, salt2, bidder2.address);

        await tenderContract.connect(bidder1).commitBid(commitment1);
        await tenderContract.connect(bidder2).commitBid(commitment2);

        console.log("getBidInfo 1: ", await tenderContract.getBidInfo(bidder1.address))
        console.log("getBidInfo 2: ", await tenderContract.getBidInfo(bidder2.address))

        console.log("revealEndTime", await tenderContract.revealEndTime())
        console.log("getRevealTimeEnd 1", await tenderContract.getRevealTimeEnd())

        await expect(tenderContract.connect(bidder1).revealBid(12, salt1)).to.revertedWith("Reveal phase has not started yet");
        await expect(tenderContract.connect(bidder2).revealBid(11, salt2)).to.revertedWith("Reveal phase has not started yet");

        await tenderContract.startRevealPhase();

        await tenderContract.connect(bidder1).revealBid(bid1, salt1)
        await tenderContract.connect(bidder2).revealBid(bid2, salt2)

        let bid_revealed1 = await tenderContract.getBidInfo(bidder1.address)
        expect(bid_revealed1[1]).to.equal(bid1);
        
        let bid_revealed2 = await tenderContract.getBidInfo(bidder2.address)
        expect(bid_revealed2[1]).to.equal(bid2);

        let winner_bid = await tenderContract.selectWinner()
        expect(winner_bid[0][0]).to.equal(commitment1);

        await expect(tenderContract.connect(bidder1).selectWinner()).to.revertedWith("Only the Mayor can perform this action");

    });
});