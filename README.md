wild
====

"wonderful immersive language directory"

### The GitHubs

<div>
    git clone https://github.com/admc/wild

</div>
\

### The Jitsu

<div>
Get an account here: [http://nodejitsu.com][]

              > npm install -g jitsu
              > cd wild
              > cp package.json.dev package.json
              > edit package.json to have a different subdomain
              > jitsu users confirm username SOMESECRETCODE
              > jitsu login
              > git co -b jitsu
              > jitsu deploy
            

</div>
\

### Transloadit

Get an S3 account: [http://aws.amazon.com/s3][]

Then create a bucket to store your stuff.

<div>
Create a template called ‘clips’ as so (replacing with your S3 keys):

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
            

And another called ‘wild’:

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
            

</div>
### Irish Couches

<div>
Get an account: [http://www.iriscouch.com][]

            > cd wild
            > vim app.js //edit the couchdb url to point to your instance
           

</div>

  [http://nodejitsu.com]: http://nodejitsu.com
  [http://aws.amazon.com/s3]: http://aws.amazon.com/s3/"
  [http://www.iriscouch.com]: http://www.iriscouch.com

