import numpy as np
import pandas as pd
from flask import Flask, render_template, request
from sklearn.feature_extraction.text import CountVectorizer
from sklearn.metrics.pairwise import cosine_similarity
import json
import bs4 as bs
import urllib.request
import pickle
import requests


def create_similarity():
    data = pd.read_csv('final_data.csv')
    # creating a count matrix
    cv = CountVectorizer()
    count_matrix = cv.fit_transform(data['combo'])
    # creating a similarity score matrix
    similarity = cosine_similarity(count_matrix)
    return data, similarity


def rcmd(m):
    m = m.lower()
    try:
        data.head();
        similarity.shape
    except:
        data, similarity = create_similarity()
    if m not in data['Title'].unique():
        return (
            'Sorry! The mahi movie you requested is not in our database. Please check the spelling or try with some other movies')
    else:
        i = data.loc[data['Title'] == m].index[0]
        lst = list(enumerate(similarity[i]))
        lst = sorted(lst, key=lambda x: x[1], reverse=True)
        lst = lst[1:11]  # excluding first item since it is the requested movie itself
        l = []
        for i in range(len(lst)):
            a = lst[i][0]
            l.append(data['Title'][a])
        return l


# converting list of string to list (eg. "["abc","def"]" to ["abc","def"])
def convert_to_list(my_list):
    my_list = my_list.split('","')
    my_list[0] = my_list[0].replace('["', '')
    my_list[-1] = my_list[-1].replace('"]', '')
    return my_list


def get_suggestions():
    data = pd.read_csv('final_data.csv')
    return list(data['Title'].str.capitalize())


app = Flask(__name__)


@app.route("/")
@app.route("/home")
def home():
    suggestions = get_suggestions()
    return render_template('home.html', suggestions=suggestions)


@app.route("/similarity", methods=["POST"])
def similarity():
    movie = request.form['name']
    rc = rcmd(movie)
    if type(rc) == type('string'):
        return rc
    else:
        m_str = "---".join(rc)
        return m_str


@app.route("/recommend", methods=["POST"])
def recommend():
    # getting data from AJAX request
    title = request.form['title']
    imdb_id = request.form['imdb_id']
    poster = request.form['poster']
    genres = request.form['genres']
    overview = request.form['overview']
    vote_count = request.form['vote_count']
    
    runtime = request.form['runtime']
    

    rec_movies = request.form['rec_movies']
    rec_posters = request.form['rec_posters']

    # get movie suggestions for auto complete
    suggestions = get_suggestions()

    # call the convert_to_list function for every string that needs to be converted to list
    rec_movies = convert_to_list(rec_movies)
    rec_posters = convert_to_list(rec_posters)


    # combining multiple lists as a dictionary which can be passed to the html file so that it can be processed easily and the order of information will be preserved
    movie_cards = {rec_posters[i]: rec_movies[i] for i in range(len(rec_posters))}

    # passing all the data to the html file
    return render_template('recommend.html', title=title, poster=poster, overview=overview,
                           vote_count=vote_count,
                           genres=genres,
                           
                           runtime = runtime,
                           

                           movie_cards=movie_cards)



if __name__ == '__main__':
    app.run(debug=True)