const chai = require('chai');
chai.use(require('chai-http'));
const { expect } = require("chai");
const d = new Date();
let a = d.toDateString(), parts = a.split(" ");
const date = parts[2], day = parts[0], month = parts[1], year = parts[3];


module.exports.checkInvoiceGenerated = function (transID) {
    describe('checking-invoice-for-current-time-after-the-self-remote-stop', () => {
        it('check invoice', () => {
                return chai.request('https://testcms1.numocity.com:4003/')
                    .get(`transaction/get/v1?fromDate=${day}%20${month}%20${date}%20${year}%2001:01:01%20GMT+0530%20(India%20Standard%20Time)&toDate=${day}%20${month}%20${date}%20${year}%2023:59:59%20GMT+0530%20(India%20Standard%20Time)`)
                    .set('content-type', 'application/json')
                    .then((res) => {
                        expect(res).to.have.status(200);
                        console.log(`got ${res.body.Document.length} total sessions`);
                        const todaysSession = res.body.Document.filter((session) => {
                            return session.CPID.startsWith('Testcharge001');
                        });
                        console.log(`${todaysSession.length} of them are for Testcharge001`);
                        const ActTransID = (todaysSession[0].TransactionID).toString();
                    
                        console.log(transID);
                        console.log(`Recent Transaction ID : ${ActTransID}`);
                        expect(ActTransID).to.be.equal(transID);
                        
                        //spawn('bash', ['stop-simulator.sh']);
                    })
        })
    })

}

