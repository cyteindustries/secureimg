"""
    (c) cyte industries
    http://github.com/cyteindustries/secureimg

    be warned that until it is reviewed by a 
    sassy gent that shall remain nameless, it will 
    look trashy, but this does not remove from 
    its functionality.

    license available in repository above
"""

from flask import Flask, render_template, request, redirect, abort, url_for, jsonify
from flask.ext.sqlalchemy import SQLAlchemy
from sqlalchemy.sql import exists
import re, random, string, datetime, time, hashlib

app = Flask(__name__)
app.config['SQLALCHEMY_DATABASE_URI'] = 'mysql://root:password@localhost/secureimg'
db = SQLAlchemy(app)

def hash_ip(ip):
    a = hashlib.sha1(ip).hexdigest()
    return hashlib.md5(a).hexdigest()[:10]

def get_time():
    n = datetime.datetime.now()
    return time.mktime(n.timetuple())

# --------------------------\
#  SQLAlchemy Model(s)
# --------------------------/

class Upload(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    img_id = db.Column(db.String(32), unique=True)
    timestamp = db.Column(db.String(32))
    img_string = db.Column(db.Text)

    def __init__(self, img_id, img_string, timestamp=get_time()):
        self.img_id = img_id
        self.img_string = img_string
        self.timestamp = timestamp

    def __repr__(self):
        return '%r' % self.img_string

class Limiting(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    ip = db.Column(db.String(32))
    amount = db.Column(db.Integer)

    def __init__(self, ip, amount=100):
        self.ip = hash_ip(ip)
        self.amount = amount

    def __repr__(self):
        return '%r' % self.amount

# --------------------------\
#  Views
# --------------------------/

@app.route('/')
def index():
    count = db.session.query(Upload).count()
    return render_template('index.html', count=count)

@app.route('/privacy_policy')
def privacypolicy():
    return "not done yet :("

@app.route('/<imgid>&<privkey>')
def show_img(imgid, privkey):
    count = db.session.query(Upload).count()
    upload = Upload.query.filter_by(img_id=imgid).first_or_404()
    return render_template('show.html', upload=upload, count=count)

# --------------------------\
#  API
# --------------------------/

@app.route('/api/upload_image', methods=['POST'])
def upload_image():
    # check if rate limiting for the user has been submitted
    if db.session.query(exists().where(Limiting.ip == hash_ip(request.remote_addr))).scalar() == False:
        thing = Limiting(request.remote_addr)
        db.session.add(thing)
        db.session.commit()

    try:
        otherthing = Limiting.query.filter_by(ip=hash_ip(request.remote_addr)).first()
        if otherthing.amount == 0:
            return jsonify(success="false", reason="image upload limit reached, try again tomorrow")
        else:
            otherthing.amount -= 1

        img_id = ''.join(random.choice(string.letters + string.digits) for x in range(32))
        thing = Upload(img_id, request.json['str'])
        db.session.add(thing)

        db.session.commit()
    except:
        return jsonify(success="false", reason="database error occurred, sad panda :(")

    return jsonify(success="true", img_url=img_id)

if __name__ == "__main__":
    app.run(debug=True, host='0.0.0.0')