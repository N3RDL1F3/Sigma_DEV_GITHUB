/**
 * Created by Adams on 29.08.2016.
 */

console.log('[DEBUG] Sigma: Utility Started');
console.log('[DEBUG] Sigma: Loading.....');

var sNode = getSDG().getUtil().loadAsynchronousScript('/javascripts/SDMObject.js',document.getElementsByTagName('head')[0],function()
{
    console.log('[DEBUG] Sigma: Done!');
    var obj = new SDM_Object();
});







