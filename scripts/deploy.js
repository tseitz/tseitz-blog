const hre = require("hardhat");
const fs = require("fs");

async function main() {
  /* these two lines deploy the contract to the network */
  const Blog = await hre.ethers.getContractFactory("Blog");
  const blog = await Blog.deploy("My web3 blog");

  await blog.deployed();

  console.log("Blog deployed to:", blog.address);

  fs.writeFileSync(
    "./config.ts",
    `
  export const contractAddress = "${blog.address}"
  export const ownerAddress = "${blog.signer.address}"
  `
  );
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
