import "@nomiclabs/hardhat-ethers"
import "@nomiclabs/hardhat-waffle"
import "@openzeppelin/hardhat-upgrades"
import "@typechain/hardhat"
import "dotenv/config"
import "hardhat-contract-sizer"
import "hardhat-dependency-compiler"
import "hardhat-deploy"
import "hardhat-gas-reporter"
import { HardhatUserConfig } from "hardhat/config"
import "solidity-coverage"
import "./mocha-test"
import "./tasks"

const config: HardhatUserConfig = {
    solidity: {
        version: "0.7.6",
        settings: {
            optimizer: { enabled: true, runs: 100 },
            evmVersion: "berlin",
            // for smock to mock contracts
            outputSelection: {
                "*": {
                    "*": ["storageLayout"],
                },
            },
        },
    },
    paths: {
        tests: "./test",
        artifacts: "./build/artifacts",
        cache: "./build/cache",
        deployments: "./build/deployments",
    },
    typechain: {
        outDir: "./build/typechain",
    },
    namedAccounts: {
        deployer: 0,
    },
    networks: {
        hardhat: {
            allowUnlimitedContractSize: true,
        },
        localhost: {
            url: "http://127.0.0.1:8545",
        },
        rinkeby: {
            url: `https://rinkeby.infura.io/v3/${process.env.INFURA_API_KEY}`,
            accounts: [`0x${process.env.PRIVATE_KEY}`],
            verify: {
                etherscan: {
                    apiKey: process.env.ETHERSCAN_API_KEY || "API_KEY_WEB",
                },
            },
            gas: 2100000,
            gasPrice: 8000000000,
        },
        ropsten: {
            url: `https://ropsten.infura.io/v3/${process.env.INFURA_API_KEY}`,

            accounts: {
                mnemonic: process.env.MNEMONIC,
            },
            verify: {
                etherscan: {
                    apiKey: process.env.ETHERSCAN_API_KEY || "API_KEY_WEB",
                },
            },
        },
        kovan: {
            url: `https://kovan.infura.io/v3/${process.env.INFURA_API_KEY}`,
            accounts: [`0x${process.env.PRIVATE_KEY}`],
            verify: {
                etherscan: {
                    apiKey: process.env.ETHERSCAN_API_KEY || "API_KEY_WEB",
                },
            },
        },
    },
    dependencyCompiler: {
        // We have to compile from source since UniswapV3 doesn't provide artifacts in their npm package
        paths: [
            "@uniswap/v3-core/contracts/UniswapV3Factory.sol",
            "@uniswap/v3-core/contracts/UniswapV3Pool.sol",
            "@perp/perp-oracle-contract/contracts/test/ChainlinkPriceFeed.sol",
            "@perp/perp-oracle-contract/contracts/ChainlinkPriceFeed.sol",
            "@perp/perp-oracle-contract/contracts/BandPriceFeed.sol",
            "@perp/perp-oracle-contract/contracts/EmergencyPriceFeed.sol",
        ],
    },
    contractSizer: {
        alphaSort: true,
        runOnCompile: true,
        disambiguatePaths: false,
    },
    gasReporter: {
        excludeContracts: ["test"],
    },
    mocha: {
        require: ["ts-node/register/files"],
        jobs: 4,
        timeout: 120000,
        color: true,
    },
}

export default config
