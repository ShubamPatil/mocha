
const { spawn } = require('child_process');
CheckInvoice = require("./check-invoice").checkInvoiceGenerated;
remoteStart = require("./remote-start-stop/remote-start").triggerRemoteStart;
remoteStop = require("./remote-start-stop/remote-stop").triggerRemoteStop;


let flag = true;
var transID;
// const startDatetime = new Date();

describe('-----Test Case - 021-----', function () {
    it('-----Remote-Start-AutoStop------', function (done) {

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

            if (chunk.includes("Stopped charging")) {
                // const endDatetime = new Date();
                CheckInvoice(transID);
                done();
            }

        });


    })
})
