const dotenv = require("dotenv");
dotenv.config();

const {
  LocalTerra,
  LCDClient,
  Dec,
  Int,
  MsgWithdrawDelegatorReward,
} = require("@terra-money/terra.js");
const { MnemonicKey } = require("@terra-money/terra.js");
const {
  executeContract,
  instantiateContract,
  queryContract,
  storeCode,
} = require("./utils.js");
const { terraClient, terraTestnetClient } = require("./constants.js");

const AnchorLunaIntegrationPath = "./Anchor_Luna_Integration.wasm";

const mk1 = new MnemonicKey({
  mnemonic:
    "shallow squeeze where genre spawn beauty cake example gaze excess style essence enlist play panel defense lamp exchange churn wink category sound pair glance",
});
const testing_wallet = terraClient.wallet(mk1);
console.log(testing_wallet.key.accAddress);

async function uploadAnchorLunaIntegration() {
  console.log("Uploading Anchor and Luna Integration...");
  let contractId = await storeCode(mint_wallet, AnchorLunaIntegrationPath); // Getting the contract id from local terra
  console.log(`Contract ID: ${contractId}`);
  return contractId;
}

async function instantiateMainContract(code_id) {
  console.log("Instantiating Contract...");

  let initMessage = {
    anchor_portion: new Dec(0.8).toString(),
    luna_portion: new Dec(0.2).toString(),
    anchor_address: "terra15dwd5mj8v59wpj0wvt233mf5efdff808c5tkal",
    token_address: "terra1ajt556dpzvjwl0kl5tzku3fc3p3knkg9mkv8jl",
    denom: "uusd",
  };

  console.log(JSON.stringify(initMessage, null, 2));
  let result = await instantiateContract(mint_wallet, code_id, initMessage);
  let contractAddresses = result.logs[0].events[0].attributes
    .filter((element) => element.key == "contract_address")
    .map((x) => x.value);
  console.log(`Contract Address: ${contractAddresses}`);
  return contractAddresses;
}

async function getStateInfo(contractAddress) {
  let coResponse = await queryContract(contractAddress, {
    get_state_info: {},
  });
  console.log(coResponse);
  return coResponse;
}

async function depositMoney(contractAddress) {
  console.log("depositing");
  const [balance] = await terraTestnetClient.bank.balance(
    testing_wallet.key.accAddress
  );
  console.log(balance.toData());
  let balanceStableCoin = balance.toData();
  let amount = "0";
  await balanceStableCoin.forEach((coin) => {
    if (coin.denom === "uusd") amount = Number(coin.amount) - Number(500000);
  });
  if (amount < 0) return;
  console.log(amount);

  let deposit = {
    deposit: {},
  };
  let wsfacResponse = await executeContract(
    testing_wallet,
    contractAddress,
    deposit,
    { uusd: Number(amount) }
  );
  console.log("transaction hash = " + wsfacResponse["txhash"]);
}

async function withdraw(contractAddress, tokenAddress) {
  let tokenBalance = await queryContract(tokenAddress, {
    balance: { address: contractAddress },
  });

  console.log("token balance", String(tokenBalance.balance));

  let withdraw = {
    withdraw: { amount: String(tokenBalance.balance) },
  };

  let state = await getStateInfo(contractAddress);
  let total_deposit = state.total_deposit;
  console.log("total deposit", total_deposit);

  let wsfacResponse = await executeContract(
    testing_wallet,
    contractAddress,
    withdraw,
    {}
  );
  console.log("withdraw transaction hash = " + wsfacResponse["txhash"]);

  const [balance] = await terraTestnetClient.bank.balance(contractAddress);
  console.log("uusd balance", balance.toData()[0].amount);

  let amount = balance.toData()[0].amount;

  let sendToWallet = {
    send_to_wallet: { amount: String(amount) },
  };
  let wsfacResponse1 = await executeContract(
    testing_wallet,
    contractAddress,
    sendToWallet,
    {}
  );
  console.log("send to wallet transaction hash = " + wsfacResponse1["txhash"]);
  console.log("interest", Number(amount) - Number(total_deposit));

  let deposit = {
    deposit_to_anchor: {},
  };

  let wsfacResponse2 = await executeContract(
    testing_wallet,
    contractAddress,
    deposit,
    { uusd: Number(total_deposit) }
  );
  console.log("send to wallet transaction hash = " + wsfacResponse2["txhash"]);
}

module.exports = {
  AnchorLunaIntegrationPath,
  testing_wallet,
  depositMoney,
  withdraw,
};
