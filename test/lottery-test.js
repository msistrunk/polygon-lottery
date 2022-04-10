const { expect } = require("chai");
const { ethers, waffle } = require("hardhat");

describe("Lottery", function () {
  it("Enter lottery and pick winner", async function () {
    [addr1, addr2, addr3, addr4] = await ethers.getSigners()
    const provider = waffle.provider;
    const Lottery = await ethers.getContractFactory("Lottery");
    const lottery = await Lottery.deploy();
    await lottery.deployed();
    const preBalance = await lottery.getBalance()
    console.log(preBalance, 'preBalance')
    expect(await lottery.getBalance()).to.equal(0);
    const tx1 = await lottery.connect(addr1).enter({ value: ethers.utils.parseEther("0.5") })
    const tx2 = await lottery.connect(addr2).enter({ value: ethers.utils.parseEther("0.5") })
    const tx3 = await lottery.connect(addr3).enter({ value: ethers.utils.parseEther("0.5") })
    const tx4 = await lottery.connect(addr4).enter({ value: ethers.utils.parseEther("0.5") })
    const player = await lottery.getPlayers()
    const postBalance = await lottery.getBalance()
    expect(await lottery.getBalance() / 1000000000000000000).to.equal(2)
    console.log(player, 'Players')
    console.log('postBalance: ', `${postBalance / 1000000000000000000} ETH`)

    const addr1Balance = await provider.getBalance(addr1.address)
    const addr2Balance = await provider.getBalance(addr2.address)
    const addr3Balance = await provider.getBalance(addr3.address)
    const addr4Balance = await provider.getBalance(addr4.address)

    console.log('addr1Balance', addr1Balance)
    console.log('addr2Balance', addr2Balance)
    console.log('addr3Balance', addr3Balance)
    console.log('addr4Balance', addr4Balance)


    const pickWinner = await lottery.pickWinner();
    const number1Winner = await lottery.getWinnerByLottery(1)
    const postWinnerPlayers = await lottery.getPlayers();
    console.log(number1Winner, 'number1winner');
    const addr1Bal = await provider.getBalance(addr1.address)
    const addr2Bal = await provider.getBalance(addr2.address)
    const addr3Bal = await provider.getBalance(addr3.address)
    const addr4Bal = await provider.getBalance(addr4.address)

    console.log('addr1Bal', addr1Bal)
    console.log('addr2Bal', addr2Bal)
    console.log('addr3Bal', addr3Bal)
    console.log('addr4Bal', addr4Bal)
    console.log(postWinnerPlayers, 'postwinnerplayers')
    expect(postWinnerPlayers).to.deep.equal([])


  });
});
