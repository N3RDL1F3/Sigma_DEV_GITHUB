/**
 * Created by Adams on 22.09.2016.
 */

var HelperTool = function()
{

    help = new HelperTool();
    console.log('Helper!');


    help.createButton();

};

HelperTool.prototype = {

    createButton:function()
    {
        var btn = document.createElement('BUTTON');
        var style = btn.style;

        style.position = 'relative';
        style.top ='500px';
    },

    btnClick:function()
    {
        console.log('btn Clicked');
    }
};

