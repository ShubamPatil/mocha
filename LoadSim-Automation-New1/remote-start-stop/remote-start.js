const chai = require('chai');
chai.use(require('chai-http'));
const { expect } = chai;

module.exports.triggerRemoteStart = function () {
    // describe('Remote-start-for-self-remote-stop', () => {
    //     it('Remote start', (done) => {
            return chai.request('https://testcms1.numocity.com:9091/')
                .post('api/v2/ocpp/remotetransaction/start/Testcharge001').send({
                    "connectorId": 1,
                    "idTag": "RFSH001"
                })
                .then((res) => {
                    expect(res.body).to.not.be.empty;
                    expect(res).to.have.status(200);
                    // done();
                })
        // })
    // })
}
