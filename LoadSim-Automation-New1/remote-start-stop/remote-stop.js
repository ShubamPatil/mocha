function triggerRemoteStop(TransID){
    return chai.request('https://testcms1.numocity.com:9091/')
    .get(`api/v2/ocpp/remotetransaction/stop/Testcharge001/${TransID}`)
    .end((err,res) => {
        expect(err).to.be.null;
        expect(res).to.have.status(200);
    })
}
