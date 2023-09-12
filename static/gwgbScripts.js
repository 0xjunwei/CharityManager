// // STYLING OF WEBPAGE
// // Get the current date
// const currentDate = new Date();

// // Format the date as desired (e.g., "Month Day, Year")
// const options = { year: 'numeric', month: 'long', day: 'numeric' };
// const formattedDate = currentDate.toLocaleDateString('en-US', options);

// // Update the HTML element with the current date
// const currentDateElement = document.getElementById('currentDate');
// currentDateElement.textContent = formattedDate;
// WEB3 INTEGRATION WITH SC
// Address of Charity Manager Contract
const spenderAddress = "0xF63f9e1adc2ba9B3BE16D0aE12506400f7A6c4a1";

let account;
const connectMetamask = async () => {
    if(typeof window.ethereum !== "undefined") {
        const accounts = await ethereum.request({method: "eth_requestAccounts"});
        account = accounts[0];
        document.getElementById("accountArea").innerHTML = "Connected wallet address: " + account;
        
        // hide button after connecting
        var button = document.getElementById('myButton');
        button.style.display = 'none';
    } else {
    console.log('Please install MetaMask.');
    }
}

const sendDonation = async () => {
    var donateVal = document.getElementById("donateVal").value;
    var tokenAddress = document.getElementById("tokenAddress").value;

        // if usdc
    if (tokenAddress == "0xbE00A68C2fa82E39b27933464261E5a55A36fE4F") {
        approvalAddress = "0xbE00A68C2fa82E39b27933464261E5a55A36fE4F"

       // if xsgd
      }  else if (tokenAddress == "0xD27Fa8D3C51EDa3F78233dBEa36058c9E77D4139") {
        approvalAddress = "0xD27Fa8D3C51EDa3F78233dBEa36058c9E77D4139"
      }

    approvalInstance = await new Web3(window.ethereum);
    approvalContract = await new approvalInstance.eth.Contract(approval_ABI, approvalAddress);
    const allowance = await approvalContract.methods.allowance(account, spenderAddress).call();

    if (allowance == 0){
        approvalContract.methods.approve(spenderAddress, donateVal * 10**6)
        .send({ from: account })
        .on('transactionHash', (hash) => {
            $("#txStatus").text("Transaction Hash:" + hash);
        })
        .on('receipt', (receipt) => {
            $("#txStatus").text("Approved ! Execute it again to perform the donation !");
        })
        .on('error', (error) => {
            $("#txStatus").text("An error occurred, please try again !");
        });
    }
    else if (allowance > 0){
        donationInstance = await new Web3(window.ethereum);
        donationContract = await new donationInstance.eth.Contract(donation_ABI, spenderAddress);

        // As POC, Proposal Number is hardcoded
        donationContract.methods.donateWithChoice(donateVal* 10**6, 1, tokenAddress)
        .send({ from: account})
        .on('transactionHash', (hash) => {
            $("#txStatus").text("Transaction Hash:" + hash);
        })
        .on('receipt', (receipt) => {
            $("#txStatus").text("Successfully Contributed !");
        })
        .on('error', (error) => {
            $("#txStatus").text("An error occurred, please try again !");
        });
    }


}

const createProposal = async () => {
    var URL = "www.minds.org.sg/donation/";
    console.log(URL)

    var amountNeeded = document.getElementById('proposalNeeded').value;
    console.log(amountNeeded);

    var donateToAddress = document.getElementById('proposalNeeded').value;

    // insufficet time to troublesome and not hardcode
    var donateToAddress = "0x7a5EAE523975516A0f92F889caFD88c30B6fA656";

    console.log(donateToAddress);
    var durationInDays = document.getElementById('proposalDuration').value;
    console.log(proposalDuration);

    donationInstance = await new Web3(window.ethereum);
    donationContract = await new donationInstance.eth.Contract(donation_ABI, spenderAddress);

    // As POC, Proposal URL is hardcoded
    donationContract.methods.addProposal(URL, amountNeeded * 10 ** 6, donateToAddress, durationInDays)
    .send({ from: account})
    .on('transactionHash', (hash) => {
        $("#txStatus").text("Transaction Hash:" + hash);
    })
    .on('receipt', (receipt) => {
        $("#txStatus").text("Proposal was Created Successfully !");
//        document.getElementById("proposalProof").innerHTML = "Proposal was Created Successfully ! ";
    })
    .on('error', (error) => {
        $("#txStatus").text("An error occurred, please try again !");
    });

}

const matchDonation = async () => {
    var proposalID = document.getElementById("proposalID").value;
    var amtToMatch = document.getElementById("amtToMatch").value;
    var ratioToMatch = document.getElementById("ratioToMatch").value;
    var tokenAddress = document.getElementById("tokenAddress").value;
    
        // if usdc
    if (tokenAddress == "0xbE00A68C2fa82E39b27933464261E5a55A36fE4F") {
        approvalAddress = "0xbE00A68C2fa82E39b27933464261E5a55A36fE4F"

       // if xsgd
      }  else if (tokenAddress == "0xD27Fa8D3C51EDa3F78233dBEa36058c9E77D4139") {
        approvalAddress = "0xD27Fa8D3C51EDa3F78233dBEa36058c9E77D4139"
      }

    approvalInstance = await new Web3(window.ethereum);
    approvalContract = await new approvalInstance.eth.Contract(approval_ABI, approvalAddress);
    const allowance = await approvalContract.methods.allowance(account, spenderAddress).call();

    if (allowance == 0){
        approvalContract.methods.approve(spenderAddress, amtToMatch * 10**6)
        .send({ from: account })
        .on('transactionHash', (hash) => {
            $("#txStatus").text("Transaction Hash:" + hash);
        })
        .on('receipt', (receipt) => {
            $("#txStatus").text("Approved ! Execute it again to perform the matching !");
        })
        .on('error', (error) => {
            $("#txStatus").text("An error occurred, please try again !");
        });
    }
    else if (allowance > 0){
        matchInstance = await new Web3(window.ethereum);
        matchContract = await new matchInstance.eth.Contract(donation_ABI, spenderAddress);

        // As POC, Proposal Number is hardcoded
        matchContract.methods.matchDonation(proposalID, amtToMatch * 10 **6, ratioToMatch * 100, tokenAddress)
        .send({ from: account})
        .on('transactionHash', (hash) => {
            $("#txStatus").text("Transaction Hash:" + hash);
        })
        .on('receipt', (receipt) => {
            $("#txStatus").text("Successfully Matched !");
        })
        .on('error', (error) => {
            $("#txStatus").text("An error occurred, please try again !");
        });
    }


}