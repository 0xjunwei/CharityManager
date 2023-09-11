const hre = require("hardhat");

async function main() {
  const [deployer] = await hre.ethers.getSigners();

  const CharityManager = await hre.ethers.getContractFactory("CharityManager");
  const charityManager = await CharityManager.deploy();

  await charityManager.waitForDeployment();

  // Estimate gas for your functions
  const proposalId = 1;
  const donationAmount = 1000000; // In the smallest token unit
  const estimateDonationGas = await charityManager.estimateGas.donateWithChoice(
    donationAmount,
    proposalId
  );
  console.log(`Estimate gas for donateWithChoice: ${estimateDonationGas}`);

  const amountToMatch = 100000000; // In the smallest token unit
  const ratioToMatch = 10000; // 1:1 ratio
  const estimateMatchGas = await charityManager.estimateGas.matchDonation(
    proposalId,
    amountToMatch,
    ratioToMatch
  );
  console.log(`Estimate gas for matchDonation: ${estimateMatchGas}`);
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
