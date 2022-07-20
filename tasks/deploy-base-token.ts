import { task } from "hardhat/config"
import { HardhatRuntimeEnvironment } from "hardhat/types"

task("baseToken.deploy")
    .addParam("name", "Contract address")
    .addParam("symbol", "BaseToken address")
    .addParam("pricefeed", "BaseToken address")
    .addParam("clearinghouse", "BaseToken address")
    .addParam("exchange", "BaseToken address")
    .setAction(async ({ name, symbol, pricefeed, clearinghouse, exchange }, hre: HardhatRuntimeEnvironment) => {
        const { deployments, getNamedAccounts, ethers } = hre
        const { deploy } = deployments

        const { deployer } = await getNamedAccounts()

        const newBaseToken = await deploy("BaseToken", {
            from: deployer,
            proxy: {
                proxyContract: "OpenZeppelinTransparentProxy",
                execute: {
                    init: {
                        methodName: "initialize",
                        args: [name, symbol, pricefeed],
                    },
                },
            },
            log: true,
        })

        const BaseTokenContract = (await ethers.getContractFactory("BaseToken")).attach(newBaseToken.address)
        const Exchange = (await ethers.getContractFactory("Exchange")).attach(exchange)

        await BaseTokenContract.mintMaximumTo(clearinghouse)
        await Exchange.setMaxTickCrossedWithinBlock(newBaseToken.address, 250)

        console.log(`${name} address: ${newBaseToken.address}`)
    })
