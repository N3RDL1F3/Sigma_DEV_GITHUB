/**
 * Created by Adams on 30.08.2016.
 */
var SDM_Object = function(){
   console.log('[DEBUG] Sigma: SDM Object Loaded');

   window.addEventListener('loadedAll', function (e)
   {
      console.log('[EVENT]-Caught Loaded All');
      getSDG().log('SYSTEM: Event: LOADED_ALL was triggered. DOM now ready.', getSDG().loglvl('DEBUG'), e);
   });
};
