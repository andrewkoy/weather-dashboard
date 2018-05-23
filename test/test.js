const should = require('chai').should();
const expect  = require('chai').expect;
const supertest = require('supertest');
const api = supertest('http://localhost:3000');

// chai.use(require('chai-http'));

// GET - list all weather info
it('should return a 200 response for GET', function(done) {
	api.get('/')
	.set('Accept','text/html')
	.expect(200,done);
})

it('should return a 200 response for GET in json', function(done) {
	api.get('/json')
	.set('Accept','application/json')
	.expect(200)
	.end(function(err, res) {
		expect(res.body).to.have.property("weathercel");
		expect(res.body.weathercel).to.not.equal(null);
		done();
	});
})

