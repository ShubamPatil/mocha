const chai = require('chai');
chai.use(require('chai-http'));
const { expect } = chai;

const { spawn } = require('child_process');
let TransID;

startSimulator();

function startSimulator() {
    return new Promise((resolve) => {
        const child = spawn('bash', ['start-simulator.sh']);

        child.stdout.on('data', (chunk) => {
            chunk = chunk.toString();
            console.log(`sim says: ${chunk}`);

            if (chunk.includes("transactionId")) {
                TransID = chunk.split("transactionId:")[1].split(",")[0];
            }

            if(chunk.includes("Waiting for Remote Stop for Testcharge001's Connector 1")){
                triggerRemoteStop(TransID);
                
            }
            if(chunk.includes("Error when starting charging for Testcharge001's connector 1")){
                console.log("check for user account(Account Bal or Expiry of RFID & User Valid Till)");
                spawn('bash', ['stop-simulator.sh']);
            }
            

            if (chunk.includes("Stopped charging for Testcharge001's connector 1")) {
                console.log("Stopped charging for Testcharge001's connector 1")
                spawn('bash', ['stop-simulator.sh']);
                resolve();
            }
        })

        child.stderr.on('data', (message) => {
            console.log(`sim err: ${message}`)
        })

    })
}

function triggerRemoteStop(TransID){
    return chai.request('https://testcms1.numocity.com:9091/')
    .get(`api/v2/ocpp/remotetransaction/stop/Testcharge001/${TransID}`)
    .end((err,res) => {
        expect(err).to.be.null;
        expect(res).to.have.status(200);
    })
}
