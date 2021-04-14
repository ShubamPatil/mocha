
const { spawn } = require('child_process');
CheckInvoice = require("./check-invoice").checkInvoiceGenerated;
remoteStart = require("./remote-start-stop/remote-start").triggerRemoteStart;
remoteStop = require("./remote-start-stop/remote-stop").triggerRemoteStop;


let flag = true;
var transID;

const actions = [
    { sim_out: "Waiting for Remote Start", action: remoteStart},
    { sim_out: "Waiting for Remote Stop", action: remoteStop},
    { sim_out: "Stopped charging", action: CheckInvoice}
]


describe('-----Test Case - 021-----', function () {
    it('RemoteStart stopping by itself and then checking for the invoice generated for recent session', function (done) {
        const child = spawn('bash', ['TC-RemoteStartStop/start-simulator.sh']);
        child.stdout.on('data', (chunk) => {
            chunk = chunk.toString();
            console.log(`sim says: ${chunk}`);

            for (const actionItem of actions) {
                if (chunk.includes(actionItem.sim_out)) {
                    actionItem.action();
                }
            }

            // Getting Transaction ID from terminal using RegExp
            if (chunk.includes("transactionId") && flag === true) {
                transID = chunk.split("transactionId:")[1].trim().split(/[ .:;?!~,`"&|()<>{}\[\]\r\n/\\]+/)[0];
                flag = false;
                console.log(transID);
                module.exports.transID = transID;
            }
        })

        // setTimeout(() => {
        //     CheckInvoice(transID).then(done);
        // }, 100000);

    })
})



