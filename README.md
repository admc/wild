Immersion -- "wonderful immersive language directory"
===

### The GitHubs

<pre>
  git clone https://github.com/admc/wild
</pre>


### The Jitsu

  * Get an account here: [http://nodejitsu.com][]

<pre>
  > npm install -g jitsu
  > cd wild
  > cp package.json.dev package.json
  > edit package.json to have a different subdomain
  > jitsu users confirm username SOMESECRETCODE
  > jitsu login
  > git co -b jitsu
  > jitsu deploy
</pre>

### Transloadit

  * Get an S3 account: [http://aws.amazon.com/s3][]
  * Then create a bucket to store your stuff.

  * Create a template called ‘clips’ as so (replacing with your S3 keys):
<pre>
    {
      "steps": {
        "import": {
          "robot": "/http/import",
          "url": "${fields.url}"
        },
        "encode_clip":{
          "robot": "/audio/encode",
          "preset": "mp3",
          "ffmpeg": {
            "ss": "${fields.ss}",
            "t": 5
          }
        },
        "export": {
          "robot": "/s3/store",
          "key": "YOUR KEY HERE",
          "secret": "YOUR SECRET HERE",
          "bucket": "YOUR BUCKET NAME"
        }
      }
    }
</pre>

  * And another called ‘wild’:

<pre>
    {
    "steps": {
      "webm_video": {
        "robot": "/video/encode",
        "preset": "webm",
        "width": 640,
        "height": 360
      },
      "export": {
        "robot": "/s3/store",
        "key": "YOUR KEY HERE",
        "secret": "YOUR SECRET HERE",
        "bucket": "YOUR BUCKET HERE"
      }
    }
    }
</pre>

### Iris Couches

  * Get an account: [http://www.iriscouch.com][]
<pre>
  > cd wild
  > vim app.js //edit the couchdb url to point to your instance
</pre>

  [http://nodejitsu.com]: http://nodejitsu.com
  [http://aws.amazon.com/s3]: http://aws.amazon.com/s3/"
  [http://www.iriscouch.com]: http://www.iriscouch.com

