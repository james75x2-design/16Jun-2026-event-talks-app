import os
import requests
import xml.etree.ElementTree as ET
from flask import Flask, render_template, jsonify, request

app = Flask(__name__)

# Configuration: set your Twitter credentials as environment variables
TWITTER_API_KEY = os.getenv('TWITTER_API_KEY')
TWITTER_API_SECRET = os.getenv('TWITTER_API_SECRET')
TWITTER_ACCESS_TOKEN = os.getenv('TWITTER_ACCESS_TOKEN')
TWITTER_ACCESS_SECRET = os.getenv('TWITTER_ACCESS_SECRET')

BIGQUERY_NOTES_URL = 'https://docs.cloud.google.com/feeds/bigquery-release-notes.xml'

def fetch_release_notes():
    """Fetch and parse BigQuery release notes XML."""
    resp = requests.get(BIGQUERY_NOTES_URL)
    resp.raise_for_status()
    root = ET.fromstring(resp.content)
    # The XML uses the Atom format. Entries are under '{http://www.w3.org/2005/Atom}entry'
    ns = {'atom': 'http://www.w3.org/2005/Atom'}
    notes = []
    for entry in root.findall('atom:entry', ns):
        title = entry.find('atom:title', ns).text
        link = entry.find('atom:link', ns).attrib.get('href')
        updated = entry.find('atom:updated', ns).text
        content_elem = entry.find('atom:content', ns)
        content = content_elem.text if content_elem is not None else ''
        notes.append({
            'title': title,
            'link': link,
            'updated': updated,
            'content': content,
        })
    return notes

def tweet_message(message: str):
    """Post a tweet using Tweepy. Requires environment variables for credentials.
    Returns the tweet URL on success or raises an exception.
    """
    try:
        import tweepy
    except ImportError:
        raise RuntimeError('tweepy is not installed. Please add it to requirements.txt and install.')

    if not all([TWITTER_API_KEY, TWITTER_API_SECRET, TWITTER_ACCESS_TOKEN, TWITTER_ACCESS_SECRET]):
        raise RuntimeError('Twitter credentials are not set in environment variables.')

    auth = tweepy.OAuth1UserHandler(
        TWITTER_API_KEY,
        TWITTER_API_SECRET,
        TWITTER_ACCESS_TOKEN,
        TWITTER_ACCESS_SECRET,
    )
    api = tweepy.API(auth)
    tweet = api.update_status(status=message)
    return f"https://twitter.com/{tweet.user.screen_name}/status/{tweet.id}
"

@app.route('/')
def index():
    return render_template('index.html')

@app.route('/api/notes')
def api_notes():
    notes = fetch_release_notes()
    return jsonify(notes)

@app.route('/api/tweet', methods=['POST'])
def api_tweet():
    data = request.get_json()
    if not data or 'content' not in data:
        return jsonify({'error': 'Missing content'}), 400
    content = data['content']
    try:
        tweet_url = tweet_message(content)
        return jsonify({'tweet_url': tweet_url})
    except Exception as e:
        return jsonify({'error': str(e)}), 500

if __name__ == '__main__':
    # For development only; use a proper WSGI server in production.
    app.run(host='0.0.0.0', port=5000, debug=True)
