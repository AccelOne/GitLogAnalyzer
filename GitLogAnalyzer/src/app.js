import http from 'http';
import express from 'express';
import bodyParser from 'body-parser';
import path from 'path';
import fs from 'fs';
import util from 'util';
import request from 'request';
import querystring from 'querystring';
//import routes from './routes';
import config from './config';
import auth from 'http-auth'

let log_file = fs.createWriteStream('log.txt', {flags : 'w'});
let log_stdout = process.stdout;

const app = express();
app.server = http.createServer(app);

app.use(express.static(path.join(__dirname, '/../public')));
app.set('views', path.join(__dirname, '/../public'));
app.engine('html', require('ejs').renderFile);
app.set('view engine', 'html');

// middleware
app.use(bodyParser.json({
  limit : config.app.bodyLimit
}));

// CORS Interceptors
if (config.cors && config.cors === "enabled") {
    app.all('*', function(req, res, next) {
        res.header('Access-Control-Allow-Origin', '*');
        res.header('Access-Control-Allow-Methods', 'GET,PUT,POST,DELETE');
        res.header('Access-Control-Allow-Headers', 'Content-Type');
        next();
    });
}

app.get('/index', (req, res) => {
  console.log(req.user);
  res.render('index.html');
});

app.post('/commits', (req, res) => {
  let repo = req.body.repo;
  let user = req.body.usr;
  let pass = req.body.pwd;
  let url = 'https://api.github.com/repos/'+ user + '/'+ repo + '/commits';
  let options = {
    url: url,
    auth: {
        'user': user,
        'pass': pass
    },
    headers: {'user-agent': 'node.js'}
  };
  request(options, (error, response, body) => {
    if (error) {
      console.log(error);
      res.json(error);
    }
    let result = JSON.parse(body)
    var promises = [];
    for(let i=0; i < result.length; i++) {
      promises.push(new Promise((resolve, reject) => {
        options.url = 'https://api.github.com/repos/'+ user + '/'+ repo + '/commits/'+result[i].sha;
        request(options, (intError, intResponse, intBody) => {
          if (intError) {
            reject(intError);
          }
          let intResult = JSON.parse(intBody)
          resolve({
            message : intResult.commit.message,
            stats : intResult.stats
          });
        });
      }));
      // get all results, to return all the data at the same time
    }
    Promise.all(promises).then(
      function(allData) {
        console.log(allData);
        //Fix o Bug cant
        //Cantidad lineas sum
        //Cantidad lineas borradas sum
        //agreg - borra .. dividis candidatad de bugs por lineas y multiplicar por mil
        let jsonResult = {
          messageAmount : 0,
          lineAdd : 0,
          lineRem : 0
        };
        for(let i = 0; i < allData.length; i++) {
          if((allData[i].message.indexOf("bug") != -1) || (allData[i].message.indexOf("bug")!= -1)) {
            jsonResult.messageAmount +=1;
          }
          jsonResult.lineAdd += allData[i].stats.additions;
          jsonResult.lineRem += allData[i].stats.deletions;
        }
        res.json(jsonResult);
      },
      function(err) {
        console.log(err);
        res.json({'error': err});
      }
    );
  });
});

app.post('/getByIdCommits', (req, res) => {
  let repo = req.body.repo;
  let user = req.body.usr;
  let pass = req.body.pwd;
  let sha = req.body.sha;
  let url = 'https://api.github.com/repos/'+ user + '/'+ repo + '/commits/1a6a70e48ec75061fba8bf1196a7e253d43fe985';
  let options = {
    url: url,
    auth: {
        'user': user,
        'pass': pass
    },
    headers: {'user-agent': 'node.js'}
  };
  //Fix o Bug cant
  //Cantidad lineas sum
  //Cantidad lineas borradas sum
  //agreg - borra .. dividis candidatad de bugs por lineas y multiplicar por mil
  request(options, (error, response, body) => {
    if (error) {
      console.log(error);
      res.json(error);
    }
    res.json(body);
  });
});

//app.use('/v1', routes);

app.all('*', (req, res) => res.render('error.html'));
app.server.listen(config.app.port, () => console.log('Server Started at ' + config.app.port));
