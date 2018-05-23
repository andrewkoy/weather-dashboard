var expect  = require('chai').expect;
var request = require('request');

it('Main page response', function(done) {
    request('http://localhost:3000' , function(error, response, body) {
        expect(res.statusCode).to.equal(200);  
        done();
    });
});