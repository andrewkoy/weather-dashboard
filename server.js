const express = require('express');
const bodyParser = require('body-parser');
const request = require('request');
const where = require('node-where');
const requestp = require('request-promise');
const app = express();
const fahrenheitToCelsius = require('fahrenheit-to-celsius');
const mcache = require('memory-cache');


const weatherText = "";
const acweatherText = "";
const city = "";
const latlng = "";
const apiKey = 'a7f69af1a592ac491ff7eef29b856ede';
const googlekey = 'AIzaSyCWaMKWtDD49NLKCCmnylLP9s4fUdI8iuw';



app.use(express.static('public'));
app.use(bodyParser.urlencoded({ extended: true }));
app.set('view engine', 'ejs')



app.get('/', function (req, res) {
    getweather (req, res);
  })

app.get('/json', function (req, res) {
    getweatherinjson (req, res);
  })

app.post('/', function (req, res) {
    postweather (req, res);
  })
  

app.listen(3000, function () { console.log('Listening on port 3000')})



function postweather(req,res){
    let city = req.body.city !== undefined ? req.body.city : null ;     
    var accity;
    //console.log(req);
    if (city){
        let url = `http://api.openweathermap.org/data/2.5/weather?q=${city}&units=imperial&appid=${apiKey}`;

        request(url, function (err, response, body) {
            let key = city;
            if (err || response.statusCode !== 200) { getcache(key);}
            else{                 
                 let weather = JSON.parse(body);  
                 let weatherceltext = `${fahrenheitToCelsius(weather.main.temp).toFixed(0)} °`;      
                 let weathercitytext = `${weather.name}`;
                 
                 //console.log(weather);
                 let latlng = (-weather.coord.lat).toString() + "," + (weather.coord.lon-180).toString();  
                 //console.log(latlng);

                 let accityurl =  `https://maps.googleapis.com/maps/api/geocode/json?latlng=${latlng}&key=${googlekey}`;
                  request(accityurl, function (err, response, body) {  
                      //console.log(response.statusCode);                 
                      if (err || response.statusCode !== 200) { res.render('index', {weathercel: weatherceltext, weathercity: weathercitytext, error: null, acweathercel: 'NIL', acweathercity: 'Not avalable'}) }
                      else{                         
                         let accityresp = JSON.parse(body);
                         if (accityresp !== undefined) {
                            if(accityresp.status == "ZERO_RESULTS")  { res.render('index', {weathercel: weatherceltext, weathercity: weathercitytext, error: null, acweathercel: 'NIL', acweathercity: 'Not avalable'}) }
                            for (i=0;i<accityresp.results.length;i++){
                              if(accityresp.results[i].types[0] ==  "country"){
                                let accity = accityresp.results[i].formatted_address;
                                //console.log(accity);

                                let acurl = `http://api.openweathermap.org/data/2.5/weather?q=${accity}&units=imperial&appid=${apiKey}`;  
                                request(acurl, function (err, response, body) {
                                     if (err || response.statusCode !== 200)  { res.render('index', {weathercel: weatherceltext, weathercity: weathercitytext, error: null, acweathercel: 'NIL', acweathercity: 'Not avalable'}) }
                                     else{
                                        let acweather = JSON.parse(body); 
                                        //let acweatherText = `It's ${fahrenheitToCelsius(acweather.main.temp).toFixed(1)} Celsius in ${acweather.name}!`;
                                        let acweatherceltext = `${fahrenheitToCelsius(acweather.main.temp).toFixed(0)} °`;      
                                        let acweathercitytext = `${acweather.name}`;
                                        //console.log(acweather);      
                                        if(weatherText == undefined && acweatherText == undefined){  getcache(key); }
                                        else {
                                            mcache.put(key,weatherceltext + "|" + weathercitytext + "|" + acweatherceltext + "|" + acweathercitytext);
                                            res.render('index', {weathercel: weatherceltext, weathercity: weathercitytext, error: null, acweathercel: acweatherceltext, acweathercity: acweathercitytext});
                                        }
                                     }
                               })
                              }
                            }

                          
                        }
                      }
                  })
              }
            })
      }
    }

function getweather(req, res)
{  
  
  let key = req.connection.remoteAddress;
  requestp(
   {
    "method":"GET", 
    "uri": "http://gd.geobytes.com/GetCityDetails",
    "json": true,
    }).then(function(value) { 
          where.is(value.geobytesremoteip, function(err, result) 
          {
            if (result){                  
                let latlng = (-result.get('lat')).toString() + "," + (result.get('lng')-180).toString();   
                //console.log(latlng);
                let city = req.body.city  !== undefined ? req.body.city : result.get('city');    
                let key = city;      
                var accity; var weather; var acweather;
                //let accityurl =  `http://maps.googleapis.com/maps/api/geocode/json?latlng=${latlng}`;
                let accityurl =  `https://maps.googleapis.com/maps/api/geocode/json?latlng=${latlng}&key=${googlekey}`;

                request(accityurl, function (err, response, body) {
                    if (err || response.statusCode !== 200) {}
                    else{
                       let accityresp = JSON.parse(body);
                       if (accityresp !== undefined) {
                          let accity = accityresp.results[1].formatted_address;
                          //console.log(accity);

                          let url = `http://api.openweathermap.org/data/2.5/weather?q=${city}&units=imperial&appid=${apiKey}`;
                          request(url, function (err, response, body) {
                              if (err || response.statusCode !== 200) {}
                              else{
                                 let weather = JSON.parse(body);  
                                 let weatherceltext = `${fahrenheitToCelsius(weather.main.temp).toFixed(0)} °`;      
                                 let weathercitytext = `${weather.name}`;
                                 //console.log(weather);        


                                 let acurl = `http://api.openweathermap.org/data/2.5/weather?q=${accity}&units=imperial&appid=${apiKey}`;  
                                 request(acurl, function (err, response, body) {
                                     if (err || response.statusCode !== 200) {}
                                     else{
                                        let acweather = JSON.parse(body); 
                                        //let acweatherText = `It's ${fahrenheitToCelsius(acweather.main.temp).toFixed(1)} Celsius in ${acweather.name}!`;
                                        let acweatherceltext = `${fahrenheitToCelsius(acweather.main.temp).toFixed(0)} °`;      
                                        let acweathercitytext = `${acweather.name}`;
                                        //console.log(acweatherText);      


                                        if(weatherText == undefined && acweatherText == undefined){
                                            //res.render('index', {weather: null, error: 'Error, please try again', acweather:null});
                                            res.render('index', {weathercel: null, weathercity: null, error: 'Error, please try again', acweathercel: null, acweathercity: null});
                                        }
                                        else {
                                            //let weatherText = `It's ${weather.main.temp} degrees in ${weather.name}!`;
                                            //let acweatherText = `It's ${acweather.main.temp} degrees in ${acweather.name}!`;
                                            //res.render('index', {weather: weatherText, error: null,acweather:acweatherText});
                                            mcache.put(key,weatherceltext + "|" + weathercitytext + "|" + acweatherceltext + "|" + acweathercitytext);
                                            res.render('index', {weathercel: weatherceltext, weathercity: weathercitytext, error: null, acweathercel: acweatherceltext, acweathercity: acweathercitytext});
                                        }
                                     }
                                 })  
                              }
                          })
                       }
                    }
                })
            } 
    });
  });  
}

function getweatherinjson(req, res)
{  
  
  let key = req.connection.remoteAddress;
  requestp(
   {
    "method":"GET", 
    "uri": "http://gd.geobytes.com/GetCityDetails",
    "json": true,
    }).then(function(value) { 
          where.is(value.geobytesremoteip, function(err, result) 
          {
            if (result){                  
                let latlng = (-result.get('lat')).toString() + "," + (result.get('lng')-180).toString();   
                //console.log(latlng);
                let city = req.body.city  !== undefined ? req.body.city : result.get('city');    
                let key = city;      
                var accity; var weather; var acweather;
                //let accityurl =  `http://maps.googleapis.com/maps/api/geocode/json?latlng=${latlng}`;
                let accityurl =  `https://maps.googleapis.com/maps/api/geocode/json?latlng=${latlng}&key=${googlekey}`;

                request(accityurl, function (err, response, body) {
                    if (err || response.statusCode !== 200) {}
                    else{
                       let accityresp = JSON.parse(body);
                       if (accityresp !== undefined) {
                          let accity = accityresp.results[1].formatted_address;
                          //console.log(accity);

                          let url = `http://api.openweathermap.org/data/2.5/weather?q=${city}&units=imperial&appid=${apiKey}`;
                          request(url, function (err, response, body) {
                              if (err || response.statusCode !== 200) {}
                              else{
                                 let weather = JSON.parse(body);  
                                 let weatherceltext = `${fahrenheitToCelsius(weather.main.temp).toFixed(0)} °`;      
                                 let weathercitytext = `${weather.name}`;
                                 //console.log(weather);        


                                 let acurl = `http://api.openweathermap.org/data/2.5/weather?q=${accity}&units=imperial&appid=${apiKey}`;  
                                 request(acurl, function (err, response, body) {
                                     if (err || response.statusCode !== 200) {}
                                     else{
                                        let acweather = JSON.parse(body); 
                                        //let acweatherText = `It's ${fahrenheitToCelsius(acweather.main.temp).toFixed(1)} Celsius in ${acweather.name}!`;
                                        let acweatherceltext = `${fahrenheitToCelsius(acweather.main.temp).toFixed(0)} °`;      
                                        let acweathercitytext = `${acweather.name}`;
                                        //console.log(acweatherText);      


                                        if(weatherText == undefined && acweatherText == undefined){
                                            //res.render('index', {weather: null, error: 'Error, please try again', acweather:null});
                                            res.json({weathercel: null, weathercity: null, error: 'Error, please try again', acweathercel: null, acweathercity: null});
                                        }
                                        else {
                                            //let weatherText = `It's ${weather.main.temp} degrees in ${weather.name}!`;
                                            //let acweatherText = `It's ${acweather.main.temp} degrees in ${acweather.name}!`;
                                            //res.render('index', {weather: weatherText, error: null,acweather:acweatherText});
                                            mcache.put(key,weatherceltext + "|" + weathercitytext + "|" + acweatherceltext + "|" + acweathercitytext);
                                            res.json({weathercel: weatherceltext, weathercity: weathercitytext, error: null, acweathercel: acweatherceltext, acweathercity: acweathercitytext});
                                        }
                                     }
                                 })  
                              }
                          })
                       }
                    }
                })
            } 
    });
  });  
}


function getcache(key){
    let cachebody = mcache.get(key);
      if(cachebody){
        var arr = cachebody.split('|');
        console.log("fast ah");
        let weatherceltext = arr[0];
        let weathercitytext = arr[1];
        let acweatherceltext = arr[2];
        let acweathercitytext = arr[3];
        res.render('index', {weathercel: weatherceltext, weathercity: weathercitytext, error: null, acweathercel: acweatherceltext, acweathercity: acweathercitytext});
      }else{
        res.render('index', {weathercel: null, weathercity: null, error: 'Error, please try again', acweathercel: null, acweathercity: null});
      }
    }


  /*
    if (result) {
    console.log('City: ' + result.get('city'));
    console.log('State / Region: ' + result.get('region'));
    console.log('State / Region Code: ' + result.get('regionCode'));
    console.log('Zip: ' + result.get('postalCode'));
    console.log('Country: ' + result.get('country'));
    console.log('Country Code: ' + result.get('countryCode'));
    console.log('Lat: ' + result.get('lat'));
    console.log('Lng: ' + result.get('lng'));
  }
  */


