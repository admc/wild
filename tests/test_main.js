var wd = require('wd')
var assert = require('assert')
browser = wd.remote(
  "ondemand.saucelabs.com"
  , 80
  , process.env.SAUCE_USERNAME
  , process.env.SAUCE_ACCESS_KEY
)

var REMOTE_HOST = 'http://localhost'
var REMOTE_PORT = process.env.PORT || 8000
var BASE_URL = REMOTE_HOST + ":" + REMOTE_PORT + "/"
console.log("BASE_URL: %s", BASE_URL)

var desired = {
  browserName: process.env.SAUCE_BROWSER || 'chrome',
  version: process.env.SAUCE_BROWSER_VERSION || '',
  platform: process.env.SAUCE_OS || 'linux',
  name: "immersion tests"
}

describe("Selenium Tests: ", function() {

  before(function(done) {
    this.timeout(90000)
    browser.init(desired, done)
  })

  after(function(done) {
    this.timeout(10000)
    browser.quit(done)
  })

  it("test all the things", function(done) {
    this.timeout(30000)
    browser.get(BASE_URL, function() {
      browser.title(function(err, title) {
        assert.ok(~title.indexOf('Immersion'), 'Wrong Title')
        browser.elementByName("username", function(el) {
          browser.type(el, "bob", function() {
            browser.elementByName("username", function(el) {
              browser.type(el, "secret", function() {
                browser.elementByName("submit", function(el) {
                  browser.clickElement(el, function() {
                    browser.elementByLinkText("Logout", function(el) {
                      browser.clickElement(el, function() {
                        browser.title(function(err, title) {
                          assert.ok(~title.indexOf('Immersion'), 'Wrong Title')
                          done()
                        }
                      }
                    }
                  }
                }
              }
            }
          }
        }
      })
    })
  })


})

