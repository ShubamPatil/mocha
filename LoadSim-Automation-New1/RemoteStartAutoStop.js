const chai = require('chai');
chai.use(require('chai-http'));
const { expect } = chai;

const { spawn } = require('child_process');
CheckInvoice = require("./check-invoice").checkInvoiceGenerated;
var transID;
let flag = true;

const startDatetime = new Date();



function startSimulator() {
    return new Promise((resolve) => {
        const child = spawn('bash', ['TC-021-AutoStopForRemoteStart/start-simulator.sh']);

        child.stdout.on('data', (chunk) => {
            chunk = chunk.toString();
            console.log(`sim says: ${chunk}`);

            if (chunk.includes("Waiting for Remote Start")) {
                resolve();
            }

            if (chunk.includes("transactionId") && flag === true) {
                transID = chunk.split("transactionId:")[1].split(",")[0];
                flag = false;
            }
        })

        child.stderr.on('data', (message) => {
            console.log(`sim err: ${message}`)
        })

    })
}

function triggerRemoteStart() {
    describe('remote-start-which-stops-by-itself.js', () => {
        it('RFID-REMOTE-START', (done) => {
            startSimulator().then(() => {
                return chai.request('https://testcms1.numocity.com:9091/')
                    .post('api/v2/ocpp/remotetransaction/start/Testcharge001').send({
                        "connectorId": 1,
                        "idTag": "RFSH001"
                    })
                    .then((res) => {
                        expect(res.body).to.not.be.empty;
                        expect(res).to.have.status(200);
                        done();
                    })
            })           
        })
    })
}

triggerRemoteStart();

const endDatetime = new Date();
CheckInvoice(startDatetime, endDatetime, transID);


