var video, player;

module('Ad Framework', {
  setup: function() {
    video = document.createElement('video');
    video.id = 'video';
    document.getElementById('qunit-fixture').appendChild(video);
    player = videojs(video);
  },
  teardown: function() {
  }
});

test('the environment is sane', function() {
  ok(true, 'true is ok');
});

test('video plays on bad ad tag', function() {
  var options = {
    id: 'video',
    adTagUrl: 'http://this.site.does.not.exist.google.com'
  };
  player.ima(options);
  var playCount = 0;
  player.play = function() {
    playCount++;
  }
  player.ima.initializeAdDisplayContainer();
  player.ima.requestAds();
  player.play();
  stop();
  setTimeout(function() {
    // Play called once by the plugin on error.
    equal(playCount, 1);
    start();
  }, 5000);
});

test('ad plays on good ad tag', function() {
  var options = {
    id: 'video',
    adTagUrl: 'http://pubads.g.doubleclick.net/gampad/ads?sz=640x360&' +
        'iu=/6062/iab_vast_samples/skippable&ciu_szs=300x250,728x90&impl=s&' +
        'gdfp_req=1&env=vp&output=xml_vast2&unviewed_position_start=1&' +
        'url=[referrer_url]&correlator=[timestamp]'
  }
  player.ima(options);
  var contentPauseCount = 0;
  player.ima.onContentPauseRequested_ = function() {
    contentPauseCount++;
  }
  player.ima.initializeAdDisplayContainer();
  player.ima.requestAds();
  player.play();
  stop();
  setTimeout(function() {
    equal(contentPauseCount, 1);
    start();
  }, 5000);
});

test('video continues after ad was skipped', function() {
  var options = {
    id: 'video',
    adTagUrl: 'http://pubads.g.doubleclick.net/gampad/ads?sz=640x360&' +
        'iu=/6062/iab_vast_samples/skippable&ciu_szs=300x250,728x90&impl=s&' +
        'gdfp_req=1&env=vp&output=xml_vast2&unviewed_position_start=1&' +
        'url=[referrer_url]&correlator=[timestamp]'
  }

  //addEventListener only works when the adManager is available, thus using it in the ready-callback
  var readyForPrerollCallback = function() {
    player.ima.addEventListener(google.ima.AdEvent.Type.SKIPPABLE_STATE_CHANGED, function() {
      var adManager = this;
      adManager.skip();
    })
    //we overwrote the normal ready-callback, thus calling start now
    player.ima.start();
  };

  player.ima(options, readyForPrerollCallback);

  var contentResumeCount = 0;
  player.ima.onContentResumeRequested_ = function() {
    contentResumeCount++;
  }
  var adCompleteCount = 0;
  player.ima.onAdComplete_ = function() {
    adCompleteCount++;
  }

  player.ima.initializeAdDisplayContainer();
  player.ima.requestAds();
  player.play();
  stop();

  setTimeout(function () {
      equal(contentResumeCount, 1, 'content resumed');
      equal(adCompleteCount, 1, 'adComplete was called');
      start();
  }, 7000);
});

test('ad with prebuilt adsResponse plays', function () {
    var options = {
        id: 'video',
        adTagUrl: '',
        adsResponse: getAdsResponse()
    }
    player.ima(options);
    var contentPauseCount = 0;
    player.ima.onContentPauseRequested_ = function () {
        contentPauseCount++;
    }
    player.ima.initializeAdDisplayContainer();
    player.ima.requestAds();
    player.play();
    stop();
    setTimeout(function () {
        equal(contentPauseCount, 1);
        start();
    }, 5000);

    function getAdsResponse() {
        return '\
<?xml version="1.0" encoding="UTF-8"?> \
<VAST xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance" xsi:noNamespaceSchemaLocation="vast.xsd" version="2.0"> \
 <Ad id="24283604"> \
  <InLine>\
   <AdSystem>GDFP</AdSystem>\
   <AdTitle>IAB Vast Samples Skippable</AdTitle>\
   <Description><![CDATA[IAB Vast Samples Skippable ad]]></Description>\
   <Error><![CDATA[https://pubads.g.doubleclick.net/pagead/conversion/?ai=BgtgIsMICV6y2I5HFBczwkRj0qqyMBwAAABABIAA4AFj03p_femDJhvuGyKOQGYIBF2NhLXB1Yi04MTI1NTM5MzIyMTI5MTY0sgEEbnVsbLoBEjMyMHg1MCwzMzZ4MjY5X3htbMgBBdoBDGh0dHA6Ly9udWxsL8ACAuACAOoCIC82MDYyL2lhYl92YXN0X3NhbXBsZXMvc2tpcHBhYmxl-AL30R6AAwGQA6wCmAPgA6gDAeAEAdIFBRDUk8oLkAYBoAYj2AcB&sigh=IHCbKI_nxAs&label=videoplayfailed]]></Error>\
    <Impression><![CDATA[https://pubads.g.doubleclick.net/pagead/adview?ai=BgtgIsMICV6y2I5HFBczwkRj0qqyMBwAAABABIAA4AFj03p_femDJhvuGyKOQGYIBF2NhLXB1Yi04MTI1NTM5MzIyMTI5MTY0sgEEbnVsbLoBEjMyMHg1MCwzMzZ4MjY5X3htbMgBBdoBDGh0dHA6Ly9udWxsL8ACAuACAOoCIC82MDYyL2lhYl92YXN0X3NhbXBsZXMvc2tpcHBhYmxl-AL30R6AAwGQA6wCmAPgA6gDAeAEAdIFBRDUk8oLkAYBoAYj2AcB&sigh=0HmfOAzVrMc&cid=5Gjjjg]]></Impression>\
    <Creatives>\
     <Creative id="32948875124" AdID="ABCD1234567" sequence="1">\
      <Linear skipoffset="00:00:10">\
       <Duration>00:00:51</Duration>\
       <TrackingEvents>\
        <Tracking event="start"><![CDATA[https://pubads.g.doubleclick.net/pagead/conversion/?ai=BgtgIsMICV6y2I5HFBczwkRj0qqyMBwAAABABIAA4AFj03p_femDJhvuGyKOQGYIBF2NhLXB1Yi04MTI1NTM5MzIyMTI5MTY0sgEEbnVsbLoBEjMyMHg1MCwzMzZ4MjY5X3htbMgBBdoBDGh0dHA6Ly9udWxsL8ACAuACAOoCIC82MDYyL2lhYl92YXN0X3NhbXBsZXMvc2tpcHBhYmxl-AL30R6AAwGQA6wCmAPgA6gDAeAEAdIFBRDUk8oLkAYBoAYj2AcB&sigh=IHCbKI_nxAs&label=part2viewed&acvw=[VIEWABILITY]]]></Tracking>\
    <Tracking event="firstQuartile"><![CDATA[https://pubads.g.doubleclick.net/pagead/conversion/?ai=BgtgIsMICV6y2I5HFBczwkRj0qqyMBwAAABABIAA4AFj03p_femDJhvuGyKOQGYIBF2NhLXB1Yi04MTI1NTM5MzIyMTI5MTY0sgEEbnVsbLoBEjMyMHg1MCwzMzZ4MjY5X3htbMgBBdoBDGh0dHA6Ly9udWxsL8ACAuACAOoCIC82MDYyL2lhYl92YXN0X3NhbXBsZXMvc2tpcHBhYmxl-AL30R6AAwGQA6wCmAPgA6gDAeAEAdIFBRDUk8oLkAYBoAYj2AcB&sigh=IHCbKI_nxAs&label=videoplaytime25&acvw=[VIEWABILITY]]]></Tracking>\
    <Tracking event="midpoint"><![CDATA[https://pubads.g.doubleclick.net/pagead/conversion/?ai=BgtgIsMICV6y2I5HFBczwkRj0qqyMBwAAABABIAA4AFj03p_femDJhvuGyKOQGYIBF2NhLXB1Yi04MTI1NTM5MzIyMTI5MTY0sgEEbnVsbLoBEjMyMHg1MCwzMzZ4MjY5X3htbMgBBdoBDGh0dHA6Ly9udWxsL8ACAuACAOoCIC82MDYyL2lhYl92YXN0X3NhbXBsZXMvc2tpcHBhYmxl-AL30R6AAwGQA6wCmAPgA6gDAeAEAdIFBRDUk8oLkAYBoAYj2AcB&sigh=IHCbKI_nxAs&label=videoplaytime50&acvw=[VIEWABILITY]]]></Tracking>\
    <Tracking event="thirdQuartile"><![CDATA[https://pubads.g.doubleclick.net/pagead/conversion/?ai=BgtgIsMICV6y2I5HFBczwkRj0qqyMBwAAABABIAA4AFj03p_femDJhvuGyKOQGYIBF2NhLXB1Yi04MTI1NTM5MzIyMTI5MTY0sgEEbnVsbLoBEjMyMHg1MCwzMzZ4MjY5X3htbMgBBdoBDGh0dHA6Ly9udWxsL8ACAuACAOoCIC82MDYyL2lhYl92YXN0X3NhbXBsZXMvc2tpcHBhYmxl-AL30R6AAwGQA6wCmAPgA6gDAeAEAdIFBRDUk8oLkAYBoAYj2AcB&sigh=IHCbKI_nxAs&label=videoplaytime75&acvw=[VIEWABILITY]]]></Tracking>\
    <Tracking event="complete"><![CDATA[https://pubads.g.doubleclick.net/pagead/conversion/?ai=BgtgIsMICV6y2I5HFBczwkRj0qqyMBwAAABABIAA4AFj03p_femDJhvuGyKOQGYIBF2NhLXB1Yi04MTI1NTM5MzIyMTI5MTY0sgEEbnVsbLoBEjMyMHg1MCwzMzZ4MjY5X3htbMgBBdoBDGh0dHA6Ly9udWxsL8ACAuACAOoCIC82MDYyL2lhYl92YXN0X3NhbXBsZXMvc2tpcHBhYmxl-AL30R6AAwGQA6wCmAPgA6gDAeAEAdIFBRDUk8oLkAYBoAYj2AcB&sigh=IHCbKI_nxAs&label=videoplaytime100&acvw=[VIEWABILITY]]]></Tracking>\
    <Tracking event="mute"><![CDATA[https://pubads.g.doubleclick.net/pagead/conversion/?ai=BgtgIsMICV6y2I5HFBczwkRj0qqyMBwAAABABIAA4AFj03p_femDJhvuGyKOQGYIBF2NhLXB1Yi04MTI1NTM5MzIyMTI5MTY0sgEEbnVsbLoBEjMyMHg1MCwzMzZ4MjY5X3htbMgBBdoBDGh0dHA6Ly9udWxsL8ACAuACAOoCIC82MDYyL2lhYl92YXN0X3NhbXBsZXMvc2tpcHBhYmxl-AL30R6AAwGQA6wCmAPgA6gDAeAEAdIFBRDUk8oLkAYBoAYj2AcB&sigh=IHCbKI_nxAs&label=admute&acvw=[VIEWABILITY]]]></Tracking>\
    <Tracking event="unmute"><![CDATA[https://pubads.g.doubleclick.net/pagead/conversion/?ai=BgtgIsMICV6y2I5HFBczwkRj0qqyMBwAAABABIAA4AFj03p_femDJhvuGyKOQGYIBF2NhLXB1Yi04MTI1NTM5MzIyMTI5MTY0sgEEbnVsbLoBEjMyMHg1MCwzMzZ4MjY5X3htbMgBBdoBDGh0dHA6Ly9udWxsL8ACAuACAOoCIC82MDYyL2lhYl92YXN0X3NhbXBsZXMvc2tpcHBhYmxl-AL30R6AAwGQA6wCmAPgA6gDAeAEAdIFBRDUk8oLkAYBoAYj2AcB&sigh=IHCbKI_nxAs&label=adunmute&acvw=[VIEWABILITY]]]></Tracking>\
    <Tracking event="rewind"><![CDATA[https://pubads.g.doubleclick.net/pagead/conversion/?ai=BgtgIsMICV6y2I5HFBczwkRj0qqyMBwAAABABIAA4AFj03p_femDJhvuGyKOQGYIBF2NhLXB1Yi04MTI1NTM5MzIyMTI5MTY0sgEEbnVsbLoBEjMyMHg1MCwzMzZ4MjY5X3htbMgBBdoBDGh0dHA6Ly9udWxsL8ACAuACAOoCIC82MDYyL2lhYl92YXN0X3NhbXBsZXMvc2tpcHBhYmxl-AL30R6AAwGQA6wCmAPgA6gDAeAEAdIFBRDUk8oLkAYBoAYj2AcB&sigh=IHCbKI_nxAs&label=adrewind&acvw=[VIEWABILITY]]]></Tracking>\
    <Tracking event="pause"><![CDATA[https://pubads.g.doubleclick.net/pagead/conversion/?ai=BgtgIsMICV6y2I5HFBczwkRj0qqyMBwAAABABIAA4AFj03p_femDJhvuGyKOQGYIBF2NhLXB1Yi04MTI1NTM5MzIyMTI5MTY0sgEEbnVsbLoBEjMyMHg1MCwzMzZ4MjY5X3htbMgBBdoBDGh0dHA6Ly9udWxsL8ACAuACAOoCIC82MDYyL2lhYl92YXN0X3NhbXBsZXMvc2tpcHBhYmxl-AL30R6AAwGQA6wCmAPgA6gDAeAEAdIFBRDUk8oLkAYBoAYj2AcB&sigh=IHCbKI_nxAs&label=adpause&acvw=[VIEWABILITY]]]></Tracking>\
    <Tracking event="resume"><![CDATA[https://pubads.g.doubleclick.net/pagead/conversion/?ai=BgtgIsMICV6y2I5HFBczwkRj0qqyMBwAAABABIAA4AFj03p_femDJhvuGyKOQGYIBF2NhLXB1Yi04MTI1NTM5MzIyMTI5MTY0sgEEbnVsbLoBEjMyMHg1MCwzMzZ4MjY5X3htbMgBBdoBDGh0dHA6Ly9udWxsL8ACAuACAOoCIC82MDYyL2lhYl92YXN0X3NhbXBsZXMvc2tpcHBhYmxl-AL30R6AAwGQA6wCmAPgA6gDAeAEAdIFBRDUk8oLkAYBoAYj2AcB&sigh=IHCbKI_nxAs&label=adresume&acvw=[VIEWABILITY]]]></Tracking>\
    <Tracking event="fullscreen"><![CDATA[https://pubads.g.doubleclick.net/pagead/conversion/?ai=BgtgIsMICV6y2I5HFBczwkRj0qqyMBwAAABABIAA4AFj03p_femDJhvuGyKOQGYIBF2NhLXB1Yi04MTI1NTM5MzIyMTI5MTY0sgEEbnVsbLoBEjMyMHg1MCwzMzZ4MjY5X3htbMgBBdoBDGh0dHA6Ly9udWxsL8ACAuACAOoCIC82MDYyL2lhYl92YXN0X3NhbXBsZXMvc2tpcHBhYmxl-AL30R6AAwGQA6wCmAPgA6gDAeAEAdIFBRDUk8oLkAYBoAYj2AcB&sigh=IHCbKI_nxAs&label=adfullscreen&acvw=[VIEWABILITY]]]></Tracking>\
    <Tracking event="creativeView"><![CDATA[https://pubads.g.doubleclick.net/pagead/conversion/?ai=BgtgIsMICV6y2I5HFBczwkRj0qqyMBwAAABABIAA4AFj03p_femDJhvuGyKOQGYIBF2NhLXB1Yi04MTI1NTM5MzIyMTI5MTY0sgEEbnVsbLoBEjMyMHg1MCwzMzZ4MjY5X3htbMgBBdoBDGh0dHA6Ly9udWxsL8ACAuACAOoCIC82MDYyL2lhYl92YXN0X3NhbXBsZXMvc2tpcHBhYmxl-AL30R6AAwGQA6wCmAPgA6gDAeAEAdIFBRDUk8oLkAYBoAYj2AcB&sigh=IHCbKI_nxAs&label=vast_creativeview&acvw=[VIEWABILITY]]]></Tracking>\
    <Tracking event="acceptInvitation"><![CDATA[https://pubads.g.doubleclick.net/pagead/conversion/?ai=BgtgIsMICV6y2I5HFBczwkRj0qqyMBwAAABABIAA4AFj03p_femDJhvuGyKOQGYIBF2NhLXB1Yi04MTI1NTM5MzIyMTI5MTY0sgEEbnVsbLoBEjMyMHg1MCwzMzZ4MjY5X3htbMgBBdoBDGh0dHA6Ly9udWxsL8ACAuACAOoCIC82MDYyL2lhYl92YXN0X3NhbXBsZXMvc2tpcHBhYmxl-AL30R6AAwGQA6wCmAPgA6gDAeAEAdIFBRDUk8oLkAYBoAYj2AcB&sigh=IHCbKI_nxAs&label=acceptinvitation&acvw=[VIEWABILITY]]]></Tracking>\
    <Tracking event="start"><![CDATA[https://video-ad-stats.googlesyndication.com/video/client_events?event=2&web_property=ca-pub-8125539322129164&cpn=[CPN]&break_type=[BREAK_TYPE]&slot_pos=[SLOT_POS]&ad_id=[AD_ID]&ad_sys=[AD_SYS]&ad_len=[AD_LEN]&p_w=[P_W]&p_h=[P_H]&mt=[MT]&rwt=[RWT]&wt=[WT]&sdkv=[SDKV]&vol=[VOL]&content_v=[CONTENT_V]&conn=[CONN]&format=[FORMAT_NAMESPACE]_[FORMAT_TYPE]_[FORMAT_SUBTYPE]]]></Tracking>\
    <Tracking event="complete"><![CDATA[https://video-ad-stats.googlesyndication.com/video/client_events?event=3&web_property=ca-pub-8125539322129164&cpn=[CPN]&break_type=[BREAK_TYPE]&slot_pos=[SLOT_POS]&ad_id=[AD_ID]&ad_sys=[AD_SYS]&ad_len=[AD_LEN]&p_w=[P_W]&p_h=[P_H]&mt=[MT]&rwt=[RWT]&wt=[WT]&sdkv=[SDKV]&vol=[VOL]&content_v=[CONTENT_V]&conn=[CONN]&format=[FORMAT_NAMESPACE]_[FORMAT_TYPE]_[FORMAT_SUBTYPE]]]></Tracking>\
    </TrackingEvents>\
    <VideoClicks>\
     <ClickThrough id="GDFP"><![CDATA[https://pubads.g.doubleclick.net/aclk?sa=L&ai=BgtgIsMICV6y2I5HFBczwkRj0qqyMBwAAABABIAA4AFj03p_femDJhvuGyKOQGYIBF2NhLXB1Yi04MTI1NTM5MzIyMTI5MTY0sgEEbnVsbLoBEjMyMHg1MCwzMzZ4MjY5X3htbMgBBdoBDGh0dHA6Ly9udWxsL8ACAuACAOoCIC82MDYyL2lhYl92YXN0X3NhbXBsZXMvc2tpcHBhYmxl-AL30R6AAwGQA6wCmAPgA6gDAeAEAdIFBRDUk8oLkAYBoAYj2AcB&num=0&cid=5Gjjjg&sig=AOD64_1zLbzdmsa4HgLtdYc61vfyMLNSPw&client=ca-pub-8125539322129164&adurl=https://developers.google.com/interactive-media-ads/]]></ClickThrough>\
    <ClickTracking id=""><![CDATA[https://video-ad-stats.googlesyndication.com/video/client_events?event=6&web_property=ca-pub-8125539322129164&cpn=[CPN]&break_type=[BREAK_TYPE]&slot_pos=[SLOT_POS]&ad_id=[AD_ID]&ad_sys=[AD_SYS]&ad_len=[AD_LEN]&p_w=[P_W]&p_h=[P_H]&mt=[MT]&rwt=[RWT]&wt=[WT]&sdkv=[SDKV]&vol=[VOL]&content_v=[CONTENT_V]&conn=[CONN]&format=[FORMAT_NAMESPACE]_[FORMAT_TYPE]_[FORMAT_SUBTYPE]]]></ClickTracking>\
    </VideoClicks>\
    <MediaFiles>\
     <MediaFile id="GDFP" delivery="progressive" width="640" height="360" type="video/x-flv" bitrate="379" scalable="true" maintainAspectRatio="true"><![CDATA[https://redirector.gvt1.com/videoplayback/id/8bd2c53a3e15469d/itag/34/source/gfp_video_ads/requiressl/yes/ip/0.0.0.0/ipbits/0/expire/1459820304/sparams/ip,ipbits,expire,id,itag,source,requiressl/signature/5FDC6644512BEA57D664F2DFA11E558A1F50966D.70D7AE3E5BBF89EDC7BF026F5990FAE64DAB545C/key/ck2/file/file.flv]]></MediaFile>\
     <MediaFile id="GDFP" delivery="progressive" width="640" height="360" type="video/mp4" bitrate="324" scalable="true" maintainAspectRatio="true"><![CDATA[https://redirector.gvt1.com/videoplayback/id/8bd2c53a3e15469d/itag/18/source/gfp_video_ads/requiressl/yes/ip/0.0.0.0/ipbits/0/expire/1459820304/sparams/ip,ipbits,expire,id,itag,source,requiressl/signature/15F9C3BBC3CFCFCD66A75EF5F7F107DAC2B25A0D.4BBDEC734548C235A5B12394CAB49DC815769B66/key/ck2/file/file.mp4]]></MediaFile>\
     <MediaFile id="GDFP" delivery="progressive" width="426" height="240" type="video/x-flv" bitrate="337" scalable="true" maintainAspectRatio="true"><![CDATA[https://redirector.gvt1.com/videoplayback/id/8bd2c53a3e15469d/itag/5/source/gfp_video_ads/requiressl/yes/ip/0.0.0.0/ipbits/0/expire/1459820304/sparams/ip,ipbits,expire,id,itag,source,requiressl/signature/B6A99D7C19114D8A4C66510D076F2533A8C08E74.95938C144E5CBDFD9B3EEAF21FAC327CCD6CCB52/key/ck2/file/file.flv]]></MediaFile>\
     <MediaFile id="GDFP" delivery="progressive" width="640" height="360" type="video/webm" bitrate="348" scalable="true" maintainAspectRatio="true"><![CDATA[https://redirector.gvt1.com/videoplayback/id/8bd2c53a3e15469d/itag/43/source/gfp_video_ads/requiressl/yes/ip/0.0.0.0/ipbits/0/expire/1459820304/sparams/ip,ipbits,expire,id,itag,source,requiressl/signature/79F17ACF4F4B67F1422F9D9FEFF285FFB36E2855.86098FAD504E7CA01FFBF27C7E3CE31935684CF8/key/ck2/file/file.webm]]></MediaFile>\
     <MediaFile id="GDFP" delivery="progressive" width="320" height="180" type="video/3gpp" bitrate="234" scalable="true" maintainAspectRatio="true"><![CDATA[https://redirector.gvt1.com/videoplayback/id/8bd2c53a3e15469d/itag/36/source/gfp_video_ads/requiressl/yes/ip/0.0.0.0/ipbits/0/expire/1459820304/sparams/ip,ipbits,expire,id,itag,source,requiressl/signature/46CE513329153E65B4A335C34566895B7156FE78.40351D6E2B9E9C7737CDECF8FF6DC9272642E89B/key/ck2/file/file.3gp]]></MediaFile>\
     <MediaFile id="GDFP" delivery="progressive" width="176" height="144" type="video/3gpp" bitrate="86" scalable="true" maintainAspectRatio="true"><![CDATA[https://redirector.gvt1.com/videoplayback/id/8bd2c53a3e15469d/itag/17/source/gfp_video_ads/requiressl/yes/ip/0.0.0.0/ipbits/0/expire/1459820304/sparams/ip,ipbits,expire,id,itag,source,requiressl/signature/34CA83994FF45170326DFFDDD8428EFFB616B83F.2DFFD7A172EFF37D00EFAA15742B368E1EE2DEE8/key/ck2/file/file.3gp]]></MediaFile>\
    </MediaFiles>\
   </Linear>\
  </Creative>\
  <Creative id="32948875244" sequence="1">\
   <CompanionAds>\
    <Companion id="32948875244" width="300" height="250">\
     <StaticResource creativeType="image/jpeg"><![CDATA[https://pagead2.googlesyndication.com/pagead/imgad?id=CICAgMCuxM7V8AEQrAIY-gEyCNhCTRcyGqqI]]></StaticResource>\
    <TrackingEvents>\
     <Tracking event="creativeView"><![CDATA[https://pubads.g.doubleclick.net/pagead/adview?ai=Bei_SsMICV_SFJZHFBczwkRj0qqyMBwAAABABIAA4AFjs35_femDJhvuGyKOQGYIBF2NhLXB1Yi04MTI1NTM5MzIyMTI5MTY0sgEEbnVsbLoBEjMyMHg1MCwzMzZ4MjY5X3htbMgBAtoBDGh0dHA6Ly9udWxsL8ACAuACAOoCIC82MDYyL2lhYl92YXN0X3NhbXBsZXMvc2tpcHBhYmxl-AL30R6AAwGQA6wCmAPgA6gDAeAEAdIFBwgBENSTyguQBgGgBhTYBwE&sigh=d87WL_SaqEI&cid=5GiT9A]]></Tracking>\
    </TrackingEvents>\
    <CompanionClickThrough><![CDATA[https://pubads.g.doubleclick.net/aclk?sa=L&ai=Bei_SsMICV_SFJZHFBczwkRj0qqyMBwAAABABIAA4AFjs35_femDJhvuGyKOQGYIBF2NhLXB1Yi04MTI1NTM5MzIyMTI5MTY0sgEEbnVsbLoBEjMyMHg1MCwzMzZ4MjY5X3htbMgBAtoBDGh0dHA6Ly9udWxsL8ACAuACAOoCIC82MDYyL2lhYl92YXN0X3NhbXBsZXMvc2tpcHBhYmxl-AL30R6AAwGQA6wCmAPgA6gDAeAEAdIFBwgBENSTyguQBgGgBhTYBwE&num=0&cid=5GiT9A&sig=AOD64_21F7Dlf54DWl4oN4AgqmOR1lrr9w&client=ca-pub-8125539322129164&adurl=https://developers.google.com/interactive-media-ads/]]></CompanionClickThrough>\
    </Companion>\
    <Companion id="32948875364" width="728" height="90">\
     <StaticResource creativeType="image/jpeg"><![CDATA[https://pagead2.googlesyndication.com/pagead/imgad?id=CICAgMCuxM728wEQ2AUYWjII2NvINDqWbhI]]></StaticResource>\
    <TrackingEvents>\
     <Tracking event="creativeView"><![CDATA[https://pubads.g.doubleclick.net/pagead/adview?ai=BlNUrsMICV_WFJZHFBczwkRj0qqyMBwAAABABIAA4AFjk4J_femDJhvuGyKOQGYIBF2NhLXB1Yi04MTI1NTM5MzIyMTI5MTY0sgEEbnVsbLoBEjMyMHg1MCwzMzZ4MjY5X3htbMgBAtoBDGh0dHA6Ly9udWxsL8ACAuACAOoCIC82MDYyL2lhYl92YXN0X3NhbXBsZXMvc2tpcHBhYmxl-AL30R6AAwGQA6wCmAPgA6gDAeAEAdIFBwgBENSTyguQBgGgBhTYBwE&sigh=uQPsf-gqHOk&cid=5GgUyQ]]></Tracking>\
    </TrackingEvents>\
    <CompanionClickThrough><![CDATA[https://pubads.g.doubleclick.net/aclk?sa=L&ai=BlNUrsMICV_WFJZHFBczwkRj0qqyMBwAAABABIAA4AFjk4J_femDJhvuGyKOQGYIBF2NhLXB1Yi04MTI1NTM5MzIyMTI5MTY0sgEEbnVsbLoBEjMyMHg1MCwzMzZ4MjY5X3htbMgBAtoBDGh0dHA6Ly9udWxsL8ACAuACAOoCIC82MDYyL2lhYl92YXN0X3NhbXBsZXMvc2tpcHBhYmxl-AL30R6AAwGQA6wCmAPgA6gDAeAEAdIFBwgBENSTyguQBgGgBhTYBwE&num=0&cid=5GgUyQ&sig=AOD64_1GBYMF2R99-RWnrKBEEJqRVOgiog&client=ca-pub-8125539322129164&adurl=https://developers.google.com/interactive-media-ads/]]></CompanionClickThrough>\
    </Companion>\
   </CompanionAds>\
  </Creative>\
 </Creatives>\
 <Extensions>\
  <Extension type="DFP"><SkippableAdType>Generic</SkippableAdType>\
<CustomTracking>\
<Tracking event="engagedView"><![CDATA[https://pubads.g.doubleclick.net/pagead/conversion/?ai=BgtgIsMICV6y2I5HFBczwkRj0qqyMBwAAABABIAA4AFj03p_femDJhvuGyKOQGYIBF2NhLXB1Yi04MTI1NTM5MzIyMTI5MTY0sgEEbnVsbLoBEjMyMHg1MCwzMzZ4MjY5X3htbMgBBdoBDGh0dHA6Ly9udWxsL8ACAuACAOoCIC82MDYyL2lhYl92YXN0X3NhbXBsZXMvc2tpcHBhYmxl-AL30R6AAwGQA6wCmAPgA6gDAeAEAdIFBRDUk8oLkAYBoAYj2AcB&sigh=IHCbKI_nxAs&label=video_engaged_view&acvw=[VIEWABILITY]]]></Tracking>\
    <Tracking event="skip"><![CDATA[https://pubads.g.doubleclick.net/pagead/conversion/?ai=BgtgIsMICV6y2I5HFBczwkRj0qqyMBwAAABABIAA4AFj03p_femDJhvuGyKOQGYIBF2NhLXB1Yi04MTI1NTM5MzIyMTI5MTY0sgEEbnVsbLoBEjMyMHg1MCwzMzZ4MjY5X3htbMgBBdoBDGh0dHA6Ly9udWxsL8ACAuACAOoCIC82MDYyL2lhYl92YXN0X3NhbXBsZXMvc2tpcHBhYmxl-AL30R6AAwGQA6wCmAPgA6gDAeAEAdIFBRDUk8oLkAYBoAYj2AcB&sigh=IHCbKI_nxAs&label=videoskipped&acvw=[VIEWABILITY]]]></Tracking>\
    <Tracking event="skipShown"><![CDATA[https://pubads.g.doubleclick.net/pagead/conversion/?ai=BgtgIsMICV6y2I5HFBczwkRj0qqyMBwAAABABIAA4AFj03p_femDJhvuGyKOQGYIBF2NhLXB1Yi04MTI1NTM5MzIyMTI5MTY0sgEEbnVsbLoBEjMyMHg1MCwzMzZ4MjY5X3htbMgBBdoBDGh0dHA6Ly9udWxsL8ACAuACAOoCIC82MDYyL2lhYl92YXN0X3NhbXBsZXMvc2tpcHBhYmxl-AL30R6AAwGQA6wCmAPgA6gDAeAEAdIFBRDUk8oLkAYBoAYj2AcB&sigh=IHCbKI_nxAs&label=video_skip_shown&acvw=[VIEWABILITY]]]></Tracking>\
    </CustomTracking>\
    </Extension>\
        <Extension type="activeview"><CustomTracking>\
     <Tracking event="viewable_impression"><![CDATA[https://pubads.g.doubleclick.net/pagead/conversion/?ai=BgtgIsMICV6y2I5HFBczwkRj0qqyMBwAAABABIAA4AFj03p_femDJhvuGyKOQGYIBF2NhLXB1Yi04MTI1NTM5MzIyMTI5MTY0sgEEbnVsbLoBEjMyMHg1MCwzMzZ4MjY5X3htbMgBBdoBDGh0dHA6Ly9udWxsL8ACAuACAOoCIC82MDYyL2lhYl92YXN0X3NhbXBsZXMvc2tpcHBhYmxl-AL30R6AAwGQA6wCmAPgA6gDAeAEAdIFBRDUk8oLkAYBoAYj2AcB&sigh=IHCbKI_nxAs&label=viewable_impression&acvw=[VIEWABILITY]]]></Tracking>\
    <Tracking event="abandon"><![CDATA[https://pubads.g.doubleclick.net/pagead/conversion/?ai=BgtgIsMICV6y2I5HFBczwkRj0qqyMBwAAABABIAA4AFj03p_femDJhvuGyKOQGYIBF2NhLXB1Yi04MTI1NTM5MzIyMTI5MTY0sgEEbnVsbLoBEjMyMHg1MCwzMzZ4MjY5X3htbMgBBdoBDGh0dHA6Ly9udWxsL8ACAuACAOoCIC82MDYyL2lhYl92YXN0X3NhbXBsZXMvc2tpcHBhYmxl-AL30R6AAwGQA6wCmAPgA6gDAeAEAdIFBRDUk8oLkAYBoAYj2AcB&sigh=IHCbKI_nxAs&label=video_abandon&acvw=[VIEWABILITY]]]></Tracking>\
    <Tracking event="viewable_impression"><![CDATA[https://pagead2.googlesyndication.com/activeview?id=lidarv&acvw=[VIEWABILITY]&avi=BJ_AMsMICV6y2I5HFBczwkRgAAAAAEAE4AcgBBcACAuACAOAEAaAGIw]]></Tracking>\
    <Tracking event="measurable_impression"><![CDATA[https://pagead2.googlesyndication.com/activeview?id=lidarv&acvw=[VIEWABILITY]&avi=BJ_AMsMICV6y2I5HFBczwkRgAAAAAEAE4AcgBBcACAuACAOAEAaAGIw&avm=1]]></Tracking>\
    <Tracking event="measurable_impression"><![CDATA[https://pubads.g.doubleclick.net/pagead/conversion/?ai=BgtgIsMICV6y2I5HFBczwkRj0qqyMBwAAABABIAA4AFj03p_femDJhvuGyKOQGYIBF2NhLXB1Yi04MTI1NTM5MzIyMTI5MTY0sgEEbnVsbLoBEjMyMHg1MCwzMzZ4MjY5X3htbMgBBdoBDGh0dHA6Ly9udWxsL8ACAuACAOoCIC82MDYyL2lhYl92YXN0X3NhbXBsZXMvc2tpcHBhYmxl-AL30R6AAwGQA6wCmAPgA6gDAeAEAdIFBRDUk8oLkAYBoAYj2AcB&sigh=IHCbKI_nxAs&label=active_view_video_measurable_impression&acvw=[VIEWABILITY]]]></Tracking>\
    <Tracking event="fully_viewable_audible_half_duration_impression"><![CDATA[https://pagead2.googlesyndication.com/activeview?id=lidarv&acvw=[VIEWABILITY]&avi=BJ_AMsMICV6y2I5HFBczwkRgAAAAAEAE4AcgBBcACAuACAOAEAaAGIw&avgm=1]]></Tracking>\
    <Tracking event="fully_viewable_audible_half_duration_impression"><![CDATA[https://pubads.g.doubleclick.net/pagead/conversion/?ai=BgtgIsMICV6y2I5HFBczwkRj0qqyMBwAAABABIAA4AFj03p_femDJhvuGyKOQGYIBF2NhLXB1Yi04MTI1NTM5MzIyMTI5MTY0sgEEbnVsbLoBEjMyMHg1MCwzMzZ4MjY5X3htbMgBBdoBDGh0dHA6Ly9udWxsL8ACAuACAOoCIC82MDYyL2lhYl92YXN0X3NhbXBsZXMvc2tpcHBhYmxl-AL30R6AAwGQA6wCmAPgA6gDAeAEAdIFBRDUk8oLkAYBoAYj2AcB&sigh=IHCbKI_nxAs&label=fully_viewable_audible_half_duration_impression&acvw=[VIEWABILITY]]]></Tracking>\
    </CustomTracking>\
    </Extension>\
        <Extension type="geo"><Country>US</Country>\
    <Bandwidth>4</Bandwidth>\
    <BandwidthKbps>20000</BandwidthKbps>\
    </Extension>\
    <Extension type="waterfall" fallback_index="0"/></Extensions>\
      </InLine>\
     </Ad>\
    </VAST>\
    ';
    }
});


