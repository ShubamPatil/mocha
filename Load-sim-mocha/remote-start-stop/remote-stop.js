const chai = require('chai');
chai.use(require('chai-http'));
const { expect } = chai;
var ID = require('../RemoteStartStop');
var transID;

module.exports.triggerRemoteStop = function () {
    console.log("remote stop");
    // console.log(ID);
    transID = ID.transID;
    // console.log("last "+transID);

    
    return chai.request('https://testcms1.numocity.com:9091/')
        .get(`api/v2/ocpp/remotetransaction/stop/Testcharge001/${transID}`)
        .then((res) => {
            expect(res.body).to.not.be.empty;
            expect(res).to.have.status(200);
        })
}
