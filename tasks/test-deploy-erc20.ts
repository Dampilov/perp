import { Address, BN } from "ethereumjs-util"
import { task } from "hardhat/config"
import { HardhatRuntimeEnvironment } from "hardhat/types"

task("erc20.deploy").setAction(async ({ args }, hre: HardhatRuntimeEnvironment) => {
    const { deployments, getNamedAccounts, ethers, network } = hre
    const { deploy } = deployments

    const { deployer } = await getNamedAccounts()

    const quoteAddress = Address.fromString("0x4F2e62fb00B5D07d411ee3da5A130f11Ee1F8861")

    let futureAddress = quoteAddress
    let nonce = await ethers.provider.getTransactionCount(deployer)

    for (; futureAddress >= quoteAddress; nonce++) {
        futureAddress = Address.generate(Address.fromString(deployer), new BN(nonce))
    }

    console.log(`Predicted address: ` + nonce.toString(16))

    /* const Name = "USDC"
    const Symbol = "USDC"
    const Decimals = 6

    const newBaseToken = await deploy("ERC20Test", {
        from: deployer,
        args: [Name, Symbol, Decimals],
        nonce: nonce++,
        log: true,
    })

    console.log(`${Name} address: ${newBaseToken.address}`) */
})
