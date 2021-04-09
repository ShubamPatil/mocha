const chai = require('chai');
chai.use(require('chai-http'));
const { expect } = chai;

const { spawn } = require('child_process');
const startDatetime = new Date();
let TransID;

startSimulator();

function startSimulator() {
    return new Promise((resolve) => {
        const child = spawn('bash', ['start-simulator.sh']);

        child.stdout.on('data', (chunk) => {
            chunk = chunk.toString();
            console.log(`sim says: ${chunk}`);
            if (chunk.includes("Waiting for Remote Start for Testcharge001's Connector 1")) {
                triggerRemoteStart();
            }

            if (chunk.includes("transactionId")) {
                TransID = chunk.split("transactionId:")[1].split(",")[0];
            }

            if(chunk.includes("Waiting for Remote Stop for Testcharge001's Connector 1")){
                triggerRemoteStop(TransID);
            }


            if (chunk.includes("Stopped charging for Testcharge001's connector 1")) {
                const endDatetime = new Date();
                checkInvoiceGenerated(startDatetime, endDatetime);
                resolve();
            };
        })

        child.stderr.on('data', (message) => {
            console.log(`sim err: ${message}`)
        })

    })
}


function triggerRemoteStart() {
    return chai.request('https://testcms1.numocity.com:9091/')
        .post('api/v2/ocpp/remotetransaction/start/Testcharge001').send({
            "connectorId": 1,
            "idTag": "RFSH001"
        })
        .then((res) => {
            expect(res.body).to.not.be.empty;
            expect(res).to.have.status(200);
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


function checkInvoiceGenerated(startDatetime, endDatetime) {
    return chai.request('https://testcms1.numocity.com:4003/')
        .get('transaction/get/v1?fromDate=Thu%20Apr%2001%202021%2001:01:01%20GMT+0530%20(India%20Standard%20Time)&toDate=Thu%20Apr%2001%202021%2023:59:59%20GMT+0530%20(India%20Standard%20Time)')
        .set('content-type', 'application/json')
        .end((err, res) => {
            expect(err).to.be.null;
            expect(res).to.have.status(200);
            console.log(`got ${res.body.Document.length} total sessions`);
            const todaysSession = res.body.Document.filter((session) => {
                endDatetime = new Date();
                return endDatetime > startDatetime && session.CPID.startsWith('Testcharge001');
            });
            console.log(`${todaysSession.length} of them are for Testcharge001`);
            console.log(`Recent Transaction ID : ${todaysSession[0].TransactionID}`);
            spawn('bash', ['stop-simulator.sh']);

        })

}

