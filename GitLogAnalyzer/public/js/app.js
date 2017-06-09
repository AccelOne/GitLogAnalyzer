
var App = (function() {

  function _getServer(extraUrl){
    let url = window.location.protocol + "//" + window.location.host;
    let serverAddress = 'http://162.243.199.173:5000';
    if(url.search("localhost") == -1) {
      url = serverAddress;
    }
    if(extraUrl != null) {
      url = url + extraUrl;
    }
    return url;
  }

  function _getAllCommits() {
    var repo = $("#repo")[0].value;
    var usr = $("#usr")[0].value;
    var pwd = $("#pwd")[0].value;
    $.ajax({
       url: _getServer() + '/commits',
       type: 'POST',
       data: JSON.stringify({repo : repo, usr : usr, pwd : pwd}),
       contentType: "application/json",
       dataType: "json",
       success: function(resp) {
         $("#htmlResult").html(JSON.stringify(resp));
       },
       error: function (xhr, ajaxOptions, thrownError) {
         console.log(xhr.responseText);
       }
     });
  }

  function _getCommitById() {
    var repo = $("#repo")[0].value;
    var usr = $("#usr")[0].value;
    var pwd = $("#pwd")[0].value;
    var sha = $("#sha")[0].value;
    $.ajax({
       url: _getServer() + '/getByIdCommits',
       type: 'POST',
       data: JSON.stringify({repo : repo, usr : usr, pwd : pwd, sha : sha}),
       contentType: "application/json",
       dataType: "json",
       success: function(resp) {
         $("#htmlResult").html(resp);
       },
       error: function (xhr, ajaxOptions, thrownError) {
         console.log(xhr.responseText);
       }
     });
  }

  return {
    getAllCommits : _getAllCommits,
    getCommitById : _getCommitById
  }
}());
