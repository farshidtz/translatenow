/* Wikipedia Controller */
app.wikipediaCtrl = function($scope, $http)
{
  $http.GetOrJsonp = ionic.Platform.isWebView()? $http.get : $http.jsonp;

  $scope.getWikiList = function(text){
    console.log(text);
    var url = "https://"+localStorage['lang-from']+".wikipedia.org/w/api.php?action=opensearch&redirects=resolve&limit=10&search="+text;
    $http.GetOrJsonp(urlFormat(url), {timeout: $scope.canceler.promise, cache: true}).
    success(function(result, status, headers, config) {
      if(result[1].length == 0){
        $scope.wait.done("getWikiList");
        return;
      }
      $scope.getProperties(result[1], result[2]);
    }).
    error(function(data, status, headers, config) {
      $scope.showError(status, data);
    });

  }

  $scope.getProperties = function(titles, snippets){
    var pending = titles.length;
    $scope.wait.add(pending-1); // already have one in queue for the parent function

    function seq(i){
      var url = "https://"+localStorage['lang-from']+".wikipedia.org/w/api.php?action=query&prop=pageterms|pageimages|links|categories&format=json&pithumbsize="+ListThumbSize+"&pllimit=max&titles="+titles[i];
      $http.GetOrJsonp(urlFormat(url), {timeout: $scope.canceler.promise, cache: true}).
      success(function(res, status, headers, config) {
        var page = first(res.query.pages)
        // Get page description
        var descr = "no description";
        if(page.hasOwnProperty('terms') && page.terms.hasOwnProperty('description') && page.terms.description.length>0){
          descr = page.terms.description[0];
        }
        // Check if this is a Wikipedia disambiguation page
        if(isDisambiguous(page)){
          $scope.wait.done("getProperties"); // no need to wait for this title
          $scope.disambiguate(titles[i], page.links, i);
        } else {
          // Get thumbnail
          var thumb = DefaultThumb;
          if(page.hasOwnProperty('thumbnail')){
            thumb = page.thumbnail.source;
          }

          $scope.list[titles[i]] = {
            rank: i,
            title: titles[i],
            descr: descr,
            img: thumb,
            trans: []
          };

          $scope.getTranslations(titles[i]);
        }

        pending--;
        if(pending>0){
          seq(i+1);
        }
      }).
      error(function(data, status, headers, config) {
        $scope.showError(status, data);
      });

    };
    seq(0);
  }

  $scope.disambiguate = function(ambiguousTitle, links, rank){
    links.forEach(function(link, i){
      var title = link['title'];

      // var re = new RegExp("^"+ambiguousTitle+" [(][a-z|A-Z]+[)]$");
      // var matched = re.test(title);
      // if(matched){
        $scope.wait.add(1);
        var url = "https://"+localStorage['lang-from']+".wikipedia.org/w/api.php?action=query&redirects&prop=pageterms|pageimages|categories&format=json&pithumbsize="+ListThumbSize+"&titles="+title;
        $http.GetOrJsonp(urlFormat(url), {timeout: $scope.canceler.promise, cache: true}).
        success(function(res, status, headers, config) {
          var page = first(res.query.pages)

          if(isDisambiguous(page)){
            // don't dig any further
            $scope.wait.done("disambiguate");
            return;
          }

          // Get page description
          var descr = "no description";
          if(page.hasOwnProperty('terms') && page.terms.hasOwnProperty('description') && page.terms.description.length>0){
            descr = page.terms.description[0];
          }
          // Get thumbnail
          var thumb = DefaultThumb;
          if(page.hasOwnProperty('thumbnail')){
            thumb = page.thumbnail.source;
          }

          $scope.list[title] = {
            rank: rank,
            title: title,
            descr: descr,
            img: thumb,
            trans: [],
          } ;

          $scope.getTranslations(title);
        }).
        error(function(data, status, headers, config) {
          $scope.showError(status, data);
        });

      // }
    });
  }

  $scope.getTranslations = function(title) {
    var url = "https://"+localStorage['lang-from']+".wikipedia.org/w/api.php?action=query&prop=langlinks&lllang="+localStorage['lang-to']+"&format=json&titles="+title;
    $http.GetOrJsonp(urlFormat(url), {timeout: $scope.canceler.promise, cache: true}).
    success(function(res, status, headers, config) {
      var page = first(res.query.pages);
      var word = "";
      if(page.hasOwnProperty('langlinks') && page.langlinks.length>0 && page.langlinks[0].hasOwnProperty('*')){
        word = page.langlinks[0]['*'];
      }

      if(word != ""){
        if($scope.list.hasOwnProperty(title)){
          //console.log("getTranslations",  title, ":::", word);
          if($scope.list[title].trans.indexOf(word) > -1){
            // word is already there
            $scope.wait.done("getTranslations");
            return;
          }
          $scope.list[title].trans.push(word);
          $scope.getSynonyms(title, word);
        }
      } else {

        // No match in the destination language
        if($scope.list.hasOwnProperty(title)){
          //delete $scope.list[title];
          $scope.list[title].trans.push("No match in "+LANGUAGES[localStorage['lang-to']]+" Wikipedia");
          $scope.list[title].type = 'nomatch';
          $scope.list[title].rank += 100;
        }
        $scope.wait.done("getTranslations");
        //$scope.getBingTranslation(title, word);
      }
    }).
    error(function(data, status, headers, config) {
      $scope.showError(status, data);
    });

  }


  $scope.getSynonyms = function(title, word){
    var url = "https://"+localStorage['lang-to']+".wikipedia.org/w/api.php?action=query&list=backlinks&format=json&blfilterredir=redirects&bllimit=2&bltitle="+word;
    $http.GetOrJsonp(urlFormat(url), {timeout: $scope.canceler.promise, cache: true}).
    success(function(res, status, headers, config) {
      res.query.backlinks.forEach(function(backlink){
        if($scope.list.hasOwnProperty(title)){
          //console.log("getSynonyms", title, ":::", word, ":::", backlink.title);
          $scope.list[title].trans.push(backlink.title);
        }
      });
      $scope.wait.done("getSynonyms");
      //$scope.getBingTranslation(title, word);
    }).
    error(function(data, status, headers, config) {
      $scope.showError(status, data);
    });

  }

  var isDisambiguous = function(page) {
    if(!page.hasOwnProperty('categories')){
      return false;
    }
    var category = DISAMBIGUATIONS[localStorage['lang-from']];
    // Check the categories
    for(var i=0; i<page.categories.length; i++){
      if(page.categories[i].title === category){
        return true;
      }
    }
    return false;
  }

}

// Encode url and add callback param for jsonp
var urlFormat = function(url){
  if(!ionic.Platform.isWebView()){
    return encodeURI(url+"&callback=JSON_CALLBACK");
  } else {
    return encodeURI(url);
  }
}

// Returns value of the first object
var first = function(objs){
  var value;
  $.each(objs, function(k,v){
    value = v;
    return false;
  });
  return value;
}
