//import here
const { ethers, run } = require("hardhat");

// async main
async function main() {
  // getting a custom ERC20 contract factory using ethers
  const erc20 = await ethers.getContractFactory("CustomERC20");
  console.log("Deploying erc20 contract...");
  // deploying the contract
  const initialSupply = ethers.parseUnits("1000000", 6); // Adjust the initial supply as needed
  const erc20Contract = await erc20.deploy(initialSupply);

  // Wait for the deployment transaction to be mined
  await erc20Contract.waitForDeployment(); // Use .deployed() to get the deployed contract instance
  console.log("ERC20 Contract deployed!");
  const erc20ContractAddress = await erc20Contract.getAddress();
  console.log(`Deployed contract address: ${erc20ContractAddress}`);
  await erc20Contract.deploymentTransaction().wait(8);
  await verify(`contracts/CustomERC20.sol:CustomERC20`, erc20ContractAddress, [
    initialSupply,
  ]);

  const rewardToken = await ethers.getContractFactory(
    "contracts/RewardToken.sol:RewardToken"
  );
  console.log("Deploying Reward Token Contract");
  const rewardTokenContract = await rewardToken.deploy();
  await rewardTokenContract.waitForDeployment();
  console.log("Reward Token Deployed");
  const rewardTokenContractAddress = await rewardTokenContract.getAddress();
  console.log(
    `Deployed reward contract address: ${rewardTokenContractAddress}`
  );

  await rewardTokenContract.deploymentTransaction().wait(6);
  await verify(
    "contracts/RewardToken.sol:RewardToken",
    rewardTokenContractAddress,
    []
  );

  // launching Charity Manager
  const charityManager = await ethers.getContractFactory("CharityManager");
  console.log("Deploying charity manager");
  const charityContract = await charityManager.deploy(
    erc20Contract.getAddress(),
    rewardTokenContract.getAddress()
  );
  await charityContract.waitForDeployment();
  console.log("Charity Token Deployed");
  const charityManagerContractAddress = await charityContract.getAddress();
  console.log(
    `Deployed charity contract address: ${charityManagerContractAddress}`
  );

  await charityContract.deploymentTransaction().wait(6);
  await verify(
    `contracts/CharityManager.sol:CharityManager`,
    charityManagerContractAddress,
    [erc20ContractAddress, rewardTokenContractAddress]
  );

  // Passing ownership of mintable to charity manager
  await rewardTokenContract.transferOwnership(charityManagerContractAddress);
  console.log(`Passed ownership to charity contract`);
}

async function verify(contractLoc, contractAddress, args) {
  console.log("Verifying contract");
  try {
    await run("verify:verify", {
      contract: contractLoc,
      address: contractAddress,
      constructorArguments: args,
    });
  } catch (e) {
    if (e.message.toLowerCase().includes("already verified")) {
      console.log("Already Verified!");
    } else {
      console.log(e);
    }
  }
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
