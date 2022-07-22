import { Address } from "ethereumjs-util"
import { task } from "hardhat/config"
import { HardhatRuntimeEnvironment } from "hardhat/types"

task("baseToken.deploy")
    .addParam("name", "Contract address")
    .addParam("symbol", "BaseToken address")
    .addParam("clearinghouse", "BaseToken address")
    .addParam("pair", "Pair name")
    .addParam("aggregator", "Aggregator address")
    .setAction(async ({ name, symbol, clearinghouse, pair, aggregator }, hre: HardhatRuntimeEnvironment) => {
        const { deployments, getNamedAccounts, ethers, network } = hre
        const { deploy } = deployments

        const { deployer } = await getNamedAccounts()

        const priceFeedAddr = await hre.run("priceFeed.deploy", {
            pair: pair,
            aggregator: aggregator,
        })

        const ClearingHouse = (await ethers.getContractFactory("ClearingHouse")).attach(clearinghouse)
        const quoteAddress = Address.fromString(await ClearingHouse.getQuoteToken())

        /* let futureAddress = quoteAddress
        let nonce = await ethers.provider.getTransactionCount(deployer)
        console.log(`Actual nonce: ${nonce}`)

        for (; futureAddress >= quoteAddress; nonce++) {
            futureAddress = Address.generate(Address.fromString(deployer), new BN(nonce))
        }

        console.log(`Predicted ${name} address: ` + futureAddress.toString())
        console.log(`Future nonce: ${nonce}`) */

        const newBaseToken = await deploy(`${name}`, {
            from: deployer,
            contract: "BaseToken",
            proxy: {
                proxyContract: "OpenZeppelinTransparentProxy",
                execute: {
                    init: {
                        methodName: "initialize",
                        args: [name, symbol, priceFeedAddr],
                    },
                },
            },
            log: true,
        })

        console.log(`${name} address: ${newBaseToken.address}`)

        const BaseTokenContract = (await ethers.getContractFactory("BaseToken")).attach(newBaseToken.address)

        await (await BaseTokenContract.mintMaximumTo(clearinghouse)).wait()
    })
