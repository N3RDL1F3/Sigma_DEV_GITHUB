window.SDG = {
    Setup: {
        PROTOCOLS: {
            HTTP: 'http:',
            HTTPS: 'https:'
        },
        MODULES: {
            /**
             * Module Objects
             *
             * @type {Object.<String, String>}
             */
            EVENT_DISPATCHER: 'EventDispatcher',
            PUBLISHER_CONFIG: 'PublisherConfig',
            ADSERVER: 'AdServer',
            LOGGER: 'Logger',
            ADSLOT_CONTROLLER: 'PlacementController',
            TAGMAN_CONVERTER: 'TagManConverter',
            PRAELUDIUM_CONVERTER: 'PraeludiumConverter',
            AD_LABELS: 'AdLabels',
            GENERIC_TARGETING: 'GenericTargets',
            FORMAT_CONFIG: 'FormatController',
            TTRACKER: 'timeTracker',
            INFOTOOL: 'InfoTool'

        },
        SYSTEM: {
            /**
             * System Objects, without this configuration the system will not be able to set itself up
             *
             * @type {Object.<String, String>}
             */
            CORE: 'Core',
            RESOURCES: 'Resources',
            UTILITY: 'Utilities',
            ADTEMPLATES: 'AdTemplates',
            MODULES: 'PluginContainer',
            PUBLIC_API: 'Publisher'
        },
        LOGGER: {
            /**
             * Log levels
             *
             * @type {Object.<String, Number>}
             */
            LEVELS: {
                NOLOG: 0,
                DEBUG: 10,
                INFO: 20,
                NOTICE: 30,
                WARNING: 40,
                ERROR: 50,
                CRITICAL: 60,
                ALERT: 70,
                EMERGENCY: 80
            }
        },
        RESOURCES: {
            POSTSCRIBE: 'postScribe',
            ADP: 'audienceDiscoverPlattform',
            MEETRICS: 'meetrics',
            NUGGAD_DMP: 'nuggAdSegments',
            AUDIENCE_SCIENCE: 'audienceScience',
            REMINTREX: 'remintrex',
            TABOOLA:'taboola',
            XAXISFOOTERBIDDER: 'xaxisFooterBidder',
            OPENX: 'openX',
            PREBID: 'preBid',
            CRITEOONETAG: 'criteoOneTag'
        }
    },
    getSetup: function ()
    {
        return this.Setup
    },
    /**
     * returns the active core object
     *
     */
    getCore: function ()
    {
        return this[getSDG().getSetup().SYSTEM.CORE]
    },
    /**
     * returns the active resources object
     *
     */
    getRes: function ()
    {
        return this[getSDG().getSetup().SYSTEM.RESOURCES]
    },
    /**
     * returns the active adslot_controller object
     *
     */
    getCN: function ()
    {
        return this.getCore().get(getSDG().getSetup().MODULES.ADSLOT_CONTROLLER);
    },
    /**
     * returns the active Public_API object
     *
     */
    getPUB: function ()
    {
        return this[getSDG().getSetup().SYSTEM.PUBLIC_API]
    },
    /**
     * returns the AdTemplate Library
     *
     */
    getAdLib: function () {
        return this[getSDG().getSetup().SYSTEM.ADTEMPLATES]
    },
    /**
     * Convenience method to fetch event dispatcher from service container.
     *
     */
    getEventDispatcher: function ()
    {
        return this.getCore().get(getSDG().getSetup().MODULES.EVENT_DISPATCHER);
    },
    /**
     * Convienence method for selecting the Utility module
     * @returns {object}
     */
    getUtil: function ()
    {
        return this[getSDG().getSetup().SYSTEM.UTILITY];
    },
    /**
     * Adds convenience function to SDG Object to quickly select the logger
     * @param message
     * @param level
     * @param messageObjects
     */
    log: function (message, level, messageObjects)
    {
        this.getCore().get(getSDG().getSetup().MODULES.LOGGER).log(message, level, messageObjects);
    },
    /**
     * Adds convenience function to SDG Object to quickly select the log level based on a string
     * @param levelAsString
     */
    loglvl: function (levelAsString)
    {
        return this.getCore().get(getSDG().getSetup().MODULES.LOGGER).getLogLevelAsString(levelAsString)
    },
    buildAd: function (params, callback) {
        getSDG().getCore().get(getSDG().getSetup().MODULES.FORMAT_CONFIG).buildAd(params, callback)
    },
    addInfoToolReport: function(string){
        return getSDG().getCore().get(getSDG().getSetup().MODULES.INFOTOOL).addInfoToolReport(string)
    }
};
window.getSDG = function ()
{
    return SDG;
};
SDG[getSDG().getSetup().SYSTEM.MODULES] = {};
SDG[getSDG().getSetup().SYSTEM.RESOURCES] = {};


/**
 * @class Name space for ad server adapters.
 */
getSDG()[getSDG().getSetup().SYSTEM.MODULES].AdTechIQAdServer = function (config)
{
    this._config = config;
    this._adserverConfigEntry = 'aol';
    this._adServerName = 'AOL One';
    this._loadTypes = {
        instance: this,
        immoscout: function (placement)
        {
            getSDG().log(placement.getName() + ': register(): placement will load at once as immoscout special tag.', getSDG().loglvl('DEBUG'));
            placement.sendPlacementPreparedEvent();
            if (placement.executePreCallSetup())
            {
                placement.loadType = 'ImmoscoutSpecial';
                placement.stats.loaded = true;
                document.write(this.createAdserverTag(placement))
            } else
            {
                getSDG().log(placement.getName() + ': register(): problem with Immobilienscout special tag!', getSDG().loglvl('DEBUG'));
            }
        },
        asynchron: function (placement)
        {
            if(this.setPlacementAsynchron(placement)){
                getSDG().log(placement.getName() + ': register(): placement set up as asynchron JavaScript.', getSDG().loglvl('DEBUG'));
            }else{
                getSDG().log(placement.getName() + ': register(): problem during setup of asynchron tagType!', getSDG().loglvl('DEBUG'));
            }
        },
        iframe: function (placement)
        {
            if(this.wrapInFriendlyIframe(placement)){
                getSDG().log(placement.getName() + ': register(): placement set up as friendly Iframe', getSDG().loglvl('DEBUG'));
            }else{
                getSDG().log(placement.getName() + ': register(): problem during setup of friendly Iframe tagType!', getSDG().loglvl('DEBUG'));
            }
        }
    };
    this._loadSlotNumber = (!!parseFloat(this._config.getCommonValue('sequenceSlotCount'))) ? parseFloat(this._config.getCommonValue('sequenceSlotCount')) + 1 : 1;
    this._defaultTagTemplate = 'addyn';
    getSDG().getEventDispatcher().trigger('SDG_AD_SERVER_MODULE_LOADED');
};
//noinspection JSUnusedLocalSymbols
getSDG()[getSDG().getSetup().SYSTEM.MODULES].AdTechIQAdServer.prototype = {
    /**
     * Generate ad call name from current configuration for given position.
     *
     * @param {String} placement
     * @return {String}
     */
    returnAdServerPlacementName: function (placement)
    {
        //noinspection JSUnresolvedVariable
        var alias = this._config.getCommonValue('aolOneDesktopName') +
            '_' + this._config.getZone() +
            '_' + this._config.getPageType() +
            '_' + ((typeof this._config.getValueForPosition(placement.getName(),'aolOnePositionAlias') !== 'undefined') ? this._config.getValueForPosition(placement.getName(),'aolOnePositionAlias') : placement.getName());
        if (alias.length > 128)
        {
            getSDG().log('SYSTEM: AdServerAdapter:  Generated alias for "' + position + '" is longer that 128 chars.', getSDG().loglvl('ALERT'));
        }
        return alias;
    },
    getPlacementIdentifierByPosition: function (position)
    {
        return parseFloat(this._config.getValueForPosition(position, 'fallback'))
    },
    finishPlacementConstruction: function (placement)
    {
        var loadType = this._config.getValueForPosition(placement.getName(), 'aolOneTagType');

        placement.containerId = placement.getContainer().id; //tagMan backwards compatibility, can be removed after 01.08.2017

        placement.tagTemplateType = this._defaultTagTemplate;
        if (!parseFloat(this._config.getValueForPosition(placement.getName(), 'sequenceSlot')))
        {
            placement.sequenceSlot = this._loadSlotNumber;
            this._loadSlotNumber++;

        } else
        {
            placement.sequenceSlot = parseFloat(this._config.getValueForPosition(placement.getName(), 'sequenceSlot'))
        }
        if (loadType !== undefined && !!this._loadTypes[loadType]) //check if a special tagType has to be used otherwise do nothing
        {
            this._loadTypes[loadType].call(this, placement);
        }else{
            placement.loadType = 'synchron'
        }

    },
    updateKeywords: function () {
        //inactive in this adserver module
    },
    /**
     * adds a keyvalue pair to adserver API
     * @param key
     */
    sendKeyValueUpdate: function (key) {
        //inactive in this adserver module
    },
    /**
     * removes a keyvalue from adserver API
     * @param key
     */
    sendKeyValueRemove: function (key) {
        //inactive in this adserver module
    },
    getKeywordString: function ()
    {
        var kwString = '';
        if (this._config.getKeywords().length)
        {
            kwString = 'key=' + this._config.getKeywords().join('+') + ';';
        }
        return kwString;
    },
    getKeyValueString: function (placement)
    {
        var
            kvString = '',
            globalKeyValues = this._config.getKeyValues(),
            localKeyValues = placement.localTargeting,
            kv = {},
            key;
        kv = getSDG().getUtil().mergeTargetingsRecursive(kv, globalKeyValues);
        kv = getSDG().getUtil().mergeTargetingsRecursive(kv, localKeyValues);
        for (key in kv)
        {
            if(!/n\d+/gi.test(key) && key !== "nuggad"){   // filter nuggad from AOLOne
                if (kv[key].length > 4096)
                {
                    getSDG().log('SYSTEM: AdServerAdapter: More than 4096 values for key "' + key + '" were added. AolOne will not parse all values!', getSDG().loglvl('ALERT'));
                }
                kvString += 'kv' + key + '=' + kv[key].join(':') + ';';
            }
        }
        return kvString;
    },
    createAdserverTag: function (placement) {
        var position = placement.getName(),
            params = {
                protocol: this._config.getProtocol(),
                host: this._config.getCommonValue('aolOneHost'),
                type: 'addyn',
                version: '3.0',
                networkId: this._config.getCommonValue('aolOneNetworkId'),
                fallbackPlacement: (this._config.getValueForPosition(position, 'aolOneFallback')) ? this._config.getValueForPosition(position, 'aolOneFallback') : '-1',
                size: (this._config.getValueForPosition(position, 'aolOneSize')) ? this._config.getValueForPosition(position, 'aolOneSize') : '-1',
                width: this._config.getValueForPosition(position, 'width'),
                height: this._config.getValueForPosition(position, 'height'),
                alias: this.returnAdServerPlacementName(placement),
                group: this._config.getGroup(),
                custom: this.getKeywordString() + this.getKeyValueString(placement),
                misc: SDG.getUtil().generateRandomNumberString(this._config.getCommonValue('aolOneMiscLength'))
            };
        return new SDG[getSDG().getSetup().SYSTEM.UTILITY].Template(this._config.getTemplateForType(placement.tagTemplateType)).render(params);
    },
    writeSynchronousTag: function (tagString, callback) {
        document.write('<script src="' + tagString + '" type="text/javascript"><\/script>');
        if (typeof callback === 'function') {
            callback()
        }
    },
    executeSingleAdSlotCall: function (placement)
    {
        if(placement.executePreCallSetup()){
            if(placement.stats.loaded){
                placement.deletePlacementContent();
            }
            if (!placement.flags.activeAsyncModule && (document.readyState !== 'interactive' && document.readyState !== 'complete'))
            {
                placement.sendPlacementCallingEvent();
                this.writeSynchronousTag(this.createAdserverTag(placement), function ()
                {
                    placement.placementResponded();
                }, false, false);
            } else
            {
                placement.sendPlacementCallingEvent();
                getSDG().getUtil().loadScript(this.createAdserverTag(placement), placement.getContainer(), function ()
                {
                    placement.placementResponded();
                }, true, false);
            }
            if (placement.flags.activeFriendlyIframe)
            {
                //todo evaluate if friendlyiframe is still needed
                // this.buildFriendlyIframe(placement.getContainer(), tagString)
            }
            return true;
        }else{
            getSDG().log('ADSERVER: ' + placement.getName() + ':  Load command received, but placement was not loaded.', getSDG().loglvl('NOTICE'));
            return false;
        }
    },
    /**
     * Will start the load process for mutiple placements defined by position argument
     *
     *
     * @param {boolean} reloadAds - Will load any placements on the site if set to true (default), will load only unloaded placements if set to false.
     */
    executeMutipleAdSlotCalls: function (reloadAds) {
        var currentPlacement,
            placementDirectory = getSDG().getCN().getPlacements(),
            readyPlacements = [],
            currentSequenceSlots = this._loadSlotNumber - 1;
        for (var i = 1; currentSequenceSlots >= i; i++) {
            for (var x in placementDirectory) {
                if(placementDirectory.hasOwnProperty(x)){
                    currentPlacement = placementDirectory[x];
                    if (currentPlacement.sequenceSlot === i && ((currentPlacement.stats.loaded !== true && currentPlacement.stats.loadDelayed !== true) || reloadAds)) {
                        if (currentPlacement.executePreCallSetup() && currentPlacement.readyMultiAdServerCall()) {
                            readyPlacements.push(currentPlacement.getName());
                        }
                    }
                }
            }
        }
        if (readyPlacements.length > 0) {
            getSDG().log('ADSERVER: executeMutipleAdSlotCalls(): triggered, slots now loading are: %o', getSDG().loglvl('NOTICE'), [readyPlacements.toString()]);
            for (var y in readyPlacements) {
                if (typeof readyPlacements[y] === 'string') {
                    currentPlacement = getSDG().getCN().getPlacementByPosition(readyPlacements[y]);
                    currentPlacement.load()
                }
            }
        }
        return true;
    },
    readyMultiAdServerCall: function (placement) {
        if(this.setPlacementAsynchron(placement)){
            getSDG().log('SYSTEM: AdServerAdapter: Setting position '+placement.getName()+' to asynchron, otherwise the ad might load not correctly in placement container!', getSDG().loglvl('DEBUG'));
            return true;
        }else{
            getSDG().log('SYSTEM: AdServerAdapter: readyMultiAdServerCall(): Error during setting up '+placement.getName()+' as asynchron!', getSDG().loglvl('ALERT'));
        }
    },
    deleteAdserverPlacement: function (placement) {
        //getSDG().log('SYSTEM: AdServerAdapter:  deleteAdserverPlacement() not set in new adServer module. Module will not work properly', getSDG().loglvl('ALERT'), placement);
        return true;
    },
    setPlacementAsynchron: function (placement) {
        placement.flags.activeAsyncModule = true;
        placement.loadType = 'asynchronousJavascript';
        return true
    },
    wrapInFriendlyIframe: function (placement) {
        placement.flags.activeFriendlyIframe = true;
        placement.loadType = 'friendlyIframe';
        return true
    },
    /**
     * checks if the adserver features a mobile breakpoint, returns true if a breakpoint is found
     * @returns {boolean}
     */
    checkForMobileBreakpoint: function (){
        return !!this._config.getCommonValue('mobileBreakpoint');
    },
    /**
     * returns the mobile rbeakpoint for the site if present in the config
     * @returns {*}
     */
    returnMobileBreakpoint: function () {
        if (!!this._config.getCommonValue('mobileBreakpoint')) {
            return parseFloat(this._config.getCommonValue('mobileBreakpoint'))
        } else {
            return 0
        }
    }
};
/**
 * @class Name space for ad server adapters.
 */
getSDG()[getSDG().getSetup().SYSTEM.MODULES].GoogleDfp = function (config) {
    this._config = config;
    this._defaultLoadType = 'standardGpt';
    this._firstCall = true;
    this._keywordStorage = [];
    this._adserverConfigEntry = 'dfp';
    this._correlatorTimestamp = 0;
    this._adServerName = 'Google Doubleclick for Publishers';
    var gptParameters = this._config._adserverConfig.dfp.config;
    //initialize googletag command queue
    window.googletag = window.googletag || {};
    window.googletag.cmd = window.googletag.cmd || [];
    window.googletag.cmd.push(function () {
        getSDG().getEventDispatcher().trigger('SDG_AD_SERVER_MODULE_LOADED');
        getSDG().getCore().get(getSDG().getSetup().MODULES.ADSERVER).updateKeywords();
    });
    //decide which tagVersion to use
    if (gptParameters) {
        if (typeof gptParameters.useSynchronTags !== 'undefined') {
            this._gptUseSynchronTags = gptParameters.useSynchronTags
        }
        if (typeof  gptParameters.useSingleRequest !== 'undefined') {
            this._gptUseSingleRequest = gptParameters.useSingleRequest
        }
        if (typeof gptParameters.collapseEmptyDivs !== 'undefined') {
            this._gptCollapseEmptyDivs = gptParameters.collapseEmptyDivs
        }
        if (typeof gptParameters.collapseDivsBeforeFetch !== 'undefined') {
            this._gptCollapseDivsBeforeFetch = gptParameters.collapseDivsBeforeFetch
        }
    }
    //insert GPT scripte to head or via document.write depending on loadMode
    if (this._gptUseSynchronTags) {
        document.write('<!--suppress JSUnresolvedLibraryURL --><script src="//www.googletagservices.com/tag/js/gpt.js"><\/script>');
        getSDG().log('SYSTEM: Google Publisher Tag loaded in blocking mode via document.write()', getSDG().loglvl('NOTICE'));
    } else {
        var scriptAnchor = document.getElementsByTagName('head')[0];
        getSDG().getUtil().loadScript('//www.googletagservices.com/tag/js/gpt.js', scriptAnchor, function () {
            getSDG().log('SYSTEM: Google Publisher Tag loaded and attached to %o', getSDG().loglvl('NOTICE'), [scriptAnchor]);
        }, false);
    }
    if (this._gptUseSingleRequest) {
        window.googletag.cmd.push(function () {
            getSDG().log('SYSTEM: ADSERVER: Setting DFP to Single Request Mode', getSDG().loglvl('INFO'));
            //noinspection JSUnresolvedFunction
            window.googletag.pubads().enableSingleRequest();
        });
    }
    if (this._gptUseSynchronTags) {
        window.googletag.cmd.push(function () {
            getSDG().log('SYSTEM: ADSERVER: Setting DFP to Sync Render Mode', getSDG().loglvl('INFO'));
            //noinspection JSUnresolvedFunction
            window.googletag.pubads().enableSyncRendering();
        });
    } else {
        window.googletag.cmd.push(function () {
            getSDG().log('SYSTEM: ADSERVER: Setting DFP to Asynchronous Render Mode', getSDG().loglvl('INFO'));
            //noinspection JSUnresolvedFunction
            window.googletag.pubads().enableAsyncRendering();
            //noinspection JSUnresolvedFunction
            window.googletag.pubads().disableInitialLoad();
        });
    }
    if (this._gptCollapseEmptyDivs) {
        if (this._gptCollapseDivsBeforeFetch) {
            window.googletag.cmd.push(function () {
                getSDG().log('SYSTEM: ADSERVER: Setting DFP to collapse DIVs before rendering', getSDG().loglvl('INFO'));
                //noinspection JSUnresolvedFunction
                window.googletag.pubads().collapseEmptyDivs(true, true);
            });
        } else {
            window.googletag.cmd.push(function () {
                getSDG().log('SYSTEM: ADSERVER: Setting DFP to collapse empty DIVs after rendering', getSDG().loglvl('INFO'));
                //noinspection JSUnresolvedFunction
                window.googletag.pubads().collapseEmptyDivs(true, false);
            });
        }
    }
    window.googletag.cmd.push(function () {
        //noinspection JSUnresolvedFunction
        window.googletag.pubads().addEventListener('slotRenderEnded', function (event) {
            //noinspection JSUnresolvedFunction,JSUnresolvedVariable
            var placement;
            //noinspection JSUnresolvedVariable,JSUnresolvedFunction
            if (typeof getSDG().getCN().getPlacementByContainerId(event.slot.getSlotElementId()) !== 'undefined') {
                //noinspection JSUnresolvedVariable,JSUnresolvedFunction
                placement = getSDG().getCN().getPlacementByContainerId(event.slot.getSlotElementId());
                //noinspection JSUnresolvedVariable
                placement.finalizeCall({
                    systemIds: {
                        doubleclick: {
                            advertiserId: event.advertiserId,
                            campaignId: event.campaignId,
                            adId: event.creativeId,
                            labelIds: event.labelIds,
                            flightId: event.lineItemId,
                            websiteId: (!!getSDG().getPUB().getConfig().getValueForPosition(placement.getName(), 'isMobileSlot')) ? getSDG().getPUB().getConfig().getCommonValue('dfpMobileName') : getSDG().getPUB().getConfig().getCommonValue('dfpDesktopName')
                        }
                    }
                });
            }
        });
    });
    window.addEventListener('beforeLoadAll', function () {
        window.googletag.cmd.push(function () {
            getSDG().log('SYSTEM: ADSERVER: DFP setup finished. GPT Services enabled', getSDG().loglvl('INFO'));
            //noinspection JSUnresolvedVariable
            if (typeof googletag.pubadsReady === 'undefined') {
                //noinspection JSUnresolvedFunction
                window.googletag.enableServices();
            }
        });
    });
    this._config = config;
    this._defaultLoadType = 'standardGpt';
    this._firstCall = true;
    this._keywordStorage = [];
    this._loadTypes = {
        instance: this,
        /**
         * Basic tagType for GPT intended for simple delivery of a slot to the page.
         * Can be used in synchron and asynchron modus.
         * @param placement - the placement passed by the register() function
         */
        standardGpt: function (placement) {
            placement.loadType = 'standardGpt';
            window.googletag.cmd.push(function () {
                getSDG().log('ADSERVER: ' + placement.getName() + ': placement set up as standard DFP GPT.', getSDG().loglvl('DEBUG'));
                //noinspection JSUnresolvedFunction
                window["slot" + placement.getName()] = window.googletag.defineSlot(getSDG().getPUB().getAdServer().returnDfpPath(placement), placement.sizeParams.sizeArray, placement.getContainer().id).addService(window.googletag.pubads());
                placement.gptSlot = window["slot" + placement.getName()];
            });
        },
        outOfPageGpt: function (placement) {
            placement.loadType = 'outOfPageGpt';
            window.googletag.cmd.push(function () {
                getSDG().log('ADSERVER: ' + placement.getName() + ': placement set up as OutOfPage DFP GPT.', getSDG().loglvl('DEBUG'));
                //noinspection JSUnresolvedFunction
                placement.gptSlot = window.googletag.defineOutOfPageSlot(getSDG().getPUB().getAdServer().returnDfpPath(placement), placement.getContainer().id).addService(window.googletag.pubads());
            });
        }
    };
    this._loadSlotNumber = (!!parseFloat(this._config.getCommonValue('sequenceSlotCount'))) ? parseFloat(this._config.getCommonValue('sequenceSlotCount')) + 1 : 1;
};
getSDG()[getSDG().getSetup().SYSTEM.MODULES].GoogleDfp.prototype = {
    /**
     * returns the DoubleClick for Publisher AdUnit path based on the current set zone
     * @param placement
     */
    returnDfpPath: function (placement) {
        return this._config.getCommonValue('dfpNetwork') +
            '/' + ( (!!this._config.getValueForPosition(placement.getName(), 'isMobileSlot') && !!this._config.getCommonValue('dfpMobileName')) ? this._config.getCommonValue('dfpMobileName') : this._config.getCommonValue('dfpDesktopName') ) +
            '/' + placement.getZone() + ((!!this._config.getValueForPosition(placement.getName(), 'dfpZonePostfix')) ? this._config.getValueForPosition(placement.getName(), 'dfpZonePostfix') : '');
    },
    /**
     * Generate ad call name from current configuration for given placement.
     *
     * @param {object} placement
     * @return {String}
     */
    returnAdServerPlacementName: function (placement) {
        var placementName = '/' + this.returnDfpPath(placement) +
            '/' + placement.getName();
        if (placementName.length > 128) {
            getSDG().log('SYSTEM: ADSERVER:  Generated alias "' + placementName + '" is longer that 128 chars.', getSDG().loglvl('ALERT'));
        }
        return placementName;
    },
    /**
     * Populates the placement created by register() with adserver specific values and parameters.
     *
     * @param placement
     */
    finishPlacementConstruction: function (placement) {
        placement.loadType = (this._config.getValueForPosition(placement.getName(), 'dfpTagType')) ? this._config.getValueForPosition(placement.getName(), 'dfpTagType') : this._defaultLoadType;
        //create GPT sizeArrays
        if (typeof this._config.getValueForPosition(placement.getName(), 'dfpSizes') !== 'undefined') {
            placement.sizeParams.sizeArray = this._config.getValueForPosition(placement.getName(), 'dfpSizes')
        }
        if (!parseFloat(this._config.getValueForPosition(placement.getName(), 'sequenceSlot'))) {
            placement.sequenceSlot = this._loadSlotNumber;
            this._loadSlotNumber++;
        } else {
            parseFloat(this._config.getValueForPosition(placement.getName(), 'sequenceSlot'))
        }
    },
    /**
     * sends the whole keyword stack to GPT
     */
    updateKeywords: function () {
        window.googletag.cmd.push(function () {
            //noinspection JSUnresolvedFunction
            window.googletag.pubads().setTargeting('keywords', getSDG().getPUB().getConfig().getKeywords())
        });
    },
    /**
     * adds a keyvalue pair to adserver API
     * @param key
     */
    sendKeyValueUpdate: function (key) {
        window.googletag.cmd.push(function () {
            //noinspection JSUnresolvedFunction
            window.googletag.pubads().setTargeting(key, getSDG().getPUB().getConfig().getKeyValues()[key])
        });
    },
    /**
     * removes a keyvalue from adserver API
     * @param key
     */
    sendKeyValueRemove: function (key) {
        window.googletag.cmd.push(function () {
            //noinspection JSUnresolvedFunction
            window.googletag.pubads().clearTargeting(key)
        });
    },
    /**
     * call a single placement and start the load process. If the gpt correlator is older then 5 seconds, update the correlator
     *
     * @param placement
     * @returns {boolean}
     */
    executeSingleAdSlotCall: function (placement) {
        var instance = this;
        window.googletag.cmd.push(function () {
            var currentTime;
            if (instance._correlatorTimestamp === 0) {
                instance._correlatorTimestamp = new Date().getTime();
                //noinspection JSUnresolvedFunction
                window.googletag.pubads().updateCorrelator();
            } else {
                currentTime = new Date().getTime();
                if (currentTime - instance._correlatorTimestamp > 5000) {
                    instance._correlatorTimestamp = currentTime;
                    //noinspection JSUnresolvedFunction
                    window.googletag.pubads().updateCorrelator();
                }
            }
            if (placement.executePreCallSetup() && instance.checkAndPrepareGptPlacement(placement)) {
                /**
                 * If the setup is asynchron, trigger the first time GTP display command, after that only use the GPT refreh command
                 * If the setup is sync, trigger GTP display wtih all necessary metaTag Events
                 */
                if (!this._gptUseSynchronTags) {
                    if (!placement.stats.loaded) {
                        window.googletag.display(placement.getContainer().id);
                    }
                    placement.sendPlacementCallingEvent();
                    placement.stats.loaded = true;
                    //noinspection JSUnresolvedFunction
                    window.googletag.pubads().refresh([placement.gptSlot], {changeCorrelator: false});
                    placement.placementResponded();
                } else {
                    placement.sendPlacementCallingEvent();
                    placement.stats.loaded = true;
                    window.googletag.display(placement.getContainer().id);
                    placement.placementResponded();
                }
                return true;
            } else {
                getSDG().log('ADSERVER: ' + placement.getName() + ':  Load command received, but placement was not loaded.', getSDG().loglvl('NOTICE'));
                return false;
            }
        });
    },
    /**
     * Will start the load process for mutiple placements defined by position argument
     *
     *
     * @param {boolean} reloadAds - Will load any placements on the site if set to true (default), will load only unloaded placements if set to false.
     */
    executeMutipleAdSlotCalls: function (reloadAds) {
        var instance = this;
        window.googletag.cmd.push(function () {
            var currentPlacement,
                placementDirectory = getSDG().getCN().getPlacements(),
                readyPlacements = [],
                currentSequenceSlots = instance._loadSlotNumber - 1;
            for (var i = 1; currentSequenceSlots >= i; i++) {
                for (var x in placementDirectory) {
                    if (placementDirectory.hasOwnProperty(x)) {
                        currentPlacement = placementDirectory[x];
                        if (currentPlacement.sequenceSlot === i && ( (currentPlacement.stats.loaded !== true && currentPlacement.stats.loadDelayed !== true) || reloadAds)) {
                            readyPlacements.push(currentPlacement.getName());
                        }
                    }
                }
            }
            if (readyPlacements.length > 0) {
                getSDG().log('ADSERVER: executeMutipleAdSlotCalls(): triggered, slots now loading are: %o', getSDG().loglvl('NOTICE'), [readyPlacements.toString()]);
                for (var y in readyPlacements) {
                    if (typeof readyPlacements[y] === 'string') {
                        currentPlacement = getSDG().getCN().getPlacementByPosition(readyPlacements[y]);
                        if (this._gptUseSingleRequest) {

                        }
                        currentPlacement.load()
                    }
                }
            }
        });
        return true;
    },
    getAdgetAdCallHtml: function (position, templateType) {
        getSDG().log('SYSTEM: AdServerAdapter:  getAdgetAdCallHtml() not set in DFP adServer module. Function is not needed.', getSDG().loglvl('NOTICE'), [position, templateType]);
        return true;
    },
    readyMultiAdServerCall: function (placement) {
        getSDG().log('SYSTEM: AdServerAdapter:  readyMultiAdServerCall() not set in DFP adServer module. Function is not needed.', getSDG().loglvl('NOTICE'), placement);
        return true;
    },
    /**
     * checks if the adserver features a mobile breakpoint, returns true if a breakpoint is found
     * @returns {boolean}
     */
    checkForMobileBreakpoint: function () {
        return !!this._config.getCommonValue('mobileBreakpoint');
    },
    /**
     * returns the mobile breakpoint as floating integer, or zero if not present
     * @returns {*}
     */
    returnMobileBreakpoint: function () {
        if (!!this._config.getCommonValue('mobileBreakpoint')) {
            return parseFloat(this._config.getCommonValue('mobileBreakpoint'))
        } else {
            return 0
        }
    },
    /**
     * Delete the placement from GPT
     * @param placement
     * @returns {boolean}
     */
    deleteAdserverPlacement: function (placement) {
        window.googletag.cmd.push(function () {
            //noinspection JSUnresolvedFunction
            window.googletag.destroySlots([placement.gptSlot]);
        });
        return true;
    },
    /**
     * Check if there is a load type set for the position, than call the loadType and parse localTargeting of the placement to GPT m
     * @param placement
     * @returns {boolean}
     */
    checkAndPrepareGptPlacement: function (placement) {
        if (typeof placement.gptSlot !== 'object' && placement.loadType !== undefined && !!this._loadTypes[placement.loadType]) {
            this._loadTypes[placement.loadType].call(this, placement);
        }
        for (var key in placement.localTargeting) {
            if (placement.localTargeting.hasOwnProperty(key)) {
                (function (placementKey, targetingKey) {
                    window.googletag.cmd.push(function () {
                        placementKey.gptSlot.setTargeting(targetingKey, placement.localTargeting[targetingKey])
                    });
                })(placement, key);
            }
        }
        return true;
    },
    setPlacementAsynchron: function (placement) {
        getSDG().log('SYSTEM: AdServerAdapter:  setPlacementAsynchron() not set in new adServer module. GPT does not need this function!', getSDG().loglvl('DEBUG'), placement);
        return true
    },
    wrapInFriendlyIframe: function (placement) {
        getSDG().log('SYSTEM: AdServerAdapter:  wrapInFriendlyIframe() not set in new adServer module. GPT does not need this function!', getSDG().loglvl('DEBUG'), placement);
        return true
    }
};
getSDG()[getSDG().getSetup().SYSTEM.MODULES].Advertisment = function (anchor, jsonData) {
    this._mediaSegments = {
        anchor: anchor
    };
    this._countPixel = {
        container: undefined
    };
    this._jsonData = jsonData;
};
getSDG()[getSDG().getSetup().SYSTEM.MODULES].Advertisment.prototype = {
    getAnchor: function () {
        if (!!this._mediaSegments.anchor) {
            return this._mediaSegments.anchor
        } else {
            return false
        }
    },
    addMedia: function (name, mediaObj) {
        return this._mediaSegments[name] = mediaObj;
    },
    getMedia: function (name) {
        return this._mediaSegments[name]
    },
    getReponseParameters: function(){
        return this._jsonData
    },
    createCountContainer: function () {
        this._countPixel.container = document.createElement('div');
        this._countPixel.container.className = 'sdgCountPixelAnker';
        this._countPixel.container.style["display"] = 'none';
        return this._countPixel.container
    },
    addCountPixel: function (number, counter) {
        return this._countPixel[number] = counter;
    },
    getCountContainer: function () {
        if (this._countPixel.container !== undefined) {
            return this._countPixel.container
        } else {
            return this.createCountContainer()
        }
    },
    deleteAllContent: function() {
        var segment,
            pixel;
        for(segment in this._mediaSegments){
            if(this._mediaSegments.hasOwnProperty(segment)){
                if(segment !== 'anchor'){
                    if(typeof this._mediaSegments[segment] !== 'undefined' && this._mediaSegments[segment].parentNode !== null){
                        this._mediaSegments[segment].parentNode.removeChild(this._mediaSegments[segment])
                    }
                }
            }
        }
        if(!!this._mediaSegments['anchor'] && this._mediaSegments['anchor'].parentNode !== null){
            this._mediaSegments['anchor'].parentNode.removeChild(this._mediaSegments['anchor'])
        }
        delete this._mediaSegments;
        for(pixel in this._countPixel){
            if(this._countPixel.hasOwnProperty(pixel)){
                if(pixel !== 'container'){
                    if(typeof this._countPixel[pixel] !== 'undefined' && this._countPixel[pixel].parentNode !== null){
                        this._countPixel[pixel].parentNode.removeChild(this._countPixel[pixel])
                    }
                }
            }
        }
        if(!!this._countPixel['container'] && this._countPixel['container'].parentNode !== null){
            this._countPixel['container'].parentNode.removeChild(this._countPixel['container'])
        }
        delete this._countPixel;
    }
};
getSDG()[getSDG().getSetup().SYSTEM.ADTEMPLATES] = {
    featureController: {
        currentStickies: {},
        currentBackgrounds: {},
        currentResizes: {},
        currentScrollTop: 0,
        currentScrollleft: 0,
        currentViewportWidth: 0,
        currentViewportHeight: 0,
        siteAdhesionUnitHeight: 0,
        eventsActive: false,
        /**
         * Constrcutor for a new stickyObject. Each stickyObject will be managed by on their own, but will share information between them.
         * StickyObjects can be stacked on the site, for example an object should only be sticky for the first 1000pixel scrolled down, then another object should start to be sticky.
         * The position of the sticky object will be updated on scroll and resize of the browser and will always try to keep their position, no matter what.
         *
         *
         * @param stickObj
         * @param {object} referenceObject Object can by anywhere on the site to function as reference, as long as reference will be moved when the browser is resized.
         * Should the object be static, even on a resize, the position of the stickyObject will not be updated.
         * @constructor
         */
        StickyInstance: function (stickObj, referenceObject) {
            this.active = true;
            this.stickyObject = stickObj;
            this.refObj = referenceObject;
            this.startTop = 0;
            this.endTop = 40000;
            this.objectOrginalStyleTop = (this.stickyObject.style["top"] !== '') ? parseFloat(this.stickyObject.style["top"]) : (window.getComputedStyle(this.stickyObject).getPropertyValue('top') !== "" && window.getComputedStyle(this.stickyObject).getPropertyValue('top') !== "auto") ? parseFloat(window.getComputedStyle(this.stickyObject).getPropertyValue('top')) : 0;
            this.objectOrginalStyleLeft = (this.stickyObject.style["left"] !== '') ? parseFloat(this.stickyObject.style["left"] ) : (window.getComputedStyle(this.stickyObject).getPropertyValue('left') !== "" && window.getComputedStyle(this.stickyObject).getPropertyValue('left') !== "auto") ? parseFloat(window.getComputedStyle(this.stickyObject).getPropertyValue('left')) : 0;
            this.objectOrginalStylePosition = this.stickyObject.style["position"];
            this.objectOrginalPosTop = getSDG().getUtil().getPos(this.stickyObject).top;
            this.objectOrginalPosLeft = getSDG().getUtil().getPos(this.stickyObject).left;
            this.leftDifferenceFromObjectToReference = getSDG().getUtil().getPos(this.stickyObject).left - getSDG().getUtil().getPos(this.refObj).left;
        },
        BackgroundInstance: function (color, referenceObject) {
            this.inView = false;
            this.color = color;
            this.refObj = referenceObject;
            this.startTop = (getSDG().getUtil().getPos(this.refObj).top < 300) ? 0 : IM.getUtil().getPos(this.refObj).top - 2 * (referenceObject.offsetHeight);
            this.endTop = 40000;
            this.objOrgPosTop = getSDG().getUtil().getPos(this.refObj).top;
        },
        ResizeInstance: function (resizeObject, referenceObject, negativeLeftPosition) {
            this.refObj = referenceObject;
            this.resObj = resizeObject;
            this.recalcLeft = (typeof negativeLeftPosition !== 'undefined') ? negativeLeftPosition : false;
            this.objOrgPosTop = getSDG().getUtil().getPos(this.resObj).top;
            this.objOrgPosLeft = getSDG().getUtil().getPos(this.resObj).left;
        },
        calculateResize: function (instance) {
            if (instance.resObj.style["position"] === "absolute") {
                if (instance.recalcLeft) {
                    instance.resObj.style.width = getSDG().getUtil().getPos(instance.refObj).left + 'px';
                    instance.resObj.style.left = -getSDG().getUtil().getPos(instance.refObj).left + 'px';
                    if (!!this.currentStickies[instance.resObj.nodeName + '-' + instance.resObj.id]) {
                        this.currentStickies[instance.resObj.nodeName + '-' + instance.resObj.id].objOrgStyleLeft = -parseFloat(instance.resObj.style.width);
                    }
                } else {
                    instance.resObj.style.width = this.currentViewportWidth - getSDG().getUtil().getPos(instance.refObj).left - getSDG().getUtil().getObjectDimensions(instance.refObj).width + 'px';
                }
            } else if (instance.resObj.style["position"] === 'fixed') {
                if (instance.recalcLeft) {
                    instance.resObj.style.width = getSDG().getUtil().getPos(instance.refObj).left + 'px';
                    if (!!this.currentStickies[instance.resObj.nodeName + '-' + instance.resObj.id]) {
                        this.currentStickies[instance.resObj.nodeName + '-' + instance.resObj.id].objOrgStyleLeft = -getSDG().getUtil().getPos(instance.refObj).left;
                    }
                } else {
                    instance.resObj.style.width = this.currentViewportWidth - getSDG().getUtil().getPos(instance.refObj).left - getSDG().getUtil().getObjectDimensions(instance.refObj).width + 'px';
                }
            }
        },
        /**
         *  Will calculate the position of the sticky object based on the scroll position of the browser. Depending on this the sticky object will shift between 3 "states"
         *  1.) transition to sticky
         *  2.) transition to non-sticky
         *  3.) update while sticky
         *  During these states some inline styles of the object will change, if necessary.
         *  This calculation tries to use as little resources as possible and therefor use general saved position calculations from the featureController
         * @param {object} instance
         */
        calculateSticky: function (instance) {
            var scrollTop = this.currentScrollTop,
                scrollLeft = this.currentScrollleft,
                adhesionUnitHeight = this.siteAdhesionUnitHeight,
                stickyObject = instance.stickyObject,
                posLeft;
            if (instance.active) {
                if (instance.objectOrginalPosTop - (scrollTop + adhesionUnitHeight) <= 0 && stickyObject.style["position"] !== 'fixed' && scrollTop >= instance.startTop) {
                    stickyObject.style["position"] = 'fixed';
                    stickyObject.style.left = instance.objectOrginalPosLeft + 'px';
                    stickyObject.style.top = adhesionUnitHeight + 'px';
                }
                if ((instance.objectOrginalPosTop - (scrollTop + adhesionUnitHeight) >= 0 || scrollTop >= instance.endTop) && stickyObject.style["position"] === 'fixed') {
                    stickyObject.style["position"] = instance.objectOrginalStylePosition;
                    stickyObject.style.left = instance.objectOrginalStyleLeft + 'px';
                    stickyObject.style.top = instance.objectOrginalStyleTop + 'px';
                }
                if (instance.stickyObject.style["position"] === 'fixed') {
                    posLeft = getSDG().getUtil().getPos(instance.refObj).left + instance.leftDifferenceFromObjectToReference - scrollLeft;
                    if (parseFloat(stickyObject.style.left) !== posLeft) {
                        stickyObject.style.left = posLeft + 'px';
                    }
                    if (parseFloat(instance.stickyObject.style.top) !== adhesionUnitHeight) {
                        stickyObject.style.top = adhesionUnitHeight + 'px';
                    }
                }
            }
        },
        calculateBackground: function (instance) {
            var scrollTop = this.currentScrollTop;
            if (instance.startTop <= scrollTop && instance.endTop >= scrollTop && !instance.inView) {
                getSDG()[getSDG().getSetup().SYSTEM.ADTEMPLATES].setBackgroundColor(instance.color);
                instance.inView = true;
            }
            if ((instance.endTop <= scrollTop || instance.startTop >= scrollTop) && instance.inView) {
                instance.inView = false;
            }
        },
        processScrollFeatures: function () {
            for (var obj in this.currentStickies) {
                if(this.currentStickies.hasOwnProperty(obj)){
                    this.calculateSticky(this.currentStickies[obj]);
                }

            }
            for (var bgs in this.currentBackgrounds) {
                if(this.currentBackgrounds.hasOwnProperty(bgs)){
                    this.calculateBackground(this.currentBackgrounds[bgs]);
                }
            }
        },
        processResizeFeatures: function () {
            for (var obj in this.currentStickies) {
                if(this.currentStickies.hasOwnProperty(obj)){
                    this.calculateSticky(this.currentStickies[obj]);
                }

            }
            for (var res in this.currentResizes) {
                if(this.currentResizes.hasOwnProperty(res)){
                    this.calculateResize(this.currentResizes[res]);
                }
            }
        },
        activateEvents: function () {
            var selfReference = this;
            getSDG().getUtil().addEventListener(window, 'scroll', function () {
                var scrollPos = getSDG().getUtil().getScrollPositions(),
                    adhesionUnit = getSDG().getPUB().getConfig().getAdhesionUnit();
                this.currentScrollTop = scrollPos.top;
                this.currentScrollleft = scrollPos.left;
                this.siteAdhesionUnitHeight = (!!adhesionUnit) ? adhesionUnit.offsetHeight : 0;
                this.processScrollFeatures();
            }.bind(selfReference));
            getSDG().getUtil().addEventListener(window, 'resize', function () {
                var viewport = getSDG().getUtil().getViewportDimensions();
                this.currentViewportWidth = viewport.width;
                this.currentViewportHeight = viewport.height;
                this.processResizeFeatures();
            }.bind(selfReference));
            this.eventsActive = true;
        },
        evaluateEndPositions: function (collection) {
            var level1 = [], level2 = [], level1End;
            for (var obj in collection) {
                if(collection.hasOwnProperty(obj)){
                    var collectionObject = collection[obj];
                    if (collectionObject.objOrgPosTop > 300) {
                        level2.push(collectionObject);
                    } else {
                        level1.push(collectionObject);
                    }
                }
            }
            if (level2.length > 0) {
                level1End = level2[0].objOrgPosTop - getSDG().getUtil().getViewportDimensions().height;
                for (var number in level1) {
                    level1[number].endTop = level1End;
                }
                for (var number2 in level2) {
                    level2[number2].startTop = level1End;
                }
            }
        }
    },
    /**
     * tries to determine which ad format should be constructed and which placement is involved.
     * If all is well the data is passed to the format constructor and waits for successfull return.
     * As soon as the format is constructed the data gets passes to the after build functions
     * @param formatObject
     * @param jsonData
     */
    startAdConstruction: function (formatObject, jsonData) {
        if (!!formatObject.getContainerPlacement()) {
            formatObject.getContainerPlacement().prepareNewAd(document.createElement('div'),jsonData);
            if (formatObject.selectTemplate()) {
                this.finishAdConstruction(formatObject)
            } else {
                getSDG().log('SYSTEM: FORMATS: ' + formatObject.getContainerPlacement().getName() + ': Error during ad construction. Calling template' + jsonData.adType + '() did not return positive results!', getSDG().loglvl('ERROR'));
            }
        } else {
            getSDG().log('SYSTEM: Error during ad construction. Placement for new ad not found, discarding impression for ad ' + jsonData.name + '! Please contact InteractiveMedia Technical Support for further informations.', getSDG().loglvl('EMERGENCY'));
        }
    },
    /**
     * Checks if any post construction features like background color or stickyObjects are needed and passes the data to these builders
     * @param formatObject
     */
    finishAdConstruction: function (formatObject) {
        var jsonData = formatObject.getResponseParameters(),
            placement = formatObject.getContainerPlacement();
        if (jsonData.countPix) {
            this.setupCountPixels(formatObject);
            placement.getContainer().appendChild(placement.getAd().getCountContainer());
        }
        //Starte Zaehlpixel Auslieferung, setze moegliche Stickys, Hintergrund und starte Sichtbarkeitsmessung
        if (!!jsonData.formatParams && jsonData.formatParams.useBackgroundColor && getSDG().getPUB().getConfig().getFeatureValue('allowBackgroundColor')) {
            this.addBackground(jsonData.formatParams.backgroundColor, placement.getAd().getMedia(jsonData.Media["1"].mediaName));
            if (jsonData.formatParams.backgroundClickable && getSDG().getPUB().getConfig().getFeatureValue('allowClickableBackground')) {
                this.buildBackgroundClick(formatObject);
            }
        }
        if (getSDG().getPUB().getConfig().getFeatureValue('allowStickies')) {
            this.processStickySegments(formatObject);
        }
        formatObject.executeCallback();
        getSDG().log(placement.getName() + ' ad assets build and appended to page. Delivery finished!', getSDG().loglvl('DEBUG'));
    },
    /**
     * Determines if countPixel are needed for this ad, if yes passes each pixel entry to the builder
     * @param formatObject
     */
    setupCountPixels: function (formatObject) {
        var jsonData = formatObject.getResponseParameters();
        for (var obj in jsonData.countPix) {
            if(jsonData.countPix.hasOwnProperty(obj)){
                this.buildCountPixel(formatObject, obj, jsonData.countPix[obj].tech, jsonData.countPix[obj].url);
            }
        }
    },
    /**
     * Adds an stickyObject to the featureController
     * @param stickyObj
     * @param referenceObj
     */
    addSticky: function (stickyObj, referenceObj) {
        this.featureController.currentStickies[stickyObj.nodeName + '-' + stickyObj.id] = new this.featureController.StickyInstance(stickyObj, referenceObj);
        if (this.featureController.eventsActive === false) {
            this.featureController.activateEvents();
        }
        this.featureController.evaluateEndPositions(this.featureController.currentStickies);
        this.featureController.processScrollFeatures();
    },
    /**
     * Adds an background color to the featureController
     * @param color
     * @param referenceObject
     */
    addBackground: function (color, referenceObject) {
        this.featureController.currentBackgrounds[referenceObject.nodeName + '-' + referenceObject.id] = new this.featureController.BackgroundInstance(color, referenceObject);
        if (this.featureController.eventsActive === false) {
            this.featureController.activateEvents();
        }
        this.featureController.evaluateEndPositions(this.featureController.currentBackgrounds)
    },
    /**
     * Adds a resizeObject to the featureController
     * @param {object} resizeObject
     * @param {object} referenceObject
     * @param {boolean} negativeLeftPosition - Is the resizeObject currently using a negative style.left position?
     */
    addResize: function (resizeObject, referenceObject, negativeLeftPosition) {
        this.featureController.currentResizes[resizeObject.nodeName + '-' + resizeObject.id] = new this.featureController.ResizeInstance(resizeObject, referenceObject, negativeLeftPosition);
        if (this.featureController.eventsActive === false) {
            this.featureController.activateEvents();
        }
    },
    buildMediaSegments: function (formatObject) {
        var currentJsonSegment,
            mediaContainer,
            fileObject,
            jsonData = formatObject.getResponseParameters(),
            ad = formatObject.getContainerPlacement().getAd();
        for (var obj in jsonData.Media) {
            if(jsonData.Media.hasOwnProperty(obj)){
                currentJsonSegment = jsonData.Media[obj];
                mediaContainer = ad.addMedia(currentJsonSegment.mediaName, this.buildContainer(currentJsonSegment));
                fileObject = this['build' + currentJsonSegment.file.type + 'Media'](currentJsonSegment, formatObject);
                if (!!fileObject) {
                    if (typeof fileObject === 'string') {
                        mediaContainer.innerHTML = fileObject;
                    }
                    else {
                        mediaContainer.appendChild(fileObject);
                    }
                    if (getSDG().getUtil().hasObjectKeys(currentJsonSegment.file.expandable)) {
                        this.buildExpandable(currentJsonSegment, formatObject)
                    }
                } else {
                    getSDG().log('SYSTEM: FORMATS: Error during MediaSegments construction! JSON segment causing the error: %o', getSDG().loglvl('ERROR'), [currentJsonSegment]);
                    return false;
                }
            }
        }
        return true;
    },
    buildContainer: function (jsonSegement) {
        var div = document.createElement('div');
        div.id = 'div-' + jsonSegement.file.fileId;
        div.style['top'] = 0;
        div.style['left'] = 0;
        div.style['zIndex'] = 2;
        return div;
    },
    buildExpandable: function (jsonSegement, formatObject) {
        var adSegment, cHeight, cWidth, mHeight, mWidth, collapseClip, top, left;
        adSegment = formatObject.getContainerPlacement().getAd().getMedia(jsonSegement.mediaName);
        cHeight = jsonSegement.file.expandable.collapsedHeight;
        cWidth = jsonSegement.file.expandable.collapsedWidth;
        mHeight = jsonSegement.file.height;
        mWidth = jsonSegement.file.width;
        adSegment.style['position'] = 'absolute';
        adSegment.style['overflow'] = 'hidden';
        switch (jsonSegement.file.expandable.direction) {
            case "u":
                collapseClip = 'rect(' + (mHeight - cHeight) + 'px ' + mWidth + 'px ' + mHeight + 'px 0px)';
                top = -(mHeight - cHeight);
                left = 0;
                break;
            case "ur":
                collapseClip = 'rect(' + (mHeight - cHeight) + 'px ' + cWidth + 'px ' + mHeight + 'px 0px)';
                top = -(mHeight - cHeight);
                left = 0;
                break;
            case "r":
                collapseClip = 'rect(0px ' + cWidth + 'px ' + mHeight + 'px 0px)';
                top = 0;
                left = 0;
                break;
            case "rd":
                collapseClip = 'rect(0px ' + cWidth + 'px ' + cHeight + 'px 0px)';
                top = 0;
                left = 0;
                break;
            case "d":
                collapseClip = 'rect(0px ' + mWidth + 'px ' + cHeight + 'px 0px)';
                top = 0;
                left = 0;
                break;
            case "dl":
                collapseClip = 'rect(0px ' + mWidth + 'px ' + cHeight + 'px ' + (mWidth - cWidth) + 'px)';
                top = 0;
                left = -(mWidth - cWidth);
                break;
            case "l":
                collapseClip = 'rect(0px ' + mWidth + 'px ' + mHeight + 'px ' + (mWidth - cWidth) + 'px)';
                top = 0;
                left = -(mWidth - cWidth);
                break;
            case "lu":
                collapseClip = 'rect(' + (mHeight - cHeight) + 'px ' + mWidth + 'px ' + mHeight + 'px ' + (mWidth - cWidth) + 'px)';
                top = -(mHeight - cHeight);
                left = -(mWidth - cWidth);
                break;
        }
        if (jsonSegement.file.expandable.startExpanded) {
            adSegment.style['clip'] = 'rect(0px ' + mWidth + 'px ' + mHeight + 'px 0px)';
        } else {
            adSegment.style['clip'] = collapseClip;
        }
        adSegment.style['clip'] = collapseClip;
        adSegment.style['top'] = top + 'px';
        adSegment.style['left'] = left + 'px';
        adSegment.style['zIndex'] = 100;
        adSegment.style['width'] = mWidth + 'px';
        adSegment.style['height'] = mHeight + 'px';
        window[jsonSegement.file.expandable.collapseFunc] = function () {
            adSegment.style['clip'] = collapseClip;
        };
        window[jsonSegement.file.expandable.expandFunc] = function () {
            adSegment.style['clip'] = 'rect(0px ' + mWidth + 'px ' + mHeight + 'px 0px)';
        };
        for (var entry in formatObject.getResponseParameters().Media) {
            if(formatObject.getResponseParameters().Media.hasOwnProperty(entry)){
                window[formatObject.getResponseParameters().Media[entry].file.fileId + '_DoFSCommand'] = function (command) {
                    switch (command) {
                        case jsonSegement.file.expandable.expandFsCommand:
                            window[jsonSegement.file.expandable.expandFunc]();
                            break;
                        case jsonSegement.file.expandable.collapseFsCommand:
                            window[jsonSegement.file.expandable.collapseFunc]();
                            break;
                    }
                }
            }
        }
    },
    buildFlashMedia: function (jsonSegement, formatObject) {
        var mediaString, adSegment;
        adSegment = formatObject.getContainerPlacement().getAd().getMedia(jsonSegement.mediaName);
        //todo IDs an Flashobjekten bei IE10 und hoeher, ansonsten Probleme mit JS Aufrufen aus Flashdateien
        if (getSDG().getUtil().checkFlashVersion(jsonSegement.file.plugin.minVersion)) {
            mediaString = '<object classid="clsid:d27cdb6e-ae6d-11cf-96b8-444553540000" width="' + jsonSegement.file.width + '" height="' + jsonSegement.file.height + '" '
                + 'id="' + jsonSegement.file.fileId + '"><param name="movie" value="' + jsonSegement.file.url + '"/>';
            for (var key in jsonSegement.file.plugin.params) {
                if(jsonSegement.file.plugin.params.hasOwnProperty(key)){
                    var value = jsonSegement.file.plugin.params[key];
                    mediaString += '<param name="' + key + '" value="' + value + '"/>';
                }
            }
            var flashvars = '';
            for (var number in jsonSegement.links) {
                if(jsonSegement.links.hasOwnProperty(number)){
                    key = jsonSegement.links[number];
                    if (number !== 1) {
                        flashvars += '&';
                    }
                    flashvars += key.variable + '=' + key.url;
                }
            }
            flashvars += (jsonSegement.file.plugin.additionalVariables !== '') ? '&' + jsonSegement.file.plugin.additionalVariables : '';
            mediaString += '<param name="flashvars" value="' + flashvars + '"/>'
                + '<embed src="' + jsonSegement.file.url + '" width="' + jsonSegement.file.width + '" height="' + jsonSegement.file.height + '" type="application/x-shockwave-flash" name="' + jsonSegement.file.fileId + '" ';
            for (key in jsonSegement.file.plugin.params) {
                if(jsonSegement.file.plugin.params.hasOwnProperty(key)){
                    value = jsonSegement.file.plugin.params[key];
                    mediaString += key + '="' + value + '" ';
                }
            }
            mediaString += 'flashvars="' + flashvars + '"></embed></object>';
            adSegment.style['width'] = jsonSegement.file.width + 'px';
            adSegment.style['height'] = jsonSegement.file.height + 'px';
        } else {
            mediaString = '<a id="' + jsonSegement.file.fileId + '" href="' + jsonSegement.file.altLink + '" target="' + jsonSegement.file.altTarget + '">'
                + '<img src="' + jsonSegement.file.altUrl + '" width="' + jsonSegement.file.altWidth + '" height="' + jsonSegement.file.altHeight + '" border="0"></a>';
            adSegment.style['width'] = jsonSegement.file.altWidth + 'px';
            adSegment.style['height'] = jsonSegement.file.altHeight + 'px';
        }
        return mediaString;
    },
    buildImageMedia: function (jsonSegement, formatObject) {
        var image, ahref, adSegment;
        adSegment = formatObject.getContainerPlacement().getAd().getMedia(jsonSegement.mediaName);
        ahref = document.createElement('a');
        ahref.href = jsonSegement.links["1"].url;
        ahref.target = jsonSegement.links["1"].target;
        ahref.id = jsonSegement.file.fileId;
        image = document.createElement('img');
        image.width = jsonSegement.file.width;
        image.height = jsonSegement.file.height;
        image.border = '0';
        image.src = jsonSegement.file.url;
        ahref.appendChild(image);
        adSegment.style['width'] = jsonSegement.file.width + 'px';
        adSegment.style['height'] = jsonSegement.file.height + 'px';
        return ahref;
    },
    buildHtmlMedia: function (jsonSegement, formatObject) {
        var iframe, adSegment;
        adSegment = formatObject.getContainerPlacement().getAd().getMedia(jsonSegement.mediaName);
        iframe = document.createElement('iframe');
        iframe.width = jsonSegement.file.width;
        iframe.height = jsonSegement.file.height;
        iframe.marginHeight = '0';
        iframe.marginWidth = '0';
        iframe.frameBorder = '0';
        iframe.scrolling = 'no';
        iframe.onload = function () {
            iframe.onload = '';
            iframe.contentWindow.inhalt = jsonSegement.file.htmlString;
            iframe.src = 'javascript:window["inhalt"]';
        };
        adSegment.style['width'] = jsonSegement.file.width + 'px';
        adSegment.style['height'] = jsonSegement.file.height + 'px';
        return iframe;
    },
    buildCountPixel: function (formatObject, name, tech, url) {
        var ad, pixel, container;
        ad = formatObject.getContainerPlacement().getAd();
        container = ad.getCountContainer();
        if (tech === 'image') {
            pixel = document.createElement('img');
            pixel.width = 1;
            pixel.height = 1;
            pixel.src = url;
            container.appendChild(ad.addCountPixel(name, pixel))
        }
        if (tech === 'javascript' || tech === 'iframe') {
            if (tech === 'javascript' && document.readyState !== 'loading') {
                ad.addCountPixel(name, getSDG().getUtil().loadScript(url, container));
            } else {
                pixel = document.createElement('iframe');
                pixel.src = 'about:blank';
                pixel.width = 1;
                pixel.height = 1;
                container.appendChild(ad.addCountPixel(name, pixel));
                if (tech === 'javascript') {
                    var listener = function () {
                        var element = pixel;
                        element.contentWindow.inhalt = '<!DOCTYPE html>'
                            + '<html><head><title>Dynamic iframe</title></head>'
                            + '<body style="margin:0;padding:0;">'
                            + '<script type="text/javascript" src="' + url + '"><\/script>'
                            + '</body></html>';
                        element.src = 'javascript:window["inhalt"]';
                        pixel.removeEventListener('load', listener, false)
                    };
                    pixel.addEventListener('load', listener, false);
                } else {
                    pixel.src = url;
                }
            }
        }
    },
    /**
     * Will return a div construct containing a advertisment label with a given position.
     *
     * @param pos_val - will require the css "position" value for the ad label, either absolute or relative
     * @param val_left - css "left" value
     * @param val_top - css "top" value
     * @returns {Element} - div element with id sdgAdLabel
     */
    setAdLabel: function (pos_val, val_left, val_top) {
        //Fuegt Anzeigenkennung ein, gibt Element zurueck
        var div = document.createElement('div');
        var img = document.createElement('img');
        div.id = 'sdgAdLabel';
        div.style['position'] = pos_val;
        div.style['left'] = val_left + 'px';
        div.style['top'] = val_top + 'px';
        img.src = 'data:image/gif;base64,R0lGODlhCAA8AIABAGZmZv///yH5BAEAAAEALAAAAAAIADwAAAI9jI+py+2vwJFG2hluBZzCZHGYlmGVuXkf0okri16ePLUvfG55SVJuubu1VMEikGW71X6kE7GZIiqn1CqiAAA7';
        img.width = '8';
        img.height = '60';
        div.appendChild(img);
        return div;
    },
    setBackgroundColor: function (color) {
        getSDG().getPUB().getConfig().executeLocalBackgroundColor(color);
        document.getElementsByTagName('body')[0].style['background'] = color
    },
    processStickySegments: function (formatObject) {
        var refObject,
            stickyObjs = [],
            currentMedia,
            jsonData = formatObject.getResponseParameters(),
            placement = formatObject.getContainerPlacement(),
            i;
        for (var obj in jsonData.Media) {
            if(jsonData.Media.hasOwnProperty(obj)){
                currentMedia = jsonData.Media[obj];
                if (!currentMedia.sticky && currentMedia["position"] === 'top') {
                    refObject = placement.getAd().getMedia(currentMedia.mediaName)
                }
                if (currentMedia.sticky) {
                    stickyObjs.push(placement.getAd().getMedia(currentMedia.mediaName));
                }
            }
        }
        if (typeof refObject === 'undefined') {
            refObject = placement.getContainer();
        }
        if (stickyObjs.length > 0) {
            for (i = 0; i < stickyObjs.length; i++) {
                this.addSticky(stickyObjs[i], refObject)
            }
        }
    },
    buildBackgroundClick: function (formatObject) {
        var divBgAnker,
            divBgLeft,
            divBgTop,
            divBgRight,
            bgArray,
            contentDim,
            viewHeight,
            viewWidth,
            placement = formatObject.getContainerPlacement(),
            linkurl = formatObject.getResponseParameters().formatParams.backgroundClickUrl;
        divBgAnker = document.createElement('div');
        divBgAnker.id = 'backgroundClickAnker-' + placement.getAd().getAnchor().id;
        divBgLeft = document.createElement('div');
        divBgLeft.id = 'divBgLeft-' + placement.getAd().getAnchor().id;
        divBgTop = document.createElement('div');
        divBgTop.id = 'divBgTop-' + placement.getAd().getAnchor().id;
        divBgRight = document.createElement('div');
        divBgRight.id = 'divBgRight-' + placement.getAd().getAnchor().id;
        contentDim = getSDG().getPUB().getConfig().getContentObject();
        viewWidth = getSDG().getUtil().getViewportDimensions().width;
        viewHeight = getSDG().getUtil().getViewportDimensions().height;
        bgArray = [divBgTop, divBgLeft, divBgRight];
        for (var div in bgArray) {
            if(bgArray.hasOwnProperty(div)){
                if (bgArray[div].tagName === 'DIV') {
                    bgArray[div].style.cssText = 'width:1px;height:1px;position:absolute;cursor:pointer;top:0;left:0;';
                    bgArray[div].onclick = function () {
                        window.open(linkurl);
                    };
                    divBgAnker.appendChild(bgArray[div])
                }
            }
        }
        if (getSDG().getPUB().getConfig().getFeatureValue('allowClickableTopBackground')) {
            divBgTop.style.width = contentDim.width + 'px';
            divBgTop.style.height = placement.getAd().getAnchor().style['height'];
        } else {
            divBgAnker.removeChild(divBgTop);
        }
        placement.getAd().addMedia('backgroundClick', divBgAnker);
        placement.getAd().getAnchor().appendChild(divBgAnker);
        divBgAnker.style["position"] = 'absolute';
        divBgAnker.style.width = '1px';
        divBgAnker.style.height = '1px';
        divBgAnker.style.zIndex = '1';
        divBgAnker.style.left = (getSDG().getUtil().getPos(placement.getAd().getAnchor()).left - getSDG().getUtil().getPos(divBgAnker).left) - (getSDG().getUtil().getPos(divBgAnker).left - contentDim.left) + 'px';
        divBgAnker.style.top = (getSDG().getUtil().getPos(placement.getAd().getAnchor()).top - (contentDim.top + (getSDG().getUtil().getPos(placement.getAd().getAnchor()).top - contentDim.top))) + 'px';
        divBgLeft.style.width = contentDim.left + 'px';
        divBgLeft.style.left = -contentDim.left + 'px';
        divBgLeft.style.height = viewHeight + 'px';
        divBgRight.style.width = viewWidth - contentDim.width - contentDim.left + 'px';
        divBgRight.style.left = contentDim.width + 'px';
        divBgRight.style.height = viewHeight + 'px';
        this.addResize(divBgLeft, getSDG().getPUB().getConfig().getContentObject().element, true);
        this.addResize(divBgRight, getSDG().getPUB().getConfig().getContentObject().element, false);
        this.addSticky(divBgLeft, divBgAnker);
        this.addSticky(divBgRight, divBgAnker);
        getSDG().getPUB().getConfig().executeLocalBackgroundClickable(placement)
    },
    templateNativeAd: function (formatObject) {
        var jsonData = formatObject.getResponseParameters(),
            placement = formatObject.getContainerPlacement(),
            ad = placement.getAd(),
            anchor = ad.getAnchor(),
            templateParams = {
                linkurl: jsonData.Media[1].links[1].url,
                linktarget: jsonData.Media[1].links[1].target,
                headline: jsonData.formatParams.headline,
                maintext: jsonData.formatParams.maintext,
                linktext: jsonData.formatParams.linktext,
                imgsrc: jsonData.Media[1].file.url,
                imgwidth: jsonData.Media[1].file.width,
                imgheight: jsonData.Media[1].file.height
            };
        anchor.id = jsonData.name;
        //todo: check if native ads are required in SDG context, until than function deativated
        anchor.innerHTML = new SDG[getSDG().getSetup().SYSTEM.UTILITY].Template(getSDG().getPUB().getConfig().getTemplateForType('native' + jsonData.formatParams.nativeType)).render(templateParams);
        placement.getContainer().appendChild(anchor);
        return true;
    },
    templateBillboard: function (formatObject) {
        var jsonData = formatObject.getResponseParameters(),
            placement = formatObject.getContainerPlacement(),
            ad = placement.getAd(),
            anchor = ad.getAnchor(),
            contentDim = getSDG().getPUB().getConfig().getContentObject(),
            currentMediaDiv,
            bbWidth,
            bbHeight,
            bbLeft;
        if (formatObject.startLocalBuildProcess() && !!this.buildMediaSegments(formatObject)) {
            anchor.style['position'] = 'relative';
            anchor.style['visibility'] = 'hidden';
            anchor.style['zIndex'] = jsonData.zIndex;
            anchor.id = 'div' + jsonData.name;
            currentMediaDiv = ad.getMedia(jsonData.Media["1"].mediaName);
            bbWidth = parseFloat(currentMediaDiv.style['width']);
            bbHeight = parseFloat(currentMediaDiv.style['height']);
            anchor.appendChild(currentMediaDiv);
            placement.getContainer().appendChild(anchor);
            anchor.style['width'] = bbWidth + 'px';
            anchor.style['height'] = bbHeight + 'px';

            //Finale Positionierung
            bbLeft = getSDG().getUtil().getObjectDimensions(currentMediaDiv).left;
            currentMediaDiv.style['position'] = 'absolute';
            // Falls das BB gleich breit wie der Content ist, nachdem wir die Position normalisiert haben (Margins, etc rausgerechnet)
            if ((contentDim.left + contentDim.width) === ((bbLeft - (bbLeft - contentDim.left)) + bbWidth  )) {
                //Normalisiere Position
                currentMediaDiv.style['left'] = -( (bbLeft - contentDim.left)) + 'px';
            }
            //Falls das Billboard breiter ist als die Seite, nachdem wir die Position normalisiert haben
            if ((contentDim.left + contentDim.width) < ( (bbLeft - (bbLeft - contentDim.left) ) + bbWidth  )) {
                // Normalisiere Position(bbLeft - contentDim.left) und platziere mittig ( (bbWidth - contentDim.width) / 2 )
                currentMediaDiv.style['left'] = -( (bbLeft - contentDim.left) + ( (bbWidth - contentDim.width) / 2 ) ) + 'px';
                anchor.style['width'] = contentDim.width - ((bbLeft - contentDim.left)) + 'px';
            }
            //Falls das Billboard kleiner ist als die Seite
            if ((contentDim.left + contentDim.width) > ( bbLeft - (bbLeft - contentDim.left) + bbWidth  )) {
                // Normalisiere Position(bbLeft - contentDim.left) und platziere mittig ( (contentDim.width - bbWidth) / 2 )
                currentMediaDiv.style['left'] = +( -(bbLeft - contentDim.left) + ( (contentDim.width - bbWidth) / 2 ) ) + 'px';
            }

            anchor.appendChild(this.setAdLabel('absolute', -9, 8));
            if (formatObject.finishLocalBuildProcess()) {
                anchor.style['visibility'] = 'visible';
                return true;
            } else {
                return false;
            }
        } else {
            return false;
        }
    },
    templateHalfpageAd: function () {
    },
    templateBanderoleAd: function () {
    },
    templateFloorAd: function () {
    },
    templateSitebar: function () {
    },
    templateInterstitial: function () {
    },
    templatePushdownAd: function () {
    },
    templatePrestitial: function () {
    },
    templateBridgeAd: function (formatObject) {
        //noinspection JSUnresolvedVariable
        var jsonData = formatObject.getResponseParameters(),
            placement = formatObject.getContainerPlacement(),
            ad = placement.getAd(),
            anchor = ad.getAnchor(),
            contentDim = getSDG().getPUB().getConfig().getContentObject(),
            skyGap = (!!jsonData.formatParams.bridgeAdSkyGap) ? jsonData.formatParams.bridgeAdSkyGap : 0,
            currentJsonSegment, currentMediaDiv, obj, bbWidth, bbHeight, bbLeft, bbSegment;

        if (formatObject.startLocalBuildProcess() && !!this.buildMediaSegments(formatObject)) {
            anchor.style['position'] = 'relative';
            anchor.style['visibility'] = 'hidden';
            anchor.style['zIndex'] = jsonData.zIndex;
            anchor.id = 'div' + jsonData.name;

            for (obj in jsonData.Media) {
                if(jsonData.Media.hasOwnProperty(obj)){
                    currentJsonSegment = jsonData.Media[obj];
                    currentMediaDiv = ad.getMedia(currentJsonSegment.mediaName);
                    currentMediaDiv.style['position'] = 'absolute';
                    if (currentJsonSegment.position === 'billboard') {
                        bbWidth = parseFloat(currentMediaDiv.style['width']);
                        bbHeight = parseFloat(currentMediaDiv.style['height']);
                        bbSegment = currentMediaDiv

                    }
                    if (currentJsonSegment.position === 'left') {
                        currentMediaDiv.style['left'] = -(parseFloat(currentMediaDiv.style['width'])) + 'px';
                        currentMediaDiv.style['top'] = -skyGap + 'px'
                    }
                    if (currentJsonSegment.position === 'right') {
                        currentMediaDiv.style['left'] = bbWidth + 'px';
                        currentMediaDiv.style['top'] = -skyGap + 'px'
                    }
                    anchor.appendChild(currentMediaDiv);
                }
            }
            placement.getContainer().appendChild(anchor);
            anchor.style['width'] = bbWidth + 'px';
            anchor.style['height'] = bbHeight + 'px';

            //Falls Billboard mit margins platziert wurde, normalisiere Position
            bbLeft = getSDG().getUtil().getObjectDimensions(bbSegment).left;
            if (contentDim.left !== bbLeft) {
                //Normalisiere Position
                anchor.style['left'] = -( (bbLeft - contentDim.left)) + 'px';
            }
            anchor.appendChild(this.setAdLabel('absolute', -9, 8));
            if (formatObject.finishLocalBuildProcess()) {
                anchor.style['visibility'] = 'visible';
                return true;
            } else {
                return false;
            }
        } else {
            return false
        }
    },
    templateSingleAd: function (formatObject) {
        var jsonData = formatObject.getResponseParameters(),
            placement = formatObject.getContainerPlacement(),
            ad = placement.getAd(),
            anchor = ad.getAnchor(),
            obj,
            currentJsonSegment,
            currentMediaDiv,
            width,
            height;
        if (formatObject.startLocalBuildProcess() && !!this.buildMediaSegments(formatObject)) {
            for (obj in jsonData.Media) {
                if(jsonData.Media.hasOwnProperty(obj)){
                    currentJsonSegment = jsonData.Media[obj];
                    currentMediaDiv = ad.getMedia(currentJsonSegment.mediaName);
                    anchor.appendChild(currentMediaDiv);
                    width = (currentJsonSegment.expandable) ? currentJsonSegment.expandable.collapsedWidth : parseFloat(currentMediaDiv.style['width']);
                    height = (currentJsonSegment.expandable) ? currentJsonSegment.expandable.collapsedHeight : parseFloat(currentMediaDiv.style['height']);
                }
            }
            anchor.style['position'] = 'relative';
            anchor.style['width'] = width + 'px';
            anchor.style['height'] = height + 'px';
            anchor.id = jsonData.name;
            placement.getContainer().appendChild(anchor);
            return true;
        } else {
            return false;
        }
    },
    templateMultiAd: function (formatObject) {
        var jsonData = formatObject.getResponseParameters(),
            placement = formatObject.getContainerPlacement(),
            ad = placement.getAd(),
            anchor = ad.getAnchor(),
            contentDimensions = getSDG().getPUB().getConfig().getContentObject(),
            topDimensions = {width: contentDimensions.widthModified, height: 90},
            leftDimensions = {width: 0, height: 0},
            rightDimensions = {width: 0, height: 0},
            overDimensions = {width: 0, height: 0},
            docked = (typeof jsonData.formatParams.sideDocking !== 'undefined') ? jsonData.formatParams.sideDocking : true,
            currentJsonSegment,
            currentMediaDiv,
            posLeft,
            posTop;

        //getSDG().getPUB().getConfig().startLocalMultiAd(ad, jsonData, placement);

        //Erstelle Media Elemente
        if (formatObject.startLocalBuildProcess() && !!this.buildMediaSegments(formatObject) && (contentDimensions)) {
            anchor.style['position'] = 'relative';
            anchor.style['visibility'] = 'hidden';
            anchor.style['zIndex'] = jsonData.zIndex;
            anchor.id = 'div' + jsonData.name;
            //Erster Durchlauf um die genauen Amessungen fuer jede Position/Anteil zu errechnen, spaeter fuer Positionierung benoetigt.
            //Laesst sich nicht in einem Durchlauf alles durchfuehren, da nicht sicher gestellt ist in welcher Reihenfolge die einzelnen Positionen innerhalb des Objektes gefunden waeren. Wuerde zb Overlay als erstes selektiert, wuerden Fehler auftauchen.
            for (var obj in jsonData.Media) {
                if(jsonData.Media.hasOwnProperty(obj)){
                    currentJsonSegment = jsonData.Media[obj];
                    currentMediaDiv = ad.getMedia(jsonData.Media[obj].mediaName);
                    if (currentJsonSegment.position === 'top') {
                        topDimensions.width = (currentJsonSegment.expandable) ? currentJsonSegment.expandable.collapsedWidth : parseFloat(currentMediaDiv.style['width']);
                        topDimensions.height = (currentJsonSegment.expandable) ? currentJsonSegment.expandable.collapsedHeight : parseFloat(currentMediaDiv.style['height']);
                    }
                    if (currentJsonSegment.position === 'left') {
                        leftDimensions.width = (currentJsonSegment.expandable) ? currentJsonSegment.expandable.collapsedWidth : parseFloat(currentMediaDiv.style['width']);
                        leftDimensions.height = (currentJsonSegment.expandable) ? currentJsonSegment.expandable.collapsedHeight : parseFloat(currentMediaDiv.style['height']);
                    }
                    if (currentJsonSegment.position === 'right') {
                        rightDimensions.width = (currentJsonSegment.expandable) ? currentJsonSegment.expandable.collapsedWidth : parseFloat(currentMediaDiv.style['width']);
                        rightDimensions.height = (currentJsonSegment.expandable) ? currentJsonSegment.expandable.collapsedHeight : parseFloat(currentMediaDiv.style['height']);
                    }
                    if (currentJsonSegment.position === 'overlay') {
                        overDimensions.width = (currentJsonSegment.expandable) ? currentJsonSegment.expandable.collapsedWidth : parseFloat(currentMediaDiv.style['width']);
                        overDimensions.height = (currentJsonSegment.expandable) ? currentJsonSegment.expandable.collapsedHeight : parseFloat(currentMediaDiv.style['height']);
                    }
                }
            }
            anchor.style['width'] = topDimensions.width + 'px';
            anchor.style['height'] = topDimensions.height + 'px';
            //Zweiter Durchlauf fuer Positionierung
            for (obj in jsonData.Media) {
                if(jsonData.Media.hasOwnProperty(obj)){
                    currentJsonSegment = jsonData.Media[obj];
                    currentMediaDiv = ad.getMedia(currentJsonSegment.mediaName);
                    currentMediaDiv.style['position'] = 'absolute';
                    if (currentJsonSegment.position === 'left') {
                        posLeft = parseFloat(currentMediaDiv.style['left']) + (docked) ? -leftDimensions.width : 0;
                        posTop = parseFloat(currentMediaDiv.style['top']) + (docked) ? 0 : topDimensions.height;
                    }
                    if (currentJsonSegment.position === 'right') {
                        posLeft = parseFloat(currentMediaDiv.style['left']) + (docked) ? topDimensions.width : topDimensions.width - rightDimensions.width;
                        posTop = parseFloat(currentMediaDiv.style['top']) + (docked) ? 0 : topDimensions.height;
                    }
                    if (currentJsonSegment.position === 'overlay') {
                        posLeft = parseFloat(currentMediaDiv.style['left']) + (docked) ? topDimensions.width - overDimensions.width : leftDimensions.width + ((topDimensions.width - rightDimensions.width - leftDimensions.width) - overDimensions.width);
                        posTop = parseFloat(currentMediaDiv.style['top']) + topDimensions.height;
                    }
                    currentMediaDiv.style['left'] = posLeft + 'px';
                    currentMediaDiv.style['top'] = posTop + 'px';
                    anchor.appendChild(currentMediaDiv);
                }
            }
            //Schreibe MultiAd auf Seite
            placement.getContainer().appendChild(anchor);
            //Positioniere Anker in Relation zu Seite
            anchor.style['left'] = ((docked) ? (contentDimensions.widthModified - topDimensions.width + (contentDimensions.leftModified - getSDG().getUtil().getPos(anchor).left)) : (contentDimensions.widthModified - topDimensions.width + rightDimensions.width + (contentDimensions.leftModified - getSDG().getUtil().getPos(anchor).left))) + 'px';
            getSDG().log(placement.getName() + ': buildMultiAd(): Positionsdbug: docked=' + docked + ', topBannerWidth=' + topDimensions.width + ', rightBannerWidth=' + rightDimensions.width + ', contentLeft=' + contentDimensions.leftModified + ',contentWidth=' + contentDimensions.widthModified + ', anchorLeft=' + getSDG().getUtil().getPos(anchor).left + '. Formel: docked (contentWidth-topBannerWidth+(contentLeft-anchorLeft)), undocked (contentWidth-topBannerWidth+rightBannerWidth+(contentWidth-anchorLeft)', getSDG().loglvl('DEBUG'));
            anchor.style['top'] = '0px';
            //finish it
            anchor.appendChild(this.setAdLabel('absolute', -9, 8));
            if (formatObject.finishLocalBuildProcess()) {
                anchor.style['visibility'] = 'visible';
                return true;
            } else {
                return false;
            }
        } else {
            return false;
        }
    }
};
getSDG()[getSDG().getSetup().SYSTEM.MODULES].AdLabels = function (cssString) {
    getSDG().getCN().addGlobalPlacementAddon('adLabel', this.anzeigeController);
    getSDG().getUtil().addCssToHead(cssString);
};
getSDG()[getSDG().getSetup().SYSTEM.MODULES].AdLabels.prototype = {
    anzeigeController: {
        execute: function () {
            var currentPlacement = this;
            getSDG().getCN().addLocalAddon(currentPlacement, 'anzeige', {
                anzElement: document.createElement('div'),
                activate: function () {
                    this.flags.activeAdLabel = true;
                    this.getAdLabel = function () {
                        return this.localAddons["anzeige"].anzElement;
                    };
                    var divAnz = this.getAdLabel();
                    divAnz.id = currentPlacement._adServerAlias + '_anz';
                    divAnz.className = 'sdgAnzeigenkennung sdgAnz-' + currentPlacement.getName();
                    currentPlacement.getContainer().insertBefore(divAnz, currentPlacement.getContainer().firstChild);
                },
                deactivate: function () {
                    delete this.flags.activeAdLabel;
                    delete this.getAdLabel;
                }
            })
        },
        remove: function () {
            var currentPlacement = this;
            getSDG().getCN().removeLocalAddon(currentPlacement, 'anzeige');
        }
    }
};




getSDG()[getSDG().getSetup().SYSTEM.MODULES].praeludiumConverter = function () {
    /**
     * Overwrites the fXm_Head methodes with the tranlation functions of metaTag
     */
    window.fXm_Head = window.fXm_Head || {};
    fXm_Head.create = fXm_Head.create || {};
    fXm_Head.create.style = function (cssString) {
        return getSDG().getUtil().addCssToHead(cssString)
    };
    fXm_Head.create.script = function (scriptSrc) {
        getSDG().getUtil().loadScript(scriptSrc, document.getElementsByTagName('head')[0], function () {
            getSDG().log('SYSTEM: Loaded Script from ' + scriptSrc + ' and attached it to %o', getSDG().loglvl('ERROR'), [document.getElementsByTagName('head')[0]]);
        }, true, false)
    };
    fXm_Head.create.twin = function (scriptSrc, successFunction) {
        getSDG().getUtil().loadScript(scriptSrc, document.getElementsByTagName('head')[0], successFunction, true, false)
    };
    fXm_Head.aframe = fXm_Head.aframe || {};
    fXm_Head.aframe.BuildFrame = function (id, width, height, html) {
        getSDG().getUtil().addIframeToNode(document.getElementById('fxm-framed-ad-' + id), width, height, html)
    };
    fXm_Head.aframe.FixDocumentWrite = function () {
        getSDG().log('SYSTEM: PrealudiumAdapter:  FixDocumentWrite(). Function is deprecated, don\'t use it!', getSDG().loglvl('ERROR'));
    };
    fXm_Head.aframe.CountMatches = function () {
        getSDG().log('SYSTEM: PrealudiumAdapter:  CountMatches(). Function is deprecated, don\'t use it!', getSDG().loglvl('ERROR'));
    };
    fXm_Head.aframe.AddEvent = function (listenerObject, eventName, callbackFunction) {
        getSDG().getUtil().addEventListener(listenerObject, eventName, callbackFunction)
    };
    /**
     * Overwrites the SDM_head methodes with the tranlation functions of metaTag
     */
    window.SDM_head = window.SDM_head || {};
    window.SDM_head.SDM_adArray = [];
    SDM_head.registerAd = function (SDM_adConfig) {
        return getSDG().getCore().get(getSDG().getSetup().MODULES.PRAELUDIUM_CONVERTER).praeludiumRegisterAd(SDM_adConfig)
    };
    SDM_head.addTargeting = function (key, value) {
        return getSDG().getPUB().addKeyValue(key, value)
    };
    SDM_head.addTargetingForAdSlot = function (position, key, value) {
        return getSDG().getCN().getPlacementByPosition(position).addTargeting(key, value);
    };
    SDM_head.setAdset = function (adset) {
        return getSDG().getCore().get(getSDG().getSetup().MODULES.PRAELUDIUM_CONVERTER).praeludiumSetAdset(adset)
    };
    SDM_head.adoptGptSetup = function () {
        return getSDG().getCore().get(getSDG().getSetup().MODULES.PRAELUDIUM_CONVERTER).praeludiumAdoptGptSetup()
    };
    SDM_head.displayAd = function (adname) {
        return getSDG().getCore().get(getSDG().getSetup().MODULES.PRAELUDIUM_CONVERTER).praeludiumDisplayAd(adname)
    };
    SDM_head.refreshAd = function (adname) {
        return getSDG().getCore().get(getSDG().getSetup().MODULES.PRAELUDIUM_CONVERTER).praeludiumRefreshAd(adname)
    };
    SDM_head.refreshAllAds = function () {
        return getSDG().getPUB().loadAllSlots();
    };
    SDM_head.removeAd = function (adname) {
        return getSDG().getCore().get(getSDG().getSetup().MODULES.PRAELUDIUM_CONVERTER).praeludiumRemoveAd(adname)
    };
    SDM_head.removeAllAds = function () {
        return getSDG().getPUB().unregisterAll(true)
    };
    SDM_head.ping = function (imageUrl) {
        return getSDG().getUtil().loadImage(imageUrl)
    };
    SDM_head.isinarray = function (array, search) {
        return getSDG().getUtil().inArray(array, search);
    };
    SDM_head.now = function () {
        return getSDG().getUtil().getNow();
    };
    SDM_head.getViewportWidth = function () {
        return getSDG().getUtil().getViewportDimensions().width;
    };
    SDM_head.setCookie = function (cname, cvalue, exdays) {
        return getSDG().getUtil().setCookie(cname, cvalue, exdays);
    };
    SDM_head.getCookie = function (cname) {
        return getSDG().getUtil().getCookie(cname);
    };
    SDM_head.deleteCookie = function (cname) {
        return getSDG().getUtil().deleteCookie(cname);
    };
    SDM_head.enableDevMode = function () {
        return getSDG().getUtil().setCookie('SDM_devmode', 'true', 1);
    };
    SDM_head.disableDevMode = function () {
        getSDG().getUtil().deleteCookie('SDM_devmode');
    };
    SDM_head.enableLocalMode = function () {
        return getSDG().getUtil().setCookie('SDM_localmode', 'true', 1);
    };
    SDM_head.disableLocalMode = function () {
        getSDG().getUtil().deleteCookie('SDM_localmode');
    };
    SDM_head.cleanamp = function (target) {
        return getSDG().getCore().get(getSDG().getSetup().MODULES.PRAELUDIUM_CONVERTER).praeludiumCleanAmp(target)
    };
    SDM_head.cleansemcol = function (target) {
        return getSDG().getCore().get(getSDG().getSetup().MODULES.PRAELUDIUM_CONVERTER).praeludiumCleansEmcol(target)
    };
    SDM_head.appendStyles = function (stylesToUse, elem, id) {
        return getSDG().getCore().get(getSDG().getSetup().MODULES.PRAELUDIUM_CONVERTER).praeludiumAppendStyles(stylesToUse, elem, id)
    };
    SDM_head.safariWorkaround = function (stylesToUse) {
        return getSDG().getCore().get(getSDG().getSetup().MODULES.PRAELUDIUM_CONVERTER).praeludiumSafariWorkaround(stylesToUse)
    };
    SDM_head.disableSafariWorkaround = function () {
        return SDM_head.SDM_safariWorkaround = false;
    };
    getSDG().getPUB().addKeyValue('adset', 'brsl');
};
getSDG()[getSDG().getSetup().SYSTEM.MODULES].praeludiumConverter.prototype = {
    /**
     * Praeludium translation for the SDG.Publisher.registerPosition methode
     * @param SDM_adConfig
     */
    praeludiumRegisterAd: function (SDM_adConfig) {
        //noinspection JSUnusedLocalSymbols
        var placement,
            targetParams = {},
            sitename = typeof SDM_adConfig.defsite !== 'undefined' ? SDM_adConfig.defsite : '',
            zone = typeof SDM_adConfig.defzone !== 'undefined' ? SDM_adConfig.defzone : '',
            position = typeof SDM_adConfig.name === 'string' ? SDM_adConfig.name : '',
            targetDiv = typeof SDM_adConfig.targetDiv === 'string' ? SDM_adConfig.targetDiv : ('div-gpt-ad-' + (position === 'out-of-page' ? 'swf' : position)),
            sizes = typeof SDM_adConfig.size !== 'undefined' ? SDM_adConfig.size : '',
            loadAtOnce = typeof SDM_adConfig.display === 'boolean' ? SDM_adConfig.display : true,
            targetingString = typeof SDM_adConfig.targeting === 'string' ? SDM_adConfig.targeting : '',
            mobile = typeof SDM_adConfig.mobile === 'boolean' ? SDM_adConfig.mobile : false,
            configSizes = [],
            sizeArray = [],
            subSizeArray,
            subSizeKey,
            subSizeValue,
            intermediateSize,
            removeSizes = [],
            sizeToRemove = [],
            removeKey,
            removeValue,
            checkKey,
            checkValue;
        if (typeof SDM_adConfig.defzone2 === 'string') {
            zone += '/' + SDM_adConfig.defzone2;
        }
        if (typeof SDM_adConfig.defzone3 === 'string') {
            zone += '/' + SDM_adConfig.defzone3;
        }
        //part for info tool
        if (sitename !== '') {
            window.SDM_defsite = sitename;
        }
        if (zone !== '') {
            window.SDM_defzone = zone;
        }

        //Check for errors in SDM_adConfig
        if (zone.indexOf(' ') === -1) {
            //pass


        } else {
            //fail
            getSDG().log('SYSTEM: PrealudiumAdapter:  registerAd(). Whitespace passed in "zone" definitions. RegisterAd for "' + position + '" aborted.', getSDG().loglvl('ERROR'));
        }
        if (sitename !== '' && ( sitename !== getSDG().getPUB().getConfig().getCommonValue('dfpDesktopName') &&  sitename !== getSDG().getPUB().getConfig().getCommonValue('dfpMobileName'))) {
            getSDG().log('SYSTEM: PrealudiumAdapter:  registerAd(). Identifier for site overwritten by registerAd with value "' + sitename + '" was "' + getSDG().getPUB().getConfig().getCommonValue('name') + '"', getSDG().loglvl('NOTICE'));
            getSDG().getPUB().getConfig()._commonConfig.dfpDesktopName = sitename;

        }
        if (sizes !== '') {
            subSizeArray = sizes.split(',');
            for (var i1 = 0; i1 < subSizeArray.length; i1++) {
                subSizeValue = subSizeArray[i1];
                intermediateSize = subSizeValue.split('x');
                sizeArray.push([parseFloat(intermediateSize[0]), parseFloat(intermediateSize[1])]);
            }
            if (typeof getSDG().getPUB().getConfig().getValueForPosition(position, 'dfpSizes') !== 'undefined' && getSDG().getPUB().getConfig().getValueForPosition(position, 'dfpSizes').length >= 1) {
                configSizes = configSizes.concat(getSDG().getPUB().getConfig().getValueForPosition(position, 'dfpSizes'));
            } else {
                configSizes = [];
            }
            removeSizes = removeSizes.concat(configSizes);
            for (var ii = 0; ii < sizeArray.length; ii++) {
                removeValue = sizeArray[ii];
                for (var iii = 0; iii < configSizes.length; iii++) {
                    checkValue = configSizes[iii];
                    if (checkValue[0] === removeValue[0] && checkValue[1] === removeValue[1]) {
                        removeSizes[iii] = '-';
                    }
                }
            }
            removeSizes.forEach(function (currentValue, index) {
                if (typeof currentValue === 'object') {
                    sizeToRemove.push(removeSizes[index])
                }
            });
            if (sizeToRemove.length === 0) {
                sizeToRemove = '';
            }
        }
        if (targetingString !== '') {
            targetParams = this.parseTargetingString(targetingString);
        }
        if (getSDG().getPUB().getAdServer()._gptUseSynchronTags) {
            document.write(this.constructSyncTag(position, targetDiv, targetParams, zone, sizeToRemove));
        } else {
            this.attachTargetDivToCurrentScriptNode(targetDiv);
            placement = getSDG().getPUB().registerSlot(position, document.getElementById(targetDiv));
            placement.setTargeting(targetParams);
            if (zone !== '') {
                placement.setZone(zone);
            }
            if (sizeToRemove !== '') {
                placement.removeSizes(sizeToRemove)
            }
            if (loadAtOnce) {
                placement.load()
            }
        }
    },
    /**
     * parse the Targetingstring, mostly a string of keyvalue pairs coming from praeludium, and translate them to an literal object annotation for easy import into metatag engine
     * returns the literal object
     * @param targetingString
     * @returns {{}}
     */
    parseTargetingString: function (targetingString) {
        var targetArray = [],
            currentKeyValue,
            targetParams = {};
        if (targetingString !== '') {
            targetArray = targetingString.split(';');
            targetArray.forEach(
                function (currentEntry) {
                    if (currentEntry.length > 1) {
                        currentKeyValue = currentEntry.split('=');
                        if (!targetParams.hasOwnProperty(currentKeyValue[0])) {
                            targetParams[currentKeyValue[0]] = [];
                        }
                        targetParams[currentKeyValue[0]].push(currentKeyValue[1]);
                    }
                }, this);
        } else {
            targetParams = '';
        }
        return targetParams;
    },
    /**
     * Will check if the adset is  used and set by the publisher and then return it as key Value
     * @param adset
     * @returns {*}
     */
    praeludiumSetAdset: function (adset) {
        if (adset !== 'bs' && adset !== 'brs' && adset !== 'brsl' && adset !== 'bsl' && adset !== '') {
            getSDG().log('SYSTEM: PrealudiumAdapter:  setAdset(). Adset must be one of "bs", "brs", "brsl", "bsl", "". Given was "' + adset, getSDG().loglvl('ERROR'));
        }
        if (typeof SDM_adset === 'undefined') {
            return getSDG().getPUB().addKeyValue('adset', adset);
        } else {
            return false
        }
    },
    /**
     * Starts some basic targeting logic from praeludium and translates this into key Value pairs to metaTag
     */
    praeludiumAdoptGptSetup: function () {
        var predefinedTargetString;
        if (!getSDG().getUtil().checkFlashVersion(13)) {
            getSDG().getPUB().addKeyValue('flash', 'no')
        }
        window.SDM_resource = (getSDG().getPUB().getConfig().getCommonValue('dfpResource') !== '') ? getSDG().getPUB().getConfig().getCommonValue('dfpResource') : "undefiniert";
        window.SDM_target = (typeof SDM_target !== 'undefined') ? SDM_target : '';
        predefinedTargetString = (typeof SDM_target !== 'undefined') ? SDM_target : '';
        predefinedTargetString += (typeof SDM_adxtra !== 'undefined') ? SDM_adxtra : '';
        predefinedTargetString += (typeof SDM_adset !== 'undefined') ? SDM_adset : '';
        if (predefinedTargetString !== '') {
            getSDG().getPUB().addKeyValues(this.parseTargetingString(predefinedTargetString));
        }
    },
    /**
     * Writes the GPT Tag synchronously to the site while considering all prealudium registerAd options.
     * returns the adcall and the container div
     *
     * @param position
     * @param targetDiv
     * @param targetParams
     * @param zone
     * @param removeSizes
     * @returns {string}
     */
    constructSyncTag: function (position, targetDiv, targetParams, zone, removeSizes) {
        var i;
        var placementCall = '<script type="text/javascript">SDG.Publisher.registerSlot("' + position + '", document.getElementById("' + targetDiv + '"))';
        placementCall += (typeof targetParams === 'object') ? '.setTargeting(' + JSON.stringify(targetParams) + ')' : '';
        placementCall += (zone !== '') ? '.setZone("' + zone + '")' : '';
        if (removeSizes !== '') {
            for (i = 0; i < removeSizes.length; i++) {
                placementCall += '.removeSizes([' + removeSizes[i][0] + ',' + removeSizes[i][1] + '])';
            }
        }
        placementCall += '.load()<\/script>';
        return '<div id="' + targetDiv + '">' + placementCall + '</div>';
    },
    /**
     * injects a new DIV into the content by trying to guess the current script tag and hopefully beeing the last on the (to this point rendered) site, then writes a DIV to the scripts parent object.
     * this is highly dangerous on async and AJAX sites, since the current script node will not be the last on the site
     * Dont use this as long as you dont have to
     * @param targetDiv
     * @returns {boolean}
     */
    attachTargetDivToCurrentScriptNode: function (targetDiv) {
        if (!document.getElementById(targetDiv)) {

            var currentScript = document.currentScript || (function () {
                    var scripts = document.getElementsByTagName('script');
                    return scripts[scripts.length - 1];
                })();
            var newDiv = document.createElement('div');
            newDiv.id = targetDiv;
            currentScript.parentNode.insertBefore(newDiv, currentScript.nextSibling);
            return true
        } else {
            return false
        }
    },
    /**
     * Translates the refresh methode to the proper metatag function
     * @param adname
     * @returns {*}
     */
    praeludiumRefreshAd: function (adname) {
        if (getSDG().getCN().getPlacementByPosition(adname)) {
            return getSDG().getCN().getPlacementByPosition(adname).load()
        } else {
            getSDG().log('SYSTEM: PrealudiumAdapter:  refreshAd(). Position ' + adname + ' not found on site. Aborting load process', getSDG().loglvl('ERROR'));
            return false;
        }
    },
    /**
     * Translates the displayAd methode to the proper metatag function
     * @param adname
     * @returns {*}
     */
    praeludiumDisplayAd: function (adname) {
        if (getSDG().getCN().getPlacementByPosition(adname)) {
            return getSDG().getCN().getPlacementByPosition(adname).load()
        } else {
            getSDG().log('SYSTEM: PrealudiumAdapter:  displayAd(). Position ' + adname + ' not found on site. Aborting display process', getSDG().loglvl('ERROR'));
            return false;
        }
    },
    /**
     * Translates the removeAd methode to the proper metatag function
     * @param adname
     * @returns {*}
     */
    praeludiumRemoveAd: function (adname) {
        if (getSDG().getCN().getPlacementByPosition(adname)) {
            return getSDG().getPUB().unregister(adname, true);
        } else {
            getSDG().log('SYSTEM: PrealudiumAdapter:  removeAd(). Position ' + adname + ' not found on site. Aborting remove process', getSDG().loglvl('ERROR'));
            return false;
        }
    },
    /**
     * Imported from Praeludium -  unknown use
     * @param target
     * @returns {*}
     */
    praeludiumCleanAmp: function (target) {
        target = (target.charAt(0) === '&') ? target.substr(1, target.length - 1) : target;
        target = (target.charAt(target.length - 1) === '&') ? target.substr(0, target.length - 1) : target;
        if (target === '') {
            return '';
        } else {
            return '&' + target;
        }
    },
    /**
     * Imported from Praeludium -  unknown use
     * @param target
     * @returns {*}
     */
    praeludiumCleansEmcol: function (target) {
        target = (target.charAt(0) === ';') ? target.substr(1, target.length - 1) : target;
        target = (target.charAt(target.length - 1) === ';') ? target.substr(0, target.length - 1) : target;
        if (target === '') {
            return '';
        } else {
            return ';' + target;
        }
    },
    praeludiumAppendStyles: function (stylesToUse, elem, id) {
        var head = (typeof elem !== 'undefined' && elem !== null) ? elem : document.head || document.getElementsByTagName('head')[0];
        var style = document.createElement('style');
        style.type = 'text/css';
        style.className = 'SDM_Delivery';
        if (typeof id !== 'undefined') {
            style.id = id;
        }
        if (style.styleSheet) {
            style.styleSheet.cssText = stylesToUse;
        } else {
            style.appendChild(document.createTextNode(stylesToUse));
        }
        head.appendChild(style);
        var isSafari = (/Safari/.test(navigator.userAgent) && /Apple Computer/.test(navigator.vendor)) && this.SDM_safariWorkaround;
        if (isSafari && /SDM_WP_Container|WPBanner|WPSky|SDM_WPBanner|SDM_WPSky/.test(stylesToUse)) {
            if (typeof window.jQuery !== 'undefined') {
                SDM_head.SDM_jQuery = window.jQuery;
                this.safariWorkaround(stylesToUse);
            } else { // load jQuery
                //console.log("load jQuery");
                fXm_Head.create.twin(escape(document.location.protocol + '//code.jquery.com/jquery-2.2.4.min.js'),
                    function () {
                        SDM_head.SDM_jQuery = jQuery.noConflict();
                        SDM_head.safariWorkaround(stylesToUse);
                    }, function () {
                        console.log('jQuery loading did not work!');
                    });
            }
        }

    },
    praeludiumSafariWorkaround: function (stylesToUse) {
        fXm_Head.create.twin(escape(document.location.protocol + '//cdn.stroeerdigitalmedia.de/praeludium/cssparser.min.js'),
            function () {
                try {
                    var result = SDM_parser.parse(stylesToUse);
                    //console.log(result);
                    if (result) {
                        for (var i = 0; i < result.rulelist.length; i++) {
                            // trim whitespaces around selector
                            result.rulelist[i].selector = result.rulelist[i].selector.replace(/^\s+|\s+$/g, '');
                            //console.log(result.rulelist[i].selector);
                            // only do it for dynamically added elements
                            if (/SDM_WP_Container|WPBanner|WPSky|SDM_WPBanner|SDM_WPSky/.test(result.rulelist[i].selector)) {
                                var elems = SDM_head.SDM_jQuery(result.rulelist[i].selector);
                                //console.log(elems);
                                for (var j = 0; j < elems.length; j++) {
                                    var keys = Object.keys(result.rulelist[i].declarations);
                                    //console.log(keys);
                                    for (var key in keys) {
                                        SDM_head.SDM_jQuery(elems[j]).css(keys[key], result.rulelist[i].declarations[keys[key]]);
                                    }
                                }
                            }
                        }
                    }
                } catch (e) {
                    console.log(e);
                }
            },
            function () {
                console.log('Loading cssparser did not work!');
            }
        );
    }
};

getSDG()[getSDG().getSetup().SYSTEM.MODULES].tagManConverter = function () {
    window.IM = {
        version: 2.0,
        GlobalAdTag: {
            /**
             *
             * @param zone
             */
            setZone: function (zone) {
                return getSDG().getPUB().setZone(zone);
            },
            /**
             *
             * @param pageType
             */
            setPageType: function (pageType) {
                return getSDG().getPUB().setPageType(pageType);
            },
            addKeywords: function (keywords) {
                return getSDG().getPUB().addKeywords(keywords);
            },
            addKeyword: function (keyword) {
                return getSDG().getPUB().addKeyword(keyword)
            },
            removeKeywords: function (keywords) {
                return getSDG().getPUB().removeKeywords(keywords);
            },
            removeKeyword: function (keyword) {
                return getSDG().getPUB().removeKeyword(keyword)
            },
            addKeyValue: function (key, value) {
                return getSDG().getPUB().addKeyValue(key, value)
            },
            addKeyValues: function (keyvalues) {
                return getSDG().getPUB().addKeyValues(keyvalues)
            },
            removeKeyValue: function (key, value) {
                return getSDG().getPUB().removeKeyValue(key, value)
            },
            removeKeyValues: function (keyvalues) {
                return getSDG().getPUB().removeKeyValues(keyvalues)
            },
            activateSecureProtocol: function () {
                return getSDG().getPUB().activateSecureProtocol();
            },
            load: function (position) {
                return getSDG().getPUB().loadSlot(position)
            },
            loadAll: function (reloadAds) {
                return getSDG().getPUB().loadAllSlots(reloadAds)
            },
            render: function (position){
                document.write('<div id="sdgTagManConverterContainer-'+position+'"><script>IM.GlobalAdTag.register("'+position+'","sdgTagManConverterContainer-'+position+'");<\/script></div>')
            },
            /**
             *
             * @param position
             * @param container
             * @param loadWithCommand
             */
            register: function (position, container, loadWithCommand) {
                var placement;
                container = (typeof container === 'string') ? document.querySelector('#' + container) : container;

                if(typeof loadWithCommand === 'string'){
                    if(loadWithCommand === 'synchronJs'){
                        loadWithCommand = false;
                    }
                    if(loadWithCommand === 'asyncJs'){
                        loadWithCommand = true;
                    }
                }
                if (!loadWithCommand) {
                    placement = getSDG().getPUB().registerSlot(position, container);
                    if(!!placement){
                        return placement.load()
                    }
                } else {
                    return getSDG().getPUB().registerSlot(position, container)
                }
            },
            /**
             *
             * @param position
             * @param deleteAd
             */
            unregister: function (position, deleteAd) {
                return getSDG().getPUB().unregisterSlot(position, deleteAd)
            },
            /**
             *
             * @param deleteAd
             */
            unregisterAll: function (deleteAd) {
                return getSDG().getPUB().unregisterAllSlots(deleteAd)
            },
            /**
             *
             * @param placementName
             * @param params
             */
            finalizeCall: function (placementName, params) {
                return getSDG().getCN().getPlacementByAdServerName(placementName).finalizeCall(params)
            },
            buildAd: function (jsonData, callback) {
                return getSDG().buildAd(jsonData, callback);
            },
            setupPlacementForRtb: function () {
            },
            processRtbFormat: function () {
            },
            setInitialLoadMode: function () {
            },
            addAdpValues: function (adpValues) {
                return getSDG().getPUB().addAdpValues(adpValues);
            }
        },
        Controller: {
            getPlaceByPos: function (position) {
                return getSDG().getCN().getPlacementByPosition(position)
            },
            getPosBySizeId: function (sizeId) {
                return getSDG().getCN().getPosBySizeId(sizeId)
            },
            getPlacementBySizeString: function (sizeString) {
                return getSDG().getCN().getPlacementBySizeString(sizeString)
            },
            getPlacementByAlias: function (adserverName){
                return getSDG().getCN().getPlacementByAdServerName(adserverName)
            },
            getPosByAlias: function(adserverName){
                return getSDG().getCN().getPlacementByAdServerName(adserverName).getName()
            },
            Video: {
                zoneDefinition: {
                    companion_bottom: {
                        status: 'empty',
                        div: ''
                    },
                    companion_top: {
                        status: 'empty',
                        div: ''
                    },
                    companion_left: {
                        status: 'empty',
                        div: ''
                    },
                    companion_right: {
                        status: 'empty',
                        div: ''
                    }
                },
                /**
                 * Erstellt HTML Code des CompanionAds und gibt diesen zurück.
                 * @param adParameter
                 * @returns {*}
                 */
                buildCompanionAd: function (adParameter) {
                    var adContent;
                    switch (adParameter.ResTyp) {
                        case 'Static':
                            if (adParameter.CreaTyp === 'image/jpeg' || adParameter.CreaTyp === 'image/gif' || adParameter.CreaTyp === 'image/png') {
                                adContent = '<a href="' + adParameter.ClickThro + '" target="_blank"><img src="' + adParameter.ResCont + '" width="' + adParameter.Width + '" height="' + adParameter.Height + '" alt="' + adParameter.AltText + '" border="0"><\/a>';
                            }
                            if (adParameter.CreaTyp === 'HTML') {
                                adContent = '<a href="' + adParameter.ClickThro + '" target="_blank"><img src="' + adParameter.ResCont + '" width="' + adParameter.Width + '" height="' + adParameter.Height + '" alt="' + adParameter.AltText + '" border="0"><\/a>';
                            }

                            if (adParameter.CreaTyp === 'application/x-shockwave-flash') {
                                adContent = '<object id="adcompanionobject" classid="clsid:D27CDB6E-AE6D-11cf-96B8-444553540000" width="' + adParameter.Width + '" height="' + adParameter.Height + '" codebase="<a href="http://download.macromedia.com/pub/shockwave/cabs/flash/swflash.cab" target="_blank">http://download.macromedia.com/pub/shockwave/cabs/flash/swflash.cab</a>"><param name="movie" value="' + adParameter.ResCont + '"><param name="wmode" value="opaque"><param name="quality" value="high"><param name="SCALE" value="exactscale"><param name="allowScriptAccess" value="always"><param name="menu" value="false"><param name="flashvars" value="' + adParameter.AdParam + '"><embed src="' + adParameter.ResCont + '" quality="high" width="' + adParameter.Width + '" height="' + adParameter.Height + '" type="application/x-shockwave-flash" pluginspage="<a href="http://www.macromedia.com/shockwave/download/index.cgi?P1_Prod_Version=ShockwaveFlash" target="_blank">http://www.macromedia.com/shockwave/download/index.cgi?P1_Prod_Version=ShockwaveFlash</a>" wmode="opaque" play="true" loop="true" allowscriptaccess="always" scale="exactscale" menu="false" name="adcompanionobject" flashvars="' + adParameter.AdParam + '"><\/embed><\/object>';
                            }
                            break;

                        case 'Iframe':
                            adContent = '<iframe id="imifr" src="' + adParameter.ResCont + '" width="' + adParameter.Width + '" height="' + adParameter.Height + '" scrolling="no" marginheight="0" marginwidth="0" frameborder="0"><\/iframe>';
                            break;
                        case 'HTML':
                            var im_regexp_check = /script/i;
                            if (im_regexp_check.test(adParameter.ResCont)) {
                                adContent = '<div style="display:none;">Fehlerhaftes CompanionAd, JS gefunden<\/div>';
                            } else {
                                adContent = adParameter.ResCont;
                            }
                            break;
                        default:
                            adContent = '<div style="display:none;">Fehlerhaftes CompanionAd, CreaTyp Unbekannt<\/div>';
                            break;
                    }
                    return adContent;
                },
                /**
                 * Baut den HTML Code eines CompanionAds auf die Webseite ein.
                 * Dafür wird ein neues DIV Object erstellt, dynamisch in die Seite gehängt und dann per innerHTML befuellt.
                 *
                 * @param displayRegion
                 * @param adContent
                 * @returns {boolean}
                 */
                insertCompanionAd: function (displayRegion, adContent) {
                    var
                        region = typeof displayRegion !== 'undefined' ? displayRegion : '',
                        div = false,
                        targetContainer;
                    if (typeof this.zoneDefinition[region] === 'object') {
                        div = this.zoneDefinition[region].div
                    } else {
                        console.log('Error');
                        return false
                    }
                    if (div) {
                        if (typeof div === 'string') {
                            targetContainer = document.querySelector('#' + div)
                        } else {
                            targetContainer = div;
                        }
                        var newDiv = document.createElement('DIV');
                        newDiv.id = 'imVideoCompanion-' + region;
                        targetContainer.appendChild(newDiv);
                        newDiv.innerHTML = adContent;
                        this.zoneDefinition[region].status = 'filled';
                        return true;
                    } else {
                        this.zoneDefinition[region].status = 'error';
                        return false;
                    }
                }
            }
        },
        Site: {
            getLocalContentObj: function (windowObj){
                return getSDG().getPUB().getConfig().getContentObject(windowObj)
            },
            getSiteAdhesionUnit: function (){
                return getSDG().getPUB().getConfig().getAdhesionUnit()
            }
        },
        getGT: function () {
            return IM.GlobalAdTag;
        },
        getAds: function () {
            return getSDG().getAdLib()
        },
        getCN: function () {
            return IM.Controller;
        },
        getSite: function(){
            return IM.Site
        }
    };
    window.getIM = function () {
        return IM;
    };
    window.imVideoAd = {
        /**
         * Schnittstellen Funktion fuer Webseiten. Die Webseite muss VOR dem Aufrufen eines VideoAds anzeigen, wo ein CompanionAd für eine bestimmte Zone dargestellt werden soll.
         * Mögliche Zonen sind: "companion_bottom", "companion_top", "companion_left" und "companion_right".
         * Als Container kann jedes HTML Element angegeben werden, entweder in dem man im Argument divId, das ID Attribue des HTML Objectes als String , ODER in dem man die DOM Node des HTML Objectes übergibt (zb durch document.querySelector() etc.)
         *
         * @param zoneName
         * @param divId
         * @returns {boolean}
         */
        activateZone: function (zoneName, divId) {
            var
                zone = typeof zoneName !== 'undefined' ? zoneName : '',
                div = typeof divId !== 'undefined' ? divId : '',
                zoneDef = getIM().getCN().Video.zoneDefinition;
            if (typeof zoneDef[zone] === 'object') {
                zoneDef[zone].status = 'active';
                zoneDef[zone].div = div;
                return true;
            } else {
                return false;
            }
        }
    };


    /**
     * Funktion wird durch Videoplayer aufgerufen, Argumente müssen vom Player mit Daten aus der VAST XML befuellt werden
     * Konstruiert ein Object, angereichter mit den Argumenten und leitet weiter an buildCompanionAd, um aus den Daten das Werbemittel zusammen zu bauen.
     * Das Ergebnis wird sofort an insertCompanionAd durchgereicht.
     *
     * @param DispReg
     * @param Width
     * @param Height
     * @param ResTyp
     * @param ResCont
     * @param CreaTyp
     * @param AltText
     * @param ClickThro
     * @param AdParam
     * @returns {*}
     */
    window.im_companionad_call = function (DispReg, Width, Height, ResTyp, ResCont, CreaTyp, AltText, ClickThro, AdParam) {
        var obj = {
            Width: Width,
            Height: Height,
            ResTyp: ResTyp,
            ResCont: ResCont,
            CreaTyp: CreaTyp,
            AltText: AltText,
            ClickThro: ClickThro,
            AdParam: AdParam
        };
        return getIM().getCN().Video.insertCompanionAd(DispReg, getIM().getCN().Video.buildCompanionAd(obj));
    };
    getSDG().getPUB().addKeyValue('tagmanversion','200')
};
/**
 * Events sub module
 * Controlls creation and firing of events.
 * @author: Bjoern Militzer
 */
getSDG()[getSDG().getSetup().SYSTEM.MODULES].EventDispatcher = function () {
    document.addEventListener('DOMContentLoaded', function () {
        getSDG().log('WEBSITE: DOMContentLoaded fired!', getSDG().loglvl('DEBUG'));
        getSDG().getEventDispatcher().trigger('SDG_DOM_CONTENT_LOADED');
    });
    document.onreadystatechange = function () {
        if (document.readyState === "complete") {
            getSDG().log('WEBSITE: ReadyState is complete!', getSDG().loglvl('DEBUG'));
            getSDG().getEventDispatcher().trigger('SDG_LOADED_ALL', this);
        }
    };
    this.POSITION_REGISTERED = this.setup('positionRegistered', {
        type: 'position',
        position: '',
        placement: ''

    });
    this.SLOT_REGISTERED = this.setup('slotRegistered', {
        type: 'slot',
        slot: '',
        placement: ''

    });
    this.POSITION_PREPARED = this.setup('positionPrepared', {
        type: 'position',
        position: '',
        placement: ''
    });
    this.SLOT_PREPARED = this.setup('slotPrepared', {
        type: 'slot',
        slot: '',
        placement: ''
    });
    this.POSITION_DELETED = this.setup('positionDeleted', {
        type: 'position',
        position: '',
        placement: ''
    });
    this.SLOT_DELETED = this.setup('slotDeleted', {
        type: 'slot',
        slot: '',
        placement: ''
    });
    this.POSITION_CALLING = this.setup('positionCalling', {
        type: 'position',
        position: '',
        placement: ''
    });
    this.SLOT_CALLING = this.setup('slotCalling', {
        type: 'slot',
        slot: '',
        placement: ''
    });
    this.POSITION_RESPONDED = this.setup('positionResponded', {
        type: 'position',
        position: '',
        placement: ''
    });
    this.SLOT_RESPONDED = this.setup('slotResponded', {
        type: 'slot',
        slot: '',
        placement: ''
    });
    this.POSITION_DONE = this.setup('positionDone', {
        type: 'position',
        position: '',
        placement: ''
    });
    this.SLOT_DONE = this.setup('slotDone', {
        type: 'slot',
        slot: '',
        placement: ''
    });
    this.SDG_DOM_CONTENT_LOADED = this.setup('contentLoaded', {type: 'system'});
    this.SDG_BEFORE_LOAD_ALL = this.setup('beforeLoadAll', {type: 'system'});
    this.SDG_LOADED_ALL = this.setup('loadedAll', {type: 'system'});
    this.SDG_PLACEMENT_REGISTERED = this.setup('placementRegistered', {type: 'system'});
    this.SDG_PLACEMENT_UNREGISTERED = this.setup('placementUnRegistered', {type: 'system'});
    this.SDG_PLACEMENT_CALLING = this.setup('placementCalling', {type: 'system'});
    this.SDG_PLACEMENT_DONE = this.setup('placementDone', {type: 'system'});
    this.SDG_PLACEMENT_DELETED = this.setup('placementDeleted', {type: 'system'});
    this.SDG_SLOT_REGISTERED = this.setup('systemSlotRegistered', {
        type: 'systemSlot',
        position: '',
        placement: ''
    });
    this.SDG_SLOT_UNREGISTERED = this.setup('systemSlotUnRegistered', {
        type: 'systemSlot',
        position: '',
        placement: ''
    });
    this.SDG_SLOT_PREPARED = this.setup('systemSlotPrepared', {
        type: 'systemSlot',
        position: '',
        placement: ''
    });
    this.SDG_SLOT_CALLING = this.setup('systemSlotCalling', {
        type: 'systemSlot',
        position: '',
        placement: ''
    });
    this.SDG_SLOT_DONE = this.setup('systemSlotDone', {
        type: 'systemSlot',
        position: '',
        placement: ''
    });
    this.SDG_SLOT_RESPONDED = this.setup('systemSlotResponded', {
        type: 'systemSlot',
        position: '',
        placement: ''
    });
    this.SDG_SLOT_DELETED = this.setup('systemSlotDeleted', {
        type: 'systemSlot',
        position: '',
        placement: ''
    });
    this.SDG_ZONE_SET = this.setup('zoneSet', {type: 'system'});
    this.SDG_NEW_LOG_ENTRY = this.setup('newLogEntry', {type: 'system'});
    this.SDG_AD_SERVER_MODULE_LOADED = this.setup('adServerModuleLoaded', {type: 'system'});
    this.SDG_ADP_MODULE_LOADED = this.setup('adpModuleLoaded', {type: 'system'});
    this.SDG_RTB_MODULE_LOADED = this.setup('rtbModuleLoaded', {type: 'system'});
    this.SDG_CONTENT_ELEMENT_LOADED = this.setup('contentElementLoaded', {type: 'system'});
    this.SDG_POSTSCRIBE_RESOURCE_LOADED = this.setup('postscribeResourceLoaded', {type: 'system'});
    this.SDG_PREBID_RESOURCE_LOADED = this.setup('prebidResourceLoaded', {type: 'system'});
    this.SDG_PREBID_RESPONDED = this.setup('prebidResponded', {type: 'system'});
    this.isComplete = false;
};
getSDG()[getSDG().getSetup().SYSTEM.MODULES].EventDispatcher.prototype = {
    /**
     * Creates new Event and passes additional info to the event
     * @param {string} eventName - Name of event
     * @param additionalInfos - object with additional informations for the event
     * @returns {object}
     */
    setup: function (eventName, additionalInfos) {
        var event;
        if (getSDG().getUtil().getBrowserData().app !== 'MSIE') {
            //normal version
            //noinspection JSCheckFunctionSignatures
            event = new CustomEvent(eventName, {
                detail: additionalInfos
            });
        } else {
            //ie version
            event = document.createEvent('Event');
            event.initEvent(eventName, true, true);
            //saubere übergabe mit for in
            event['detail'] = additionalInfos;
        }
        return event
    },
    /**
     * Triggers Event if it was already created. Will try to differentiate between a general system event (fires only once) or an position event, which may happen more often.
     * System events will be emitted on the document object, position events on their respective position container elements.
     * @param eventName
     * @param passedObject
     */
    trigger: function (eventName, passedObject) {
        var emittingObject;
        var event = (!!getSDG().getEventDispatcher()[eventName]) ? getSDG().getEventDispatcher()[eventName] : undefined;
        if (event) {
            if (event.detail['type'] === 'position') {
                emittingObject = passedObject.getContainer();
                event.detail['passedObject'] = passedObject;
            }
            if (event.detail['type'] === 'slot') {
                emittingObject = passedObject.getContainer();
                event.detail['passedObject'] = passedObject;
                event.detail['placement'] = passedObject;
                event.detail['slot'] = passedObject.getName();
            }
            if (event.detail['type'] === 'systemSlot'){
                emittingObject = window;
                event.detail['passedObject'] = passedObject;
                event.detail['placement'] = passedObject;
                event.detail['slot'] = passedObject.getName();
            }
            if (event.detail['type'] === 'system') {
                emittingObject = window;
                event.detail['passedObject'] = passedObject;
            }
            //getSDG().log('EVENTS: ' + eventName + ': fired on object %o passing %o ', getSDG().loglvl('DEBUG'), [emittingObject, passedObject]);
            emittingObject.dispatchEvent(event);
            event.detail['passedObject'] = '';
        } else {
            getSDG().log('EVENTS: Tried to trigger event ' + eventName + ' but event was not found!', getSDG().loglvl('ERROR'))
        }
    }
};
/**
 * Created by b.militzer on 18.11.2016.
 */
getSDG()[getSDG().getSetup().SYSTEM.MODULES].FormatController = {
    /**
     * Module Controller for all metaTag formats. Will activate any preconfigured global.json formats during initial module call
     * @constructor
     */
    Controller: function () {
        this._activeFormats = {};
        var formatname,
            formatObject,
            formatConfig = getSDG().getPUB().getConfig()._formatConfig;
        for (formatname in formatConfig) {
            if (formatConfig.hasOwnProperty(formatname)) {
                formatObject = formatConfig[formatname];
                if (formatObject.active) {
                    this.getActiveFormats()[formatname] = new SDG[getSDG().getSetup().SYSTEM.MODULES].FormatController.FormatObject(formatname, formatObject)
                }
            }
        }
    },
    /**
     * Object to base all formats upon. Will be configured in the global.json and constructed during the initial load of metatag on the site.
     *
     * @param name
     * @param params {object}
     *  sizes:
     *  callPosition: position to use for the format when calling the adserver
     *  renderPosition: position to use for the format when rendering the ad on the site
     *  blockedPositions: the positions which are blocked by the format when rendering the ad
     *  useTemplate: the template from the TemplateLibrary to use for rendering the format
     *  startFormat: a function to be called when the format starts rendering
     *  finishFormat: a function to be called when the format finishes rendering
     *
     * @constructor
     */
    FormatObject: function (name, params) {
        this.name = name;
        this.sizes = (!!params.sizes) ? params.sizes : 'variable';
        this.callPosition = (!!params.callPosition) ? params.callPosition : 'variable';
        this.renderPosition = (!!params.renderPosition) ? params.renderPosition : 'variable';
        if (typeof params.blockedPositions !== 'undefined') {
            this.blockedPositions = params.blockedPositions;
            this.countBlockedPositions = params.blockedPositions.length + 1;
        }
        this.useTemplate = (!!params.useTemplate) ? params.useTemplate : 'none';
        this.startFormat = false;
        this.finishFormat = false;

        if (this.callPosition !== 'variable') {
            this.getConfig().addKeyValuePresetToPosition(this.callPosition, {
                "availformats": this.name
            })
        } else {
            this.getConfig().addKeyValue("availformats", this.name)
        }
    }
};
getSDG()[getSDG().getSetup().SYSTEM.MODULES].FormatController.Controller.prototype = {
    /**
     * returns all active format objects
     * @returns {{}|*}
     */
    getActiveFormats: function () {
        return this._activeFormats
    },
    /**
     * central entry function for the ad building process. Function will be called by the core and passed with the adserver jsonData of the ad.
     * @param params - the jsondata from the ad
     * @param callback - the callback function defined in the adserver template, saved under "callbackOnEnd" in the jsonData
     */
    buildAd: function (params, callback) {
        var jsonAdParams;
        jsonAdParams = params;
        jsonAdParams["callbackOnEnd"] = callback;
        this.allocateFormat(jsonAdParams)
    },
    /**
     * Tries to determine which format was defined by the adServer through the jsonData.
     * If jsonData has a valid format entry, we try to map the jsonData format to our current active metaTag formats
     * Is the mapping successfull, we start to setup the ad based on the settings of the metaTag format
     * @param params
     */
    allocateFormat: function (params) {
        var formatObject, formatType;
        if (!!params.adFormat || !!params.adType) {
            formatType = (!params.adFormat && !!params.adType) ? params.adType : (!!params.adFormat) ? params.adFormat : 'notset';
            formatObject = this.searchFormatConfig(formatType);
            if (formatObject) {
                formatObject.setup(params);
            } else {
                getSDG().log('SYSTEM: FORMATS: A format that was delivered by the adserver was not preconfigured. AdType was reported as: ' + formatType + '.', getSDG().loglvl('ERROR'));
            }
        } else {
            getSDG().log('SYSTEM: FORMATS: No name for format found, discarding impression. Passed parameters: %o', getSDG().loglvl('EMERGENCY'), [params]);
        }
    },
    /**
     * Determines if the ad entry for format maps to an active metaTag format
     * @param formatName
     * @returns {*}
     */
    searchFormatConfig: function (formatName) {
        if (!!this.getActiveFormats()[formatName]) {
            return this.getActiveFormats()[formatName]
        } else {
            return false;
        }
    },
    /**
     * convienence function to select the publisherConfig quickly
     * @returns {*}
     */
    getConfig: function () {
        return getSDG().getPUB().getConfig()
    }
};
getSDG()[getSDG().getSetup().SYSTEM.MODULES].FormatController.FormatObject.prototype = {
    /**
     * tries to determine if the ad format needs the contentObject to be present on the site. If yes and the object is not present, it will delay the ad construction until the contentElementLoaded Event.
     * If the object is present, the data is passed to the ad constructor
     */
    setup: function (jsonData) {
        var instance = this;
        this.renderPosition = this.evaluateRenderPosition(jsonData);
        this.markUsedPositions();
        if (!!jsonData.formatParams && jsonData.formatParams.contentObjectRequired && !getSDG().getPUB().getConfig().getContentObject()) {
            window.addEventListener('contentElementLoaded', function () {
                getSDG()[getSDG().getSetup().SYSTEM.ADTEMPLATES].startAdConstruction(instance, jsonData);
            });
            getSDG().log('SYSTEM: FORMATS: Ad construction for "' + jsonData.name + '" delayed until _contentObject is fully loaded!', getSDG().loglvl('NOTICE'));
        } else {
            getSDG()[getSDG().getSetup().SYSTEM.ADTEMPLATES].startAdConstruction(this, jsonData);
        }
    },
    /**
     * Tries to determine the template to use for building the ad. If no template is set in the formatObject, we throw an error and forfeit the impression. If the formatObject includes the useTemnplate parameter with the value "none", the system tries to build the ad without any predefined templates.
     * @returns {function|boolean}
     */
    selectTemplate: function () {
        var templateLibrary = getSDG()[getSDG().getSetup().SYSTEM.ADTEMPLATES];
        if (this.useTemplate !== 'none') {
            if (typeof templateLibrary["template" + this.useTemplate] === 'function') {
                return templateLibrary["template" + this.useTemplate](this)
            } else {
                getSDG().log('SYSTEM: FORMATS: Ad construction for "' + this.getResponseParameters().name + '" encountered an error. A template was selected for the format, but no such template could be found! Impression for the adcall is now void!', getSDG().loglvl('ERROR'));
                return false
            }
        } else {
            getSDG().log('SYSTEM: FORMATS: Ad construction for "' + this.getResponseParameters().name + '" was processed without a template. Not all format features might be avaible and working!', getSDG().loglvl('DEBUG'));
            return true
        }
    },
    markUsedPositions: function () {
        /**
         var pos, currentPosition;
         for (pos in this.usedPositions) {
            currentPosition = this.usedPositions[pos];
            if (typeof currentPosition === 'string') {
                getIM().getCN().getPlaceByPos(currentPosition).stats.rtbSlotFilled = true;
            }
        }*/
    },
    /**
     * return the DOMNode of the placement responsible for rendering the ad
     * @returns {*}
     */
    getContainerPlacement: function () {
        if (this.renderPosition !== 'variable') {
            return getSDG().getCN().getPlacementByPosition(this.renderPosition);
        } else {
            return false
        }
    },
    /**
     * returns the jsonData of the ad, saved inside the rendering placement
     * @returns {*}
     */
    getResponseParameters: function () {
        if(!!this.getContainerPlacement().getAd()){
            return this.getContainerPlacement().getAd().getReponseParameters();
        }else{
            return {}
        }
    },
    /**
     * If there is a startFormat function defined in the local.js for this format, call it, otherwise do nothing
     * @returns {boolean}
     */
    startLocalBuildProcess: function () {
        if (typeof this.startFormat === 'function') {
            try {
                this.startFormat();
                return true
            } catch (error) {
                getSDG().log('SYSTEM: FORMATS: Error during startLocalBuildProcess(): %o', getSDG().loglvl('ERROR'), [error]);
                return false
            }
        } else {
            return true;
        }
    },
    /**
     * If there is a finishFormat function defined in the local.js for this format, call it, otherwise do nothing
     * @returns {boolean}
     */
    finishLocalBuildProcess: function () {
        if (typeof this.finishFormat === 'function') {
            try {
                this.finishFormat();
                return true
            } catch (error) {
                getSDG().log('SYSTEM: FORMATS: Error during finishLocalBuildProcess(): %o', getSDG().loglvl('ERROR'), [error]);
                return false
            }
        } else {
            return true
        }
    },
    /**
     * if the adserver passed a callback function, call it
     * @returns {boolean}
     */
    executeCallback: function () {
        if (typeof this.callbackOnEnd === 'function') {
            try {
                this.callbackOnEnd();
                return true
            } catch (error) {
                getSDG().log('SYSTEM: FORMATS: Error during AdFormat Callback: %o', getSDG().loglvl('ERROR'), [error]);
                return false
            }
        }
        return true
    },
    /**
     * tries to evaluate which adslot is actually the one delivering the format. tries to be backwards compatible to old tagman logic for identifying correct placement
     * returns the position of the adslot
     * @param jsonData
     */
    evaluateRenderPosition: function (jsonData) {
        var overwriteAdserverName = '',
            currentPlacement,
            placementDirectory;
        //noinspection JSUnresolvedVariable
        if (typeof jsonData.placementAlias !== 'undefined') {
            //tagMan backwards compatibility
            //noinspection JSUnresolvedVariable
            overwriteAdserverName = jsonData.placementAlias;
        }
        if (typeof jsonData.placementAdServerName !== 'undefined') {
            overwriteAdserverName = jsonData.placementAdServerName;
        }
        if (overwriteAdserverName !== '') {
            if(!!getSDG().getCN().getPlacementByAdServerName(overwriteAdserverName)) {
                if((getSDG().getCN().getPlacementByAdServerName(overwriteAdserverName).getName() !== this.renderPosition)){
                    return getSDG().getCN().getPlacementByAdServerName(overwriteAdserverName).getName();
                }else{
                    return this.renderPosition
                }
            }
        } else {
            if (!!getSDG().getCN().getPlacementBySizeId(jsonData.placementSizeId)) {
                return getSDG().getCN().getPlacementBySizeId(jsonData.placementSizeId).getName();
            } else {
                placementDirectory = getSDG().getCN().getPlacements();
                //noinspection JSUnresolvedVariable
                if (typeof jsonData.placementSizeString !== 'undefined' && jsonData.placementSizeString !== "") {
                    for (var x in placementDirectory) {
                        if(placementDirectory.hasOwnProperty(x)){
                            currentPlacement = placementDirectory[x];
                            //noinspection JSUnresolvedVariable
                            if (currentPlacement.sizeParams.sizeString === jsonData.placementSizeString) {
                                return currentPlacement.getName();
                            }
                        }
                    }
                } else {
                    getSDG().log('SYSTEM: FORMATS: Ad construction for "' + jsonData.name + '" encountered a major error. The target placement for the format could not be determined, indicating a fault in the jsonData delivered by the ad, defaulting to "sb" position. JSON used: %o', getSDG().loglvl('CRITICAL'), [jsonData]);
                    return 'sb';
                }

            }

        }
    },
    /**
     * convienence function to select the publisherConfig quickly
     * @returns {*}
     */
    getConfig: function () {
        return getSDG().getPUB().getConfig()
    }
};
getSDG()[getSDG().getSetup().SYSTEM.MODULES].StandardTargets = function () {
    var instance = this;

    if (getSDG().getPUB().getConfig()._targetingConfigs.common.collectBrowserData) {
        this.collectBrowserData();
    }
    if (getSDG().getPUB().getConfig()._targetingConfigs.common.collectFlashVersion) {
        this.collectFlashVersion();
    }
    if (getSDG().getPUB().getConfig()._targetingConfigs.common.collectMetaKeys) {
        this.collectMetaKeys();
    }
    if (getSDG().getPUB().getConfig()._targetingConfigs.common.collectPageImpressions) {
        window.addEventListener('beforeLoadAll', function () {
            instance.collectPageImpression();
        })
    }
    if (getSDG().getPUB().getConfig()._targetingConfigs.common.detectAdBlockPlus) {
        this.detectAdBlockPlus()
    }
    if(getSDG().getPUB().getConfig()._targetingConfigs.common.detectGoogleReferrer){
        this.detectGoogleReferrer()
    }
    this.collectUrlParameters();
    this.collectViewportDimensions();
    this.startTargetingPixels()
};

getSDG()[getSDG().getSetup().SYSTEM.MODULES].StandardTargets.prototype = {
    collectViewportDimensions: function () {
        var dim = getSDG().getUtil().getViewportDimensions();
        getSDG().getPUB().addKeyValue('viewportwidth', dim.width);
        getSDG().getPUB().addKeyValue('viewportheight', dim.height);
    },
    collectFlashVersion: function () {
        var version = getSDG().getUtil().getFlashVersion().split(',').shift();
        getSDG().getPUB().addKeyValue('flashVersion', version);
    },
    collectBrowserData: function () {
        var browser = getSDG().getUtil().getBrowserData();
        getSDG().getPUB().addKeyValue('browserapp', browser.app.toLowerCase());
        getSDG().getPUB().addKeyValue('browserversion', browser.version);
    },
    collectMetaKeys: function () {
        var keywordString = getSDG().getUtil().getMetaContent('keywords'),
            keywordArray;
        if (typeof keywordString !== 'undefined') {
            keywordArray = getSDG().getUtil().convertStringToKeywords(keywordString, 6);
            if (!!keywordArray) {
                getSDG().getPUB().addKeywords(keywordArray);
            }
        }
    },
    collectUrlParameters: function () {
        var url = window.location.href,
            result = [];
        if (url.indexOf('sdmad') > -1) {
            result = url.match(/(?:sdmad)=([a-zA-z-_0-9~]+)=([a-zA-z-_0-9~]+)/);
            if (result !== null) {
                getSDG().getPUB().addKeyValue(result[1], result[2]);
            }
        }
        if (url.indexOf('sdgkv') > -1) {

            result = url.match(/(?:sdgkv)=([a-zA-z-_0-9~]+)=([a-zA-z-_0-9~]+)/);
            if (result !== null) {
                getSDG().getPUB().addKeyValue(result[1], result[2]);
            }
        }
    },
    collectPageImpression: function () {
        var keyValueString = 't=',
            targetingKey,
            targetObject = getSDG().getPUB().getConfig().getKeyValues(),
            targetingSet,
            first = true,
            img = new Image();
        for (targetingKey in targetObject) {
            if (targetObject.hasOwnProperty(targetingKey)) {
                targetingSet = targetObject[targetingKey];
                if (typeof targetingKey === 'string' && targetingSet instanceof Array) {
                    if (first) {
                        first = false;
                    } else {
                        keyValueString += '&'
                    }
                    keyValueString += targetingKey + '=' + targetingSet.toString()
                }
            }
        }
        //todo add a switch to return the correct site name based on a device detection
        img.src = '//pubads.g.doubleclick.net/gampad/ad?iu=/' + getSDG().getPUB().getConfig().getCommonValue('dfpNetwork') + '/' + 'MissingSiteVariable/+' + getSDG().getPUB().getConfig().getZone() + '&sz=11x11&' + encodeURIComponent(keyValueString.toLowerCase()) + '&c=' + getSDG().getUtil().generateRandomNumberString(8);
    },
    detectAdBlockPlus: function () {
        var script = document.createElement("script");
        script.type = "text/javascript";
        script.src = '//cdn.stroeerdigitalgroup.de/metatag/libraries/px.js?ch=2';
        script.onerror = function(){
            window.abp = true;
            getSDG().getPUB().addKeyValue('adblocker','abp');
        };
        document.getElementsByTagName('head')[0].appendChild(script)
    },
    detectGoogleReferrer: function() {
        if(/google./.test(document.referrer)){
            getSDG().getPUB().addKeyValue('googref', '1');
        }
    },
    startTargetingPixels: function () {
        var key, entry;
        for (key in getSDG().getPUB().getConfig()._targetingConfigs) {
            entry = getSDG().getPUB().getConfig()._targetingConfigs[key];
            if (entry.active) {
                if (entry.setup.targetingType === 'module') {
                    this.buildTargetingModule(entry)
                }
                if (entry.setup.targetingType === 'pixel') {
                    this.fireSimplePixel(entry)
                }
            }
        }
    },
    buildTargetingModule: function (params) {
        var setup = params.setup;
        if (!!setup.functionName) {
            getSDG().getRes().set(getSDG().getSetup().RESOURCES[setup.resourceName], function () {
                return new SDG[getSDG().getSetup().SYSTEM.MODULES][setup.functionName](params);
            });
        } else {
            getSDG().log('SYSTEM: RESOURCES: Targeting module could not load, functionName not specified, config passed was: %o', getSDG().loglvl('ERROR'), [params]);
        }
    },
    buildSimplePixel: function (params) {
        var config = params.config,
            setup = params.setup;
        if (!!config.pixelMedia) {
            config.url = config.url.replace("#{TIMESTAMP}", getSDG().getUtil().generateRandomNumberString(8));
            if (config.pixelMedia === 'script') {
                getSDG().getUtil().loadScript(config.url, document.querySelector(setup.insertionQuery), function () {
                    getSDG().log('SYSTEM: RESOURCES: Script with url: %o added successfully to ' + setup.insertionQuery + '.', getSDG().loglvl('INFO'), [config.url]);
                }, setup.usePostscribe, setup.useCrossOrigin);
            }
            if (config.pixelMedia === 'img') {
                var pixel = document.createElement('img');
                pixel.src = config.url;
                getSDG().log('SYSTEM: RESOURCES: Pixel with url: %o added successfully to website.', getSDG().loglvl('INFO'), [config.url]);
            }
        }
    },
    fireSimplePixel: function (params) {
        var setup = params.setup;
        var instance = this;
        if (!!setup.loadPattern) {
            if (setup.loadPattern === 'contentLoaded' || setup.loadPattern === 'beforeLoadAll') {
                window.addEventListener(setup.loadPattern, function () {
                    instance.buildSimplePixel(params);
                });
            }
            if (setup.loadPattern === 'atOnce') {
                instance.buildSimplePixel(params);
            }
        }
    }
};
getSDG()[getSDG().getSetup().SYSTEM.MODULES].InfoTool = function () {
    this._infoToolNode = true;
    this._errorCount = 0;
    this._placementCount = 0;
    this.constructInfoTool();
    window.showSdgDebug = function () {
        return getSDG().getCore().get(getSDG().getSetup().MODULES.INFOTOOL).showDebugTool()
    }
};
getSDG()[getSDG().getSetup().SYSTEM.MODULES].InfoTool.prototype = {
    showDebugTool: function () {
        var instance = this;
        var link = document.createElement('link');
        link.rel = 'stylesheet';
        link.type = 'text/css';
        //link.href = '../../dist/metatag/libraries/infotool.css';
        link.href = (location.href.indexOf('localhost') > -1)? '../../dist/metatag/libraries/infotool.css' : '//cdn.stroeerdigitalgroup.de/metatag/libraries/infotool.css';
        link.onload = function () {
            document.querySelector('body').appendChild(instance._infoToolNode);
        };
        document.querySelector('head').appendChild(link);
    },
    constructInfoTool: function () {
        this._infoToolNode = document.createElement('div');
        this._infoToolNode.className = 'sdgInfoMain';
        this._infoToolNode.id = 'sdgInfoTool';
        this._infoToolNode.addEventListener('transitionend', function () {
            getSDG().getCore().get(getSDG().getSetup().MODULES.INFOTOOL).hideAllPanels()
        });
        this._infoToolNode.appendChild(this.constructSmallTool());
        this._infoToolNode.appendChild(this.constructNavigation());
        this._infoToolNode.appendChild(this.constructLogPanel());
        this._infoToolNode.appendChild(this.constructReportPanel());
        this._infoToolNode.appendChild(this.constructSettingsPanel());
    },
    constructSmallTool: function () {
        var instance = this;
        this._smallInfoNode = document.createElement('div');
        this._smallInfoNode.id = 'sdgInfoSmall';
        this._smallInfoNode.className = 'sdgInfoSmallCss';

        this._placementCounterNode = document.createElement('span');
        this._placementCounterNode.id = 'sdgPlacementCount';
        this._placementCounterNode.innerHTML = "0";
        this._placmentText = document.createTextNode("Placements: ");

        this._smallInfoNode.appendChild(this._placmentText);
        this._smallInfoNode.appendChild(this._placementCounterNode);
        this._smallInfoNode.appendChild(document.createElement("br"));

        this._errorCounterNode = document.createElement('span');
        this._errorCounterNode.id = 'sdgErrorCount';
        this._errorCounterNode.innerHTML = "0";
        this._errorCounterText = document.createTextNode("Errors: ");

        this._smallInfoNode.appendChild(this._errorCounterText);
        this._smallInfoNode.appendChild(this._errorCounterNode);
        this._smallInfoNode.appendChild(document.createElement("br"));
        this._smallInfoNode.appendChild(document.createTextNode("Hover to expand"));

        window.addEventListener('placementRegistered', function () {
            instance._placementCount++;
            instance._placementCounterNode.innerHTML = instance._placementCount;
        });
        window.addEventListener('placementUnRegistered', function () {
            instance._placementCount--;
            instance._placementCounterNode.innerHTML = instance._placementCount;
        });
        return this._smallInfoNode
    },
    constructLogPanel: function () {
        this._logPanelNode = document.createElement('div');
        this._logPanelNode.id = 'sdgLogPanel';
        this._logPanelNode.className = 'sdgLogPanelCss';
        window.addEventListener('newLogEntry', function (e) {
            var entry = e.detail.passedObject;
            getSDG().getCore().get(getSDG().getSetup().MODULES.INFOTOOL).addInfoToolLog(entry._message,entry._messageObjects,entry._level,entry._timeStamp)
        });
        return this._logPanelNode;
    },
    constructReportPanel: function () {
        this._reportPanelNode = document.createElement('div');
        this._reportPanelNode.id = 'sdgReportPanel';
        this._reportPanelNode.className = 'sdgReportPanelCss';
        this._reportTextArea = document.createElement('textarea');
        this._reportTextArea.className = 'sdgReportTextArea';
        this._reportPanelNode.appendChild(this._reportTextArea);

        this.addInfoToolReport('Time of page request: ' + (new Date().toGMTString()));
        this.addInfoToolReport('Browser used: ' + getSDG().getUtil().getBrowserData().app + ' version: ' + getSDG().getUtil().getBrowserData().version);
        this.addInfoToolReport('Viewport size: Width '+getSDG().getUtil().getViewportDimensions().width+', Height '+ getSDG().getUtil().getViewportDimensions().height);
        this.addInfoToolReport('Full URL: ' + getSDG().getUtil().getCurrentUrl());
        window.addEventListener('placementRegistered', function (e) {
            var placement = e.detail.passedObject;
            getSDG().addInfoToolReport('position: ' + placement.getName() + ' registered.');
        });
        window.addEventListener('placementUnRegistered', function (e) {
            var placement = e.detail.passedObject;
            getSDG().addInfoToolReport('position: ' + placement.getName() + ' deleted by user.');
        });
        window.addEventListener('placementCalling', function (e) {
            var placement = e.detail.passedObject;
            getSDG().addInfoToolReport('position: ' + placement.getName() + ' calling. Zone: ' + ((!!placement.localZone) ? placement.localZone : getSDG().getPUB().getConfig().getZone()) + ', Name: ' + placement.getAlias() + ', Sizes: ' + placement.sizeParams.sizeArray.toString());
        });
        window.addEventListener('placementDone', function (e) {
            var placement = e.detail.passedObject;
            getSDG().addInfoToolReport('position: ' + placement.getName() + ' finished. ID dump: ' + JSON.stringify(placement.systemIds));
        });
        return this._reportPanelNode;
    },
    constructSettingsPanel: function(){
        //var instance = this;
        this._settingsPanelNode = document.createElement('div');
        this._settingsPanelNode.id = 'sdgSettingsPanel';
        this._settingsPanelNode.className = 'sdgSettingsPanelCss';

        var spanAdServerOverwriteAol = document.createElement('span');
        spanAdServerOverwriteAol.onclick = function(){
            getSDG().getUtil().setLocalStorageData(radioButtonOverwriteAol.name,radioButtonOverwriteAol.value);
            getSDG().getUtil().showUserNotification('AdServer Overwrite detected! Setting AdServerModule to AOL One!');
            radioButtonOverwriteAol.checked = true;
        };
        var radioButtonOverwriteAol = document.createElement('input');
        radioButtonOverwriteAol.type = 'radio';
        radioButtonOverwriteAol.id = 'sdg_overwrite_aol';
        radioButtonOverwriteAol.name = 'sdgAdserverOverwrite';
        radioButtonOverwriteAol.value = 'aol';
        if(getSDG().getUtil().getLocalStorageData('sdgAdserverOverwrite') === 'aol'){
            radioButtonOverwriteAol.checked = true;
        }
        spanAdServerOverwriteAol.appendChild(radioButtonOverwriteAol);
        spanAdServerOverwriteAol.appendChild(document.createTextNode("Overwrite Adserver: Use always AOL One"));
        this._settingsPanelNode.appendChild(spanAdServerOverwriteAol);

        this._settingsPanelNode.appendChild(document.createElement("br"));

        var spanAdServerOverwriteDfp = document.createElement('span');
        spanAdServerOverwriteDfp.onclick = function(){
            getSDG().getUtil().setLocalStorageData(radioButtonOverwriteDfp.name,radioButtonOverwriteDfp.value);
            getSDG().getUtil().showUserNotification('AdServer Overwrite detected! Setting AdServerModule to Google Doubleclick for Publishers!');
            radioButtonOverwriteDfp.checked = true;
        };
        var radioButtonOverwriteDfp = document.createElement('input');
        radioButtonOverwriteDfp.type = 'radio';
        radioButtonOverwriteDfp.id = 'sdg_overwrite_dfp';
        radioButtonOverwriteDfp.name = 'sdgAdserverOverwrite';
        radioButtonOverwriteDfp.value = 'dfp';
        if(getSDG().getUtil().getLocalStorageData('sdgAdserverOverwrite') === 'dfp'){
            radioButtonOverwriteDfp.checked = true;
        }
        spanAdServerOverwriteDfp.appendChild(radioButtonOverwriteDfp);
        spanAdServerOverwriteDfp.appendChild(document.createTextNode("Overwrite Adserver: Use always Google DFP"));
        this._settingsPanelNode.appendChild(spanAdServerOverwriteDfp);

        this._settingsPanelNode.appendChild(document.createElement("br"));

        var spanAdserverOverwriteDelete = document.createElement('span');
        spanAdserverOverwriteDelete.onclick = function(){
            getSDG().getUtil().deleteLocalStorageData('sdgAdserverOverwrite');
            getSDG().getUtil().showUserNotification('AdServer Overwrite removed!');
            radioButtonOverwriteDfp.checked = false;
            radioButtonOverwriteAol.checked = false;
        };
        spanAdserverOverwriteDelete.appendChild(document.createTextNode("Reset Adserver Overwrite"));
        this._settingsPanelNode.appendChild(spanAdserverOverwriteDelete);
        this._settingsPanelNode.appendChild(document.createElement("br"));
        this._settingsPanelNode.appendChild(document.createElement("br"));



        var radioLogEntrySwitch = document.createElement('input');
        radioLogEntrySwitch.type = 'radio';
        radioLogEntrySwitch.id = 'sdg_overwrite_logentry';
        radioLogEntrySwitch.name = 'sdgDumpLogsToConsole';
        radioLogEntrySwitch.value = '1';
        if(getSDG().getUtil().getLocalStorageData('sdgDumpLogsToConsole') === '1'){
            radioLogEntrySwitch.checked = true;
        }
        var spanLogEntrySwitch = document.createElement('span');
        spanLogEntrySwitch.onclick = function(){
            getSDG().getUtil().setLocalStorageData(radioLogEntrySwitch.name,radioLogEntrySwitch.value);
            getSDG().getUtil().showUserNotification('Dumping LogEntries to Browser Console!');
            radioLogEntrySwitch.checked = true;
        };
        spanLogEntrySwitch.appendChild(radioLogEntrySwitch);
        spanLogEntrySwitch.appendChild(document.createTextNode("Log Entry Overwrite: Dump all messages to browser console."));
        this._settingsPanelNode.appendChild(spanLogEntrySwitch);
        this._settingsPanelNode.appendChild(document.createElement("br"));
        var spanLogEntrySwitchDelete = document.createElement('span');
        spanLogEntrySwitchDelete.onclick = function(){
            getSDG().getUtil().deleteLocalStorageData('sdgDumpLogsToConsole');
            getSDG().getUtil().showUserNotification('Log Entry Overwrite removed!');
            radioLogEntrySwitch.checked = false;
        };
        spanLogEntrySwitchDelete.appendChild(document.createTextNode("Reset Log Entry Overwrite"));
        this._settingsPanelNode.appendChild(spanLogEntrySwitchDelete);







        return this._settingsPanelNode;
    },
    activateLogPanel: function () {
        this.hideAllPanels();
        this._logPanelNode.style.display = 'block';
    },
    deactiveLogPanel: function () {
        this._logPanelNode.style.display = 'none';
    },
    activatePlacementPanel: function () {
        this.hideAllPanels();
        //this._logPanel.style.display = 'block';
    },
    deactivePlacementPanel: function () {
        //this._logPanel.style.display = 'none';
    },
    activateReportPanel: function () {
        this.hideAllPanels();
        this._reportPanelNode.style.display = 'block';
    },
    deactiveReportPanel: function () {
        this._reportPanelNode.style.display = 'none';
    },
    activateSettingsPanel: function () {
        this.hideAllPanels();
        this._settingsPanelNode.style.display = 'block';
    },
    deactiveSettingsPanel: function () {
        this._settingsPanelNode.style.display = 'none';
    },
    constructNavigation: function () {
        var navigationContainer = document.createElement('div');
        navigationContainer.className = 'sdgNavContainer';
        navigationContainer.innerHTML = '' +
            '<div class="sdgNavList">' +
            '<span onclick="getSDG().getCore().get(getSDG().getSetup().MODULES.INFOTOOL).activatePlacementPanel()" class="sdgNavItem">Placements</span>' +
            '<span onclick="getSDG().getCore().get(getSDG().getSetup().MODULES.INFOTOOL).activateLogPanel()" class="sdgNavItem">Logs</span>' +
            '<span onclick="getSDG().getCore().get(getSDG().getSetup().MODULES.INFOTOOL).activateReportPanel()" class="sdgNavItem">Report Error</span>' +
            '<span onclick="getSDG().getCore().get(getSDG().getSetup().MODULES.INFOTOOL).activateSettingsPanel()" class="sdgNavItem sdgLastNavItem">Settings</span>' +
            '</div>';
        return navigationContainer;
    },
    hideAllPanels: function () {
        this.deactiveLogPanel();
        this.deactiveReportPanel();
        this.deactiveSettingsPanel();
    },
    addInfoToolReport: function (string) {
        this._reportTextArea.value += string+'\n';
    },
    /**
     * adds a log entry to the infopanel log
     * @param message
     * @param messageObjects
     * @param level
     * @param timestamp
     */
    addInfoToolLog: function(message, messageObjects, level, timestamp){
        var entryContainer = document.createElement('span'),
            entryMessage;
        //scrub %o placeholders from message and link to messageObjects
        if (messageObjects.length > 0) {
            for (var i = 0; i < messageObjects.length; i++) {
                if(messageObjects[i] === null){
                    messageObjects[i] = "null";
                }
                message = message.replace(/%o/, messageObjects[i].toString())

            }
        }
        //Build message for logPanel
        entryMessage = document.createTextNode('' +
            timestamp.getHours() + ':' + timestamp.getMinutes() + ':' + timestamp.getSeconds() + ':' + timestamp.getMilliseconds() + ' - ' +
            getSDG().getCore().get(getSDG().getSetup().MODULES.LOGGER).getStringForLogLevel(level) +
            ': ' +
            message);
        entryContainer.className = 'sdgLogEntry';
        if (level >= 50) {
            this._errorCount++;
            this._errorCounterNode.innerHTML = this._errorCount;
            entryContainer.className += ' sdgLogError';
        }
        entryContainer.appendChild(entryMessage);
        entryContainer.appendChild(document.createElement("br"));
        this._logPanelNode.appendChild(entryContainer);
    }
};

/**
 * Container object for Logger Module
 * @author Björn Militzer
 */
getSDG()[getSDG().getSetup().SYSTEM.MODULES].Logger = {
    /**
     * @class Container for log entry data (log message and log level).
     * @author Joerg Basedow <jbasedow@mindworks.de>
     * @constructor
     * @param {String} message
     * @param {Number} level
     * @param messageObjects
     */
    LogEntry: function (message, messageObjects, level)
    {
        this._message = getSDG().getUtil().removeLineBreaks(message);
        this._messageObjects = messageObjects;
        this._level = level;
        this._timeStamp = new Date();
    },
    /**
     * @class Abstract logging service class supporting messages with log levels.
     * @author Joerg Basedow <jbasedow@mindworks.de>
     * @constructor
     */
    LogContainer: function ()
    {
        this._logLevel = getSDG().getSetup().LOGGER.LEVELS.DEBUG;
        this._logEntries = [];
    }
};
getSDG()[getSDG().getSetup().SYSTEM.MODULES].Logger.LogEntry.prototype = {
    /**
     * Get string representation of Log Entry
     *
     * @return {String}
     */
    toString: function ()
    {
        return getSDG().getUtil().getKeyForElementFromObject(getSDG().getSetup().LOGGER.LEVELS, this._level) + ': ' + this._message + this._messageObjects;
    },
    /**
     * Get log level of entry.
     *
     * @return {Number}
     */
    getLevel: function ()
    {
        return this._level;
    }
};
getSDG()[getSDG().getSetup().SYSTEM.MODULES].Logger.LogContainer.prototype = {
    hello: 'huhu',
    /**
     * Get log level for given string.
     *
     * @param {Number} level
     * @return {String} Name of the log level
     *
     */
    getStringForLogLevel: function (level)
    {
        return getSDG().getUtil().getKeyForElementFromObject(getSDG().getSetup().LOGGER.LEVELS, level);
    },
    /**
     * Get log level for given string. Return nolog if level is not found.
     *
     * @param {String} levelAsString
     * @return {Number} the log level (getSDG().Configuration.Logger.Levels), default: NOLOG
     */
    getLogLevelAsString: function (levelAsString)
    {
        var levels = getSDG().getSetup().LOGGER.LEVELS,
            lvl = levels.NOLOG,
            aLevelName;
        for (aLevelName in levels)
        {
            if(levels.hasOwnProperty(aLevelName)){
                if (levelAsString.toUpperCase() === aLevelName)
                {
                    lvl = levels[aLevelName];
                }
            }
        }
        return lvl;
    },
    /**
     * Checks if the given level is allowed.
     *
     * @param {Number} level
     * @return {Boolean}
     */
    isValidLevel: function (level)
    {
        return Boolean(getSDG().getUtil().getKeyForElementFromObject(getSDG().getSetup().LOGGER.LEVELS, level));
    },
    /**
     * Set current log level.
     *
     * @param {Number} level - a level of getSDG().Configuration.Logger.Levels
     */
    setLogLevel: function (level)
    {
        if (this.isValidLevel(level))
        {
            this._logLevel = level;
        }
    },
    /**
     * Get current log level.
     *
     * @return {Number} One of MW.Logger.Levels
     */
    getLogLevel: function ()
    {
        return this._logLevel;
    },
    /**
     * Check if the given level will result in a log entry.
     *
     * @return {Boolean}
     */
    isCausingLogEntry: function (level)
    {
        return this._logLevel !== getSDG().getSetup().LOGGER.LEVELS.NOLOG &&
            this.isValidLevel(level) &&
            level >= this._logLevel;
    },
    /**
     * Convert array of log entries to single new line separated string.
     *
     * @param {Array} entries
     * @return {String}
     */
    stringify: function (entries)
    {
        var logString = '',
            i,
            length;
        for (i = 0, length = entries.length; i < length; i++)
        {
            logString += entries[i].toString() + "\n";
        }
        return logString;
    },
    /**
     * Get log entries which log level is at least as high as the configured log
     * level as Array.
     *
     * @return {Array.<String>} Array of log strings (Level: message).
     */
    getLogEntriesByLevel: function (level)
    {
        var log = [],
            i,
            length,
            anEntry,
            searchLevel = (typeof level !== 'undefined') ? level : 0;
        for (i = 0, length = this._logEntries.length; i < length; i++)
        {
            if (this._logEntries[i]._level >= searchLevel) {
                anEntry = this._logEntries[i];
                log.push(anEntry.toString());
            }
        }
        return log;
    },
    /**
     * Creates log entry. Checks for valid level, if not valid the level will be set to DEBUG
     *
     * @param {String} message
     * @param {Number} level
     * @param messageObjects {Array}
     */
    log: function (message, level, messageObjects)
    {
        if (typeof messageObjects !== 'undefined')
        {
            if (!getSDG().getUtil().isArray(messageObjects))
            {
                messageObjects = [messageObjects];
            }
        } else
        {
            messageObjects = []
        }
        var messageConcat,
            logIdentifier = 'SDG: ',
            levelString = this.getStringForLogLevel(level) + ': ',
            logEntry;
        if (!this.isValidLevel(level))
        {
            level = getSDG().getSetup().LOGGER.LEVELS.DEBUG;
        }
        if (this.isCausingLogEntry(level) && window.console && typeof window.console.log === 'function')
        {
            logEntry = new SDG[getSDG().getSetup().SYSTEM.MODULES].Logger.LogEntry(message, messageObjects, level);
            this._logEntries.push(logEntry);
            getSDG().getEventDispatcher().trigger('SDG_NEW_LOG_ENTRY', logEntry);

            if(level >= 50 || getSDG().getUtil().getLocalStorageData('sdgDumpLogsToConsole') === "1"){
                if (messageObjects.length === 0)
                {
                    window.console.log(logIdentifier + levelString + message);
                } else
                {
                    messageConcat = [logIdentifier + levelString + message].concat(messageObjects);
                    window.console.log.apply(this, messageConcat);
                }
            }
        }
    },
    getLogEntryByIndex: function (index) {
        var anEntry = [];
        anEntry.push(this._logEntries[index]);
        return anEntry[0];
    }
};


getSDG()[getSDG().getSetup().SYSTEM.MODULES].AdSlotController = {
    Controller: function ()
    {
        this.Placements = {};
    }
};
getSDG()[getSDG().getSetup().SYSTEM.MODULES].AdSlotController.Controller.prototype = {
    /**
     * Function to create a placement on a website by providing a pre-configured position.
     * This is the most basic command to start displaying ads.
     *
     * Will check if all passed arguments are valid and working. If any of the arguments are either invalid or not to specification,
     * the registration process will fail and an error message is thrown.
     *
     * The function can only be called once for a position, unless the position is unregistered first.
     *
     * @example SDG.Publisher.register('sb',document.querySelector('div#elementId'),true);
     * @interface
     * @this Controller
     * @param {string} position - Contains the pre-configured position name. Correlates to an ad format name shorthandle, example: "sb" for "Superbanner".
     * @param {object} containerNode - Contains the id of the HTML object, which will function as parent node, inside the DOM tree, of the placement.
     * @return {object || null}
     */
    registerSlot: function (position, containerNode)
    {
        var placement,
            placementDirectory = this.getPlacements();
        if (this.getConfig().getValueForPosition(position) !== null) //Position is configured in local.json, otherwise error
        {
            if(typeof this.getConfig().getValueForPosition(position, "positionOverwrite") !== 'undefined'){
                getSDG().log('register(): overwrite for position "'+position+'" found, adslot will use the new position '+this.getConfig().getValueForPosition(position, "positionOverwrite")+'.', getSDG().loglvl('DEBUG'));
                position = this.getConfig().getValueForPosition(position, "positionOverwrite");
            }
            if (!this.getPlacementByPosition(position)) //Position is not already registered, otherwise error
            {
                if (containerNode instanceof Node && containerNode.nodeType === 1) //Container is a valid element node and avaible on site, otherwise error
                {
                    //build placement and send placement to AdServer module to finish setup
                    placement = placementDirectory[position] =
                        new SDG[getSDG().getSetup().SYSTEM.MODULES].AdSlotController.Placement(position, containerNode);
                    placement.constructAdSlot();

                    getSDG().log(placement.getName()+': register(): arguments passed were (%o, %o)', getSDG().loglvl('DEBUG'), [position,containerNode]);


                    return placement;
                } else
                {
                    getSDG().log('register(): container not found. Please make sure that you pass a valid element node. Arguments passed were (%o, %o)', getSDG().loglvl('CRITICAL'), [position,containerNode]);
                    return null;
                }
            } else
            {
                getSDG().log('register(): Position: "' + position + '" already registered. To reuse position, use unregister first. Arguments passed were (%o, %o)', getSDG().loglvl('CRITICAL'), [position,containerNode]);
                return null;
            }
        } else
        {
            getSDG().log('register(): Position: "' + position + '" not found in site configuration or system uses malformed configuration file. Please contact InteractiveMedia technical support. Arguments passed were (%o, %o)', getSDG().loglvl('CRITICAL'), [position,containerNode]);
            return null;
        }
    },
    /**
     * Will delete a placement from the Placements namespace based on the position and remove all ad content from the site if deleteAd is true.
     *
     * @this Controller
     * @param {string} position - Contains the pre-configured position name. Correlates to an ad format name shorthandle, example: "sb" for "Superbanner".
     * @param {boolean} deleteAd - Will delete all content written by the placement if set to true or is not set, false will delete the placement but not the content.
     */
    unregisterSlot: function (position, deleteAd)
    {
        var currentPlacement = this.getPlacementByPosition(position);
        deleteAd = (deleteAd === undefined) ? true : deleteAd;
        if (currentPlacement)
        {
            if (deleteAd)
            {
                currentPlacement.deletePlacementContent();
            }
            if (currentPlacement.deleteAdserverPlacement())
            {
                //legacy events
                getSDG().getEventDispatcher().trigger('POSITION_DELETED', currentPlacement);
                getSDG().getEventDispatcher().trigger('SDG_PLACEMENT_UNREGISTERED', currentPlacement);
                //new events
                getSDG().getEventDispatcher().trigger('SLOT_DELETED', currentPlacement);
                getSDG().getEventDispatcher().trigger('SDG_SLOT_UNREGISTERED', currentPlacement);
                delete this.getPlacements()[currentPlacement.getName()];
                getSDG().log('"' + position + '": succesfully deleted.', getSDG().loglvl('NOTICE'));
                return true;
            }
        } else
        {
            getSDG().log('unregister(): Position ' + position + ' is currently not registered. Position can not be deleted.', getSDG().loglvl('WARNING'));
            return false;
        }
    },
    /**
     * Convenience function which will delete all placements on the site by iterating through the Placement namespace and calling the unregister() function for each objects position.
     *
     * @this Controller
     * @param {boolean} deleteAd - Will delete all content written by the placement if set to true or is not set, false will delete the placement but not the content.
     */
    unregisterAll: function (deleteAd)
    {
        var placementDirectory = this.getPlacements();
        for (var x in placementDirectory)
        {
            if(placementDirectory.hasOwnProperty(x)){
                var currentPlacement = placementDirectory[x];
                this.unregisterSlot(currentPlacement.getName(), deleteAd)
            }
        }
    },
    /**
     * Will start the load process of  a single placement defined by position argument
     * @param {string} position - Contains the pre-configured position name. Correlates to an ad format name shorthandle, example: "sb" for "Superbanner".
     */
    loadSingleSlot: function (position) {
        return this.getPlacementByPosition(position).load()
    },

    /**
     * Will start the process to enqueue and load several plaacements at once.
     *
     * @param {boolean} reloadAds - Will load any placements on the site if set to true (default), will load only unloaded placements if set to false.
     */
    loadMultipleSlots: function (reloadAds)
    {
        return this.getAdServer().executeMutipleAdSlotCalls(reloadAds);
    },
    /**
     * searches all active placement for the position
     * @this IM.Controller
     * @param position
     */
    getPlacementByPosition: function (position)
    {
        var placementDirectory = this.getPlacements(),
            currentPlacement;
        for (var x in placementDirectory)
        {
            if(placementDirectory.hasOwnProperty(x)){
                currentPlacement = placementDirectory[x];
                if (currentPlacement.getName() === position)
                {
                    return currentPlacement
                }
            }

        }
        return false;
    },
    /**
     * returns the placement containing the searched adserverName
     * @param adServerName
     * @returns {*}
     */
    getPlacementByAdServerName: function (adServerName) {
        var placementDirectory = this.getPlacements(),
            currentPlacement;
        for (var x in placementDirectory) {
            if(placementDirectory.hasOwnProperty(x)){
                currentPlacement = placementDirectory[x];
                if (currentPlacement.getAlias() === adServerName) {
                    return currentPlacement;
                }
            }
        }
        return false;
    },
    /**
     * returns the position of the placement registered with this sizeId
     * @this SDG.Controller
     * @param sizeId
     * @returns {*}
     */
    getPosBySizeId: function (sizeId)
    {
        var placementDirectory = this.getPlacements(),
            currentPlacement;
        if (typeof sizeId === 'string')
        {
            sizeId = parseFloat(sizeId);
        }
        for (var x in placementDirectory)
        {
            if(placementDirectory.hasOwnProperty(x)){
                currentPlacement = placementDirectory[x];
                if (currentPlacement.sizeParams.sizeId === sizeId)
                {
                    return currentPlacement.getName();
                }
            }
        }
        return false;
    },
    /**
     * returns the placement registered with this sizeString
     * @param sizeString
     * @returns {*}
     */
    getPlacementBySizeString: function (sizeString){
        var placementDirectory = this.getPlacements(),
            currentPlacement;
        for (var x in placementDirectory){
            if(placementDirectory.hasOwnProperty(x)){
                currentPlacement = placementDirectory[x];
                if(currentPlacement.sizeParams.sizeString === sizeString){
                    return currentPlacement
                }
            }
        }
        return false
    },
    /**
     * returns the first placement found with the given sizeId, otherwise false.
     * WARNING: Multiple placements with the same sizeId may exist on a page, function only returns one placement
     *
     * @param sizeId
     * @return object
     */
    getPlacementBySizeId: function (sizeId)
    {
        var placementDirectory = this.getPlacements(),
            currentPlacement;
        if (typeof sizeId === 'string')
        {
            sizeId = parseFloat(sizeId);
        }
        for (var x in placementDirectory)
        {
            if(placementDirectory.hasOwnProperty(x)){
                currentPlacement = placementDirectory[x];
                if (currentPlacement.sizeParams.sizeId === sizeId)
                {
                    return currentPlacement;
                }
            }
        }
        return false;
    },
    /**
     * returns the placement registered under the given container
     * @param containerId
     */
    getPlacementByContainerId: function (containerId) {
        var placementDirectory = this.getPlacements(),
            currentPlacement;
        if (typeof containerId === 'string') {
            for (var x in placementDirectory) {
                if(placementDirectory.hasOwnProperty(x)){
                    currentPlacement = placementDirectory[x];
                    if (currentPlacement.getContainer().id === containerId) {
                        return currentPlacement;
                    }
                }
            }
        } else {
            getSDG().log('SYSTEM: getPlacementByContainerId(): containerId was not a string, search canceled.', getSDG().loglvl('INFO'));
        }
    },
    /**
     *
     * @this SDG.Controller
     * @returns {*[]}
     */
    loadStatus: function ()
    {
        var placementDirectory = this.getPlacements(),
            loaded = 0,
            counter = 0;
        for (var x in placementDirectory)
        {
            if(placementDirectory.hasOwnProperty(x)){
                counter++;
                if (placementDirectory[x].stats.loaded)
                {
                    loaded++
                }
            }
        }
        getSDG().log('Loaded ' + loaded + ' of ' + counter + ' positions.', getSDG().loglvl('DEBUG'));
        return [loaded, counter];
    },
    /**
     *
     * @this SDG.Controller
     * @param addonName
     * @param addonObject
     */
    addGlobalPlacementAddon: function (addonName, addonObject)
    {
        getSDG()[getSDG().getSetup().SYSTEM.MODULES].AdSlotController.Placement.prototype.globalAddons[addonName] = addonObject;
    },
    /**
     *
     * @this IM.Controller
     * @param addonName
     */
    removeGlobalPlacementAddon: function (addonName)
    {
        getSDG()[getSDG().getSetup().SYSTEM.MODULES].AdSlotController.Placement.prototype.globalAddons[addonName].remove.call(this);
        delete getSDG()[getSDG().getSetup().SYSTEM.MODULES].AdSlotController.Placement.prototype.globalAddons[addonName]
    },
    /**
     *
     * @this SDG.Controller
     * @param placement
     * @param addonName
     * @param addonObject
     */
    addLocalAddon: function (placement, addonName, addonObject)
    {
        placement.localAddons[addonName] = addonObject;
    },
    /**
     *
     * @this SDG.Controller
     * @param placement
     * @param addonName
     */
    removeLocalAddon: function (placement, addonName)
    {
        placement.localAddons[addonName].deactivate.call(placement);
        delete placement.localAddons[addonName];
    },
    /**
     * Starts a call to the adserver with multiple placements at once
     * @this IM.Controller
     * @returns {boolean}
     */
    executeMultiAdserverCall: function ()
    {
        return this.getAdServer().executeMultiAdserverCall();
    },
    /**
     * Convenience method to fetch Placement container from Controller.
     * @returns {{}|*}
     */
    getPlacements: function ()
    {
        return this.Placements
    },
    /**
     * Convenience method to fetch config wrapper from service container.
     *
     * @return {IM.Setup}
     */
    getConfig: function ()
    {
        return SDG.getCore().get(getSDG().getSetup().MODULES.PUBLISHER_CONFIG);
    },
    /**
     * Convenience method to fetch ad server adapter from service container.
     *
     * @return
     */
    getAdServer: function ()
    {
        return SDG.getCore().get(getSDG().getSetup().MODULES.ADSERVER);
    }
};
/**
 * Constructor for every registered placement.
 * This Object should be kept as focused as possible. Placements should work and function no matter which adserver will interact with them
 *
 * @param position
 * @param container
 *
 * @
 * @constructor
 */
getSDG()[getSDG().getSetup().SYSTEM.MODULES].AdSlotController.Placement = function (position, container)
{
    this.adServerName = ''; //This will be set by the respective AdServer module. The Adservername will be (in most cases) the interface between adserver macros and the metatag controller
    this._adServerAlias = ''; //This will be set by the respective AdServer module. The Adservername will be (in most cases) the interface between adserver macros and the metatag controller
    this.containerElement = container; //the DOM node which houses the placement, will be passed by the register function
    this.position = position; //the position name of the adslot, main interface between the placement and the global.json
    this._slotName = position; //the name of the adslot, main interface between the placement and the global.json
    this.loadType = ''; //parameter to identify which adserver tags should be used. In most cases the adserver will use different tags for each loading pattern (async, sync, etc)
    this.localZone = ''; //a placement can have an own zone definition, divergent from the zone set for the HTML page
    this.localPageType = '';
    this.localTargeting = {};
    this.tagTemplateType = '';
    this.systemIds = {};
    this.frameWindow = undefined;
    this.flags = {
        activeAsyncModule: false,
        activeFriendlyIframe: false,
        activeLoadSequence: false
    };
    this.stats = {
        calledRTB: false,
        activeRTB: false,
        activeBigSize: false,
        loaded: false,
        loadedOnRegister: false,
        loadDelayed: false
    };
    this.sizeParams = {
        sizeString: parseFloat(this.getConfig().getValueForPosition(position, 'width')) + 'x' + parseFloat(this.getConfig().getValueForPosition(position, 'height')),
        sizeArray: [],
        width: parseFloat(this.getConfig().getValueForPosition(position, 'width')),
        height: parseFloat(this.getConfig().getValueForPosition(position, 'height'))
    };
    this.localAddons = {};

    if (container.className !== '') {
        container.className = container.className + ' ';
    }
    container.className = container.className + 'sdgSlotContainer sdgSlotName-'+position;
    //todo rewrite as inline style instead of <head> based style tags
    if(this.getConfig().getValueForPosition(position, 'cssContainerPreset')){
        getSDG().getUtil().addCssToHead('.sdgSlotName-'+position+'{'+this.getConfig().getValueForPosition(position, 'cssContainerPreset')+'}')
    }
};
/**
 *
 * @type {{globalAddons: {}, prepareNewAd: prepareNewAd, getAd: getAd, executeSeperateAdserverCall: executeSeperateAdserverCall, readyMultiAdServerCall: readyMultiAdServerCall, reloadDynamicPlacementVariables: generateLocalPlacementParameters, deleteAdserverPlacement: deleteAdserverPlacement, wrapInFriendlyIframe: wrapInFriendlyIframe, executePreCallSetup: executePreCallSetup, completeLoad: placementResponded, getContainer: getContainer, deletePlacementContent: deletePlacementContent, updatePlacementParameters: updatePlacementParameters, executeGlobalAddons: executeGlobalAddons, activateLocalAddons: activateLocalAddons, finalizeCall: finalizeCall, getSiteConfig: getConfig, getAdServer: getAdServer}}
 */

getSDG()[getSDG().getSetup().SYSTEM.MODULES].AdSlotController.Placement.prototype = {
    globalAddons: {},
    prepareNewAd: function (anchorElement, json)
    {
        var anchor, jsonData;
        anchor = (!!anchorElement) ? anchorElement : document.createElement('div');
        jsonData = (!!json) ? json : null;
        this.adContent = new SDG[getSDG().getSetup().SYSTEM.MODULES].Advertisment(anchor, jsonData);
        return this.getAd();
    },
    deleteAd: function(){
        if(!!this.getAd()){
            this.getAd().deleteAllContent();
            delete this.adContent;
        }
    },
    getAd: function ()
    {
        if (!!this.adContent)
        {
            return this.adContent
        } else
        {
            return false;
        }
    },
    /**
     *
     * @this IM.Controller.Placement
     * @returns {boolean}
     */
    executeSingleAdSlotCall: function ()
    {
        return this.getAdServer().executeSingleAdSlotCall(this);
    },
    /**
     *
     *
     * this IM.Controller.Placement
     * @returns {boolean}
     */
    readyMultiAdServerCall: function ()
    {
        return this.getAdServer().readyMultiAdServerCall(this);
    },
    /**
     * build the adslot on the site and prepare the placement for further steps
     * @returns {boolean}
     */
    constructAdSlot: function() {
        this.generateLocalPlacementParameters();
        if (!this.getContainer().id) {
            this.getContainer().id = this.getAlias();
        }
        this.getAdServer().finishPlacementConstruction(this);
        this.sendPlacementRegisteredEvent();
        return true
    },
    /**
     * update local parameters like alias and local targeting, in case they changed
     * @this IM.Controller.Placement
     * @returns {boolean}
     */
    generateLocalPlacementParameters: function ()
    {
        this._adServerAlias = this.getAdServer().returnAdServerPlacementName(this);
        //noinspection JSUnresolvedVariable
        if (getSDG().getUtil().hasObjectKeys(getSDG().getPUB().getConfig().getValueForPosition(this.getName(), 'kvPreset'))) {
            //noinspection JSUnresolvedVariable
            getSDG().getUtil().transferParamKeysToObject(this.localTargeting, getSDG().getPUB().getConfig().getValueForPosition(this.getName(), 'kvPreset'));
        }
        return true;
    },
    /**
     *
     * @this IM.Controller.Placement
     * @returns {boolean}
     */
    deleteAdserverPlacement: function ()
    {
        return this.getAdServer().deleteAdserverPlacement(this);
    },
    /**
     *
     * @this IM.Controller.Placement
     * @returns {boolean}
     */
    wrapInFriendlyIframe: function ()
    {
        return this.getAdServer().wrapInFriendlyIframe(this);
    },
    /**
     * Check several parameters of the placement, if no error occures, send events and return back to the adserver load function which called this
     *
     * todo: remove addons and stats before reload is triggered
     * @returns {boolean}
     */
    executePreCallSetup: function ()
    {
        if (!this.getConfig().isFirstAdCallExecuted()) {
            this.getConfig().markFirstAdCallExecuted();
            getSDG().getEventDispatcher().trigger('SDG_BEFORE_LOAD_ALL');
        }
        if(!this.generateLocalPlacementParameters()){
            getSDG().log(this.getName() + ':  Error occured during update of local placement parameters, skipping adslot!.', getSDG().loglvl('ALERT'));
            return false;
        }
        if (this.flags.activeFriendlyIframe)
        {
            if(!this.wrapInFriendlyIframe()){
                getSDG().log(this.getName() + ':  Wrapping the placement in a friendly iframe returned an error, skipping adslot!', getSDG().loglvl('ALERT'));
                return false
            }
        }
        if (!this.isInViewportRange())
        {
            getSDG().log(this.getName() + ':  Viewport is NOT in preconfigured range, skipping adslot.', getSDG().loglvl('NOTICE'));
            return false;
        }
        this.sendPlacementPreparedEvent();
        return true;
    },
    /**
     * //todo Resize fuer friendly Iframe einbauen
     * @this IM.Controller.Placement
     */
    placementResponded: function ()
    {
        this.sendPlacementRespondedEvent()
    },
    /**
     *
     * @returns {object} Container element for placement
     */
    getContainer: function ()
    {
        return this.containerElement;
    },
    getName: function () {
        return this._slotName;
    },
    /**
     * returns the adserverName of the adslot
     * @returns {string|*|String}
     */
    getAlias: function() {
        return this._adServerAlias;
    },
    deletePlacementContent: function ()
    {
        this.deleteAd();
        getSDG().getUtil().deleteAllNodesInObject(this.getContainer());
    },
    /**
     *
     * @this IM.Controller.Placement
     * @param params
     */
    updatePlacementParameters: function (params)
    {
        for (var x in params)
        {
            if (typeof params[x] === 'object' && params.hasOwnProperty(x))
            {
                var key = params[x];
                this[x] = this[x] || key;
                for (var y in key)
                {
                    if (typeof key[y] === 'object' && key.hasOwnProperty(y))
                    {
                        var subkey = key[y];
                        this[x][y] = this[x][y] || subkey;
                        for (var v in subkey)
                        {
                            if(subkey.hasOwnProperty(v)){
                                this[x][y][v] = subkey[v];
                            }
                        }
                    } else
                    {
                        this[x][y] = key[y];
                    }
                }
            } else
            {
                this[x] = params[x];
            }
        }
    },
    /**
     *
     * @this IM.Controller.Placement
     */
    executeGlobalAddons: function ()
    {
        for (var x in this.globalAddons)
        {
            this.globalAddons[x].execute.call(this);
        }
    },
    /**
     *
     * @this IM.Controller.Placement
     */
    activateLocalAddons: function ()
    {
        //noinspection JSUnresolvedVariable
        for (var x in this.localAddons)
        {
            //noinspection JSUnresolvedVariable
            if(this.localAddons.hasOwnProperty(x)){
                //noinspection JSUnresolvedVariable
                var currentAddon = this.localAddons[x];
                currentAddon.activate.call(this);
            }
        }
    },
    /**
     * Sends Event SDG_PLACEMENT_REGISTERED and POSITION_REGISTERED events
     */
    sendPlacementRegisteredEvent: function () {
        getSDG().getEventDispatcher().trigger('SDG_PLACEMENT_REGISTERED', this);
        getSDG().getEventDispatcher().trigger('POSITION_REGISTERED', this);
        getSDG().getEventDispatcher().trigger('SLOT_REGISTERED', this);
        getSDG().getEventDispatcher().trigger('SDG_SLOT_REGISTERED', this);
        getSDG().log(this.getName() + ': register successfull.', getSDG().loglvl('INFO'));
    },
    /**
     * Sends Event POSITION_PREPARED, should be triggered by AdServer Module when the placement was prepared (all dynamic values updated) or is in the process of beeing prepared
     */
    sendPlacementPreparedEvent: function () {
        getSDG().getEventDispatcher().trigger('POSITION_PREPARED', this);
        getSDG().getEventDispatcher().trigger('SLOT_PREPARED', this);
        getSDG().getEventDispatcher().trigger('SDG_SLOT_PREPARED', this);
        getSDG().log(this.getName() + ': placement is prepared for call, dynamic values updated. ', getSDG().loglvl('DEBUG'));
    },
    /**
     * Sends Event POSITION_CALLING, should be triggered by AdServer Module when the placement is calling for an adserver response or is milliseconds away from starting the call
     */
    sendPlacementCallingEvent: function () {
        this.stats.loaded = true;
        getSDG().getEventDispatcher().trigger('POSITION_CALLING', this);
        getSDG().getEventDispatcher().trigger('SDG_PLACEMENT_CALLING', this);
        getSDG().getEventDispatcher().trigger('SLOT_CALLING', this);
        getSDG().getEventDispatcher().trigger('SDG_SLOT_CALLING', this);
        getSDG().log(this.getName() + ': placement is now calling the adServer. ', getSDG().loglvl('DEBUG'));
    },
    /**
     * Sends Event POSITION_RESPONDED, should be triggered by AdServer Module when the placement receives an adserver response
     */
    sendPlacementRespondedEvent: function () {
        getSDG().getEventDispatcher().trigger('POSITION_RESPONDED', this);
        getSDG().getEventDispatcher().trigger('SLOT_RESPONDED', this);
        getSDG().getEventDispatcher().trigger('SDG_SLOT_RESPONDED', this);
        getSDG().log(this.getName() + ': placement has received an adServer response.', getSDG().loglvl('DEBUG'));
    },
    /**
     * Sends Event POSITION_DONE, should be triggered when the placements is done with everything (banner is rendered)
     */
    sendPlacementDoneEvent: function () {
        getSDG().getEventDispatcher().trigger('POSITION_DONE', this);
        getSDG().getEventDispatcher().trigger('SDG_PLACEMENT_DONE', this);
        getSDG().getEventDispatcher().trigger('SLOT_DONE', this);
        getSDG().getEventDispatcher().trigger('SDG_SLOT_DONE', this);
        getSDG().log(this.getName() + ': placement has finished call/response/rendering process.', getSDG().loglvl('DEBUG'));
    },
    /**
     * Sends Event POSITION_CALLING, should be triggered by AdServer Module when the placement starts its adserver request
     * @this IM.Controller.Placement
     * @param params
     */
    finalizeCall: function (params)
    {
        this.updatePlacementParameters(params);
        this.executeGlobalAddons();
        this.activateLocalAddons();
        this.sendPlacementDoneEvent()
    },
    /**
     * sets the zone of the placement
     * @param zone
     */
    setZone: function (zone) {
        this.localZone = zone;
        return this;
    },
    getZone: function () {
        if (this.localZone !== '') {
            return this.localZone;
        } else {
            return this.getConfig().getZone();
        }
    },
    /**
     * sets local pageType for this placement only
     * @param pageType
     */
    setPageType: function (pageType) {
        this.localPageType = pageType;
        return this;
    },
    getPageType: function () {
        if (this.localPageType !== '') {
            return this.localPageType;
        } else {
            return this.getConfig().getPageType();
        }
    },
    setTargeting: function (keyValues) {
        if (!getSDG().getUtil().transferParamKeysToObject(this.localTargeting, keyValues)) {
            getSDG().log('SYSTEM: ' + this.getName() + ': Malformed key values passed to adslot!', getSDG().loglvl('WARNING'));
        }
        return this;
    },
    /**
     * removes a size from the placement, in case a publisher wants to block a specific adserver specifiv settings from delivering on a given HTML site.
     * this function however is not proberly documented an needs to be explained to the publisher in detail (as security measure)
     * @param sizeArrayToRemove
     * @returns {*}
     */
    removeSizes: function (sizeArrayToRemove) {
        var sizeArry, sizeString, placementKey, placementSizeString;
        if (Array.isArray(sizeArrayToRemove)) {
            if (typeof sizeArrayToRemove[0] === 'number' || typeof sizeArrayToRemove[0] === 'string') {
                sizeArry = [];
                sizeArry.push(sizeArrayToRemove);
            } else {
                sizeArry = sizeArrayToRemove;
            }
            for (var i = 0; i < sizeArry.length; i++) {
                sizeString = sizeArry[i].toString();
                for (placementKey in this.sizeParams.sizeArray) {
                    if (typeof this.sizeParams.sizeArray[placementKey] !== 'function' && Array.isArray(this.sizeParams.sizeArray[placementKey])) {
                        placementSizeString = this.sizeParams.sizeArray[placementKey].toString();
                        if (placementSizeString === sizeString) {
                            this.sizeParams.sizeArray.splice(placementKey, 1);
                            getSDG().log(this.getName() + ': removeSizes(): size ' + sizeString + ' removed from placement.', getSDG().loglvl('NOTICE'));
                        }
                    }
                }
            }
        } else {
            getSDG().log(this.getName() + ': removeSizes(): The size to remove was not correctly passed, please consult the documentation and try again', getSDG().loglvl('ERROR'));
        }
        return this;
    },
    /**
     * Checks if the position has a preconfigured min or max viewport with to render in.
     * If not and there is a mobileBreakpoint set and the position is a mobile slot the max value is set to the mobile breakpoint
     * @returns {boolean}
     */
    isInViewportRange: function(){
        var useMobileBreakpoint = this.getAdServer().checkForMobileBreakpoint(),
            useMobieName = !!this.getConfig().getValueForPosition(this.getName(), 'isMobileSlot');
        var min = (!!this.getConfig().getValueForPosition(this.getName(), 'minViewportWidth')) ? parseFloat(this.getConfig().getValueForPosition(this.getName(), 'minViewportWidth')) : (!useMobieName && useMobileBreakpoint) ? this.getAdServer().returnMobileBreakpoint() : 0,
            max = (!!this.getConfig().getValueForPosition(this.getName(), 'maxViewportWidth')) ? parseFloat(this.getConfig().getValueForPosition(this.getName(), 'maxViewportWidth')) : (useMobieName && useMobileBreakpoint) ? this.getAdServer().returnMobileBreakpoint() : 40000;
        return !(getSDG().getUtil().getViewportDimensions().width < min) && !(getSDG().getUtil().getViewportDimensions().width > max);
    },
    /**
     * will start the load process for this placement, returns the placement for command chaining
     * checks if prebid is installed and if adslots should delay the load commands until prebid has answered with all auctions
     * @returns {*}
     */
    load: function () {
        var instance = this;
        if (this.getConfig()._targetingConfigs.prebid && this.getConfig()._targetingConfigs.prebid.active && getSDG().getRes().get(getSDG().getSetup().RESOURCES.PREBID) && getSDG().getRes().get(getSDG().getSetup().RESOURCES.PREBID).getWaitForResponseStatus() && getSDG().getRes().get(getSDG().getSetup().RESOURCES.PREBID)._loadStatus !== 'COMPLETE'){
            getSDG().log(this.getName() + ': load delayed! Waiting for PreBid to end auction.', getSDG().loglvl('NOTICE'));
            this.stats.loadDelayed = true;
            window.addEventListener('prebidResponded', function(){
                instance.executeSingleAdSlotCall()
            })
        }else{
            this.executeSingleAdSlotCall();
            return this;
        }
    },
    /**
     * Convenience method to fetch config wrapper from service container.
     *
     * @return {IM.Setup}
     */
    getConfig: function ()
    {
        return getSDG().getCore().get(getSDG().getSetup().MODULES.PUBLISHER_CONFIG);
    },
    /**
     * Convenience method to fetch ad server adapter from service container.
     *
     * @return Adserver Module
     */
    getAdServer: function ()
    {
        return getSDG().getCore().get(getSDG().getSetup().MODULES.ADSERVER);
    }
};
/**
 * Created by adams on 24.05.2017.
 *
 */

getSDG()[getSDG().getSetup().SYSTEM.MODULES].AdSlotController.Position = function(format)
{

};

getSDG()[getSDG().getSetup().SYSTEM.MODULES].AdSlotController.Position.prototype = {
    positionWallpaper:function(styles)
    {
        try{if(styles !== '') window.top.SDG.getUtil().addCssToHead(styles)}catch(err){console.log(err);};
    },
    positionBillboard:function(styles)
    {
        try{if(styles !== '') window.top.SDG.getUtil().addCssToHead(styles)}catch(err){console.log(err);};
    },
    positionUshape:function(styles)
    {
        try{if(styles !== '') window.top.SDG.getUtil().addCssToHead(styles)}catch(err){console.log(err);};
    },
    positionBridgeAd:function(styles)
    {
        try{if(styles !== '') window.top.SDG.getUtil().addCssToHead(styles)}catch(err){console.log(err);};
    }
};

/**
 * @class Container for the current configuration merging local.json, site
 * config and runtime config.
 * @author Joerg Basedow <jbasedow@mindworks.de>, edited by Bjoern Militzer
 * @constructor
 * @param {Object} config local.json from backend
 */

getSDG()[getSDG().getSetup().SYSTEM.MODULES].PublisherSetup = function (config)
{
    /**
     * @type {object}
     */
    var validatedConfig = this.validateConfig(config);
    /**
     * @type {Object}
     */
    this._commonConfig = this.mergeConfigs(validatedConfig.global.common, validatedConfig.website.common);
    /**
     * @type {Object}
     */
    this._adserverConfig = this.mergeConfigs(validatedConfig.global.adserver, validatedConfig.website.adserver);
    /**
     * @type {Object}
     */
    this._formatConfig = this.mergeConfigs(validatedConfig.global.formats, validatedConfig.website.formats);
    /**
     * @type {Object}
     */
    this._featureConfig = this.mergeConfigs(validatedConfig.global.features, validatedConfig.website.features);
    /**
     * @type {Object}
     */
    this._positionConfigs = this.mergeConfigs(validatedConfig.global.positions, validatedConfig.website.positions);
    /**
     * @type {Object}
     */
    this._targetingConfigs = this.mergeConfigs(validatedConfig.global.targeting, validatedConfig.website.targeting);
    /**
     * @type {Object}
     */
    this._templates = validatedConfig.global.templates || {};
    /**
     * @type {String}
     */
    this._zone = 'zoneError';
    /**
     * @type {String}
     */
    this._pageType = '';
    /**
     * @type {Object.<String, void>}
     */
    this._keywords = {};
    /**
     * @type {Object.<String, Array.<String>>}
     */
    this._keyValues = {};
    /**
     * @type {String}
     */
    this._protocol = (location.protocol === 'http:') ? getSDG().getSetup().PROTOCOLS.HTTP : getSDG().getSetup().PROTOCOLS.HTTPS;
    /**
     * @type {String}
     */
    this._group = SDG.getUtil().generateRandomNumberString(this.getCommonValue('grpLength'));
    /**
     * @type {Boolean}
     */
    this._isFirstAdCallExecuted = false;
    /**
     * @type {Object}
     */
    this._contentObject = {};
    /**
     * @type {object}
     */

    this._contentObjectMutationObserver = {};
};
getSDG()[getSDG().getSetup().SYSTEM.MODULES].PublisherSetup.prototype = {
    /**
     * Check if all mandatory keys are set.
     *
     * Log warnings for validation problems and generate empty objects to prevent consequential errors.
     *
     * @param {Object} config
     * @return {Object} Validated config
     */

    validateConfig: function (config)
    {
        config = config || {};
        if (!config.global)
        {
            config.global = {};
            getSDG().log('"global" section of config is missing.', getSDG().loglvl('EMERGENCY'));
        }
        if (!config.global.common)
        {
            config.global.common = {};
            getSDG().log('"global.common" section of config is missing.', getSDG().loglvl('EMERGENCY'));
        }
        if (!config.global.adserver)
        {
            config.global.common = {};
            getSDG().log('"global.adserver" section of config is missing.', getSDG().loglvl('EMERGENCY'));
        }
        if (!config.global.formats) {
            config.global.formats = {};
            //todo: Aktiviere check wenn format entwicklung abgeschlossen
            //getSDG().log('"global.features" section of config is missing.', getSDG().loglvl('EMERGENCY'));
        }
        if (!config.global.features) {
            config.global.features = {};
            getSDG().log('"global.features" section of config is missing.', getSDG().loglvl('EMERGENCY'));
        }
        if (!config.global.targeting) {
            config.global.targeting = {};
            getSDG().log('"global.targeting" section of config is missing.', getSDG().loglvl('EMERGENCY'));
        }
        if (!config.global.positions)
        {
            config.global.positions = {};
            getSDG().log('"global.positions" section of config is missing.', getSDG().loglvl('EMERGENCY'));
        }
        if (!config.website)
        {
            config.website = {};
            getSDG().log('"site" section of config is missing.', getSDG().loglvl('EMERGENCY'));
        }
        if (!config.website.common)
        {
            config.website.common = {};
            getSDG().log('"site.common" section of config is missing.', getSDG().loglvl('EMERGENCY'));
        }
        if (!config.website.features) {
            config.website.features = {};
            getSDG().log('"site.features" section of config is missing.', getSDG().loglvl('EMERGENCY'));
        }
        if (!config.website.targeting) {
            config.website.targeting = {};
        }
        if (!config.website.positions)
        {
            config.website.positions = {};
        }
        return config;
    },
    /**
     * Get a combined config containing the site specific and the global values for each position.
     *
     * @param {Object} globalConfig
     * @param {Object} websiteConfig
     * @return {Object}
     */
    mergeConfigs: function (globalConfig, websiteConfig)
    {
        var config = SDG.getUtil().mergeRecursive({}, globalConfig);
        return SDG.getUtil().mergeRecursive(config, websiteConfig);
    },
    /**
     * Get the value from the configuration from the local.json for the
     * given name.
     *
     * @param {String} name
     * @return {string}
     */
    getCommonValue: function (name)
    {
        return this._commonConfig[name];
    },
    /**
     * Get the value from the configuration from the adserverConfig for the
     * given name.
     *
     * @param {String} name
     * @return {string}
     */
    getAdServerValue: function (name)
    {
        return this._adserverConfig[name];
    },
    /**
     * Get the value from the feature configuration from the local.json for the
     * given name.
     * @param formatName
     * @param value
     * @returns {string|null}
     */
    getValueForFormat: function (formatName, value) {
        {
            if (!this._formatConfig[formatName])
            {
                getSDG().log('SYSTEM: No format with the name "' + formatName + '" found in config.', SDG.loglvl('ERROR'));
                return null;
            }else{
                if(!this._formatConfig[formatName][value]){
                    return null;
                }else{
                    return this._formatConfig[formatName][value];
                }
            }
        }
    },
    /**
     * Get the value from the feature configuration from the local.json for the
     * given name.
     *
     * @param {String} name
     * @return {string}
     */
    getFeatureValue: function (name) {
        return this._featureConfig[name];
    },
    /**
     * sets a featureConfig entry to a given value
     * @param name
     * @param value
     * @returns {boolean}
     */
    setFeatureValue: function (name, value) {
        this._featureConfig[name] = value;
        return true
    },
    /**
     * Add the zone from the current piece of content to the configuration.
     *
     * @param {String} zone
     */
    setZone: function (zone)
    {
        this._zone = zone.toLowerCase();
        getSDG().getEventDispatcher().trigger('SDG_ZONE_SET', zone);
        return true;
    },
    /**
     * Get the current zone.
     *
     * @return {String}
     */
    getZone: function ()
    {
        return this._zone;
    },
    /**
     * Add the page type to the configuration (index, article, ...).
     *
     * @param {String} pageType
     */
    setPageType: function (pageType)
    {
        this._pageType = pageType.toLowerCase();
        return true;
    },
    /**
     * Get the current page type.
     *
     * @return {String}
     */
    getPageType: function ()
    {
        return this._pageType;
    },
    /**
     * If this method is called, https is used for all subsequent ad calls.
     */
    activateSecureProtocol: function ()
    {
        this._protocol = getSDG().getSetup().PROTOCOLS.HTTPS;
        return true;
    },
    /**
     * Get the current protocol (http/https)
     *
     * @return {String}
     */
    getProtocol: function ()
    {
        return this._protocol;
    },
    /**
     * Returns the local object as DOM Node with additional informations like width and position.
     * The admin can add Modifiers in the local.json, if the object does not translate directly into an ideal positioning for our ads.
     *
     * If the object is not found, it is assumed that the object just has not loaded yet. An mutationObserver will be set up to determine when the object becomes avaible.
     * @param windowObj
     * @returns {*}
     */
    getContentObject: function (windowObj) {
        var objectInfo, objQuery, contentNode;
        objQuery = this.getFeatureValue('contentContainerQuery');
        windowObj = (typeof windowObj === 'undefined') ? window : windowObj;
        if (!!objQuery) {
            contentNode = windowObj.document.querySelector(objQuery);
            if (!!contentNode) {
                objectInfo = {
                    element: contentNode,
                    width: contentNode.offsetWidth,
                    top: getSDG().getUtil().getPos(contentNode).top,
                    left: getSDG().getUtil().getPos(contentNode).left,
                    widthModified: contentNode.offsetWidth + parseFloat(this.getFeatureValue('contentWidthModifier')),
                    topModified: getSDG().getUtil().getPos(contentNode).top + parseFloat(this.getFeatureValue('contentTopModifier')),
                    leftModified: getSDG().getUtil().getPos(contentNode).left + parseFloat(this.getFeatureValue('contentLeftModifier'))
                };
                return objectInfo
            } else {
                this.monitorContentObject();
                return false;
            }
        } else {
            getSDG().log('SYSTEM: PUBLISHER: contentObject not defined in configuration. ', getSDG().loglvl('EMERGENCY'));
            return false;
        }
    },
    /**
     * The content object provides position data for ads surrounding the content. By passing a query for the object, this function will try to extrapolate width, top and left position.
     * This can be overwritten by passing "with", "top", "left" as numbers, when defining the _contentObject.
     * If the Query of the object can not be found when an ad is trying to select the object, a mutationobserver is created.
     * The Observer will report as soon as the browser has loaded the object and will fire the "SDG_CONTENT_ELEMENT_LOADED" Event

     */
    monitorContentObject: function () {
        var browserData = getSDG().getUtil().getBrowserData();
        if (
            (browserData.app === 'MSIE' && browserData.version <= 10) ||
            (browserData.app === 'Firefox' && browserData.version <= 16) ||
            (browserData.app === 'Safari' && browserData.version <= 6) ||
            (browserData.app === 'Chrome' && browserData.version <= 26) ||
            (browserData.app === 'Opera' && browserData.version <= 15)
        ) {
            window.addEventListener('placementRegistered', function (e) {
                var alternativeIndicator = this.getFeatureValue('alternativeContentLoadIndicator');
                if (e.detail.passedObject.getName() === alternativeIndicator) {
                    getSDG().getEventDispatcher().trigger('SDG_CONTENT_ELEMENT_LOADED', alternativeIndicator);
                }
            });
        } else {
            var nodeQuery = getSDG().getPUB().getConfig().getFeatureValue('contentContainerQuery');
            this._contentObjectMutationObserver = getSDG().getUtil().createMutationObserver(
                document.getElementsByTagName('html')[0],
                {
                    childList: true,
                    attributes: false,
                    characterData: false,
                    subtree: true
                },
                function (e) {
                    var element = e.addedNodes[0];
                    if (element !== undefined && element === document.querySelector(nodeQuery)) {
                        getSDG().getPUB().getConfig()._contentObjectMutationObserver.disconnect();
                        getSDG().getEventDispatcher().trigger('SDG_CONTENT_ELEMENT_LOADED', element);
                    }
                }
            );
        }
    },
    /**
     * get the preconfigured adhesion unit of the website. An adhesion unit is a element on the site which is "stickied" (position:fixed) on the site and might interfer with our own "sticky" elements.
     * To avoid such conflict our own sticky elements will try to position itself "under" the adhesion unit.
     * This function allows to select the adhesion unit, so further attributes (offsetHeight, position) can be read
     * @returns {*}
     */
    getAdhesionUnit: function () {
        var adhesionUnitNode;
        if (!!this.getFeatureValue('adhesionUnitQuery')) {
            adhesionUnitNode = document.querySelector(this.getFeatureValue('adhesionUnitQuery'));
            if (!!adhesionUnitNode) {
                return adhesionUnitNode
            } else {
                return false
            }
        }else{
            return false
        }
    },
    /**
     * returns if a specific website feature was configured in the json as boolean
     * @param featurename
     * @returns {boolean}
     */
    isFeatureAvaible: function (featurename) {
        return !!this.getFeatureValue(featurename);
    },
    isFormatAllowed: function (featurename) {

    },
    /**
     * Get dynamically generated group value for the current page view.
     * @return {String}
     */
    getGroup: function ()
    {
        return this._group;
    }
    ,
    /**
     * Mark that there was already an ad call.
     */
    markFirstAdCallExecuted: function ()
    {
        this._isFirstAdCallExecuted = true;
    }
    ,
    /**
     * Was there already an ad call?
     * @return {Boolean}
     */
    isFirstAdCallExecuted: function ()
    {
        return this._isFirstAdCallExecuted;
    }
    ,
    /**
     * Get a value for the given position from the configuration map for the given map name.
     * @param {String} position
     * @param {String} key
     * @return {String|null}
     */
    getValueForPosition: function (position, key)
    {
        if (!this._positionConfigs[position])
        {
            getSDG().log('No position with the name "' + position + '" found in config.', SDG.loglvl('ERROR'));
            if (typeof console.trace === 'function')
            {
                console.trace();
            }
            return null;
        }
        return this._positionConfigs[position][key];
    }
    ,
    /**
     * Get a value for the given position from the configuration map for the given map name.
     * @param {String} targeting
     * @param {String} key
     * @return
     */
    getValueForTargeting: function (targeting, key) {
        if (!this._targetingConfigs[targeting]) {
            getSDG().log('No targeting entry with the name "' + targeting + '" found in config.', SDG.loglvl('ERROR'));
            if (typeof console.trace === 'function') {
                console.trace();
            }
            return null;
        }
        return this._targetingConfigs[targeting][key];
    }
    ,
    /**
     * Get the ad call template matching the given call type..
     *
     * @return {String}
     */
    getTemplateForType: function (type)
    {
        return this._templates[type];
    }
    ,
    /**
     * Add a keyword which will be added to all ad calls.
     *
     * @param {String} keyword
     */
    addKeyword: function (keyword)
    {
        this._keywords[keyword] = true;
        if (!!this.getAdServer()) {
            this.getAdServer().updateKeywords();
        }
        return true;
    }
    ,
    /**
     * Add several keywords which will be added to all ad calls.
     *
     * @param {Array.<String>} keywords
     */
    addKeywords: function (keywords)
    {
        var i, length;
        if (SDG.getUtil().isArray(keywords))
        {
            for (i = 0, length = keywords.length; i < length; i++)
            {
                this.addKeyword(keywords[i]);
            }
            return true;
        } else
        {
            getSDG().log('Malformed keywords given.', getSDG().loglvl('WARNING'));
            return false;
        }
    }
    ,
    /**
     * Remove a keyword from the keywords which will be added to all ad calls.
     *
     * @param {String} keyword
     */
    removeKeyword: function (keyword)
    {
        delete this._keywords[keyword];
        if (!!this.getAdServer()) {
            this.getAdServer().updateKeywords();
        }
        return true;
    }
    ,
    /**
     * Remove several keywords from the keywords which will be added to all ad calls.
     *
     * @param {Array.<String>} keywords
     */
    removeKeywords: function (keywords)
    {
        var i, length;
        if (SDG.getUtil().isArray(keywords))
        {
            for (i = 0, length = keywords.length; i < length; i++)
            {
                this.removeKeyword(keywords[i]);
            }
            return true;
        } else
        {
            getSDG().log('Malformed keywords given.', getSDG().loglvl('WARNING'));
            return false;
        }
    }
    ,
    /**
     * Add several keywords which will be added to all ad calls. All previously
     * added keywords are cleared.
     *
     * @param {Array.<String>} keywords
     */
    setKeywords: function (keywords)
    {
        this._keywords = {};
        this.addKeywords(keywords);
    }
    ,
    /**
     * Get keywords as array.
     *
     * @return {Array.<String>}
     */
    getKeywords: function ()
    {
        var keywords = [], kw;
        for (kw in this._keywords)
        {
            if(this._keywords.hasOwnProperty(kw)){
                keywords.push(kw);
            }
        }
        return keywords;
    }
    ,
    /**
     * Add a key value pair which will be added to all ad calls.
     *
     * @param {String} key
     * @param {String} value
     */
    addKeyValue: function (key, value)
    {
        if (!this._keyValues[key])
        {
            this._keyValues[key] = [];
        }
        this._keyValues[key].push(value);
        if (!!this.getAdServer()) {
            this.getAdServer().sendKeyValueUpdate(key);
        }
        return true
    }
    ,
    /**
     * Add several key value pairs which will be added to all ad calls.
     *
     * @param {Object.<String, String>} keyValues
     */
    addKeyValues: function (keyValues)
    {
        var key, i, length;
        if (typeof keyValues === 'object')
        {
            for (key in keyValues)
            {
                if(keyValues.hasOwnProperty(key)){
                    if (SDG.getUtil().isArray(keyValues[key]))
                    {
                        for (i = 0, length = keyValues[key].length; i < length; i++)
                        {

                            if (!this._keyValues[key])
                            {
                                this._keyValues[key] = [];
                            }
                            this._keyValues[key].push(keyValues[key][i]);
                        }
                    } else
                    {
                        if (!this._keyValues[key])
                        {
                            this._keyValues[key] = [];
                        }
                        this._keyValues[key].push(keyValues[key]);
                    }
                    if (!!this.getAdServer()) {
                        this.getAdServer().sendKeyValueUpdate(key);
                    }
                }
            }
            return true
        } else
        {
            getSDG().log('Malformed key values given.', getSDG().loglvl('WARNING'));
            return false
        }
    },
    addKeyValuePresetToPosition: function (position, keyValues) {
        if (!this._positionConfigs[position]["kvPreset"]) {
            this._positionConfigs[position]["kvPreset"] = {};
        }
        var key, i, length;
        if (typeof keyValues === 'object') {
            for (key in keyValues) {
                if(keyValues.hasOwnProperty(key)){
                    if (SDG.getUtil().isArray(keyValues[key])) {
                        for (i = 0, length = keyValues[key].length; i < length; i++) {
                            if (!this._positionConfigs[position]["kvPreset"][key]) {
                                this._positionConfigs[position]["kvPreset"][key] = [];
                            }
                            this._positionConfigs[position]["kvPreset"][key].push(keyValues[key][i]);
                        }
                    } else {
                        if (!this._positionConfigs[position]["kvPreset"][key]) {
                            this._positionConfigs[position]["kvPreset"][key] = [];
                        }
                        this._positionConfigs[position]["kvPreset"][key].push(keyValues[key]);
                    }
                }
            }

        }
    },
    /**
     * Remove a key value pair from the key value pairs which will be added to all ad calls.
     *
     * @param {String} key
     */
    removeKeyValue: function (key)
    {
        delete this._keyValues[key];
        if (!!this.getAdServer()) {
            this.getAdServer().sendKeyValueRemove(key);
        }
        return true
    }
    ,
    /**
     * Remove several key value pairs from the key value pairs which will be added to all ad calls.
     *
     * @param {Array.<String>} keys
     */
    removeKeyValues: function (keys)
    {
        var i, length;
        if (SDG.getUtil().isArray(keys))
        {
            for (i = 0, length = keys.length; i < length; i++)
            {
                this.removeKeyValue(keys[i]);
            }
            return true
        } else
        {
            getSDG().log('Malformed key values given.', getSDG().loglvl('WARNING'));
            return false
        }
    },
    /**
     * Add several key value pairs which will be added to all ad calls. All previously
     * added key value pairs are cleared.
     *
     * @param {Object.<String, String>} keyValues
     */
    setKeyValues: function (keyValues)
    {
        this._keyValues = {};
        this.addKeyValues(keyValues);
    },
    executeLocalBackgroundColor: function () {
        getSDG().log('executeLocalBackgroundColor(): function not replaced with site specific commands.', getSDG().loglvl('DEBUG'));
        return true;
    },
    executeLocalBackgroundClickable: function () {
        getSDG().log('executeLocalBackgroundClickable(): function not replaced with site specific commands.', getSDG().loglvl('DEBUG'));
        return true;
    },
    /**
     * Get key value pairs.
     *
     * @return {Object.<String, String>}
     */
    getKeyValues: function ()
    {
        return this._keyValues;
    },
    activateFormat: function (params) {
        //getSDG().getCore().get(getSDG().getSetup().MODULES.FORMAT_CONFIG).configureFormat(params)
    },
    getAdServer: function () {
        return getSDG().getCore().get(getSDG().getSetup().MODULES.ADSERVER);
    }
};
/**
 * Basic interface for constructing the system and registering all modules and services inside the SDG meta tag
 *
 * @constructor
 */
getSDG()[getSDG().getSetup().SYSTEM.MODULES].ServiceContainer = function ()
{
};
getSDG()[getSDG().getSetup().SYSTEM.MODULES].ServiceContainer.prototype = {
    /**
     * Add a service factory to the container.
     *
     * @param {String} serviceName
     * @param {Function} factory
     */
    set: function (serviceName, factory)
    {
        //this._services[serviceName] = factory;
        this[serviceName] = factory.call(this);
        //this[serviceName] = this._services[serviceName](this);
    },
    /**
     * Add a service factory to the container.
     *
     * todo allow non singleton
     *
     * @param {String} serviceName
     * @return Service with all its dependencies
     */
    get: function (serviceName)
    {
        return this[serviceName];
    }
};
getSDG()[getSDG().getSetup().SYSTEM.MODULES].TTRACKER = {
    init: function ()
    {
        var instance = getSDG()[getSDG().getSetup().SYSTEM.MODULES].TTRACKER.prototype;

        console.log('[DEBUG] Sigma: Tracker initiated.');

        window.addEventListener('adServerModuleLoaded', instance.startTracking());
        window.addEventListener('loadedAll',instance.stopTracking);
    }
};

getSDG()[getSDG().getSetup().SYSTEM.MODULES].TTRACKER.prototype = {

    startTracking: function()
    {
        console.log('[DEBUG] Sigma: Starting Tracking Sequence...');
        loadTime = Date.now();
    },

    stopTracking: function()
    {
        var time_to_load_in_seconds = (Date.now() - this.loadTime) / 1000;
        var time_to_load_in_milliseconds = Date.now() - this.loadTime;

        console.log('[DEBUG] Sigma: Stopped tracking.....');
        console.log('[DEBUG] Sigma: Total Time In Seconds: ',time_to_load_in_seconds);
        console.log('[DEBUG] Sigma: Total Time In MilliSeconds: ',time_to_load_in_milliseconds);
    }
};
SDG.Publisher = {
    /**
     * register the position for a given HTML Container on the side
     * @param position
     * @param container
     */
    registerSlot: function (position, container)
    {
        return this.getController().registerSlot(position, container)
    },
    /**
     * unregister the position and delete the Ad from the page
     * @param position
     * @param deleteAllContent
     */
    unregisterSlot: function (position, deleteAllContent) {
        return this.getController().unregisterSlot(position, deleteAllContent)
    },
    /**
     * unregister all positions on the page and deletes all ads if deleteAds is true
     * @param deleteAds
     * @returns {*}
     */
    unregisterAllSlots: function(deleteAds){
        return this.getController().unregisterAll(deleteAds)
    },
    /**
     *
     * @param {boolean} reloadAds
     * @returns {*}
     */
    loadAllSlots: function (reloadAds) {
        return this.getController().loadMultipleSlots(reloadAds)
    },
    loadSlot: function (position) {
        return this.getController().loadSingleSlot(position, true);
    },
    /**
     * Add the zone from the current piece of content to the configuration.
     *
     * @param {String} zone
     */
    setZone: function (zone)
    {
        var url = window.location.href,
            result = [];
        if (url.indexOf('sdgzone') >-1){
            result = url.match(/(?:sdgzone)=(\w+)/);
            if (result !== null){
                return this.getConfig().setZone(result[1]);
            }
        }
        return this.getConfig().setZone(zone);
    },
    /**
     * Add the page type to the configuration (index, article, ...).
     *
     * @param {String} pageType
     */
    setPageType: function (pageType)
    {
        var url = window.location.href,
            result = [];
        if (url.indexOf('sdgpagetype') >-1){
            result = url.match(/(?:sdgpagetype)=(\w+)/);
            if (result !== null){
                return this.getConfig().setPageType(result[1]);
            }
        }
        return this.getConfig().setPageType(pageType);
    },
    /**
     * Add several keywords which will be added to all ad calls. All previously
     * added keywords are cleared.
     *
     * @param {Array.<String>} keywords
     */
    setKeywords: function (keywords)
    {
        return this.getConfig().setKeywords(keywords);
    },
    /**
     * Add several keywords which will be added to all ad calls.
     *
     * @param {Array.<String>} keywords
     */
    addKeywords: function (keywords)
    {
        return this.getConfig().addKeywords(keywords);
    },
    /**
     * Add a keyword which will be added to all ad calls.
     *
     * @param {String} keyword
     */
    addKeyword: function (keyword)
    {
        return this.getConfig().addKeyword(keyword);
    },
    /**
     * Remove several keywords from the keywords which will be added to all ad calls.
     *
     * @param {Array.<String>} keywords
     */
    removeKeywords: function (keywords)
    {
        return this.getConfig().removeKeywords(keywords);
    },
    /**
     * Remove a keyword from the keywords which will be added to all ad calls.
     *
     * @param {String} keyword
     */
    removeKeyword: function (keyword)
    {
        return this.getConfig().removeKeyword(keyword);
    },
    /**
     * Add a key value pair which will be added to all ad calls.
     *
     * @param {String} key
     * @param {String} value
     */
    addKeyValue: function (key, value)
    {
        return this.getConfig().addKeyValue(key, value);
    },
    /**
     * Add several key value pairs which will be added to all ad calls.
     *
     * @param {Object.<String, String>} keyValues
     */
    addKeyValues: function (keyValues)
    {
        return this.getConfig().addKeyValues(keyValues);
    },
    /**
     * Remove a key value pair from the key value pairs which will be added to all ad calls.
     *
     * @param {String} key
     */
    removeKeyValue: function (key)
    {
        return this.getConfig().removeKeyValue(key);
    },
    /**
     * Remove several key value pairs from the key value pairs which will be added to all ad calls.
     *
     * @param {Array.<String>} keys
     */
    removeKeyValues: function (keys)
    {
        return this.getConfig().removeKeyValues(keys);
    },
    /**
     * Add several key value pairs which will be added to all ad calls. All previously
     * added key value pairs are cleared.
     *
     * @param {Object.<String, String>} keyValues
     */
    setKeyValues: function (keyValues)
    {
        return this.getConfig().setKeyValues(keyValues);
    },
    /**
     * If this method is called, https is used for all subsequent ad calls.
     */
    activateSecureProtocol: function ()
    {
        return this.getConfig().activateSecureProtocol();
    },
    /**
     *
     * @param placementName
     * @param params
     */
    finalizeCall: function (placementName, params)
    {
        if (this.getController().getPlacementBySystemName(placementName))
        {
            return this.getController().getPlacementBySystemName(placementName).finalizeCall(params);
        }
    },
    /**
     * Convenience method to fetch config wrapper from service container.
     *
     * @return
     */
    getConfig: function ()
    {
        return getSDG().getCore().get(getSDG().getSetup().MODULES.PUBLISHER_CONFIG);
    },
    /**
     * Convenience method to fetch ad server adapter from service container.
     *
     * @return AdServer Module
     */
    getAdServer: function ()
    {
        return getSDG().getCore().get(getSDG().getSetup().MODULES.ADSERVER);
    },
    /**
     * Convenience method to fetch controller from system config.
     *
     * @return Controller Module
     */
    getController: function ()
    {
        return getSDG().getCN();
    },
    /**
     * Convenience method to fetch logger from service container.
     *
     * @return
     */
    getLogger: function ()
    {
        return getSDG().getCore().get(getSDG().getSetup().MODULES.LOGGER);
    },
    /**
     * todo will not work, still needed?
     * Convenience method to fetch window wrapper from service container.
     *
     * @return
     */
    getWindow: function ()
    {
        return getSDG().getCore().get(getSDG().getSetup().SYSTEM.WINDOW);
    },

    /**
     * Todo: evaluate if still needed
     *
     * @param alias
     * @param currentWindow
     * @param params
     * @param callType
     */
    setupPlacementForRtb: function (alias, currentWindow, params, callType)
    {
        getIM().getCN().checkModuleStatus('RTB', function ()
        {
            var currentPlacement = getIM().getCN().getPlacementByName(alias);
            getIM().getCN()[getIM().getModule('RTB')].setupPlacementWithRTB(currentPlacement, currentWindow, params, callType);
        });
    },
    /**
     * todo evaluate if still needed
     *
     * @param adid
     * @param w
     * @param h
     */
    processRtbFormat: function (adid, w, h)
    {
        var currentPlacement = getIM().getCN()[getIM().getModule('RTB')].getPlacementByAdnxsAdid(adid);
        getIM().getCN()[getIM().getModule('RTB')].processFormat(currentPlacement, w, h, adid);
    },
    /**
     * todo fix if still needed
     *
     * @param name
     * @param params
     */
    addExtension: function (name, params)
    {
        //getIM().getCN().Addons.loadAddon(name, params)
    }
};

getSDG()[getSDG().getSetup().SYSTEM.MODULES].AudienceDiscoverPlattform = function (params)
{
    this._url = params.config.url;
    getSDG().getPUB().addAdpValues = function (json)
    {
        getSDG().getRes().get(getSDG().getSetup().RESOURCES.ADP).addAdpValues(json)
    };
    this.addListener();
};
getSDG()[getSDG().getSetup().SYSTEM.MODULES].AudienceDiscoverPlattform.prototype = {
    _calledAdp: false,
    _wLoaded: false,
    _loadStatus: null,
    addAdpValues: function (json)
    {
        window._enqAdpParam = window._enqAdpParam || {};
        var key, i, length, instance;
        if (typeof json === 'object')
        {
            for (key in json)
            {
                if(json.hasOwnProperty(key)){
                    if (getSDG().getUtil().isArray(json[key]))
                    {
                        for (i = 0, length = json[key].length; i < length; i++)
                        {
                            window._enqAdpParam[key.toLowerCase()] = json[key][i].toLocaleLowerCase();
                        }
                    } else
                    {
                        window._enqAdpParam[key.toLowerCase()] = json[key].toLocaleLowerCase();
                    }
                }
            }
            if (!this._wLoaded && this._loadStatus === null)
            {
                instance = this;
                window.removeEventListener('load', instance.windowLoaded);
                this.loadAdpCore();
            }
        } else
        {
            getSDG().log('SYSTEM: RESOURCES: ADP: Malformed ADP value given.', getSDG().loglvl('NOTICE'));
        }
    },
    windowLoaded: function ()
    {
        var instance = getSDG().getRes().get(getSDG().getSetup().RESOURCES.ADP);
        if (instance._loadStatus === null)
        {
            instance._wLoaded = true;
            instance.loadAdpCore()
        }
    },
    loadAdpCore: function ()
    {
        getSDG().getRes().get(getSDG().getSetup().RESOURCES.ADP)._loadStatus = 'loading';
        this.scriptNode = getSDG().getUtil().loadScript(this._url, document.getElementsByTagName('head')[0], function ()
        {
            getSDG().getRes().get(getSDG().getSetup().RESOURCES.ADP)._loadStatus = 'loaded';
            getSDG().getEventDispatcher().trigger('SDG_ADP_MODULE_LOADED');
            getSDG().log('SYSTEM: RESOURCES: ADP: Core loaded as %o and atached to %o', getSDG().loglvl('NOTICE'),
                [getSDG().getRes().get(getSDG().getSetup().RESOURCES.ADP).scriptNode, document.head]);
        }, false);
    },
    addListener: function ()
    {
        var instance = this;
        window.addEventListener('load', instance.windowLoaded)
    }
};
getSDG()[getSDG().getSetup().SYSTEM.MODULES].AudienceScience = function (params)
{
    var placements,
        config = params.config,
        setup = params.setup;
    this._url = config.url.replace("#{placements}", config.placements.toString());
    this._url = this._url.replace("#{TIMESTAMP}", getSDG().getUtil().generateRandomNumberString(8));
    this._sdiCookie = (config.sdiCookie) ? config.sdiCookie : false;
    this._sdiTargets = (config.sdiKeyValues) ? config.sdiKeyValues : false;
    this._loadStatus = 'loading';
    this._asciResponse = {};
    this.scriptNode = getSDG().getUtil().loadScript(this._url, document.querySelector(setup.insertionQuery), function ()
    {
        var instance = getSDG().getRes().get(getSDG().getSetup().RESOURCES.AUDIENCE_SCIENCE);
        getSDG().log('SYSTEM: RESOURCES: ASCI-Pre-Qual-Tag: Core loaded as %o and atached to %o', getSDG().loglvl('DEBUG'), [instance.scriptNode, document.querySelector(setup.insertionQuery)]);
        instance._loadStatus = 'loaded';
        //noinspection JSUnresolvedVariable
        if (typeof window.asiPlacements !== "undefined")
        {
            //noinspection JSUnresolvedVariable
            for (var p in window.asiPlacements)
            {
                //noinspection JSUnresolvedVariable
                if(window.asiPlacements.hasOwnProperty(p)){
                    instance._asciResponse[p] = "";
                    //noinspection JSUnresolvedVariable,JSUnusedLocalSymbols
                    for (var key in window.asiPlacements[p].data)
                    {
                        instance._asciResponse[p] += "PQ_" + p;
                    }
                }
            }
        }
        instance.finishAscSetup.call(instance);
    });
};
getSDG()[getSDG().getSetup().SYSTEM.MODULES].AudienceScience.prototype = {
    _loadStatus: null,
    finishAscSetup: function ()
    {
        var kvArr = [],
            sdiCookie,
            response = this._asciResponse,
            sdiKey;
        for (var key in response)
        {
            if(response.hasOwnProperty(key)){
                var value = response[key];
                if (value !== "")
                {
                    kvArr.push(value);
                }
            }
        }
        if (kvArr.length > 0)
        {
            if (this._sdiTargets) {
                for (sdiKey in kvArr) {
                    getSDG().getPUB().addKeyValue(kvArr[sdiKey], 'T');
                    //SDM Workaround as long as PG campaigns are not switched to acutally using asiPlacements object, instead of the SDM workaround asiPlacementTmp
                    //yes I know, sucks, but will have to do for now.
                    //noinspection JSUnresolvedVariable
                    window.asiPlacementsTmp = asiPlacements;
                    //noinspection JSUnresolvedVariable
                    window.asiAdserverTmp = asiAdserver;
                }
            } else {
                getSDG().getPUB().addKeyValues({ascformats: kvArr});
            }

            getSDG().log('SYSTEM: RESOURCES: AudienceScience HeaderBidder has responded with avaible formats.', getSDG().loglvl('INFO'));
            if (this._sdiCookie) {
                //noinspection JSUnresolvedVariable
                if (typeof asiPlacements !== 'undefined') {
                    //noinspection JSUnresolvedVariable
                    if (typeof asiAdserver !== 'undefined') {
                        //noinspection JSUnresolvedVariable
                        asiPlacements.asiAdserver = asiAdserver;
                    }
                    //noinspection JSUnresolvedVariable
                    sdiCookie = encodeURIComponent(JSON.stringify(asiPlacements));
                    SDM_head.ping('//cdn.stroeerdigitalmedia.de/Cookie?co=asgw&val=' + sdiCookie + '&m=10&cb=' + getSDG().getUtil().generateRandomNumberString(9));
                }
            }
        } else {
            getSDG().log('SYSTEM: RESOURCES: AudienceScience HeaderBidder has not responded or response does not contain formats', getSDG().loglvl('INFO'));
        }
        getSDG().log('SYSTEM: RESOURCES: AudienceScience HeaderBidder loaded and finished', getSDG().loglvl('DEBUG'));
    }
};

getSDG()[getSDG().getSetup().SYSTEM.MODULES].CriteoOneTag = function (params) {
    var config = params.config,
        setup = params.setup;
    this._url = config.url;
    this._insertionQuery = setup.insertionQuery;
    this._usePostscribe = setup.usePostscribe;
    this._useCrossOrigin = setup.useCrossOrigin;
    this._accountId = config.account;
    this.loadCriteoOneTag();
};
getSDG()[getSDG().getSetup().SYSTEM.MODULES].CriteoOneTag.prototype = {
    loadCriteoOneTag: function () {
        document.addEventListener('DOMContentLoaded', function () {
            var instance = getSDG().getRes().get(getSDG().getSetup().RESOURCES.CRITEOONETAG);
            window.criteo_q = window.criteo_q || [];
            window.criteo_q.push(
                {
                    event: "setAccount",
                    account: instance._accountId
                },
                {
                    event: "manualDising"
                },
                {
                    event: "viewHome"
                });

            getSDG().getUtil().loadScript(instance._url, document.querySelector(instance._insertionQuery), function () {
                getSDG().log('SYSTEM: RESOURCES: CriteoOneTag module added successfully to website.', getSDG().loglvl('INFO'));
            }, instance._usePostscribe, instance._useCrossOrigin);
        });
    }
};

getSDG()[getSDG().getSetup().SYSTEM.MODULES].MeetricsIm = function (url) {
    this._url = url;
    this._loadStatus = 'loading';
    this.scriptNode = getSDG().getUtil().loadScript(this._url, document.getElementsByTagName('head')[0], function () {
        var instance = getSDG().getRes().get(getSDG().getSetup().RESOURCES.MEETRICS);
        getSDG().log('SYSTEM: MeetricsCore loaded as %o and attached to %o', getSDG().loglvl('NOTICE'), [instance.scriptNode, document.head]);
        instance._loadStatus = 'loaded';
        instance.finishMeetricsSetup.call(instance);
    });
};
getSDG()[getSDG().getSetup().SYSTEM.MODULES].MeetricsIm.prototype = {
    _loadStatus: null,
    finishMeetricsSetup: function () {
        getSDG().getCN().addGlobalPlacementAddon('meetrics', this.globalAddon);
    },
    globalAddon: {
        execute: function () {
            var currentPlacement = this;
            //todo aendere sizeIqId object zu systemids
            currentPlacement.stats.activeMeetricsAddon = true;
            var systemIds = currentPlacement.systemIds.doubleclick || currentPlacement.systemIds.adtech;
            if (systemIds.flightId !== null) {
                var div = document.createElement('div');
                div.id = 'im_' + systemIds.flightId + '_' + systemIds.adId;
                div.className = 'imAdSpace imWebsiteId_' + systemIds.websiteId + ' imPlacementId_' + systemIds.placementId + ' imSizeId_' + currentPlacement.sizeParams.sizeId + ' imMasterId_' + systemIds.campaignId + ' imFlightId_' + systemIds.flightId;
                if (currentPlacement.getAd() && currentPlacement.getAd().getAnchor() && currentPlacement.getAd().getAnchor().parentNode) {
                    currentPlacement.getAd().getAnchor().parentNode.appendChild(div);
                } else {
                    currentPlacement.getContainer().appendChild(div);
                }
                if (typeof window["imUpd" + systemIds.flightId + '_' + systemIds.adId] === 'function') {
                    window["imUpd" + systemIds.flightId + '_' + systemIds.adId](div);
                }
                try {
                    //noinspection JSUnresolvedVariable,JSUnresolvedFunction
                    window.de_meetrics["802358"].detect_ad(div.id);
                } catch (error) {
                    getSDG().log(currentPlacement.getName() + ': MEETRICS: error tracking visibility on %o , Meetrics failed to initialize with error %o', getSDG().loglvl('ERROR'), [div, error]);
                }
                getSDG().log(currentPlacement.getName() + ': MEETRICS: now tracking visibility on anchor element %o ', getSDG().loglvl('DEBUG'), [div]);
            } else {
                getSDG().log(currentPlacement.getName() + ': MEETRICS: flightId is null, possible empty slot response. Measurement canceled', getSDG().loglvl('ERROR'));
            }

        },
        remove: function () {
            var currentPlacement = this;
            //todo Funktion einfuegen um asynchrones Laden bzw Entfernen von Meetrics zu unterstuetzen
            getSDG().log(currentPlacement.getName() + ': Meetrics addon removed.', getSDG().loglvl('DEBUG'));
        }
    }
};



getSDG()[getSDG().getSetup().SYSTEM.MODULES].MeetricsSdg = function (url) {
    window.sdgMeetricsStatus = 'loading';
    window.sdgAdInfoList = [];
    this._url = url;
    this._loadStatus = 'loading';
    this.scriptNode = getSDG().getUtil().loadScript(this._url, document.getElementsByTagName('head')[0], function () {
        var instance = getSDG().getRes().get(getSDG().getSetup().RESOURCES.MEETRICS);
        getSDG().log('SYSTEM: MEETRICS: Core loaded as %o and attached to %o', getSDG().loglvl('NOTICE'), [instance.scriptNode, document.head]);
        instance._loadStatus = 'loaded';
        window.sdgMeetricsStatus = 'done';
        instance.finishMeetricsSetup.call(instance);
    });
};
getSDG()[getSDG().getSetup().SYSTEM.MODULES].MeetricsSdg.prototype = {
    _loadStatus: null,
    finishMeetricsSetup: function () {
        getSDG().getCN().addGlobalPlacementAddon('meetrics', this.globalAddon);
        window.addEventListener('systemSlotDone', function(e){
            //console.log('Event loaded for '+e.detail["passedObject"].getName())

            console.log('meetrics Event for '+e.detail.slot)
        })




    },
    globalAddon: {
        execute: function () {





            var currentPlacement = this;
            //todo aendere sizeIqId object zu systemids
            currentPlacement.stats.activeMeetricsAddon = true;
            var systemIds = currentPlacement.systemIds.doubleclick || currentPlacement.systemIds.adtech;
            if (systemIds.flightId !== null) {
                var div = document.createElement('div');
                div.id = 'im_' + systemIds.flightId + '_' + systemIds.adId;
                div.className = 'imAdSpace imWebsiteId_' + systemIds.websiteId + ' imPlacementId_' + systemIds.placementId + ' imSizeId_' + currentPlacement.sizeParams.sizeId + ' imMasterId_' + systemIds.campaignId + ' imFlightId_' + systemIds.flightId;
                if (currentPlacement.getAd() && currentPlacement.getAd().getAnchor() && currentPlacement.getAd().getAnchor().parentNode) {
                    currentPlacement.getAd().getAnchor().parentNode.appendChild(div);
                } else {
                    currentPlacement.getContainer().appendChild(div);
                }
                if (typeof window["imUpd" + systemIds.flightId + '_' + systemIds.adId] === 'function') {
                    window["imUpd" + systemIds.flightId + '_' + systemIds.adId](div);
                }
                try {
                    //noinspection JSUnresolvedVariable,JSUnresolvedFunction
                    window.de_meetrics["802358"].detect_ad(div.id);
                } catch (error) {
                    getSDG().log(currentPlacement.getName() + ': MEETRICS: error tracking visibility on %o , Meetrics failed to initialize with error %o', getSDG().loglvl('ERROR'), [div, error]);
                }
                getSDG().log(currentPlacement.getName() + ': MEETRICS: now tracking visibility on anchor element %o ', getSDG().loglvl('DEBUG'), [div]);
            } else {
                getSDG().log(currentPlacement.getName() + ': MEETRICS: flightId is null, possible empty slot response. Measurement canceled', getSDG().loglvl('ERROR'));
            }

        },
        remove: function () {
            var currentPlacement = this;
            //todo Funktion einfuegen um asynchrones Laden bzw Entfernen von Meetrics zu unterstuetzen
            getSDG().log(currentPlacement.getName() + ': Meetrics addon removed.', getSDG().loglvl('DEBUG'));
        }
    }
};
getSDG()[getSDG().getSetup().SYSTEM.MODULES].NuggAdDmp = function (params) {
    var instance = this,
        config = params.config,
        setup = params.setup;
    this._useMobile = !!(navigator.userAgent.match(/mobile/i));
    this._useTemplate = (this._useMobile) ? 'nuggAdMobile' : 'nuggAdDesktop';
    this._mbrMatch = (config.mbrMatch) ? config.mbrMatch : false;
    this._mbrId = (config.mbrId) ? config.mbrId : '';
    this._sdiCookie = (config.sdiCookie) ? config.sdiCookie : false;
    this._templateOptions = {
        domain: (this._useMobile) ? config.domainMobile : config.domainDesktop,
        customerId: (this._useMobile) ? config.customerIdMobile : config.customerIdDesktop,
        siteId: (config.siteId) ? config.siteId : '',
        siteUrl: encodeURIComponent(location.href),
        tags: '' //todo insert metacontent keywords
    };
    this._nuggTag = new SDG[getSDG().getSetup().SYSTEM.UTILITY].Template(getSDG().getPUB().getConfig().getTemplateForType(this._useTemplate)).render(this._templateOptions);
    getSDG().getUtil().loadScript(this._nuggTag, document.querySelector(setup.insertionQuery), function () {
        instance.finishNuggAdSetup();

    }, setup.usePostscribe, setup.useCrossOrigin);
};
getSDG()[getSDG().getSetup().SYSTEM.MODULES].NuggAdDmp.prototype = {
    finishNuggAdSetup: function () {
        window.NUGGjson = window.NUGGjson || {};
        window.n_pbt = window.n_pbt || '';
        var
            nuggadKeyValuePairs = {},
            nuggAdJsonArray = [],
            nuggArr,
            nuggKV,
            nuggSdiCookie,

            instance = this;

        if (navigator.userAgent.match(/mobile/i)) {
            //noinspection JSUnresolvedVariable
            window.nuggad.init({"rptn-url": this._templateOptions.domain}, function (api) {
                //noinspection JSUnresolvedFunction
                api.rc({
                    "nuggn": instance._templateOptions.customerId,
                    "nuggsid": instance._templateOptions.siteId,
                    "nuggtg": instance._templateOptions.tags,
                    "nuggios": true
                });
            });
        }
        if (window.n_pbt !== '') {
            nuggArr = window.n_pbt.split(';');
            for (var i = 0; i < nuggArr.length; i++) {
                nuggKV = nuggArr[i].split('=');
                nuggadKeyValuePairs[nuggKV[0]] = nuggKV[1];
            }
            getSDG().getPUB().addKeyValues(nuggadKeyValuePairs);
            if (this._mbrMatch) {
                this.redirectSegementsToMbr(nuggadKeyValuePairs)
            }
            if (this._sdiCookie) {
                nuggSdiCookie = window.n_pbt.replace(/(.+);$/, '$1').replace(/;/g, '|');
                SDM_head.ping('//cdn.stroeerdigitalmedia.de/Cookie?co=nug&val=' + nuggSdiCookie + '&m=10080&cb=' + getSDG().getUtil().generateRandomNumberString(9))
            }
        }
        for (var nuggAdJsonKey in window.NUGGjson){
            if (window.NUGGjson.hasOwnProperty(nuggAdJsonKey)) {
                nuggAdJsonArray.push(nuggAdJsonKey + '-' + window.NUGGjson[nuggAdJsonKey])
            }
        }
        if(nuggAdJsonArray.length !== 0){
            getSDG().getPUB().addKeyValues({'nuggad': nuggAdJsonArray});
        }
        getSDG().log('SYSTEM: RESOURCES: NuggAd added and loaded successfully.', getSDG().loglvl('INFO'));
    },
    redirectSegementsToMbr: function (keyValuePairs) {
        window._m6rq = window._m6rq || [];
        window._m6rq.push(['addPixel', this._mbrId, keyValuePairs]);
        getSDG().getUtil().loadScript('//cdn.m6r.eu/sync/api',
            document.getElementsByTagName('head')[0],
            function () {
                getSDG().log('SYSTEM: RESOURCES: NuggAd segments successfully send to MBR.', getSDG().loglvl('INFO'));
            }
        )
    }
};

getSDG()[getSDG().getSetup().SYSTEM.MODULES].Postscribe = function (options)
{
    this._loadStatus = 'loading';
    this._debugModus = !!(options.debug);
    this._commandQueue = [];
    this.scriptNode = getSDG().getUtil().loadScript(
        '//cdn.stroeerdigitalgroup.de/metatag/libraries/postscribe.min.js'
        , document.getElementsByTagName('head')[0], function ()
        {
            getSDG().getRes().get(getSDG().getSetup().RESOURCES.POSTSCRIBE)._loadStatus = 'loaded';
            getSDG().getEventDispatcher().trigger('SDG_POSTSCRIBE_RESOURCE_LOADED');
            if(document.readyState === 'interactive' || document.readyState === 'complete'){

                getSDG().getRes().get(getSDG().getSetup().RESOURCES.POSTSCRIBE).startQueue()
            }else{
                document.addEventListener('DOMContentLoaded', function () {
                    getSDG().getRes().get(getSDG().getSetup().RESOURCES.POSTSCRIBE).startQueue()
                });
            }
        }, false, false);
};
getSDG()[getSDG().getSetup().SYSTEM.MODULES].Postscribe.prototype = {

    parse: function (functionToCall) {
        if (this._loadStatus !== 'loaded') {
            this._commandQueue.push(functionToCall)
        } else {
            functionToCall()
        }
    },
    startQueue: function () {
        getSDG().log('SYSTEM: POSTSCRIBE: Starting Queue!', getSDG().loglvl('DEBUG'));
        this._commandQueue.forEach(function (functionToExecute) {
            functionToExecute()
        })
    }

};
getSDG()[getSDG().getSetup().SYSTEM.MODULES].Prebid = function (params) {
    var url = (location.href.indexOf('stroeerCore=1') > -1) ? 'http://js.adscale.de/prebid/prebid.js' : '//cdn.stroeerdigitalgroup.de/metatag/libraries/prebid.min.js',
        instance = this;
    this._config = params.config;
    this._setup = params.setup;
    this._loadStatus = 'loading';
    //create prebid command queue
    window.pbjs = window.pbjs || {};
    window.pbjs.que = window.pbjs.que || [];

    //write prebid script
    if (this._config.useDocumentWrite) {
        getSDG().log('SYSTEM: PREBID: Loading this module via document.write is not possible, reverting to postScribe enhanced parser!', getSDG().loglvl('ALERT'));
    }
    this.scriptNode = getSDG().getUtil().loadScript(
        url,
        document.querySelector(this._setup.insertionQuery), function () {
            instance.launchPrebid();
            getSDG().getEventDispatcher().trigger('SDG_PREBID_RESOURCE_LOADED');
            getSDG().log('SYSTEM: RESOURCES: Prebid loaded as %o and attached to %o', getSDG().loglvl('NOTICE'), [instance.scriptNode, instance._setup.insertionQuery]);
        },
        this._config.usePostscribe,
        this._config.useCrossOrigin
    );
};
getSDG()[getSDG().getSetup().SYSTEM.MODULES].Prebid.prototype = {
    _loadStatus: 'waiting',
    launchPrebid: function () {
        getSDG().log('SYSTEM: PREBID: Building config.', getSDG().loglvl('DEBUG'));
        this._loadStatus = 'loaded';
        pbjs.que.push(function () {
            pbjs.bidderSettings = {
                standard: {
                    adserverTargeting: [
                        {
                            key: "bidOrigin",
                            val: function (bidResponse) {
                                return bidResponse.bidderCode;
                            }
                        },
                        {
                            key: "pbadid",
                            val: function (bidResponse) {
                                return bidResponse.adId;
                            }
                        }
                    ]
                },
                stroeerCore: {
                    alwaysUseBid: false,
                    sendStandardTargeting: false,
                    adserverTargeting: [{
                        key: "scpb",
                        val: function (bidResponse) {
                            var pricebucket = getSDG().getRes().get(getSDG().getSetup().RESOURCES.PREBID).convertCpmToGlobalPriceBucket(bidResponse.cpm),
                                slotSize = bidResponse.width + "x" + bidResponse.height,
                                returnedValue = slotSize + '_' + pricebucket;
                            getSDG().log('SYSTEM: PREBID: STROEER.CORE: BidResponse used cmp: '+bidResponse.cpm+' translates to pricebucket '+pricebucket+' for slotSize of '+slotSize+', keyValue is: '+returnedValue, getSDG().loglvl('DEBUG'));
                            return returnedValue;
                        }
                    }, {
                        key: 'scsize',
                        val: function (bidResponse) {
                            return bidResponse.size;
                        }
                    }]
                },
                openx: {
                    alwaysUseBid: true,
                    adserverTargeting: [{
                        key: "oxbpb",
                        val: function (bidResponse) {
                            var pricebucket = getSDG().getRes().get(getSDG().getSetup().RESOURCES.PREBID).convertCpmToGlobalPriceBucket(bidResponse.cpm),
                                slotSize = bidResponse.width + "x" + bidResponse.height,
                                returnedValue = slotSize + '_' + pricebucket;
                            getSDG().log('SYSTEM: PREBID: OPENX: BidResponse used cmp: '+bidResponse.cpm+' translates to pricebucket '+pricebucket+' for slotSize of '+slotSize+', keyValue is: '+returnedValue, getSDG().loglvl('DEBUG'));
                            return returnedValue;
                        }
                    }]
                }
            }
        });
        this.requestBids()
    },
    getWaitForResponseStatus: function(){
        return this._config.waitForReponse;
    },
    requestBids: function () {
        var instance = this;
        if (this._config.waitForZoneSetting && getSDG().getPUB().getConfig().getZone() === 'zoneError') {
            getSDG().log('SYSTEM: PREBID: Build of SSP calls postponed until zone is correctly set.', getSDG().loglvl('DEBUG'));
            window.addEventListener('zoneSet', function () {
                pbjs.requestBids({
                    adUnits: instance.buildAdunitObject(),
                    timeout: parseFloat(instance._config.timeout),
                    bidsBackHandler: getSDG().getRes().get(getSDG().getSetup().RESOURCES.PREBID).processBids

                });
            });
        } else {
            pbjs.requestBids({
                adUnits: instance.buildAdunitObject(),
                timeout: parseFloat(instance._config.timeout),
                bidsBackHandler: getSDG().getRes().get(getSDG().getSetup().RESOURCES.PREBID).processBids
            })
        }
    },
    buildBidderSlot: function(bidder,currentSlot){
        var bidderSlot = {
            "bidder": bidder,
            "params": {}
        };
        if(currentSlot.hasOwnProperty(bidder)){
            bidderSlot["params"] = getSDG().getUtil().mergeRecursive(bidderSlot["params"],currentSlot[bidder]);
            return bidderSlot
        }
    },
    buildAdunitObject: function () {
        var instance = this,
            bidders = this._config.activeBidders,
            adUnits = [],
            adSlots = this._config.adslots,
            currentSlot,
            slotEntry,
            currentUnit,
            result;
        for(slotEntry in adSlots){
            if(adSlots.hasOwnProperty(slotEntry)){
                currentSlot = adSlots[slotEntry];
                currentUnit = {};
                if(getSDG().getPUB().getConfig().getValueForPosition(slotEntry,"width") && getSDG().getPUB().getConfig().getValueForPosition(slotEntry,"height")){
                    currentUnit["code"] = slotEntry;
                    currentUnit["sizes"] = [[parseFloat(getSDG().getPUB().getConfig().getValueForPosition(slotEntry,"width")), parseFloat(getSDG().getPUB().getConfig().getValueForPosition(slotEntry,"height"))]];
                    currentUnit["bids"] = [];
                    if(Array.isArray(bidders)){
                        bidders.forEach(function(element){
                            result = instance.buildBidderSlot(element,currentSlot);
                            if(typeof result === "object"){
                                currentUnit["bids"].push(result);
                            }
                        });
                        adUnits.push(currentUnit);
                    }else{
                        getSDG().log('SYSTEM: PREBID: List of bidders is not a valid arry, aborting bidder process!', getSDG().loglvl('CRITICAL'));
                    }
                }else{
                    getSDG().log('SYSTEM: PREBID: An adslot which was selected for preBid seems not to be configured correctly, width or height are missing. Check position config!', getSDG().loglvl('ALERT'));
                }
            }
        }
        getSDG().log('SYSTEM: PREBID: All bids build, adUnit configuration used: %o', getSDG().loglvl('DEBUG'), [adUnits]);
        return adUnits;
    },
    /**
     * convience function to convert a bidresponse.cpm to stroeer pricebucket
     * @author Klaus Fleck by openX, Thanks a lot Klaus!
     * @param cpm
     */
    convertCpmToGlobalPriceBucket: function(cpm){
        var priceBucket = "",
            impRev = (cpm * 1000),
            impRevOrMaxTier = Math.min(impRev, 31000); // buckets are supported up to 31.0
        if (impRev <= 1000) { // 5 cents to 1
            priceBucket = Math.round(impRevOrMaxTier / 50) * 5;
        } else if (impRev <= 3000) { // 10 cents up to 3
            priceBucket = Math.round(impRevOrMaxTier / 100) * 10;
        } else if (impRev <= 7500) { // 25 cents up to 7.5
            priceBucket = Math.round(impRevOrMaxTier / 250) * 25;
        } else if (impRev <= 15000) { // 50 cents up to 15
            priceBucket = Math.round(impRevOrMaxTier / 500) * 50;
        } else { // 100 cent up to max 31
            priceBucket = Math.round(impRevOrMaxTier / 1000) * 100;
        }
        return priceBucket
    },
    processBids: function () {
        this._bidResponses = pbjs.getBidResponses();
        this._loadStatus = 'COMPLETE';
        var targetings = pbjs.getAdserverTargeting(),
            slot,
            slotTargets,
            currentPlacement,
            key,
            valueArray;
        getSDG().log('SYSTEM: PREBID: Response received, processing!Bids returned in time: '+pbjs.allBidsAvailable()+', targetings returned are %o', getSDG().loglvl('DEBUG'),[targetings]);
        getSDG().getCore().get(getSDG().getSetup().MODULES.INFOTOOL).addInfoToolReport('Prebid BidResponses: '+JSON.stringify(this._bidResponses));
        for (slot in targetings) {
            if(targetings.hasOwnProperty(slot)){
                slotTargets = targetings[slot];
                valueArray = [];
                for (key in slotTargets) {
                    if(slotTargets.hasOwnProperty(key)){
                        valueArray.push(key + '-' + slotTargets[key])
                    }
                }
                if (getSDG().getCN().getPlacementByPosition(slot)) {
                    getSDG().log('SYSTEM: PREBID: Targetings for adslot ' + slot + ' received, and placement is already registered, applying targets!', getSDG().loglvl('DEBUG'));
                    currentPlacement = getSDG().getCN().getPlacementByPosition(slot);
                    if (currentPlacement.stats.loaded) {
                        getSDG().log('SYSTEM: PREBID: Targetings for adslot ' + slot + ' received, but placement was already loaded. Auction ended to late!', getSDG().loglvl('DEBUG'));
                    }
                    currentPlacement.setTargeting({
                        "bidder": valueArray
                    })
                } else {
                    getSDG().log('SYSTEM: PREBID: Targetings for adslot ' + slot + ' received, and placement is NOT registered, applying targets to config!', getSDG().loglvl('DEBUG'));
                    if (getSDG().getPUB().getConfig().getValueForPosition(slot) !== null) {
                        getSDG().getPUB().getConfig().addKeyValuePresetToPosition(slot, {
                            "bidder": valueArray
                        });
                    } else {
                        getSDG().log('SYSTEM: PREBID: BidReponse for adslot ' + slot + ' received, but no such adslot is preconfigured! Check PreBid config for possible errors!', getSDG().loglvl('WARNING'));
                    }
                }
            }
        }
        getSDG().log('SYSTEM: PREBID: All steps completed, sending prebidResponded event.', getSDG().loglvl('DEBUG'));
        getSDG().getEventDispatcher().trigger('SDG_PREBID_RESPONDED', this);
    }
};
getSDG()[getSDG().getSetup().SYSTEM.MODULES].Remintrex = function (params) {
    var config = params.config,
        setup = params.setup;
    this._url = config.url;
    this._networkId = config.network;
    this._accountId = config.accountId;
    this._pageType = config.pageType;
    this._insertionQuery = setup.insertionQuery;
    this._usePostscribe = setup.usePostscribe;
    this._useCrossOrigin = setup.useCrossOrigin;
    this.loadRemintrex();

};
getSDG()[getSDG().getSetup().SYSTEM.MODULES].Remintrex.prototype = {
    loadRemintrex: function () {
        document.addEventListener('DOMContentLoaded', function () {
            var instance = getSDG().getRes().get(getSDG().getSetup().RESOURCES.REMINTREX);
            window.remintrex_q = window.remintrex_q || [];
            window.remintrex_q.push(
                {event: "setNetwork", network: instance._networkId},
                {event: "setAccount", account: instance._accountId},
                {event: "setPageType", type: instance._pageType}
            );
            getSDG().getUtil().loadScript(instance._url, document.querySelector(instance._insertionQuery), function () {
                getSDG().log('SYSTEM: RESOURCES: Remintrex module added successfully to website.', getSDG().loglvl('INFO'));
            }, instance._usePostscribe, instance._useCrossOrigin);
        });
    }
};

/**
 * Created by Adams on 19.06.2017.
 */
getSDG()[getSDG().getSetup().SYSTEM.MODULES].TABOOLA = function (taboola_Article) {

    this.window._taboola = window._taboola || [];
    _taboola.push(taboola_Article);
};

getSDG()[getSDG().getSetup().SYSTEM.MODULES].TABOOLA.prototype = {
    init: {
        setup: function (scriptPath) {
            !function (e, f, u, i) {
                if (!document.getElementById(i)) {
                    e.async = 1;
                    e.src = u;
                    e.id = i;
                    f.parentNode.insertBefore(e, f);
                }
            }
            (document.createElement('script'),
                //  document.getElementsByTagName('script')[0], '//cdn.taboola.com/libtrc/strer-network/loader.js', 'tb_loader_script');
                getSDG()[getSDG().utility].loadScript(scriptPath,document.getElementsByTagName('script')[0],'tb_loader_script',true));

            if (window.performance && typeof window.performance.mark == 'function') {
                window.performance.mark('tbl_ic');
            }
        },
        insertArticle: function (mode,placement,contName,mix) {
            var el = document.createElement('div');
            el.id = contName;
            document.write(el);
            window._taboola = window._taboola || [];
            _taboola.push({
                mode: mode,
                container: contName,
                placement: placement,
                target_type: mix
            });
        },
        execute:function()
        {
            window._taboola = window._taboola || [];
            _taboola.push({flush: true});
        }
    }
}

getSDG()[getSDG().getSetup().SYSTEM.MODULES].XaxisFooterBidder = function (params) {
    var config = params.config,
        setup = params.setup;
    this._url = config.url;
    this._insertionQuery = setup.insertionQuery;
    this._usePostscribe = setup.usePostscribe;
    this._useCrossOrigin = setup.useCrossOrigin;
    this._placementId = config.placementID;
    this._segementUri = config.segmentUri;
    this._type = config.type;
    this.loadXaxis();
};
getSDG()[getSDG().getSetup().SYSTEM.MODULES].XaxisFooterBidder.prototype = {
    loadXaxis: function () {
        document.addEventListener('DOMContentLoaded', function () {
            var instance = getSDG().getRes().get(getSDG().getSetup().RESOURCES.XAXISFOOTERBIDDER);
            window.xaxParams = window.xaxParams || {};
            window.xaxParams.CHS = {
                placementID: instance._placementId,
                segmentURI: instance.segmentUri,
                type: instance._type
            };
            getSDG().getUtil().loadScript(instance._url, document.querySelector(instance._insertionQuery), function () {
                getSDG().log('SYSTEM: RESOURCES: XaxisFooterBidder module added successfully to website.', getSDG().loglvl('INFO'));
            }, instance._usePostscribe, instance._useCrossOrigin);
        });
    }
};

SDG.version = 1;
getSDG()[getSDG().getSetup().SYSTEM.UTILITY] = {
    _browserFeatures: {},
    /**
     * Gets the first key for an element from an object if contained, false
     * otherwise.
     *
     * @param {Object} anObject - a object
     * @param {Object.<String>} anElement
     * @return {String||boolean}
     */
    getKeyForElementFromObject: function (anObject, anElement) {
        var foundKey = false,
            aKey;
        for (aKey in anObject) {
            if (anObject[aKey] === anElement) {
                foundKey = aKey;
                break;
            }
        }
        return foundKey;
    },
    /**
     * Checks if given argument is an array. Aliases native method if available.
     *
     * @param obj
     * @return {Boolean}
     */
    isArray: Array.isArray || function (obj) {
        return Object.prototype.toString.call(obj) === '[object Array]';
    },
    /**
     * Checks if given array haystack contains needle.
     *
     * @param {Array} haystack
     * @param needle
     * @return {Boolean}
     */
    inArray: function (haystack, needle) {
        if (!this.isArray(haystack)) {
            throw {
                name: 'InvalidArgumentException',
                message: '"' + haystack + '" is not an array.'
            };
        }
        if (!('indexOf' in Array.prototype)) {
            Array.prototype.indexOf = function (find, i /*opt*/) {
                if (i === undefined) {
                    i = 0;
                }
                if (i < 0) {
                    i += this.length;
                }
                if (i < 0) {
                    i = 0;
                }
                for (var n = this.length; i < n; i++) {
                    if (i in this && this[i] === find) {
                        return i;
                    }
                }
                return -1;
            };
        }
        return haystack.indexOf(needle) !== -1;
    },
    /**
     * Generate a random string of length "length" containing only numbers. If no
     * "length" given, default length of 9 is assumed.
     *
     * @param {number} length
     * @return {String}
     */
    generateRandomNumberString: function (length) {
        length = parseFloat(length) || 9;
        return String(Math.random()).substring(2, length + 2);
    },
    /**
     * returns the current time
     * @returns {number}
     */
    getNow: function () {
        return new Date().getTime()
    },
    /**
     *
     * @param {Object} obj1
     * @param {Object} obj2
     * @returns {*}
     */
    mergeTargetingsRecursive: function (obj1, obj2){
        var p;
        for (p in obj2) {
            // Property in destination object set; update its value.
            if (obj2[p].constructor === Object) {
                if (!obj1[p]) {
                    obj1[p] = {};
                }
                obj1[p] = this.mergeTargetingsRecursive(obj1[p], obj2[p]);
            } else {
                if (obj1[p] instanceof Array && obj2[p] instanceof Array){
                    obj1[p] = obj1[p].concat(obj2[p])
                }else{
                    obj1[p] = obj2[p];
                }
            }
        }
        return obj1;
    },
    /**
     * Recursively merge properties of two objects
     *
     * @param {Object} obj1
     * @param {Object} obj2
     * @return {Object}
     */
    mergeRecursive: function (obj1, obj2) {
        var p;
        for (p in obj2) {
            // Property in destination object set; update its value.
            if (obj2[p].constructor === Object) {
                if (!obj1[p]) {
                    obj1[p] = {};
                }
                obj1[p] = this.mergeRecursive(obj1[p], obj2[p]);
            } else {
                obj1[p] = obj2[p];
            }
        }
        return obj1;
    },
    /**
     * Collect meta keyword from the website based on a few simple replace rules and passes them as keywords and keyvalues to metaTag
     */
    getMetaContent: function (metaName) {
        var imMeta = (document.getElementsByTagName('meta')) ? document.getElementsByTagName('meta') : '';
        for (var i = 0; i < imMeta.length; i++) {
            if (imMeta[i].getAttribute("name") === metaName) {
                return imMeta[i].getAttribute("content");
            }
        }
    },
    /**
     * Rewrites a given string to keywords used in targeting on a few basic replace rules.
     * If a number of maxKeywords is given, only so many keywords are returned
     * @param metaContentString {string}
     * @param maxKeywords {number}
     * @returns {Array|*}
     */
    convertStringToKeywords: function (metaContentString, maxKeywords) {
        var keywords, tempString;
        if (typeof metaContentString !== 'undefined') {
            tempString = metaContentString;
            tempString = tempString.toLowerCase();
            tempString = tempString.replace(/,\s?/g, "+");
            tempString = tempString.replace(/ä/gi, "ae");
            tempString = tempString.replace(/ü/gi, "ue");
            tempString = tempString.replace(/ö/gi, "oe");
            tempString = tempString.replace(/ und /gi, "+");
            tempString = tempString.replace(/ /g, "_");
            keywords = tempString.split('+');
            if (typeof maxKeywords === 'number') {
                keywords = keywords.slice(0, 10);
            }
            return keywords
        } else {
            return false;
        }

    },
    /**
     * Gets all keys from an object. Aliases native method if available.
     *
     * @param anObject
     * @return {Array}
     */
    getKeysFromObject: Object.keys || function (anObject) {
        var keys = [],
            aKey;
        for (aKey in anObject) {
            if (anObject.hasOwnProperty(aKey)) {
                keys.push(aKey);
            }
        }
        return keys;
    },
    /**
     *
     * @param object
     * @param params
     */
    transferParamKeysToObject: function (object, params) {
        var key, i, length;
        if (typeof params === 'object') {
            for (key in params) {
                if(params.hasOwnProperty(key)){
                    if (SDG.getUtil().isArray(params[key])) {
                        for (i = 0, length = params[key].length; i < length; i++) {

                            if (!object[key]) {
                                object[key] = [];
                            }
                            object[key].push(params[key][i]);
                        }
                    } else {
                        if (!object[key]) {
                            object[key] = [];
                        }
                        object[key].push(params[key]);
                    }
                }
            }
        } else {
            return false
        }
        return true;
    },
    /**
     * Checks if a given object has further properties. Returns true if yes.
     * @param obj
     * @returns {boolean}
     */
    hasObjectKeys: function (obj) {
        for (var prop in obj) {
            if (obj.hasOwnProperty(prop))
                return true;
        }
        return false;
    },
    /**
     * Remove all Linebreaks (\n, \r\n, \r) from the given string.
     *
     * @param {String} string
     * @return {String}
     */
    removeLineBreaks: function (string) {
        return string.replace(/([\r\n])/g, '');
    },
    /**
     * Convenience function to quickly add a JS event to a given object.
     * Function will automatically decide how to set the event according to the capabilities of the browser
     *
     * @param obj - the object which will receive the eventlistener
     * @param evType - the event type to be used (for example: resize, scroll, etc)
     * @param fn - the function to be executed if the event fires
     * @returns {boolean} if the event is set successfully, returns true
     */
    addEventListener: function (obj, evType, fn) {
        if (obj.addEventListener) {
            obj.addEventListener(evType, fn, false);
            return true;
        } else if (obj.attachEvent) {
            return obj.attachEvent("on" + evType, fn);
        } else {
            return false;
        }
    },
    /**
     * tries to determine the flash version on the client
     * @returns {*}
     */
    getFlashVersion: function () {
        try {
            try {
                var axo = new ActiveXObject('ShockwaveFlash.ShockwaveFlash.6');
                try {
                    axo.AllowScriptAccess = 'always';
                } catch (e) {
                    return '6,0,0';
                }
            } catch (e) {
            }
            //noinspection JSUnresolvedFunction
            return new ActiveXObject('ShockwaveFlash.ShockwaveFlash').GetVariable('$version').replace(/\D+/g, ',').match(/^,?(.+),?$/)[1];
        } catch (e) {
            try {
                //noinspection JSUnresolvedVariable
                if (navigator.mimeTypes["application/x-shockwave-flash"].enabledPlugin) {
                    return (navigator.plugins["Shockwave Flash 2.0"] || navigator.plugins["Shockwave Flash"]).description.replace(/\D+/g, ",").match(/^,?(.+),?$/)[1];
                }
            } catch (e) {
            }
        }
        return '0,0,0';
    },
    /**
     * Will test for the Flash and Shockwave Plugin to be present and activated in a given version. Returns true if the test is passed, and false if the plugin is not present or does not meet the required version.
     * Will automatically return false if the browser is Chrome 45 or above or Safari 7 and above.
     *
     * @param req - the minimum required version of the flash plugin needed to pass the test
     * @returns {*} returns
     */
    checkFlashVersion: function (req) {
        return requiredVersion(req);
        function requiredVersion(req) {
            if ((getSDG().getUtil().getBrowserData().app === 'Chrome' && getSDG().getUtil().getBrowserData().version >= 45)
                || (getSDG().getUtil().getBrowserData().app === 'Safari' && getSDG().getUtil().getBrowserData().version >= 7)) {
                req = 99;
            }
            return req <= getSDG().getUtil().getFlashVersion().split(',').shift();
        }
    },
    /**
     * Loads a script by placing it into a given HTML object. The user can specify if the script should be parsed by postscribe (will prevent document.write() in external script) or if the script should be loaded directly onto the page, without any protection against document.write.
     *
     * @param url {String} - the url of the script
     * @param obj {object} - the object to which the script will be appended
     * @param usePostscribe {boolean} - should the script be parsed by postscribe before it is appended to the page?
     * @param callback {function} -  a callback function, executed as soon as the script is loaded.
     * @param useCrossOrigin
     */
    loadScript: function (url, obj, callback, usePostscribe, useCrossOrigin) {
        var script = document.createElement("script"),
            rdnNum = getSDG().getUtil().generateRandomNumberString(12);
        usePostscribe = (usePostscribe !== undefined) ? usePostscribe : false;
        useCrossOrigin = (useCrossOrigin !== undefined) ? useCrossOrigin : false;
        script.type = "text/javascript";
        script.src = url;
        script.id = rdnNum;
        if (usePostscribe) {
            script.dataset.usedPostscribe = "true";
            if (useCrossOrigin) {
                script.crossOrigin = true;
            }
            getSDG().getRes().get(getSDG().getSetup().RESOURCES.POSTSCRIBE).parse(function () {
                getSDG().getRes().get(getSDG().getSetup().RESOURCES.POSTSCRIBE).postscribe(obj, script.outerHTML, {done: callback});
            });
        } else {
            if (script.readyState) {
                script.onreadystatechange = function () {
                    if (script.readyState === "loaded" || script.readyState === "complete") {
                        script.onreadystatechange = null;
                        if (typeof callback === 'function') {
                            callback();
                        }
                    }
                }
            } else {
                script.onload = function () {
                    if (typeof callback === 'function') {
                        callback();
                    }
                }
            }
            obj.appendChild(script);
            return script;
        }
    },
    /**
     * Loads image from a given url
     * @param imageUrl
     * @returns {boolean}
     */
    loadImage: function (imageUrl) {
        var image = new Image();
        image.src = imageUrl;
        return true;
    },
    /**
     * Gets the current position of the object in relation to the browser window by crawling all parent nodes (saving their offsets) of the object until document is reached
     * @param obj (Object) The object to get the position
     * @returns {Array}
     */
    getPos: function (obj) {
        var posRet = [];
        try {
            if (obj.offsetParent) {
                posRet.left = 0;
                posRet.top = 0;
                do {
                    posRet.left += obj.offsetLeft;
                    posRet.top += obj.offsetTop;
                }
                while (obj = obj.offsetParent);
            }
        } catch (e) {
            console.log(e);
        }
        return posRet;
    },
    /**
     * Adds an iframe to a given nodeObject and loads its content, if a content was given
     * @param nodeObject
     * @param width
     * @param height
     * @param content
     */
    addIframeToNode: function (nodeObject, width, height, content) {
        var iframe = document.createElement('iframe');
        iframe.width = width;
        iframe.height = height;
        iframe.scrolling = "no";
        iframe.frameBorder = 0;
        iframe.marginHeight = 0;
        iframe.marginWidth = 0;
        if (typeof content !== 'undefined') {
            this.addContentToIframe(iframe, content, 'load');
        }
        nodeObject.appendChild(iframe)
    },
    /**
     * Inserts a given HTML String into an already existing iframe when a specific event is triggered
     *
     * @param iframe - the DOM Node of the Iframe
     * @param content - the HTML source code to parse into the iframe
     * @param onEvent - The event which should trigger the insertion into the iframe
     */
    addContentToIframe: function (iframe, content, onEvent) {
        var iframeContent = '<!DOCTYPE html><html><head><script type="text/javascript">var tagManIframeParsed = true;<\/script></head><body style="margin:0px;">' +
            content + '</body></html>';
        var contentObject;
        getSDG().getUtil().addEventListener(iframe, onEvent, function () {
            //noinspection JSUnresolvedVariable
            if (typeof iframe.contentWindow.tagManIframeParsed === 'undefined') {
                if (getSDG().getUtil().getBrowserData().app === 'MSIE' && getSDG().getUtil().getBrowserData().version >= 9) {
                    iframe.src = 'about:blank';
                    contentObject = iframe.contentWindow.document || iframe.contentDocument;
                    contentObject.open();
                    contentObject.write(iframeContent);
                    contentObject.close();
                } else {
                    iframe.contentWindow.inhalt = iframeContent;
                    iframe.src = 'javascript:window["inhalt"]';
                }
            }
        });
    },
    /**
     * adds a new CSS node to the document head with a given CSS string
     * @param cssString
     */
    addCssToHead: function (cssString) {
        var cssNode = document.createElement('style');
        cssNode.type = 'text/css';
        cssNode.rel = 'stylesheet';
        cssNode.appendChild(document.createTextNode(cssString));
        document.getElementsByTagName('head')[0].appendChild(cssNode);
    },
    /**
     * Will try to evaluate a given object and return its defining size attributes "with", "height", "top" position and "left" position as an object.
     * @param obj
     * @returns {Object}
     */
    getObjectDimensions: function (obj) {
        var dimRet = [];
        dimRet.left = this.getPos(obj).left;
        dimRet.top = this.getPos(obj).top;
        dimRet.width = obj.offsetWidth;
        dimRet.height = obj.offsetHeight;
        return dimRet;
    },
    /**
     * returns the current URL and shorts it to a given character length
     * @param max_length {number}
     * @returns {string}
     */
    getCurrentUrl: function (max_length) {
        var mlength = (typeof max_length !== 'undefined') ? max_length : 1200;
        return document.location.href.slice(0, mlength);
    },
    /**
     *
     * Tries to evalute the used browser and the current verion of it.
     * Returns an object with keys for "app" and "version".
     * "app" can have the values:
     * "MSIE" for Internet Explorer
     * "Chrome" for Chrome
     * "Safari" for Safari
     * "Firefox" for Firefox
     * "Opera" for Opera
     *
     * "version" will have an number with the release number. Build and revision numbers are not passed (means: FF 45.0.2 will report as "45"
     * @returns {*}
     */
    getBrowserData: function () {
        var userAgent = navigator.userAgent,
            ablage,
            data = userAgent.match(/(opera|chrome|safari|firefox|msie|trident(?=\/))\/?\s*(\d+)/i) || [];
        if (/trident/i.test(data[1])) {
            ablage = /\brv[ :]+(\d+)/g.exec(userAgent) || [];
            return {
                app: 'MSIE',
                version: (parseFloat(ablage[1]) || '')
            }
        }
        if (data[1] === 'Chrome') {
            ablage = userAgent.match(/\b(OPR|Edge)\/(\d+)/);
            if (ablage !== null) {
                return {
                    app: 'Opera',
                    version: (parseFloat(ablage[2]) || '')
                }
            }
        }
        data = data[2] ? [data[1], data[2]] : [navigator.appName, navigator.appVersion, '-?'];
        if ((ablage = userAgent.match(/version\/(\d+)/i)) !== null) {
            data.splice(1, 1, ablage[1]);
        }
        return {
            app: data[0],
            version: parseFloat(data[1])
        };
    },
    setCookie: function (cookieName, cookieValue, expireDays) {
        var d = new Date();
        d.setTime(d.getTime() + (expireDays * 24 * 60 * 60 * 1000));
        var expires = 'expires=' + d.toUTCString();
        document.cookie = cookieName + '=' + cookieValue + '; ' + expires;
    },
    getCookie: function (cookieName) {
        var name = cookieName + '=',
            cookieContent = document.cookie.split(';'),
            subContent;
        for (var i = 0; i < cookieContent.length; i++) {
            subContent = cookieContent[i];
            while (subContent.charAt(0) === ' ') {
                subContent = subContent.substring(1);
            }
            if (subContent.indexOf(name) === 0) {
                return subContent.substring(name.length, subContent.length);
            }
        }
        return '';
    },
    deleteCookie: function (cookieName) {
        document.cookie = cookieName + '=;expires=Wed; 01 Jan 1970';
    },
    /**
     * Will try to evaluate the current scroll position of the viewport. Returns an object with values for "top" and "left".
     * @returns {{}}
     */
    getScrollPositions: function () {
        var dim = {};
        dim.top = self.pageYOffset || document.documentElement.scrollTop || document.body.scrollTop;
        dim.left = self.pageXOffset || document.documentElement.scrollLeft || document.body.scrollLeft;
        return dim;
    },
    /**
     * Will try to evalute the current size of the viewport (NOT the size of the browser or screen). Returns an object with values for "top" and "left".
     * @returns {{}}
     */
    getViewportDimensions: function () {
        var dim = {};
        dim.width = document.documentElement.clientWidth || document.body.clientWidth || window.innerWidth;
        dim.height = document.documentElement.clientHeight || document.body.clientHeight || window.innerHeight;
        return dim;
    },
    /**
     *
     * @param observedElement
     * @param paramList
     * @param mutationFunction
     * @returns {MutationObserver}
     */
    createMutationObserver: function (observedElement, paramList, mutationFunction) {
        var observer = new MutationObserver(function (mutations) {
            mutations.forEach(function (mutation) {
                mutationFunction(mutation);
            })
        });
        observer.observe(observedElement, paramList);
        return observer;
    },
    deleteAllNodesInObject: function (object) {
        var objectNodes = object.childNodes;
        for (var i = objectNodes.length - 1; objectNodes.length !== 0; i--) {
            object.removeChild(objectNodes[i]);
        }
    },
    showUserNotification: function(message){
        var div = document.createElement('div');
        div.style.cssText = 'position:absolute;left:0px;z-index:500000;transition: opacity 1s; opacity: 0;background:#FFFFFF;font-family: arial, helvetica, freesans, sans-serif !important;        line-height: 16px !important;font-size: 18px !important;font-weight: 200 !important;color: black !important;text-align: left !important;margin:5px;border-style: dashed;border-width: 1px; border-color: #ff5a10;border-radius: 10px;padding: 5px;';
        div.appendChild(document.createTextNode(message));
        document.querySelector('body').insertBefore(div, document.querySelector('body').firstChild);
        window.setTimeout(function(){
            div.style['opacity'] = "1";
        },100);
        window.setTimeout(function(){
            div.style['opacity'] = "0";
        },4000);
        window.setTimeout(function(){
            document.querySelector('body').removeChild(div)
        },6000)
    },
    /**
     * Sets data to localStorage
     * @param key
     * @param value
     * @returns {boolean}
     */
    setLocalStorageData: function(key, value){
        if(this.browserStorageAvailable('localStorage')){
            window.localStorage[key] = value;
            return true
        }
        return false;
    },
    /**
     * returns the value of a localStorage key if present, false if not
     * @param key
     * @returns {boolean|String}
     */
    getLocalStorageData: function(key){
        if(this.browserStorageAvailable('localStorage') && window.localStorage.getItem(key)){
            return window.localStorage.getItem(key)
        }
        return false
    },
    /**
     * deletes the specified key in the localStorage of the website.
     * @param key
     * @returns {boolean}
     */
    deleteLocalStorageData: function(key){
        if(this.browserStorageAvailable('localStorage') && window.localStorage.getItem(key)){
            window.localStorage.removeItem(key);
            return true
        }
        return false
    },
    /**
     * checks if localStorage or sessionStorage is avaible
     * @param type
     * @returns {boolean}
     */
    browserStorageAvailable: function (type) {
        if (this._browserFeatures.hasOwnProperty(type+'Avaible')){
            return this._browserFeatures[type+'Avaible']
        }else{
            try {
                var storage = window[type],
                    x = '__storage_test__';
                storage.setItem(x, x);
                storage.removeItem(x);
                this._browserFeatures[type+'Avaible'] = true;
                return true
            }
            catch (e) {
                this._browserFeatures[type+'Avaible'] = false;
                return false;
            }
        }
    },
    /**
     * @class Convenience class to merge placeholders into a template string.
     * @author Joerg Basedow <jbasedow@mindworks.de>
     * @constructor
     * @param {String} template
     */
    Template: function (template) {
        this._template = template || '';
    }
};
getSDG()[getSDG().getSetup().SYSTEM.UTILITY].Template.prototype = {
    /**
     * Merge placeholders into the template string.
     *
     * @param {Object.<String, String>} placeholders
     * @return {String}
     */
    render: function (placeholders) {
        var instance = this;
        placeholders = placeholders || {};
        return this._template.replace(
            /#{([^{}]*)}/gi,
            function (completeMatch, placeholderName) {
                return instance.cleanPlaceholder(placeholders[placeholderName]);
            }
        );
    },
    isValidPlaceholder: function (placeholder) {
        return getSDG().getUtil().inArray(['string', 'number'], typeof placeholder);
    },
    /**
     * Make a placeholder an empty string, if it is not a string or a number.
     *
     * @param placeholder
     * @return {String}
     */
    cleanPlaceholder: function (placeholder) {
        if (!this.isValidPlaceholder(placeholder)) {
            placeholder = '';
        }
        return String(placeholder);
    }
};
(function() {
    var conf = {
        "global": {
            "common": {
                "aolOneGrpLength": "9",
                "aolOneHost": "im.banner.t-online.de",
                "aolOneMiscLength": "12",
                "aolOneNetworkId": "784.1",
                "aolOneDesktopName": "beispielseite",
                "aolOneMobileName": "beispielseite_aol",
                "sequenceSlotCount": "0",
                "dfpNetwork": "4444",
                "mobileBreakpoint": "950",
                "dfpMobileName": "testmobile_dfp",
                "dfpDesktopName": "testwebseite_dfp"
            },
            "adserver": {
                "dfp": {
                    "active": true,
                    "functionName": "GoogleDfp",
                    "config": {
                        "useSynchronTags": false,
                        "useSingleRequest": false,
                        "collapseEmptyDivs": true,
                        "collapseDivsBeforeFetch": false
                    }
                },
                "aol": {
                    "active": false,
                    "functionName": "AdTechIQAdServer",
                    "config": {
                    }
                }
            },
            "formats": {
                "wallpaper":{
                    "active": true,
                    "callPosition": "banner",
                    "renderPosition:": "sb",
                    "blockedPositions": ["sky", "bb"],
                    "useTemplate": "MultiAd",
                    "openXSizes": [880,660],
                    "appnexusSizes": [800,600]
                },
                "USHAPE":{
                    "active": true,
                    "callPosition": "banner",
                    "renderPosition:": "sb",
                    "blockedPositions": ["sky", "bb"],
                    "useTemplate": "MultiAd",
                    "meetricsFormatCode": "ushape",
                    "meetricsMeasurementMode": "default",
                    "openXSizes": [880,660],
                    "appnexusSizes": [800,600]
                },
                "DYNAMIC_SITEBAR": {
                    "active": true,
                    "callPosition": "sky",
                    "renderPosition": "sb",
                    "blockedPositions": ["sky"],
                    "useTemplate": "Sitebar",
                    "openXSizes": [880,660],
                    "appnexusSizes": [800,600]
                },
                "uap": {
                    "active": true,
                    "useTemplate": "SingleAd"
                },
                "SingleAd": {
                    "active": true,
                    "useTemplate": "SingleAd"
                }
            },
            "features": {
                "contentContainerQuery": "",
                "contentWidthModifier": "0",
                "contentTopModifier": "0",
                "contentLeftModifier": "0",
                "alternativeContentLoadIndicator": "mrec",
                "adhesionUnitQuery": "",
                "allowStickies": true,
                "allowBackgroundColor": true,
                "allowClickableBackground": true,
                "allowClickableTopBackground": true
            },
            "targeting": {
                "common": {
                    "collectBrowserData": false,
                    "collectFlashVersion": true,
                    "collectMetaKeys": true,
                    "collectPageImpressions": true,
                    "detectAdBlockPlus": true,
                    "detectGoogleReferrer": true
                },
                "ablida": {
                    "active": true,
                    "setup": {
                        "targetingType": "pixel",
                        "loadPattern": "beforeLoadAll",
                        "usePostscribe": false,
                        "useCrossOrigin": false,
                        "insertionQuery": "head"
                    },
                    "config": {
                        "url": "//pubads.g.doubleclick.net/gampad/adx?iu=/4099689/stroeerde-wrapper-1x1&d_imp=1&sz=1x1&c=#{TIMESTAMP}&m=text/javascript",
                        "pixelMedia": "script"
                    }
                },
                "adscale": {
                    "active": true,
                    "setup": {
                        "targetingType": "pixel",
                        "loadPattern": "beforeLoadAll",
                        "usePostscribe": false,
                        "useCrossOrigin": false,
                        "insertionQuery": "head"
                    },
                    "config": {
                        "url": "//js.adscale.de/map.js",
                        "pixelMedia": "script"
                    }
                },
                "xaxisLearn": {
                    "active": true,
                    "setup": {
                        "targetingType": "pixel",
                        "loadPattern": "contentLoaded",
                        "usePostscribe": false,
                        "useCrossOrigin": false,
                        "insertionQuery": "head"
                    },
                    "config": {
                        "url": "//de-gmtdmp.mookie1.com/t/v2/learn?tagid=V2_343&src.rand=#{TIMESTAMP}&src.id=Stroeer",
                        "pixelMedia": "img"
                    }
                },
                "theAdex": {
                    "active": false,
                    "setup": {
                        "loadPattern": "atOnce",
                        "targetingType": "pixel",
                        "usePostscribe": false,
                        "useCrossOrigin": false,
                        "insertionQuery": "head"
                    },
                    "config": {
                        "url": "//dmp.theadex.com/d/173/249/s/adex.js?ts=#{TIMESTAMP}",
                        "pixelMedia": "script"
                    }
                },
                "audienceScience": {
                    "active": false,
                    "setup": {
                        "targetingType": "module",
                        "resourceName": "AUDIENCE_SCIENCE",
                        "functionName": "AudienceScience",
                        "loadPattern": "atOnce",
                        "usePostscribe": false,
                        "useCrossOrigin": false,
                        "insertionQuery": "head"
                    },
                    "config": {
                        "url": "//pq-direct.revsci.net/pql?placementIdList=#{placements}&cb=#{TIMESTAMP}",
                        "placements": ["IpZElE", "Rdkg7V", "NkqpjZ", "acWaVx", "RmJKxA", "BnG7vD", "oeu2b6", "foY3mB"],
                        "sdiCookie": false,
                        "sdiKeyValues": true
                    }
                },
                "audienceDiscoverPlattform": {
                    "active": true,
                    "setup": {
                        "targetingType": "module",
                        "resourceName": "ADP",
                        "functionName": "AudienceDiscoverPlattform",
                        "loadPattern": "atOnce",
                        "usePostscribe": false,
                        "useCrossOrigin": false,
                        "insertionQuery": "head"
                    },
                    "config": {
                        "url": "//cdn.xplosion.de/adp/69511/adp_loader.js"
                    }
                },
                "nuggAd": {
                    "active": true,
                    "setup": {
                        "targetingType": "module",
                        "resourceName": "NUGGAD_DMP",
                        "functionName": "NuggAdDmp",
                        "loadPattern": "atOnce",
                        "usePostscribe": false,
                        "useCrossOrigin": false,
                        "insertionQuery": "head"
                    },
                    "config": {
                        "domainDesktop": "https://si-s.nuggad.net",
                        "domainMobile": "https://si-s.nuggad.net",
                        "customerIdDesktop": "571289945",
                        "customerIdMobile": "571289945",
                        "siteId": "960555011",
                        "mbrMatch": true,
                        "mbrId": "eaa843f7-840a-4a36-8fdd-3b79df0d4fa0",
                        "sdiCookie": false
                    }
                },
                "remintrex": {
                    "active": true,
                    "setup": {
                        "targetingType": "module",
                        "resourceName": "REMINTREX",
                        "functionName": "Remintrex",
                        "loadPattern": "contentLoaded",
                        "usePostscribe": false,
                        "useCrossOrigin": false,
                        "insertionQuery": "head"
                    },
                    "config": {
                        "url": "//static1.remintrex.com/ceng/rqf.js",
                        "network": "remintrex",
                        "accountId": "CX20161006000001",
                        "pageType": "home"
                    }
                },
                "XaxisFooterBidder": {
                    "active": true,
                    "setup": {
                        "targetingType": "module",
                        "resourceName": "XAXISFOOTERBIDDER",
                        "functionName": "XaxisFooterBidder",
                        "loadPattern": "contentLoaded",
                        "usePostscribe": false,
                        "useCrossOrigin": false,
                        "insertionQuery": "head"
                    },
                    "config": {
                        "url": "//static-tagr.gd1.mookie1.com/s1/sas/lh1/checkSegments.min.js",
                        "placementId": "7183134",
                        "segmentUri": ["//rh.adscale.de/rh/15566/Footerbidding_Image", "//bbnaut.ibillboard.com/tag/Xaxis/value/1"],
                        "type": "img"
                    }
                },
                "CriteoOneTag": {
                    "active": true,
                    "setup": {
                        "targetingType": "module",
                        "resourceName": "CRITEOONETAG",
                        "functionName": "CriteoOneTag",
                        "loadPattern": "contentLoaded",
                        "usePostscribe": false,
                        "useCrossOrigin": false,
                        "insertionQuery": "head"
                    },
                    "config": {
                        "url": "//static.criteo.net/js/ld/ld.js",
                        "account": "37990"
                    }
                },
                "prebid": {
                    "active": true,
                    "setup": {
                        "targetingType": "module",
                        "resourceName": "PREBID",
                        "functionName": "Prebid",
                        "loadPattern": "atOnce",
                        "usePostscribe": false,
                        "useCrossOrigin": false,
                        "insertionQuery": "head"
                    },
                    "config": {
                        "activeBidders": ['openx'],
                        "adslots": {
                            "banner": {
                                "appnexus": {
                                    "placementId": 123456
                                },
                                "openx": {
                                    "place": 456789
                                },
                                "stroeerCore": {
                                    "sid": "39577"
                                }
                            },
                            "sky": {
                                "appnexus": {
                                    "placementId": 25879
                                },
                                "openx": {
                                    "place": 32145
                                }
                            },
                            "rectangle": {
                                "appnexus": {
                                    "placementId": 95347
                                },
                                "openx": {
                                    "unit": "538818070",
                                    "delDomain": "stroer-d.openx.net"
                                },
                                "stroeerCore": {
                                    "sid": "39583"
                                }
                            }
                        },
                        "waitForZoneSetting": true,
                        "timeout": "700",
                        "waitForReponse": true
                    }
                }
            },
            "positions": {
                "banner": {
                    "width": "728",
                    "height": "90",
                    "dfpSizes": [[728, 90], [728, 180]],
                    "dfpTagType": "standardGpt",
                    "aolOneFallback": "",
                    "aolOnePositionAlias": "sb"
                },
                "banner2": {
                    "width": "915",
                    "height": "108",
                    "dfpSizes": [[915, 108]],
                    "dfpTagType": "standardGpt"
                },
                "billboard": {
                    "width": "770",
                    "height": "250",
                    "dfpSizes": [[770, 250], [800, 250], [970, 250], [808, 210]],
                    "dfpTagType": "standardGpt"

                },
                "billboard2": {
                    "width": "770",
                    "height": "250",
                    "dfpSizes": [[700, 251], [800, 251], [970, 251]],
                    "dfpTagType": "standardGpt"
                },
                "billboard3": {
                    "width": "770",
                    "height": "250",
                    "dfpSizes": [[770, 252], [800, 252], [970, 252]],
                    "dfpTagType": "standardGpt"
                },
                "button": {
                    "width": "162",
                    "height": "98",
                    "dfpSizes": [[162, 98]],
                    "dfpTagType": "standardGpt"
                },
                "contentbanner_a": {
                    "width": "920",
                    "height": "70",
                    "dfpSizes": [[920, 70], [860, 70], [940, 226]],
                    "dfpTagType": "standardGpt"
                },
                "contentbanner_b": {
                    "width": "920",
                    "height": "70",
                    "dfpSizes": [[921, 70]],
                    "dfpTagType": "standardGpt"
                },
                "contentbanner_c": {
                    "width": "920",
                    "height": "70",
                    "dfpSizes": [[922, 70]],
                    "dfpTagType": "standardGpt"
                },
                "contentbanner_d": {
                    "width": "920",
                    "height": "70",
                    "dfpSizes": [[923, 70]],
                    "dfpTagType": "standardGpt"
                },
                "contentbanner_e": {
                    "width": "920",
                    "height": "70",
                    "dfpSizes": [[924, 70]],
                    "dfpTagType": "standardGpt"
                },
                "fullpagead": {
                    "width": "950",
                    "height": "600",
                    "dfpSizes": [[950, 600]],
                    "dfpTagType": "standardGpt"
                },
                "galleryad": {
                    "width": "320",
                    "height": "75",
                    "dfpSizes": [[324, 75], [324, 100], [324, 150], [300, 255], [300, 50]],
                    "dfpTagType": "standardGpt"
                },
                "halfpage": {
                    "width": "300",
                    "height": "600",
                    "dfpSizes": [[300, 600], [301, 600], [301, 601]],
                    "dfpTagType": "standardGpt"
                },
                "interstial": {
                    "width": "320",
                    "height": "480",
                    "dfpSizes": [[320, 480]],
                    "dfpTagType": "standardGpt"
                },
                "listbreaker1": {
                    "width": "728",
                    "height": "90",
                    "dfpSizes": [[728, 91]],
                    "dfpTagType": "standardGpt"
                },
                "listbreaker2": {
                    "width": "728",
                    "height": "90",
                    "dfpSizes": [[728, 92]],
                    "dfpTagType": "standardGpt"
                },
                "listbreaker3": {
                    "width": "728",
                    "height": "90",
                    "dfpSizes": [[728, 93]],
                    "dfpTagType": "standardGpt"
                },
                "maxiad": {
                    "width": "800",
                    "height": "600",
                    "dfpSizes": [[800, 600], [640, 480]],
                    "dfpTagType": "standardGpt"
                },
                "out-of-page": {
                    "width": "2",
                    "height": "2",
                    "dfpSizes": [[2, 2]],
                    "tagType": "outOfPageGpt"
                },
                "partnerkachel1": {
                    "width": "228",
                    "height": "368",
                    "dfpSizes": [[228, 368]],
                    "dfpTagType": "standardGpt"
                },
                "partnerkachel2": {
                    "width": "228",
                    "height": "368",
                    "dfpSizes": [[229, 368]],
                    "dfpTagType": "standardGpt"
                },
                "posterad": {
                    "width": "800",
                    "height": "450",
                    "dfpSizes": [[800, 450]],
                    "dfpTagType": "standardGpt"
                },
                "promobox": {
                    "width": "300",
                    "height": "150",
                    "dfpSizes": [[300, 150], [290, 154], [302, 150]],
                    "dfpTagType": "standardGpt"
                },
                "promobox2": {
                    "width": "300",
                    "height": "150",
                    "dfpSizes": [[301, 150]],
                    "dfpTagType": "standardGpt"
                },
                "promobox3": {
                    "width": "300",
                    "height": "150",
                    "dfpSizes": [[302, 150]],
                    "dfpTagType": "standardGpt"
                },
                "promobox4": {
                    "width": "300",
                    "height": "150",
                    "dfpSizes": [[303, 150]],
                    "dfpTagType": "standardGpt"
                },
                "rectangle": {
                    "width": "300",
                    "height": "250",
                    "dfpSizes": [[300, 250]],
                    "dfpTagType": "standardGpt",
                    "cssContainerPreset": "overflow-x:hidden;width:300px;"
                },
                "rectangle_2": {
                    "width": "300",
                    "height": "250",
                    "dfpSizes": [[301, 250]],
                    "dfpTagType": "standardGpt",
                    "cssContainerPreset": "overflow-x:hidden;width:300px;"
                },
                "rectangle_3": {
                    "width": "300",
                    "height": "250",
                    "dfpSizes": [[302, 250]],
                    "dfpTagType": "standardGpt"
                },
                "rectangle_4": {
                    "width": "300",
                    "height": "250",
                    "dfpSizes": [[303, 250]],
                    "dfpTagType": "standardGpt"
                },
                "rectangle_5": {
                    "width": "300",
                    "height": "250",
                    "dfpSizes": [[304, 250]],
                    "dfpTagType": "standardGpt"
                },
                "sky": {
                    "width": "120",
                    "height": "600",
                    "aolOneSize": "-1",
                    "dfpSizes": [[120, 600], [160, 600], [200, 600], [300, 600]],
                    "dfpTagType": "standardGpt",
                    "aolOneTagType": "synchron"
                },
                "skylinks": {
                    "width": "120",
                    "height": "600",
                    "dfpSizes": [[121, 601], [161, 601], [201, 601], [301, 601]],
                    "dfpTagType": "standardGpt"
                },
                "sky2": {
                    "width": "120",
                    "height": "600",
                    "dfpSizes": [[120, 601], [300, 599], [160, 601]],
                    "dfpTagType": "standardGpt"
                },
                "sky3": {
                    "width": "120",
                    "height": "600",
                    "dfpSizes": [[120, 602], [300, 598], [160, 602]],
                    "dfpTagType": "standardGpt"
                },
                "topmobile": {
                    "width": "320",
                    "height": "50",
                    "dfpSizes": [[320, 50], [320, 75], [320, 100], [320, 150], [300, 250]],
                    "dfpTagType": "standardGpt",
                    "dfpZonePostfix": "_b1",
                    "isMobileSlot": true
                    //"maxViewportWidth": "950"
                },
                "topmobile2": {
                    "width": "320",
                    "height": "50",
                    "dfpSizes": [[321, 50], [321, 75], [321, 100], [321, 150], [300, 252]],
                    "dfpTagType": "standardGpt"
                },
                "topmobile3": {
                    "width": "320",
                    "height": "50",
                    "dfpSizes": [[322, 50], [322, 75], [322, 100], [322, 150], [300, 253]],
                    "dfpTagType": "standardGpt"
                },
                "topmobile4": {
                    "width": "320",
                    "height": "50",
                    "dfpSizes": [[323, 50], [323, 75], [323, 100], [323, 150], [300, 254]],
                    "dfpTagType": "standardGpt"
                },
                "topmobile5": {
                    "width": "320",
                    "height": "50",
                    "dfpSizes": [[325, 50], [325, 75], [325, 100], [325, 150], [300, 256]],
                    "dfpTagType": "standardGpt"
                },
                "teaser1": {
                    "width": "300",
                    "height": "150",
                    "dfpSizes": [[304, 150], [1000, 90], [100, 60], [230, 154], [240, 70], [270, 120], [300, 50], [304, 150], [350, 40], [400, 600], [430, 30], [4, 6], [660, 63], [670, 300], [670, 70], [920, 90], [942, 90], [960, 75], [960, 90]],
                    "dfpTagType": "standardGpt"
                },
                "teaser2": {
                    "width": "100",
                    "height": "60",
                    "dfpSizes": [[101, 60], [275, 25], [305, 150], [350, 30], [4, 7], [500, 315], [920, 300], [942, 300]],
                    "dfpTagType": "standardGpt"
                },
                "teaser3": {
                    "width": "350",
                    "height": "30",
                    "dfpSizes": [[[351, 30], 102, 60], [175, 240]],
                    "dfpTagType": "standardGpt"
                },
                "teaser4": {
                    "width": "103",
                    "height": "60",
                    "dfpSizes": [[103, 60], [970, 90]],
                    "dfpTagType": "standardGpt"
                },
                "teaser5": {
                    "width": "400",
                    "height": "20",
                    "dfpSizes": [[400, 20]],
                    "dfpTagType": "standardGpt"
                },
                "teaser_125x125": {
                    "width": "125",
                    "height": "125",
                    "dfpSizes": [[125, 125]],
                    "dfpTagType": "standardGpt"
                },
                "teaser_130x210": {
                    "width": "130",
                    "height": "210",
                    "dfpSizes": [[130, 210]],
                    "dfpTagType": "standardGpt"
                },
                "teaser_137x60": {
                    "width": "137",
                    "height": "60",
                    "dfpSizes": [[137, 60]],
                    "dfpTagType": "standardGpt"
                },
                "teaser_160x60": {
                    "width": "160",
                    "height": "60",
                    "dfpSizes": [[160, 60]],
                    "dfpTagType": "standardGpt"
                },
                "teaser_160x60_2": {
                    "width": "160",
                    "height": "60",
                    "dfpSizes": [[161, 60]],
                    "dfpTagType": "standardGpt"
                },
                "teaser_160x60_3": {
                    "width": "160",
                    "height": "60",
                    "dfpSizes": [[162, 60]],
                    "dfpTagType": "standardGpt"
                },
                "teaser_160x60_4": {
                    "width": "160",
                    "height": "60",
                    "dfpSizes": [[163, 60]],
                    "dfpTagType": "standardGpt"
                },
                "teaser_251x300": {
                    "width": "250",
                    "height": "300",
                    "dfpSizes": [[251, 300]],
                    "dfpTagType": "standardGpt"
                },
                "teaser_252x300": {
                    "width": "250",
                    "height": "300",
                    "dfpSizes": [[252, 300]],
                    "dfpTagType": "standardGpt"
                },
                "teaser_301x100": {
                    "width": "300",
                    "height": "100",
                    "dfpSizes": [[301, 100]],
                    "dfpTagType": "standardGpt"
                },
                "teaser_302x100": {
                    "width": "300",
                    "height": "100",
                    "dfpSizes": [[302, 100]],
                    "dfpTagType": "standardGpt"
                },
                "teaser_303x100": {
                    "width": "300",
                    "height": "100",
                    "dfpSizes": [[303, 100]],
                    "dfpTagType": "standardGpt"
                },
                "teaser_301x120": {
                    "width": "300",
                    "height": "120",
                    "dfpSizes": [[301, 120]],
                    "dfpTagType": "standardGpt"
                },
                "teaser_302x120": {
                    "width": "300",
                    "height": "120",
                    "dfpSizes": [[302, 120]],
                    "dfpTagType": "standardGpt"
                },
                "teaser_303x120": {
                    "width": "300",
                    "height": "120",
                    "dfpSizes": [[303, 120]],
                    "dfpTagType": "standardGpt"
                },
                "teaser_311x238": {
                    "width": "310",
                    "height": "238",
                    "dfpSizes": [[311, 238]],
                    "dfpTagType": "standardGpt"
                },
                "teaser_312x238": {
                    "width": "310",
                    "height": "238",
                    "dfpSizes": [[312, 238]],
                    "dfpTagType": "standardGpt"
                },
                "teaser_313x238": {
                    "width": "310",
                    "height": "238",
                    "dfpSizes": [[313, 238]],
                    "dfpTagType": "standardGpt"
                },
                "teaser_468x61": {
                    "width": "468",
                    "height": "60",
                    "dfpSizes": [[468, 61]],
                    "dfpTagType": "standardGpt"
                },
                "teaser_625x400": {
                    "width": "625",
                    "height": "400",
                    "dfpSizes": [[625, 400]],
                    "dfpTagType": "standardGpt"
                },
                "bb": {
                    "width": "770",
                    "height": "250",
                    "dfpSizes": [[770, 250], [800, 250], [970, 250], [808, 210]],
                    "dfpTagType": "standardGpt"
                },
                "bb_pos2": {
                    "width": "770",
                    "height": "250",
                    "dfpSizes": [[770, 251], [800, 251], [970, 251], [808, 211]],
                    "dfpTagType": "standardGpt"
                },
                "bb_pos3": {
                    "width": "770",
                    "height": "250",
                    "dfpSizes": [[770, 252], [800, 252], [970, 252], [808, 212]],
                    "dfpTagType": "standardGpt"
                },
                "box": {
                    "width": "6",
                    "height": "9"
                },
                "ca200": {
                    "height": "200",
                    "width": "808"
                },
                "cb": {
                    "height": "160",
                    "width": "160"
                },
                "cb100": {
                    "height": "100",
                    "width": "300",
                    "dfpSizes": [[300, 100]],
                    "dfpTagType": "standardGpt"
                },
                "cb100_pos1": {
                    "height": "100",
                    "width": "300",
                    "dfpSizes": [[300, 101]],
                    "dfpTagType": "standardGpt"
                },
                "cb100_pos10": [],
                "cb100_pos2": {
                    "height": "100"
                },
                "cb100_pos3": {
                    "height": "100"
                },
                "cb100_pos4": {
                    "height": "100"
                },
                "cb100_pos5": {
                    "height": "100"
                },
                "cb100_pos6": {
                    "height": "100"
                },
                "cb100_pos7": {
                    "height": "100"
                },
                "cb100_pos8": {
                    "height": "100"
                },
                "cb100_pos9": {
                    "height": "100",
                    "width": "300"
                },
                "cb107": {
                    "height": "107",
                    "width": "300"
                },
                "cb107_pos2": {
                    "height": "107",
                    "width": "300"
                },
                "cb125": {
                    "height": "125",
                    "width": "300"
                },
                "cb140": {
                    "height": "140"
                },
                "cb147": {
                    "height": "147",
                    "width": "300"
                },
                "cb147_pos1": {
                    "height": "147",
                    "width": "300"
                },
                "cb147_pos2": {
                    "height": "147",
                    "width": "300"
                },
                "cb150": {
                    "height": "150",
                    "width": "641"
                },
                "cb162": {
                    "height": "162",
                    "width": "315"
                },
                "cb200": {
                    "width": "336",
                    "height": "200"
                },
                "cb200_pos1": {
                    "width": "336",
                    "height": "200"
                },
                "cb200_pos2": {
                    "width": "336",
                    "height": "200"
                },
                "cb200_pos3": {
                    "width": "336",
                    "height": "200"
                },
                "cb200_pos4": {
                    "width": "336",
                    "height": "200"
                },
                "cb200_pos5": {
                    "width": "336",
                    "height": "200"
                },
                "cb200_pos6": {
                    "width": "336",
                    "height": "200"
                },
                "cb200_pos7": {
                    "width": "336",
                    "height": "200"
                },
                "cb235": {
                    "height": "235",
                    "width": "498"
                },
                "cb244": [],
                "cb250": {
                    "height": "250",
                    "width": "250"
                },
                "cb260_pos_left": [],
                "cb260_pos_right": [],
                "cb275_pos1": {
                    "height": "275",
                    "width": "300"
                },
                "cb275_pos10": {
                    "height": "275",
                    "width": "300"
                },
                "cb275_pos2": {
                    "height": "275",
                    "width": "300"
                },
                "cb275_pos3": {
                    "height": "275",
                    "width": "300"
                },
                "cb275_pos4": {
                    "height": "275",
                    "width": "300"
                },
                "cb275_pos5": {
                    "height": "275",
                    "width": "300"
                },
                "cb275_pos6": {
                    "height": "275",
                    "width": "300"
                },
                "cb275_pos7": {
                    "height": "275",
                    "width": "300"
                },
                "cb275_pos8": {
                    "height": "275",
                    "width": "300"
                },
                "cb275_pos9": {
                    "height": "275",
                    "width": "300"
                },
                "cb300": {
                    "width": "300",
                    "height": "70"
                },
                "cb330": {
                    "width": "330",
                    "height": "50"
                },
                "cb410": {
                    "width": "410",
                    "height": "50"
                },
                "cb640": {
                    "width": "640",
                    "height": "120"
                },
                "cb75": {
                    "height": "75",
                    "width": "304"
                },
                "cbar": {
                    "height": "150",
                    "width": "641"
                },
                "cbar200": {
                    "width": "300",
                    "height": "200"
                },
                "cbar50": {
                    "height": "50",
                    "width": "500"
                },
                "cbar90": {
                    "width": "940",
                    "height": "90"
                },
                "cbmini_pos1": {
                    "height": "180",
                    "width": "610"
                },
                "cbmini_pos2": {
                    "height": "180",
                    "width": "610"
                },
                "cbmini_pos3": {
                    "height": "180",
                    "width": "610"
                },
                "cbmini_pos4": {
                    "height": "180",
                    "width": "610"
                },
                "cbr100": {
                    "height": "100",
                    "width": "300",
                    "dfpSizes": [[300, 100]],
                    "dfpTagType": "standardGpt"
                },
                "cbr100_pos1": {
                    "height": "100",
                    "width": "300",
                    "dfpSizes": [[300, 100]],
                    "dfpTagType": "standardGpt"
                },
                "cbr100_pos2": {
                    "height": "100",
                    "width": "300",
                    "dfpSizes": [[300, 102]],
                    "dfpTagType": "standardGpt"
                },
                "cbr200": {
                    "height": "200",
                    "width": "300",
                    "dfpSizes": [[300, 200]],
                    "dfpTagType": "standardGpt"
                },
                "cob": {
                    "width": "920",
                    "height": "45"
                },
                "fb": {
                    "height": "60",
                    "width": "468"
                },
                "fpa": {
                    "height": "600",
                    "width": "920"
                },
                "fpa_pos2": {
                    "height": "600",
                    "width": "920"
                },
                "ft": {
                    "height": "80",
                    "width": "1018"
                },
                "ga100": [],
                "google_cb": {
                    "height": "174",
                    "width": "409"
                },
                "google_cb140": {
                    "height": "140",
                    "width": "209"
                },
                "hpa": {
                    "height": "600",
                    "width": "300"
                },
                "int": {
                    "height": "460",
                    "width": "320",
                    "dfpSizes": [[320, 460]],
                    "dfpTagType": "standardGpt"
                },
                "l_cb200": {
                    "width": "962",
                    "height": "50"
                },
                "l_cbar90": {
                    "width": "6",
                    "height": "9"
                },
                "l-cb200": {
                    "width": "351",
                    "height": "200"
                },
                "l-cbar90": {
                    "width": "962",
                    "height": "90"
                },
                "lao_cbar50": {
                    "width": "920",
                    "height": "50"
                },
                "lao_cbar50_pos2": {
                    "width": "920",
                    "height": "50"
                },
                "lao_cbar50_pos3": {
                    "width": "920",
                    "height": "50"
                },
                "lb": {
                    "width": "6",
                    "height": "9"
                },
                "logo": {
                    "width": "2",
                    "height": "2"
                },
                "lrec": {
                    "height": "600",
                    "width": "800"
                },
                "ma": {
                    "height": "50",
                    "width": "320",
                    "dfpSizes": [[320, 50]],
                    "dfpTagType": "standardGpt"
                },
                "ma_bottom": {
                    "height": "50",
                    "width": "320",
                    "dfpSizes": [[322, 50]],
                    "dfpTagType": "standardGpt"
                },
                "ma_middle": {
                    "height": "50",
                    "width": "320",
                    "dfpSizes": [[321, 50]],
                    "dfpTagType": "standardGpt"
                },
                "ma_pos2": {
                    "height": "50",
                    "width": "320",
                    "dfpSizes": [[321, 50]],
                    "dfpTagType": "standardGpt"
                },
                "ma_pos3": {
                    "width": "320",
                    "height": "50",
                    "dfpSizes": [[320, 50], [320, 75], [320, 100], [320, 150], [300, 250], [300,252]],
                    "dfpTagType": "standardGpt",
                    "isMobileSlot": true,
                    "dfpZonePostfix": "_b2"
                },
                "mb": {
                    "width": "334",
                    "height": "50"
                },
                "mb144": {
                    "width": "144",
                    "height": "32"
                },
                "mb184": {
                    "width": "184",
                    "height": "41"
                },
                "modul50": {
                    "height": "50",
                    "width": "546"
                },
                "modul50_pos2": {
                    "height": "50",
                    "width": "546"
                },
                "momrec": {
                    "height": "250",
                    "width": "300",
                    "dfpSizes": [[300, 251]],
                    "dfpTagType": "standardGpt"
                },
                "momrec_pos2": {
                    "height": "250",
                    "width": "300",
                    "dfpSizes": [[300, 252]],
                    "dfpTagType": "standardGpt"
                },
                "momrec_pos3": {
                    "height": "250",
                    "width": "300",
                    "dfpSizes": [[300, 253]],
                    "dfpTagType": "standardGpt"
                },
                "mrec": {
                    "height": "250",
                    "width": "300",
                    "dfpSizes": [[300, 250]],
                    "dfpTagType": "standardGpt"
                },
                "mrec_pos1": {
                    "height": "250",
                    "width": "300",
                    "dfpSizes": [[300, 250]],
                    "dfpTagType": "standardGpt"
                },
                "mrec_pos10": {
                    "height": "250",
                    "width": "309",
                    "dfpSizes": [[309, 250]],
                    "dfpTagType": "standardGpt"
                },
                "mrec_pos11": {
                    "height": "250",
                    "width": "300",
                    "dfpSizes": [[310, 250]],
                    "dfpTagType": "standardGpt"
                },
                "mrec_pos12": {
                    "height": "250",
                    "width": "300",
                    "dfpSizes": [[311, 250]],
                    "dfpTagType": "standardGpt"
                },
                "mrec_pos13": {
                    "height": "250",
                    "width": "300",
                    "dfpSizes": [[312, 250]],
                    "dfpTagType": "standardGpt"
                },
                "mrec_pos2": {
                    "height": "250",
                    "width": "300",
                    "dfpSizes": [[301, 250]],
                    "dfpTagType": "standardGpt"
                },
                "mrec_pos3": {
                    "height": "250",
                    "width": "300",
                    "dfpSizes": [[302, 250]],
                    "dfpTagType": "standardGpt"
                },
                "mrec_pos4": {
                    "height": "250",
                    "width": "300",
                    "dfpSizes": [[303, 250]],
                    "dfpTagType": "standardGpt"
                },
                "mrec_pos5": {
                    "height": "250",
                    "width": "300",
                    "dfpSizes": [[304, 250]],
                    "dfpTagType": "standardGpt"
                },
                "mrec_pos6": {
                    "height": "250",
                    "width": "305",
                    "dfpSizes": [[305, 250]],
                    "dfpTagType": "standardGpt"
                },
                "mrec_pos7": {
                    "height": "250",
                    "width": "300",
                    "dfpSizes": [[306, 250]],
                    "dfpTagType": "standardGpt"
                },
                "mrec_pos8": {
                    "height": "250",
                    "width": "300",
                    "dfpSizes": [[307, 250]],
                    "dfpTagType": "standardGpt"
                },
                "mrec_pos9": {
                    "height": "250",
                    "width": "300",
                    "dfpSizes": [[308, 250]],
                    "dfpTagType": "standardGpt"
                },
                "pa": {
                    "width": "570",
                    "height": "310",
                    "dfpSizes": [[570, 310]],
                    "dfpTagType": "standardGpt"
                },
                "perf_cb200": {
                    "width": "336",
                    "height": "200",
                    "dfpSizes": [[336, 200]],
                    "dfpTagType": "standardGpt"
                },
                "perf_promo": {
                    "height": "5",
                    "width": "9"
                },
                "ph": {
                    "width": "962",
                    "height": "50"
                },
                "plskin": {
                    "height": "640",
                    "width": "962"
                },
                "pop": {
                    "height": "1",
                    "width": "1"
                },
                "pres": {
                    "height": "50",
                    "width": "320"
                },
                "prest": {
                    "height": "1",
                    "width": "5"
                },
                "promo": {
                    "width": "351",
                    "height": "200"
                },
                "promo200": {
                    "width": "300",
                    "height": "200"
                },
                "sb": {
                    "width": "728",
                    "height": "90",
                    "dfpSizes": [[728, 90], [728, 180]],
                    "dfpTagType": "standardGpt"
                },
                "sb_pos1": {
                    "width": "728",
                    "height": "90",
                    "dfpSizes": [[728, 90], [728, 181]],
                    "dfpTagType": "standardGpt"
                },
                "sb_pos2": {
                    "width": "728",
                    "height": "91",
                    "dfpSizes": [[728, 91], [728, 181]],
                    "dfpTagType": "standardGpt"
                },
                "sky_pos2": {
                    "height": "600",
                    "width": "120",
                    "dfpSizes": [[120, 601], [300, 599], [160, 601]],
                    "dfpTagType": "standardGpt"
                },
                "sp": {
                    "width": "324",
                    "height": "280"
                },
                "sp_pos1": {
                    "width": "324",
                    "height": "280"
                },
                "sp_pos2": {
                    "width": "324",
                    "height": "280"
                },
                "sp_pos3": {
                    "width": "324",
                    "height": "280"
                },
                "sp_pos4": {
                    "width": "324",
                    "height": "280"
                },
                "sp_pos5": {
                    "width": "324",
                    "height": "280"
                },
                "sp_pos6": {
                    "width": "324",
                    "height": "280"
                },
                "sp_pos7": {
                    "width": "324",
                    "height": "280"
                },
                "sp_pos8": {
                    "width": "324",
                    "height": "280"
                },
                "sp_pos9": {
                    "width": "324",
                    "height": "280"
                },
                "spa": {
                    "width": "324",
                    "height": "280"
                },
                "spa_pos10": {
                    "width": "300",
                    "height": "150"
                },
                "spa_pos11": {
                    "width": "300",
                    "height": "150"
                },
                "spa_pos12": {
                    "width": "300",
                    "height": "150"
                },
                "spa_pos13": {
                    "width": "300",
                    "height": "150"
                },
                "spa_pos14": {
                    "width": "300",
                    "height": "150"
                },
                "spa_pos15": {
                    "width": "300",
                    "height": "150"
                },
                "spa_pos2": {
                    "width": "300",
                    "height": "150"
                },
                "spa_pos3": {
                    "width": "300",
                    "height": "150"
                },
                "spa_pos4": {
                    "width": "300",
                    "height": "150"
                },
                "spa_pos5": {
                    "width": "300",
                    "height": "150"
                },
                "spa_pos6": {
                    "width": "300",
                    "height": "150"
                },
                "spa_pos7": {
                    "width": "300",
                    "height": "150"
                },
                "spa_pos8": {
                    "width": "300",
                    "height": "150"
                },
                "spa_pos9": {
                    "width": "300",
                    "height": "150"
                },
                "sticky": {
                    "height": "50",
                    "width": "320"
                },
                "teaser": {
                    "height": "2",
                    "width": "2"
                },
                "ticker": {
                    "height": "2",
                    "width": "2"
                },
                "tl": {
                    "height": "1",
                    "width": "6"
                },
                "tl_pos1": {
                    "height": "1",
                    "width": "4"
                },
                "tl_pos2": {
                    "height": "1",
                    "width": "4"
                },
                "tl_pos3": {
                    "height": "1",
                    "width": "4"
                },
                "vf": {
                    "height": "800",
                    "width": "1280"
                }
            },
            "templates": {
                "addyn": "#{protocol}\/\/#{host}\/#{type}\/#{version}\/#{networkId}\/#{fallbackPlacement}\/0\/#{size}\/ADTECH;loc=100;alias=#{alias};target=_blank;#{custom}grp=#{group};misc=#{misc}",
                "adiframe": "<iframe width=\"#{width}\" height=\"#{height}\" scrolling=\"no\" frameborder=\"0\" marginheight=\"0\" marginwidth=\"0\" src=\"#{protocol}\/\/#{host}\/#{type}|#{version}|#{networkId}|#{fallbackPlacement}|0|#{size}|ADTECH;alias=#{alias};target=_blank;#{custom}grp=#{group}\"><script language= \"javascript\" src=\"#{protocol}:\/\/#{host}\/addyn|#{version}|#{networkId}|#{fallbackPlacement}|0|#{size}|ADTECH;loc=700;alias=#{alias};target=_blank;#{custom}grp=#{group}\"><\/script><\/iframe>",
                "nativeBox": "<div class=\"Tmm Tltb Tts Tmc1 Tww1 Thh3 Tadblock\"><div class=\"Ttsc Ttsv169\"><a target=\"#{linktarget}\" href=\"#{linkurl}\"><h6>Anzeige&nbsp;<\/h6><h5>#{headline}<\/h5><\/a><div class=\"Ttsi\"><a target=\"#{linktarget}\" href=\"#{linkurl}\"><img width=\"300\" height=\"169\" title=\"Werbung\" src=\"#{imgsrc}\" alt=\"Werbung\" class=\"Tlz\"><div class=\"\"><i><\/i><\/div><\/a><\/div><p class=\"Ttst\">#{maintext}<a target=\"#{linktarget}\" href=\"#{linkurl}\"> #{linktext}<\/a><\/p><\/div><\/div>",
                "nativeTeaser": "<div class=\"Ttsc Ttsh100\"><a href=\"#{linkurl}\" target=\"#{linktarget}\"><h6>Anzeige<\/h6><h5>#{headline}<\/h5><\/a><div class=\"Ttsi\"><a href=\"#{linkurl}\" target=\"#{linktarget}\"><img width=\"100\" height=\"100\" src=\"#{imgsrc}\"><\/a><\/div><p class=\"Ttst\">#{maintext}<a href=\"#{linkurl}\" target=\"#{linktarget}\">#{linktext}<\/a><\/p><\/div>",
                "nuggAdDesktop": "#{domain}/rc?nuggn=#{customerId}&nuggsid=#{siteId}&nuggtg=#{tags}&nuggrid=#{siteUrl}",
                "nuggAdMobile": "#{domain}/javascripts/nuggad-ls.js"
            }
        },
        "website": {
            "common": {
                "name": "beispielseite",
                "sequenceSlotCount": "2"
            },
            "targeting": {
                "audienceScience": {
                    "placements": ["IpZElE", "Rdkg7V", "NkqpjZ", "acWaVx", "RmJKxA", "BnG7vD", "oeu2b6", "foY3mB"], //IM:  "placements": ["wV1HMo", "jRToJy", "K37e9P", "nOGLrM", "Z4IsnP", "QWgGZI", "n7obvN", "hD6oFp"],
                    "sdiCookie": false,
                    "sdiKeyValues": true
                },
                "nuggAd": {
                    "domainDesktop": "https://si-s.nuggad.net", //IM: "https://im.nuggad.net",
                    "domainMobile": "https://si-s.nuggad.net", //IM: "https://im-mobile.nuggad.net",
                    "customerIdDesktop": "571289945", //IM: "2044910161",
                    "customerIdMobile": "571289945", //IM: "2138149837",
                    "siteId": "220465615",
                    "mbrMatch": true,
                    "mbrId": "eaa843f7-840a-4a36-8fdd-3b79df0d4fa0",
                    "sdiCookie": false
                },
                "remintrex": {
                    "accountId": "CX20161006000001",
                    "pageType": "home"
                }
            },
            "positions": {
                "bb": {
                    "aolOneTagType": "asynchron",
                    "sequenceSlot": "2"
                },
                "mrec": {},
                "mrec_pos2": {},
                "mrec_pos3": {},
                "pop": {},
                "banner": {
                    "sequenceSlot": "1"
                },
                "sb": {
                    "sequenceSlot": "1",
                    "aolOneTagType": "immoscout"
                },
                "sb_pos1": {
                    "sequenceSlot": "1"
                },
                "sb_pos2": {
                    //"sequenceSlot": "2"
                },
                "sky": {
                    //"sequenceSlot": "3",
                    //"aolOneTagType": "asynchron"
                },
                "ma": {},
                "cbmini_pos1": {
                    "height": "180",
                    "width": "610"
                }
            },
            "features" : {

            }
        }
    };
    /* +++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++
     SYSTEM CORE CONFIGURATION
     Before anything works at all we have to configure the core, the resource loader, and load the logger, the event system and the resource loader in this exact order
     +++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++ */

    /**
     * Build basic system architecture
     */
    getSDG()[getSDG().getSetup().SYSTEM.CORE] = new SDG[getSDG().getSetup().SYSTEM.MODULES].ServiceContainer();
    getSDG()[getSDG().getSetup().SYSTEM.RESOURCES] = new SDG[getSDG().getSetup().SYSTEM.MODULES].ServiceContainer();
    /**
     * Add Logger, EventDispatcher and Controller to ModuleServiceContainer.
     * This will add the most basic functions to the SDG instance, every other module and resource builds on this
     *
     */
    getSDG().getCore().set(getSDG().getSetup().MODULES.LOGGER, function ()
    {
        return new SDG[getSDG().getSetup().SYSTEM.MODULES].Logger.LogContainer();
    });
    getSDG().getCore().set(getSDG().getSetup().MODULES.EVENT_DISPATCHER, function () {
        return new SDG[getSDG().getSetup().SYSTEM.MODULES].EventDispatcher();
    });
    getSDG().getCore().set(getSDG().getSetup().MODULES.ADSLOT_CONTROLLER, function () {
        return new SDG[getSDG().getSetup().SYSTEM.MODULES].AdSlotController.Controller();
    });
    /**
     *  Add Postscribe to ResourceServiceContainer.
     *  This will help us load further addons or external libraries, which may or may not use the evil document.write().
     *  Postscribe will eliminate document.write from those external scripts before it enters the site
     */
    getSDG().getRes().set(getSDG().getSetup().RESOURCES.POSTSCRIBE, function () {
        return new SDG[getSDG().getSetup().SYSTEM.MODULES].Postscribe({
            debug: (location.href.indexOf('psDebug=true') !== -1)
        });
    });

    /* +++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++
     GLOBAL MODULE & RESOURCES CONFIGURATION
     All modules and resources added here will load on EVERY site in the network
     +++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++ */
    getSDG().getCore().set(getSDG().getSetup().MODULES.PUBLISHER_CONFIG, function ()
    {
        return new SDG[getSDG().getSetup().SYSTEM.MODULES].PublisherSetup(conf);
    });
    getSDG().getCore().set(getSDG().getSetup().MODULES.INFOTOOL, function () {
        return new SDG[getSDG().getSetup().SYSTEM.MODULES].InfoTool();
    });
    getSDG().getCore().set(getSDG().getSetup().MODULES.FORMAT_CONFIG, function () {
        return new SDG[getSDG().getSetup().SYSTEM.MODULES].FormatController.Controller();
    });
    getSDG().getCore().set(getSDG().getSetup().MODULES.ADSERVER, function ()
    {
        var foundAdserver,
            chosenAdserver,
            adserverConfig = getSDG().getCore().get(getSDG().getSetup().MODULES.PUBLISHER_CONFIG)._adserverConfig;
        for (var adserver in adserverConfig){
            if(adserverConfig.hasOwnProperty(adserver)){
                if(adserverConfig[adserver].active && !foundAdserver){
                    foundAdserver = true;
                    chosenAdserver = adserverConfig[adserver]
                }
            }
        }
        if(!!getSDG().getUtil().getLocalStorageData('sdgAdserverOverwrite')){
            chosenAdserver = adserverConfig[getSDG().getUtil().getLocalStorageData('sdgAdserverOverwrite')];
            window.addEventListener('beforeLoadAll', function(){
                getSDG().getUtil().showUserNotification('AdServer Overwrite detected! Setting AdServerModule to '+chosenAdserver.functionName)
            });
        }
        if(typeof chosenAdserver !== 'undefined'){
            return new SDG[getSDG().getSetup().SYSTEM.MODULES][chosenAdserver.functionName](
                getSDG().getCore().get(getSDG().getSetup().MODULES.PUBLISHER_CONFIG),
                chosenAdserver.config
            );
        }else{
            getSDG().log('SYSTEM: ADSERVER: No AdServer was preconfigured, no ads will be delivered! Please contact StroeerDigitalGroup Technical PartnerManagement!', getSDG().loglvl('CRITICAL'));
        }
    });
//Collects Targeting Data based on user device and browser
    getSDG().getCore().set(getSDG().getSetup().MODULES.GENERIC_TARGETING, function () {
        return new SDG[getSDG().getSetup().SYSTEM.MODULES].StandardTargets();
    });
    /* +++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++
     LOCAL MODULE & RESOURCES CONFIGURATION
     Modules & resources added here will only load on the specific website owning the local.js
     +++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++ */


//TagMan Converter only needed on sites which have not switched to MetaTag API
    getSDG().getCore().set(getSDG().getSetup().MODULES.TAGMAN_CONVERTER, function ()
    {
        return new SDG[getSDG().getSetup().SYSTEM.MODULES].tagManConverter();
    });
//Praeludium Converter only needed on sites which have not switched to MetaTag API
    getSDG().getCore().set(getSDG().getSetup().MODULES.PRAELUDIUM_CONVERTER, function () {
        return new SDG[getSDG().getSetup().SYSTEM.MODULES].praeludiumConverter();
    });
    SDM_head.adoptGptSetup();





//Meetrics Visibility measurement for customer ID 802358
    getSDG().getRes().set(getSDG().getSetup().RESOURCES.MEETRICS, function () {
        return new SDG[getSDG().getSetup().SYSTEM.MODULES].MeetricsSdg('//s264.mxcdn.net/bb-mx/serve/mtrcs_802358.js');
    });


    /* +++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++
     Event Configuration
     +++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++ */
//noinspection JSUnusedLocalSymbols
    window.addEventListener('beforeLoadAll', function (e)
    {

    });
    window.addEventListener('loadedAll', function (e)
    {
        getSDG().log('SYSTEM: Event: LOADED_ALL was triggered. DOM now ready.', getSDG().loglvl('DEBUG'), e);
    });
    window.addEventListener('placementRegistered', function (e)
    {
        //Exampel to wait for a specific position
        if (e.detail.slot === 'sb_pos1')
        {
            getSDG().log('sb_pos1 registered', getSDG().loglvl('ALERT'));
        }
    });
    /* +++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++
     AdddOn Configuration
     +++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++ */
    getSDG().getCore().set(getSDG().getSetup().MODULES.AD_LABELS, function () {
        return new SDG[getSDG().getSetup().SYSTEM.MODULES].AdLabels("" +
            ".sdgSlotContainer{position:relative;}" +
            ".sdgAnzeigenkennung{margin: 0;padding: 0;font-size: 12px;font-family: arial,helvetica,freesans,sans-serif;}" +
            ".sdgAnzeigenkennung:before{content:'Anzeige';}" +
            ".sdgAnz-banner{transform: rotate(270deg);top:30px;position:absolute;left:-30px;}" +
            ".sdgAnz-bb{transform: rotate(270deg);top:30px;position:absolute;left:-30px;}"
        );
    });
    /* +++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++
     Additional Pixel Configuration
     +++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++ */



    /* SDI Criteo Script ---------------------------------- */
    getSDG().getUtil().loadScript('//rtax.criteo.com/delivery/rta/rta.js?netId=5346&rnd=' + getSDG().getUtil().generateRandomNumberString(8) + '&varName=crtg_content&cookiecreation=0', document.getElementsByTagName('head')[0], function () {
        window.crtg_content = crtg_content.replace(/=1|&/g, '').replace(/(.+);$/, '$1').replace(/;/g, '|');
        if (crtg_content !== '') {
            SDM_head.ping('//cdn.stroeerdigitalmedia.de/Cookie?co=crt&val=' + crtg_content + '&m=43200&cb=' + getSDG().getUtil().generateRandomNumberString(8));
        } else {
            SDM_head.ping('//cdn.stroeerdigitalmedia.de/Cookie?co=crt&val=0&m=0&cb=' + getSDG().getUtil().generateRandomNumberString(8));
        }
        getSDG().log('SYSTEM: Criteo SDI Script attached to document.head', getSDG().loglvl('INFO'));
    }, false, false);

//NuggAd integration




    /* +++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++
     Site Configuration
     +++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++ */




    /* +++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++
     Format Configuration
     +++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++ */
    getSDG().getPUB().getConfig().activateFormat({
        name: 'Billboard',
        sizes: [[800, 250], [970, 250]],
        usePositionForCall: 'banner',
        usePositionForRender: 'bb',
        blockedPositions: ['banner', 'sky'],
        buildFormat: function () {
            console.log('build BB')
        }
    });
    getSDG().getPUB().getConfig().activateFormat({
        name: 'Wallpaper',
        sizes: [[888, 690], [888, 600]],
        usePositionForCall: 'sb',
        usePositionForRender: 'sb',
        blockedPositions: ['sky', 'bb'],
        buildFormat: function () {
            console.log('build wp')
        },
        finishFormat: function () {
            console.log('finish wp')
        }
    });
    getSDG().getPUB().getConfig().activateFormat({
        name: 'BridgeAd',
        sizes: [[800, 250], [970, 250]],
        usePositionForCall: 'bb',
        usePositionForRender: 'bb',
        blockedPositions: ['sky', 'sb'],
        buildFormat: function () {
            console.log('building bridgeAd')
        }
    });
    getSDG().getPUB().getConfig().activateFormat({
        name: 'SingleAd'
    });

//noinspection JSUnusedLocalSymbols
    getSDG().getPUB().getConfig().executeLocalBackgroundColor = function (color) {
        //this.getIM().getGT().log('executeLocalBackgroundColor(): function not replaced with site specific commands.', this.getIM().getGT().logLvl('DEBUG'));
        return true;
    };
//noinspection JSUnusedLocalSymbols
    getSDG().getPUB().getConfig().executeLocalBackgroundClickable = function (placement) {
        //this.getIM().getGT().log('executeLocalBackgroundClickable(): function not replaced with site specific commands.', this.getIM().getGT().logLvl('DEBUG'));
        return true;
    };


    /**
     getIM().getSite().setDacMultiDetections(false, true, true, true, true);
     getIM().getSite().startAdnxsWallpaper = function (placement)
     {
         //this.getIM().getGT().log('startAdnxsWallpaper(): function not replaced with site specific commands.', this.getIM().getGT().logLvl('DEBUG'));
         return true;
     };
     getIM().getSite().finishAdnxsWallpaper = function (placement)
     {
         //this.getIM().getGT().log('finishAdnxsWallpaper(): function not replaced with site specific commands.', this.getIM().getGT().logLvl('DEBUG'));
         return true;
     };
     getIM().getSite().startAdnxsBillboard = function (placement)
     {
         //this.getIM().getGT().log('startAdnxsBillboard(): function not replaced with site specific commands.', this.getIM().getGT().logLvl('DEBUG'));
         return true;
     };
     getIM().getSite().finishAdnxsBillboard = function (placement)
     {
         //this.getIM().getGT().log('finishAdnxsBillboard(): function not replaced with site specific commands.', this.getIM().getGT().logLvl('DEBUG'));
         return true;
     };
     getIM().getSite().startLocalHalfpageAd = function (ad, jsonData, placement)
     {
     //this.getIM().getGT().log('startLocalHalfpageAd(): function not replaced with site specific commands.', this.getIM().getGT().logLvl('DEBUG'));
     return true;
     };
     getIM().getSite().finishLocalHalfpageAd = function (ad, jsonData, placement)
     {
     //this.getIM().getGT().log('finishLocalHalfpageAd(): function not replaced with site specific commands.', this.getIM().getGT().logLvl('DEBUG'));
     return true;
     };
     getIM().getSite().startLocalBanderoleAd = function (ad, jsonData, placement)
     {
     //this.getIM().getGT().log('startLocalBanderoleAd(): function not replaced with site specific commands.', this.getIM().getGT().logLvl('DEBUG'));
     return true;
     };
     getIM().getSite().finishLocalBanderoleAd = function (ad, jsonData, placement)
     {
     //this.getIM().getGT().log('finishLocalBanderoleAd(): function not replaced with site specific commands.', this.getIM().getGT().logLvl('DEBUG'));
     return true;
     };
     getIM().getSite().startLocalFloorAd = function (ad, jsonData, placement)
     {
     //this.getIM().getGT().log('startLocalFloorAd(): function not replaced with site specific commands.', this.getIM().getGT().logLvl('DEBUG'));
     return true;
     };
     getIM().getSite().finishLocalFloorAd = function (ad, jsonData, placement)
     {
     //this.getIM().getGT().log('finishLocalFloorAd(): function not replaced with site specific commands.', this.getIM().getGT().logLvl('DEBUG'));
     return true;
     };
     getIM().getSite().startLocalInterstitial = function (ad, jsonData, placement)
     {
     //this.getIM().getGT().log('startLocalInterstitial(): function not replaced with site specific commands.', this.getIM().getGT().logLvl('DEBUG'));
     return true;
     };
     getIM().getSite().finishLocalInterstitial = function (ad, jsonData, placement)
     {
     //this.getIM().getGT().log('finishLocalInterstitial(): function not replaced with site specific commands.', this.getIM().getGT().logLvl('DEBUG'));
     return true;
     };
     getIM().getSite().startLocalPushdownAd = function (ad, jsonData, placement)
     {
     //this.getIM().getGT().log('startLocalPushdownAd(): function not replaced with site specific commands.', this.getIM().getGT().logLvl('DEBUG'));
     return true;
     };
     getIM().getSite().finishLocalPushdownAd = function (ad, jsonData, placement)
     {
     //this.getIM().getGT().log('finishLocalPushdownAd(): function not replaced with site specific commands.', this.getIM().getGT().logLvl('DEBUG'));
     return true;
     };
     getIM().getSite().startLocalPrestitial = function (ad, jsonData, placement)
     {
     //this.getIM().getGT().log('startLocalPrestitial(): function not replaced with site specific commands.', this.getIM().getGT().logLvl('DEBUG'));
     return true;
     };
     getIM().getSite().finishLocalPrestitial = function (ad, jsonData, placement)
     {
     //this.getIM().getGT().log('finishLocalPrestitial(): function not replaced with site specific commands.', this.getIM().getGT().logLvl('DEBUG'));
     return true;
     };

     */
    /* +++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++
     Experimental
     +++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++
     if (location.href.indexOf('useExperimental') > -1)
     {
     getIM().getGT().createFormat({
     name: 'AdnxsBillboard',
     useBigSizeCall: true,
     width: 800,
     height: 250,
     usePositionForCall: 'sb_pos1',
     usePositionForRender: 'bb',
     alternativeSizes: null,
     blockedPositions: ['sb_pos1', 'bb', 'sky'],
     startBuilder: function ()
     {
     document.querySelector('div#vmsb').style.display = 'none';
     document.querySelector('div#Tadspacehead').style.display = 'none';
     document.querySelector('div#vmsky').style.display = 'none';
     },
     finishBuilder: function ()
     {
     }
     });
     getIM().getGT().createFormat({
     name: 'AdnxsHalfpageAd',
     width: 300,
     height: 600,
     usePositionForCall: 'mrec',
     usePositionForRender: 'mrec',
     alternativeSizes: null,
     blockedPositions: ['mrec'],
     startBuilder: function ()
     {
     },
     finishBuilder: function ()
     {
     }
     });
     getIM().getSite().setRtbCallPosition('bb');

     if (location.href.indexOf('imDemo') > -1)
     {
     var demoPage = (/imDemo=(\w+)/g.exec(location.href));
     if (demoPage !== null)
     {
     getIM().getGT().setZone(demoPage[1]);
     getIM().getGT().setPageType('rubrik')
     }
     }
     }
     */
})();