$(function() {
  // Button will be disabled until we type anything inside the input field
  const source = document.getElementById('autoComplete');
  const inputHandler = function(e) {
    if(e.target.value==""){
      $('.movie-button').attr('disabled', true);
    }
    else{
      $('.movie-button').attr('disabled', false);
    }
  }
  source.addEventListener('input', inputHandler);

  $('.movie-button').on('click',function(){
     var title = $('.movie').val();
    if (title=="") {
      $('.results').css('display','none');
      $('.fail').css('display','block');
    }
    else{
      load_details(title);
    }
  });
});

// will be invoked when clicking on the recommended movies
function recommendcard(e){
  var title = e.getAttribute('title'); 
  load_details(title);
}

// get the basic details of the movie from the API (based on the name of the movie)
function load_details(title){
  $.ajax({
    type: 'GET',
    url:'https://www.omdbapi.com/?t=' + title + '&apikey=4633a0a8',

    success: function(movie){
        $("#loader").fadeIn();
        $('.fail').css('display','none');
        $('.results').delay(1000).css('display','block');
        var movie_id = movie.imdbID;
        var movie_title = movie.Title;
        movie_recs(movie_title,movie_id);
    },
    error: function(){
      alert('Invalid Request');
      $("#loader").delay(500).fadeOut();
    },
  });
}

// passing the movie name to get the similar movies from python's flask
function movie_recs(movie_title,movie_id){
  $.ajax({
    type:'POST',
    url:"/similarity",
    data:{'name':movie_title},
    success: function(recs){
      if(recs=="Sorry! The mahesh movie you requested is not in our database. Please check the spelling or try with some other movies"){
        $('.fail').css('display','block');
        $('.results').css('display','none');
        $("#loader").delay(500).fadeOut();
      }
      else {
        $('.fail').css('display','none');
        $('.results').css('display','block');
        var movie_arr = recs.split('---');
        var arr = [];
        for(const movie in movie_arr){
          arr.push(movie_arr[movie]);
        }
        get_movie_details(movie_id,arr,movie_title);
      }
    },
    error: function(){
      alert("error recs");
      $("#loader").delay(500).fadeOut();
    },
  }); 
}

// get all the details of the movie using the movie id.
function get_movie_details(movie_id,arr,movie_title) {
  $.ajax({
    type:'GET',
    url:'https://www.omdbapi.com/?i=' + movie_id + '&apikey=4633a0a8',
    success: function(movie_details){
      show_details(movie_details,arr,movie_title,movie_id);
    },
    error: function(){
      alert("API Error!");
      $("#loader").delay(500).fadeOut();
    },
  });
}

// passing all the details to python's flask for displaying and scraping the movie reviews using imdb id
function show_details(movie_details,arr,movie_title,my_api_key,movie_id){
  var imdb_id = movie_details.imdbID;
  var poster = movie_details.Poster;
  var overview = movie_details.Plot;
  var genres = movie_details.Genre;
  var rating = movie_details.imdbRating;
  var runtime = movie_details.Runtime;
  var vote_count = movie_details.imdbVotes;
  arr_poster = get_movie_posters(arr,my_api_key);
  
  details = {
    'title':movie_title,
      'imdb_id':imdb_id,
      'poster':poster,
      'genres':genres,
      'overview':overview,
      'rating':rating,
      'vote_count':vote_count,
      'runtime' : runtime,
      'rec_movies':JSON.stringify(arr),
      'rec_posters':JSON.stringify(arr_poster),
  }

  $.ajax({
    type:'POST',
    data:details,
    url:"/recommend",
    dataType: 'html',
    complete: function(){
      $("#loader").delay(500).fadeOut();
    },
    success: function(response) {
      $('.results').html(response);
      $('#autoComplete').val('');
      $(window).scrollTop(0);
    }
  });
}

// getting posters for all the recommended movies
function get_movie_posters(arr){
  var arr_poster_list = []
  for(var m in arr) {
    $.ajax({
      type:'GET',
      url:'https://www.omdbapi.com/?t=' + arr[m] + '&apikey=4633a0a8',
      async: false,
      success: function(m_data){
        arr_poster_list.push(m_data.Poster);
      },
      error: function(){
        alert("Invalid Request!");
        $("#loader").delay(500).fadeOut();
      },
    })
  }
  return arr_poster_list;
}