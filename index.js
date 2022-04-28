const express = require("express");
const cors = require("cors");
const { exit } = require("process");
const app = express();
const { depositMoney, withdraw } = require("./anchor_utils/anchor_luna");
app.use(cors());
const PORT = process.env?.PORT || 3000;

let lastDate = new Date();
let lastWithdrawDate = new Date();
app.listen(PORT, async () => {
  console.log(`Server is running at http://localhost:${PORT}`);
  fetchInterval();
});

async function fetchInterval() {
  // await anchorWithdraw();
  setTimeout(async () => {
    await processLogic();
    fetchInterval();
  }, 86400000);
  // }, 1000);
}

const contractAddress = "terra1yx4hh2wjkm3gglw9gj3dmla66vekhaffms29ql";
const anchorAddress = "terra15dwd5mj8v59wpj0wvt233mf5efdff808c5tkal";
const tokenAddress = "terra1ajt556dpzvjwl0kl5tzku3fc3p3knkg9mkv8jl";

async function processLogic() {
  let currentDate = new Date();
  if (currentDate.getMonth() !== lastDate.getMonth()) {
    // if (currentDate.getMinutes() !== lastDate.getMinutes()) {
    await depositMoney(contractAddress);
    // await withdraw(contractAddress, tokenAddress);

    lastDate = currentDate;
    console.log("timeInterval: ", lastDate);
  }
  if (currentDate.getFullYear() !== lastWithdrawDate.getFullYear()) {
    await withdraw(contractAddress, tokenAddress);
    lastWithdrawDate = currentDate;
  }
}
