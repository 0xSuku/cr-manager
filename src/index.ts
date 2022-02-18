import { BigNumber, ethers } from 'ethers';
import * as erc20 from './abi/erc20';
import moment, { Moment } from 'moment';
import { Signature } from './entities/IItemsResponse';
import { hexlify } from 'ethers/lib/utils';
import 'dotenv/config'

// CONFIG: Poner en el file .env la línea con el mnemonic
const mnemonic = process.env.MNEMONIC as string;
let wallet = ethers.Wallet.fromMnemonic(mnemonic);
const providerPolygon = process.env.PROVIDER_POLYGON_WSS as string;
let provider_polygon = new ethers.providers.WebSocketProvider(providerPolygon);
let account_polygon = wallet.connect(provider_polygon);

const gasPrice = ethers.utils.parseUnits('50', 'gwei');

const grimweedQuestContractAddress = '0xe193364370f0e2923b41a8d1850f442b45e5cca7';
const grimweedQuestContractABI = [
    'function startQuest(uint256 _raiderId)',
    'function endQuest(uint _raiderId)',
    'function timeHome(uint _raiderId) external view returns(uint)',
    'function getRewards(uint256 _raiderId)'
];
const grimweedQuestContract = new ethers.Contract(grimweedQuestContractAddress, grimweedQuestContractABI, account_polygon);
const grimweedQuestContractRO = new ethers.Contract(grimweedQuestContractAddress, grimweedQuestContractABI, provider_polygon);

const newtQuestContractAddress = '0x98a195e3ec940f590d726557c95786c8ebb0a2d2';
const newtQuestContractABI = [
    'function startQuest(uint256 _raiderId)',
    'function endQuest(uint _raiderId)',
    'function timeHome(uint _raiderId) external view returns(uint)',
    'function getRewards(uint256 _raiderId)'
];
const newtQuestContract = new ethers.Contract(newtQuestContractAddress, newtQuestContractABI, account_polygon);


// CONFIG: Poner id de los raiders acá
const raiderGrimweedList = [
    2
]

const raiderNewtList = [
    2
]

//gas = https://api.polygonscan.com/api?module=gastracker&action=gasoracle&apikey=SKCZ68JMGBCSMJ6U1R4H2C194TZV91P2FH

// TODO: Hay que checkear si el raider está en quest, sino parece que ya volvió con el timeHome
async function main() {

    // await sendGrimweed();
    // await endGrimweedQuest();
    // await startNewtQuest();
    // await endNewtQuest();
    // await getRewardsGrimweedQuest();
    await getRewardsNewtQuest();
    // await checkGrimweedTimeHomes();
    // await checkNewtTimeHomes();
    process.exit();
}

async function getGrimweedTimeHome(raiderId: number) {
    const hex = ethers.utils.hexlify(raiderId);
    const value: ethers.BigNumber = await grimweedQuestContractRO.timeHome(hex);
    const date = new Date(value.toNumber() * 1000);
    return date;
}

async function getNewtTimeHome(raiderId: number) {
    const hex = ethers.utils.hexlify(raiderId);
    const value: ethers.BigNumber = await newtQuestContract.timeHome(hex);
    const date = new Date(value.toNumber() * 1000);
    return date;
}

async function checkGrimweedTimeHomes() {
    for (let i = 0; i < raiderGrimweedList.length; i++) {
        const raiderId = raiderGrimweedList[i];

        const timeHome = await getGrimweedTimeHome(raiderId);
        if (timeHome.getTime() < new Date().getTime()) {
            console.log(`Raider ${raiderId} is home`);
        } else {
            console.log(`Raider ${raiderId} will return at `, timeHome);
        }
    }
}

async function checkNewtTimeHomes() {
    for (let i = 0; i < raiderNewtList.length; i++) {
        const raiderId = raiderNewtList[i];

        const timeHome = await getNewtTimeHome(raiderId);
        if (timeHome.getTime() < new Date().getTime()) {
            console.log(`Raider ${raiderId} is home`);
        } else {
            console.log(`Raider ${raiderId} will return at `, timeHome);
        }
    }
}

async function getRewardsGrimweedQuest() {
    for (let i = 0; i < raiderGrimweedList.length; i++) {
        const raiderId = raiderGrimweedList[i];

        const hex = ethers.utils.hexlify(raiderId);
        console.log('Collect GRIM rewards raider id: ' + raiderId);

        const tx = await grimweedQuestContract.getRewards(hex, getGasValues());
        console.log(`Tx sent: ${tx.hash}`);

        const receipt = await tx.wait();
        console.log(`Tx was mined in block: ${receipt.blockNumber}`);
    }
}

async function getRewardsNewtQuest() {
    for (let i = 0; i < raiderNewtList.length; i++) {
        const raiderId = raiderNewtList[i];

        const hex = ethers.utils.hexlify(raiderId);
        console.log('Collect NEWT rewards raider id: ' + raiderId);

        const tx = await newtQuestContract.getRewards(hex, getGasValues());
        console.log(`Tx sent: ${tx.hash}`);

        const receipt = await tx.wait();
        console.log(`Tx was mined in block: ${receipt.blockNumber}`);
    }
}

async function startNewtQuest() {
    for (let i = 0; i < raiderNewtList.length; i++) {
        const raiderId = raiderNewtList[i];

        const hex = ethers.utils.hexlify(raiderId);
        console.log('Start NEWT raider id: ' + raiderId);

        const tx = await newtQuestContract.startQuest(hex, getGasValues());
        console.log(`Tx sent: ${tx.hash}`);

        const receipt = await tx.wait();
        console.log(`Tx was mined in block: ${receipt.blockNumber}`);
    }
}

async function endNewtQuest() {
    for (let i = 0; i < raiderNewtList.length; i++) {
        const raiderId = raiderNewtList[i];

        const hex = ethers.utils.hexlify(raiderId);
        console.log('End NEWT raider ID: ' + raiderId);

        const tx = await newtQuestContract.endQuest(hex, getGasValues());
        console.log(`Tx sent: ${tx.hash}`);

        const receipt = await tx.wait();
        console.log(`Tx was mined in block: ${receipt.blockNumber}`);
    }
}

async function startGrimweedQuest() {
    for (let i = 0; i < raiderGrimweedList.length; i++) {
        const raiderId = raiderGrimweedList[i];

        const hex = ethers.utils.hexlify(raiderId);
        console.log('Start GRIM raider id: ' + raiderId);

        const tx = await grimweedQuestContract.startQuest(hex, getGasValues());
        console.log(`Tx sent: ${tx.hash}`);

        const receipt = await tx.wait();
        console.log(`Tx was mined in block: ${receipt.blockNumber}`);
    }
}

async function endGrimweedQuest() {
    for (let i = 0; i < raiderGrimweedList.length; i++) {
        const raiderId = raiderGrimweedList[i];

        const hex = ethers.utils.hexlify(raiderId);
        console.log('End GRIM raider ID: ' + raiderId);

        const tx = await grimweedQuestContract.endQuest(hex, getGasValues());
        console.log(`Tx sent: ${tx.hash}`);

        const receipt = await tx.wait();
        console.log(`Tx was mined in block: ${receipt.blockNumber}`);
    }
}

function getGasValues() {
    return {
        maxFeePerGas: ethers.utils.parseUnits('40', 'gwei'),
        maxPriorityFeePerGas: ethers.utils.parseUnits('35', 'gwei'),
        gasLimit: 450000
    };
}

main();
