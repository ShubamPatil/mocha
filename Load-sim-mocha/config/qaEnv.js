const d = new Date();
    let a = d.toDateString(), parts = a.split(" ");
    const date = parts[2], day = parts[0], month = parts[1], year = parts[3];

export default {
    remoteStartbaseURL: 'https://testcms1.numocity.com:9091/',

    //Need to change the chargepoint ID at the end to trigger particular CP transctions
    remoteStartURIandCPID : 'api/v2/ocpp/remotetransaction/start/Testcharge001',

    //Base url of transactions api
    invoiceBaseURL: 'https://testcms1.numocity.com:4003/',
    
    Date : date,
    Day : day,
    Month : month,
    Year : year
}