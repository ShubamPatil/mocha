const chai = require('chai');
chai.use(require('chai-http'));
const { expect } = require("chai");
const d = new Date();
let a = d.toDateString(), parts = a.split(" ");
const date = parts[2], day = parts[0], month = parts[1], year = parts[3];



module.exports.checkInvoiceGenerated = function (transID) {
    return chai.request('https://testcms1.numocity.com:4003/')
        .get(`transaction/get/v1?fromDate=${day}%20${month}%20${date}%20${year}%2001:01:01%20GMT+0530%20(India%20Standard%20Time)&toDate=${day}%20${month}%20${date}%20${year}%2023:59:59%20GMT+0530%20(India%20Standard%20Time)`)
        .set('Content-Type', 'application/json')
        .then((res) => {
            expect(res.statusCode).to.equal(200);
            expect(res.body).to.not.be.empty;
            const AcTransID = (res.body.Document[0].TransactionID).toString();
            expect(transID).to.equal(AcTransID);

            console.log(`got ${res.body.Document.length} total sessions`);

        });
}


