var webdriver = require('wd-parallel')
  , assert  = require('assert');

var browsers = webdriver.remote(
  "ondemand.saucelabs.com",80
);

var desired = [
  {
    tags: ["immersion"]
    , name: "parallel test 1/4"
    , browserName: "firefox"
    , javascriptEnabled: true
    , callbacks: {
      command: function(meth, path){
        console.log(' > \x1b[33m%s\x1b[0m: %s', meth, path);
      }
      , status: function(info){
        console.log('\x1b[36m%s\x1b[0m', info);
      }
    }
  }
  ,
  {
    tags: ["immersion"]
    , name: "parallel test 2/4"
    , browserName: "chrome"
    , javascriptEnabled: true
  }
  ,
  {
  tags: ["immersion"]
    , name: "parallel test 3/4"
    , browserName: "firefox"
    , platform: "LINUX"
    , javascriptEnabled: true
  }
  ,
  {
    tags: ["immersion"]
    , name: "parallel test 4/4"
    , browserName: "chrome"
    , platform: "LINUX"
    , javascriptEnabled: true
  }
]

browsers.test = function(browser, desired) {

    browser.init(desired);
    browser.get("http://wild.io");
    browser.setWaitTimeout(3000);

    assert.equal(browser.title(), "Immersion");

    var usernameField = browser.elementByName("username");
    var passwordField = browser.elementByName("password");
    var submitField = browser.elementByName("submit");

    browser.type(usernameField, "bob");
    browser.type(passwordField, "secret");
    browser.clickElement(submitField)

    var shareButton = browser.elementById("shareButton");
    browser.clickElement(shareButton);

    var headerText = browser.elementByTagName("h1")
    assert.equal(browser.text(headerText), "Share");

    var dropDown = browser.elementByLinkText("Account");
    browser.clickElement(dropDown);
    var homeLink = browser.elementByLinkText("Home");
    browser.clickElement(homeLink);
    var accountText = browser.elementByTagName("h1")
    assert.equal(browser.text(accountText), "Immersion");

    var logoutLink = browser.elementByLinkText("Logout");
    browser.clickElement(logoutLink);

    browser.quit();
};

browsers.run(desired);
