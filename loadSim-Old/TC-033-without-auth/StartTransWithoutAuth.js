const chai = require('chai');
chai.use(require('chai-http'));
const { expect } = chai;

const { spawn } = require('child_process');
const startDatetime = new Date();

startSimulator();

function startSimulator() {
    return new Promise((resolve) => {
        const child = spawn('bash', ['start-simulator.sh']);

        child.stdout.on('data', (chunk) => {
            chunk = chunk.toString();
            console.log(`sim says: ${chunk}`);
            if (chunk.includes("Testcharge001's Connector 1 is paused")) {
                triggerRemoteStart();
            }

            if (chunk.includes("Stopped charging for Testcharge001's connector 1")) {
                const endDatetime = new Date(); //current time
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

function checkInvoiceGenerated(startDatetime, endDatetime) {
    return chai.request('https://testcms1.numocity.com:4003/')
        .get('transaction/get/v1?fromDate=Thu%20Apr%2001%202021%2001:01:01%20GMT+0530%20(India%20Standard%20Time)&toDate=Thu%20Apr%2001%202021%2023:59:59%20GMT+0530%20(India%20Standard%20Time)')
        .set('content-type', 'application/json')
        .end((err, res) => {
            expect(err).to.be.null;
            expect(res).to.have.status(200);
            console.log(`got ${res.body.Document.length} total sessions`);
            const todaysSession = res.body.Document.filter((session) => {
                endDatetime = new Date(session.SessionEnd);
                console.log(endDatetime);
                // console.log(session.SessionEnd);
                // console.log(startDatetime);
                return endDatetime > startDatetime && session.CPID.startsWith('Testcharge001');
            });
            console.log(`${todaysSession.length} of them are from today for Testcharge001`);

            //getting the recent transaction and verifying the calculation with TotalAmount
            console.log(`Recent Transaction ID : ${todaysSession[0].TransactionID}`);
            var CalAmnt = Math.floor(((todaysSession[0].TotalUnits * todaysSession[0].Rate) + ((todaysSession[0].TotalUnits * todaysSession[0].Rate) * 0.05)) + todaysSession[0].surchargeRate);
            var TotalAmt = todaysSession[0].TotalAmount;
            expect(CalAmnt).to.be.eq(TotalAmt);

            console.log(`Calculated amount ${CalAmnt}`);
            console.log(`Total amount ${TotalAmt}`);
        })

}
