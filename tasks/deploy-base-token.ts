import { task } from "hardhat/config"
import { HardhatRuntimeEnvironment } from "hardhat/types"

task("baseToken.deploy")
    .addParam("name", "Contract address")
    .addParam("symbol", "BaseToken address")
    .addParam("pricefeed", "BaseToken address")
    .addParam("clearinghouse", "BaseToken address")
    .setAction(async ({ name, symbol, pricefeed, clearinghouse }, hre: HardhatRuntimeEnvironment) => {
        const { deployments, getNamedAccounts, ethers } = hre
        const { deploy } = deployments

        const { deployer } = await getNamedAccounts()

        const newBaseToken = await deploy(`${name}`, {
            from: deployer,
            contract: "BaseToken",
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
        await BaseTokenContract.mintMaximumTo(clearinghouse)

        console.log(`${name} address: ${newBaseToken.address}`)
    })
