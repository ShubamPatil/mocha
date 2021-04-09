const chai = require('chai');
chai.use(require('chai-http'));
const { expect } = chai;

module.exports.triggerRemoteStop = function (transID) {
    describe('self-Remote-start-for-remote-stop', () => {
        it('Remote start', () => {

            return chai.request('https://testcms1.numocity.com:9091/')
                .get(`api/v2/ocpp/remotetransaction/stop/Testcharge001/${transID}`)
                .then((res) => {
                    expect(res.body).to.not.be.empty;
                    expect(res).to.have.status(200);
                })
        })
    })
}
