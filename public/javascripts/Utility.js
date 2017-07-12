/**
 * Created by Adams on 29.08.2016.
 */

//console.log("[DEBUG] Sigma: Utility Started");
//console.log('[DEBUG] Sigma: Utility Loading.....');

var Utility = function() {
    var util = this;
 //   console.log('[DEBUG] Sigma: Utility Instance created');

    //var ear = document.getElementById('mps-adtags');
    var ear = document.getElementById('div-gpt-ad-sky');

    util.listen = function (event) {
 //       console.log('[DEBUG] Sigma: Utility Ears Are Listening.......');
        ear.addEventListener(event ,function (e) {
 //           console.log('[DEBUG] Sigma: EventListener Intercepted');
            var sNode = getSDG().getUtil().loadAsynchronousScript('/javascripts/SDMObject.js',document.getElementsByTagName('head')[0],function()
            {
                var obj = new SDM_Object();
            });
        });
    }
};

var util = new Utility();
util.listen(getSDG().getEventDispatcher().POSITION_DONE);