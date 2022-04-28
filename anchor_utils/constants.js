const dotenv = require("dotenv");
dotenv.config();
const { LocalTerra, LCDClient } = require("@terra-money/terra.js");
const { get_server_epoch_seconds } = require("./utils.js");
const { MnemonicKey } = require("@terra-money/terra.js");

const terraTestnetClient = new LCDClient({
  URL: "https://bombay-lcd.terra.dev",
  chainID: "bombay-12",
});
terraTestnetClient.chainID = "bombay-12";
const localTerraClient = new LocalTerra();
localTerraClient.chainID = "localterra";

console.log("terraTestnetClient.chainID = " + terraTestnetClient.chainID);
console.log("localTerraClient.chainID = " + localTerraClient.chainID);
const terraClient =
  process.env.TERRA_CLIENT === "localTerra"
    ? localTerraClient
    : terraTestnetClient;

module.exports = { terraTestnetClient, localTerraClient, terraClient };
