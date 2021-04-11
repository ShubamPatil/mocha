
const { spawn } = require('child_process');
CheckInvoice = require("./check-invoice").checkInvoiceGenerated;
remoteStart = require("./remote-start-stop/remote-start").triggerRemoteStart;
// remoteStop = require("./remote-start-stop/remote-stop").triggerRemoteStop;


let flag = true;
var transID;

describe('-----Test Case - 021-----', function () {
    it('RemoteStart stopping by itself and then checking for the invoice generated for recent session', function (done) {
        const child = spawn('bash', ['TC-021-AutoStopForRemoteStart/start-simulator.sh']);
        child.stdout.on('data', (chunk) => {
            chunk = chunk.toString();
            console.log(`sim says: ${chunk}`);

            if (chunk.includes("Waiting for Remote Start")) {
                remoteStart();
            }

            if (chunk.includes("transactionId") && flag === true) {
                transID = chunk.split("transactionId:")[1].trim().split(/[ .:;?!~,`"&|()<>{}\[\]\r\n/\\]+/)[0];
                flag = false;
                console.log(transID);
            }
        })

        setTimeout(() => {
            CheckInvoice(transID).then(done);
        }, 100000);

    })
})
