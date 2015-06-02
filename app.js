var express = require('express'),
    sass = require('node-sass'),
    path = require('path'),
    favicon = require('serve-favicon'),
    logger = require('morgan'),
    bodyParser = require('body-parser'),
    routes = require('./routes/index'),
    wordnet = require('wordnet'),
    NodeCache = require( "node-cache" )
    chain = require('./chain');

var app = express();


// cache stuff
var appCache = new NodeCache();

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'jade');

// uncomment after placing your favicon in /public
//app.use(favicon(__dirname + '/public/favicon.ico'));
app.use(logger('dev'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));

app.use(
  sass.middleware({
    src: __dirname + '/public', //where the sass files are 
    dest: __dirname + '/public', //where css should go
    debug: true // obvious
  })
);

app.use(express.static(path.join(__dirname, 'public')));

app.get('/', function(req, res) {
  var err;
  if (req.query.err instanceof Array) err = req.query.err[req.query.err.length - 1];
  else err = req.query.err;
  res.render('index', {
    errmsg: err
  });
});

app.get('/search', function(req, res) {

  var everypath = [];

  if (req.query.oldpath) {
    if (req.query.oldpath instanceof Array) {
      for (var i = 0; i < req.query.oldpath.length; i++) {
        everypath.push(appCache.get(req.query.oldpath[i]));
      } 
    } else {
      everypath.push(appCache.get(req.query.oldpath));
    }
    var nodelimit = getRandRange(3,20);
    var synonymlevel = getRandRange(3,20);
    
  } else {
    var nodelimit = req.query.nodelimit;
    var synonymlevel = req.query.synonymlevel;
  }

  var cacheString = req.query.start + nodelimit + req.query.end  + synonymlevel;

  var cachedSearch = appCache.get(cacheString);
  
  if (cachedSearch == undefined) {
    chain.makeChain(req.query.start, req.query.end, nodelimit, synonymlevel, function(err, data) {
      if (err) {
        appCache.set(cacheString, {
          err: err
        });
        if (req.get('Referrer').indexOf('?') === -1){
          res.redirect(req.get('Referrer')+'?err='+err);
        } else {
          res.redirect(req.get('Referrer')+'&err='+err); 
        }
      } else {
        var newpath = {
          path: data.path,
          nodelimit: nodelimit,
          synonymlevel: synonymlevel,
          start: data.path[0].node,
          end: data.path[data.path.length - 1].node,
          cname: cacheString
        };
        appCache.set( cacheString, newpath);
        res.render('search', {
          data: everypath.concat(newpath),
          errmsg: req.query.err
        });
      }
    });
  } else if (cachedSearch.err != undefined) {
    if (req.get('Referrer').indexOf('?') === -1){
      res.redirect(req.get('Referrer') + '?err=' + err);
    } else {
      res.redirect(req.get('Referrer') + '&err=' + err); 
    }
  }
  else {
    res.render('search', {
       data: everypath.concat(cachedSearch),
       errmsg: req.query.err
    });
  }
});

app.get('/search/modified', function(req, res) {
  var cacheString = req.query.start + req.query.nodelimit + req.query.end  + req.query.synonymlevel;
  var cacheSearch = appCache.get(cacheString);
  if (cacheSearch == undefined) {
    chain.makeChain(req.query.start, req.query.end, req.query.nodelimit, req.query.synonymlevel, function(err, data) {
      if (err) {
        appCache.set(cacheString, {
          err: err
        });
        res.json({
          errormsg: err
        });
      } else {
        appCache.set(cacheString, {
          data: data,
          nodelimit: req.query.nodelimit,
          synonymlevel: req.query.synonymlevel
        });
        res.json({
          path: data.path
        });
      }
    });
  } else if (cacheSearch.err != undefined) {
    res.json({
      errormsg: cacheSearch.err
    });
  } else {
    res.json({
      path: cacheSearch.data.path
    });
  }
});

app.get('/new', function(req, res) {
  var allPaths = [];
  if (req.query.oldpath instanceof Array) {
    for (var i = 0; i < req.query.oldpath.length; i++) {
      allPaths.push(appCache.get(req.query.oldpath[i]));
    } 
  } else {
    allPaths.push(appCache.get(req.query.oldpath));
  }
  var nodelimit = getRandRange(3,20);
  var synonymlevel = getRandRange(3,20);

  var cacheString = req.query.start + nodelimit + req.query.end  + synonymlevel;
  var cachedSearch = appCache.get(cacheString);

  if (cachedSearch == undefined) {
    chain.makeChain(req.query.start, req.query.end, nodelimit, synonymlevel, function(err, data) {
      if (err) {
        console.log(err);
        appCache.set(cacheString, {
          err: err
        });
        res.redirect('back');
      } else {
        var result = {
          path: data.path,
          nodelimit: nodelimit,
          synonymlevel: synonymlevel,
          start: data.path[0].node,
          end: data.path[data.path.length - 1].node,
          cname: cacheString
        };
        appCache.set( cacheString, result);
        allPaths.push(result);
        res.render('search', {
          data: allPaths
        });
      }
    });
  } else if (cachedSearch.err != undefined) {
    res.render('index', {
      errormsg: cachedSearch.err
    });
  }
  else {
    console.log("cached")
    allPaths.push(cachedSearch);
      res.render('search', {
        data: allPaths
    });
  }
});

var getRandRange = function(min, max) {
  return Math.floor(Math.random() * (max -min + 1)) + min;
}

function objToString (obj) {
    var str = '';
    for (var p in obj) {
        if (obj.hasOwnProperty(p)) {
            str += p + '::' + obj[p] + '\n';
        }
    }
    return str;
}


var server = app.listen(3000, function() {
    var host = server.address().host;
    var port = server.address().port;
    console.log('Example app listening at http://%s:%s', host, port);
});
    
// error handlers

// development error handler
// will print stacktrace
if (app.get('env') === 'development') {
  app.use(function(err, req, res, next) {
    res.status(err.status || 500);
    res.render('error', {
      message: err.message,
      error: err
    });
  });
}

// production error handler
// no stacktraces leaked to user
app.use(function(err, req, res, next) {
  res.status(err.status || 500);
  res.render('error', {
    message: err.message,
    error: {}
  });
});


module.exports = app;
