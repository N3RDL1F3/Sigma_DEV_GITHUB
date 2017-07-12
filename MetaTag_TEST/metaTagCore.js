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
            TAGMAN_CONVERTER: 'tagManConverter',
            PRAELUDIUM_CONVERTER: 'praeludiumConverter',
            AD_LABELS: 'adLabels',
            GENERIC_TARGETING: 'genericTargets',
            FORMAT_CONFIG: 'formatController',
            TTRACKER: 'timeTracker',
            INFOTOOL: 'infoTool'

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
            XAXISFOOTERBIDDER: 'xaxisFooterBidder',
            OPENX: 'openX'
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
        var formatParams;
        formatParams = params;
        formatParams["callbackOnEnd"] = callback;
        getSDG().getCore().get(getSDG().getSetup().MODULES.FORMAT_CONFIG).allocateFormat(formatParams)
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
    this._loadTypes = {
        instance: this,
        immoscout: function (placement)
        {
            getSDG().log(placement.position + ': register(): placement will load at once as immoscout special tag.', getSDG().loglvl('DEBUG'));
            placement.sendPlacementPreparedEvent();
            if (placement.executePreCallSetup())
            {
                placement.loadType = 'ImmoscoutSpecial';
                placement.stats.loaded = true;
                document.write(this.instance.createAdserverTag(placement))
            } else
            {
                getSDG().log(placement.position + ': register(): problem with Immobilienscout special tag!', getSDG().loglvl('DEBUG'));
            }
        },
        asynchron: function (placement)
        {
            placement.flags.activeAsyncModule = true;
            placement.loadType = 'asynchronousJavascript';
            getSDG().log(placement.position + ': register(): placement set up as asynchron JavaScript.', getSDG().loglvl('DEBUG'));
        },
        iframe: function (placement)
        {
            placement.flags.activeFriendlyIframe = true;
            placement.loadType = 'friendlyIframe';
            getSDG().log(placement.position + ': register(): placement set up as friendly iframe.', getSDG().loglvl('DEBUG'));
        }
    };
    this._loadSlotNumber = (!!parseFloat(this._config.getCommonValue('sequenceSlotCount'))) ? parseFloat(this._config.getCommonValue('sequenceSlotCount')) + 1 : 1;
    this._defaultTagTemplate = 'addyn';
    getSDG().getEventDispatcher().trigger('SDG_AD_SERVER_MODULE_LOADED');
};
getSDG()[getSDG().getSetup().SYSTEM.MODULES].AdTechIQAdServer.prototype = {
    /**
     * Generate ad call name from current configuration for given position.
     *
     * @param {String} placement
     * @return {String}
     */
    returnAdServerPlacementName: function (placement)
    {
        var alias = this._config.getCommonValue('name') +
            '_' + this._config.getZone() +
            '_' + this._config.getPageType() +
            '_' + placement.position;
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
        var loadType = this._config.getValueForPosition(placement.position, 'aolOneTagType');
        placement.tagTemplateType = this._defaultTagTemplate;
        if (!parseFloat(this._config.getValueForPosition(placement.position, 'sequenceSlot')))
        {
            placement.sequenceSlot = this._loadSlotNumber;
            this._loadSlotNumber++;
        } else
        {
            parseFloat(this._config.getValueForPosition(placement.position, 'sequenceSlot'))
        }
        if (loadType !== undefined && !!this._loadTypes[loadType]) //check if a special tagType has to be used otherwise do nothing
        {
            this._loadTypes[loadType].call(this, placement);
        }

    },
    updateKeywords: function () {
        //inactive in this adserver module
    },
    /**
     * adds a keyvalue pair to adserver API
     * @param key
     * @param value
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
        kv = getSDG().getUtil().mergeRecursive(kv, globalKeyValues);
        kv = getSDG().getUtil().mergeRecursive(kv, localKeyValues);
        if (SDG.getUtil().getKeysFromObject(kv).length > 8)
        {
            getSDG().log('SYSTEM: AdServerAdapter:  Values for more than 8 keys were added.', getSDG().loglvl('ALERT'));
        }
        for (key in kv)
        {
            if (kv[key].length > 8)
            {
                getSDG().log('SYSTEM: AdServerAdapter: More than 8 values for key "' + key + '" were added.', getSDG().loglvl('ALERT'));
            }
            kvString += 'kv' + key + '=' + kv[key].join(':') + ';';
        }
        return kvString;
    },
    createAdserverTag: function (placement) {
        var position = placement.position,
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
    executeSingleAdserverCall: function (placement)
    {
        var tagString = this.createAdserverTag(placement);
        placement.sendPlacementPreparedEvent();
        if (placement.executePreCallSetup() && !placement.flags.activeAsyncModule && (document.readyState !== 'interactive' && document.readyState !== 'complete'))
        {
            placement.sendPlacementCallingEvent();
            this.writeSynchronousTag(tagString, function ()
            {
                placement.placementResponded();
            }, false, true);
        } else
        {
            placement.sendPlacementCallingEvent();
            getSDG().getUtil().loadScript(tagString + ';cors=yes;', placement.getContainer(), function ()
            {
                placement.placementResponded();
            }, true, true);
        }
        if (placement.flags.activeFriendlyIframe)
        {
            //todo evaluate if friendlyiframe is still needed
            // this.buildFriendlyIframe(placement.getContainer(), tagString)
        }
        return true;
    },
    /**
     * Will start the load process for mutiple placements defined by position argument
     *
     *
     * @param {boolean} reloadAds - Will load any placements on the site if set to true (default), will load only unloaded placements if set to false.
     */
    executeMutipleAdServerCalls: function (reloadAds) {
        var currentPlacement,
            placementDirectory = getSDG().getCN().getPlacements(),
            readyPlacements = [],
            currentSequenceSlots = this._loadSlotNumber - 1;
        for (var i = 1; currentSequenceSlots >= i; i++) {
            for (var x in placementDirectory) {
                currentPlacement = placementDirectory[x];
                if (currentPlacement.sequenceSlot == i && (currentPlacement.stats.loaded != true || reloadAds)) {
                    if (currentPlacement.executePreCallSetup() && currentPlacement.readyMultiAdServerCall()) {
                        readyPlacements.push(currentPlacement.position);
                    }
                }
            }
        }
        if (readyPlacements.length > 0) {
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
        getSDG().log('SYSTEM: AdServerAdapter:  readyMultiAdServerCall() not set in AOl ONE adServer module. Function is not needed.', getSDG().loglvl('NOTICE'), placement);
        return true;
    },
    deleteAdserverPlacement: function (placement) {
        getSDG().log('SYSTEM: AdServerAdapter:  deleteAdserverPlacement() not set in new adServer module. Module will not work properly', getSDG().loglvl('ALERT'), placement);
        return true;
    },
    executeMultiAdserverCall: function () {
        getSDG().log('SYSTEM: AdServerAdapter:  executeMultiAdserverCall() not set in new adServer module. Module will not work properly', getSDG().loglvl('ALERT'));
    },
    setPlacementAsynchron: function (placement) {
        getSDG().log('SYSTEM: AdServerAdapter:  setPlacementAsynchron() not set in new adServer module. Module will not work properly', getSDG().loglvl('ALERT'), placement);
    },
    wrapInFriendlyIframe: function (placement) {
        getSDG().log('SYSTEM: AdServerAdapter:  wrapInFriendlyIframe() not set in new adServer module. Module will not work properly', getSDG().loglvl('ALERT'), placement);
    }
};
/**
 * @class Name space for ad server adapters.
 */
getSDG()[getSDG().getSetup().SYSTEM.MODULES].GoogleDfp = function (config, gptParameters) {

    //initialize googletag command queue
    window.googletag = window.googletag || {};
    window.googletag.cmd = window.googletag.cmd || [];
    window.googletag.cmd.push(function () {
        getSDG().getEventDispatcher().trigger('SDG_AD_SERVER_MODULE_LOADED');
        getSDG().getCore().get(getSDG().getSetup().MODULES.ADSERVER).sendGlobalTargetingToGpt();
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
            if (typeof getSDG().getCN().getPlacementByContainerId(event.slot.getSlotElementId()) !== 'undefined') {
                //noinspection JSUnresolvedVariable,JSUnresolvedFunction
                getSDG().getCN().getPlacementByContainerId(event.slot.getSlotElementId()).finalizeCall({
                    systemIds: {
                        doubleclick: {
                            advertiserId: event.advertiserId,
                            campaignId: event.campaignId,
                            adId: event.creativeId,
                            labelIds: event.labelIds,
                            flightId: event.lineItemId,
                            websiteId: getSDG().getPUB().getConfig().getCommonValue('name')
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
                getSDG().log('ADSERVER: ' + placement.position + ': placement set up as standard DFP GPT.', getSDG().loglvl('DEBUG'));
                //noinspection JSUnresolvedFunction
                window["slot" + placement.position] = window.googletag.defineSlot(getSDG().getPUB().getAdServer().returnDfpPath(placement), placement.sizeParams.sizeArray, placement.getContainer().id).addService(window.googletag.pubads());
                placement.gptSlot = window["slot" + placement.position];
                placement.sendPlacementPreparedEvent()
            });
        },
        outOfPageGpt: function (placement) {
            placement.loadType = 'outOfPageGpt';
            window.googletag.cmd.push(function () {
                getSDG().log('ADSERVER: ' + placement.position + ': placement set up as OutOfPage DFP GPT.', getSDG().loglvl('DEBUG'));
                //noinspection JSUnresolvedFunction
                placement.gptSlot = window.googletag.defineOutOfPageSlot(getSDG().getPUB().getAdServer().returnDfpPath(placement), placement.getContainer().id).addService(window.googletag.pubads());
                placement.sendPlacementPreparedEvent()
            });
        }
    };
    this._loadSlotNumber = (!!parseFloat(this._config.getCommonValue('sequenceSlotCount'))) ? parseFloat(this._config.getCommonValue('sequenceSlotCount')) + 1 : 1;
    this.setPlacementAsynchron = function (placement) {
        getSDG().log('SYSTEM: AdServerAdapter:  setPlacementAsynchron() not set in new adServer module. GPT does not need this function!', getSDG().loglvl('DEBUG'), placement);
    };
    this.wrapInFriendlyIframe = function (placement) {
        getSDG().log('SYSTEM: AdServerAdapter:  wrapInFriendlyIframe() not set in new adServer module. GPT does not need this function!', getSDG().loglvl('DEBUG'), placement);
    };
};
getSDG()[getSDG().getSetup().SYSTEM.MODULES].GoogleDfp.prototype = {
    /**
     * returns the DoubleClick for Publisher AdUnit path based on the current set zone
     * @param placement
     */
    returnDfpPath: function (placement) {
        return this._config.getCommonValue('dfpNetwork') +
            '/' + ( (!!this._config.getValueForPosition(placement.position, 'useDfpMobileName') && !!this._config.getCommonValue('dfpMobileName')) ? this._config.getCommonValue('dfpMobileName') : this._config.getCommonValue('name') ) +
            '/' + placement.getZone() + ((placement.getPageType() !== "") ? '/' + placement.getPageType() : '');
    },
    /**
     * Generate ad call name from current configuration for given placement.
     *
     * @param {object} placement
     * @return {String}
     */
    returnAdServerPlacementName: function (placement) {
        var placementName = '/' + this.returnDfpPath(placement) +
            '/' + placement.position;
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
        placement.loadType = (this._config.getValueForPosition(placement.position, 'dfpTagType')) ? this._config.getValueForPosition(placement.position, 'dfpTagType') : this._defaultLoadType;
        //if container does not have an id, create one. Needed for GPT identifier
        placement.adServerName = this.returnAdServerPlacementName(placement);
        if (!placement.getContainer().id) {
            placement.getContainer().id = placement.adServerName;
        }
        //create GPT sizeArrays
        if (typeof this._config.getValueForPosition(placement.position, 'dfpSizes') !== 'undefined') {
            placement.sizeParams.sizeArray = this._config.getValueForPosition(placement.position, 'dfpSizes')
        }
        if (!parseFloat(this._config.getValueForPosition(placement.position, 'sequenceSlot'))) {
            placement.sequenceSlot = this._loadSlotNumber;
            this._loadSlotNumber++;
        } else {
            parseFloat(this._config.getValueForPosition(placement.position, 'sequenceSlot'))
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
     * Get the current keyValue targetings from MetaTag and send it to GPT in their format
     * todo introduce Adserver functions which parse targeting directly when the publisher sets them during page setup
     */
    sendGlobalTargetingToGpt: function () {
        var targetingKey, targetingSet;
        for (targetingKey in this._config.getKeyValues()) {
            targetingSet = this._config.getKeyValues()[targetingKey];
            if (typeof targetingKey === 'string' && targetingSet instanceof Array) {
                (function (tKey, tSet) {
                    window.googletag.cmd.push(function () {
                        //noinspection JSUnresolvedFunction
                        window.googletag.pubads().setTargeting(tKey, tSet)
                    });
                })(targetingKey, targetingSet)
            }
        }
        this.getKeywordString();
        return true;
    },
    /**
     * Pass possible keywords to GPT under the handle "keywords"
     * @returns {boolean}
     */
    getKeywordString: function () {
        if (this._config.getKeywords().length) {
            var instance = this;
            window.googletag.cmd.push(function () {
                //noinspection JSUnresolvedFunction
                window.googletag.pubads().setTargeting('keywords', instance._config.getKeywords())
            });
        }
        return true;
    },
    /**
     * call a single placement and start the load process
     *
     * @param placement
     * @returns {boolean}
     */
    executeSingleAdserverCall: function (placement) {
        //check if a tagType has to be used otherwise do nothing

        if (this.isViewportInPositioRange(placement.position)) {
            if (placement.executePreCallSetup() && this.checkAndPrepareGptPlacement(placement)) {
                /**
                 * If the setup is asynchron, trigger the first time GTP display command, after that only use the GPT refreh command
                 * If the setup is sync, trigger GTP display wtih all necessary tagMan Events
                 */
                if (!this._gptUseSynchronTags) {
                    if (!placement.stats.loaded) {
                        window.googletag.cmd.push(function () {
                            window.googletag.display(placement.getContainer().id);
                        });
                    }
                    window.googletag.cmd.push(function () {
                        placement.sendPlacementCallingEvent();
                        //noinspection JSUnresolvedFunction
                        window.googletag.pubads().refresh([placement.gptSlot], {changeCorrelator: (placement.stats.loaded)});
                        placement.placementResponded();
                    });
                } else {
                    window.googletag.cmd.push(function () {
                        placement.sendPlacementCallingEvent();
                        window.googletag.display(placement.getContainer().id);
                        placement.placementResponded();
                    });
                }
                return true;
            } else {
                getSDG().log('ADSERVER: ' + placement.position + ':  Load command received, but placement was not loaded because of an error in setting up the adserver call!', getSDG().loglvl('ERROR'));
                return false;
            }
        } else {
            getSDG().log('ADSERVER: ' + placement.position + ':  Load command received, but viewport is not in preconfigured range to load position', getSDG().loglvl('NOTICE'));
            return false;
        }
    },
    /**
     * Will start the load process for mutiple placements defined by position argument
     *
     *
     * @param {boolean} reloadAds - Will load any placements on the site if set to true (default), will load only unloaded placements if set to false.
     */
    executeMutipleAdServerCalls: function (reloadAds) {
        var currentPlacement,
            placementDirectory = getSDG().getCN().getPlacements(),
            readyPlacements = [],
            currentSequenceSlots = this._loadSlotNumber - 1;
        for (var i = 1; currentSequenceSlots >= i; i++) {
            for (var x in placementDirectory) {
                currentPlacement = placementDirectory[x];
                if (currentPlacement.sequenceSlot === i && (currentPlacement.stats.loaded !== true || reloadAds)) {
                    readyPlacements.push(currentPlacement.position);
                }
            }
        }
        if (readyPlacements.length > 0) {
            for (var y in readyPlacements) {
                if (typeof readyPlacements[y] === 'string') {
                    currentPlacement = getSDG().getCN().getPlacementByPosition(readyPlacements[y]);
                    if (this._gptUseSingleRequest) {

                    }
                    currentPlacement.load()
                }
            }
        }
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
    /**
     * Checks if the position has a preconfigured min or max viewport with to render in.
     * If not and there is a mobileBreakpoint set and the position should use the DFP mobileName, the max value is set to the mobile breakpoint
     * @param position
     * @returns {boolean}
     */
    isViewportInPositioRange: function (position) {
        var useMobileBreakpoint = !!this._config.getCommonValue('dfpMobileBreakpoint'),
            useMobieName = !!this._config.getValueForPosition(position, 'useDfpMobileName');
        var min = (!!this._config.getValueForPosition(position, 'minViewportWidth')) ? parseFloat(this._config.getValueForPosition(position, 'minViewportWidth')) : (!useMobieName && useMobileBreakpoint) ? parseFloat(this._config.getCommonValue('dfpMobileBreakpoint')) : 0,
            max = (!!this._config.getValueForPosition(position, 'maxViewportWidth')) ? parseFloat(this._config.getValueForPosition(position, 'maxViewportWidth')) : (useMobieName && useMobileBreakpoint) ? parseFloat(this._config.getCommonValue('dfpMobileBreakpoint')) : 40000;

        return !(getSDG().getUtil().getViewportDimensions().width < min) && !(getSDG().getUtil().getViewportDimensions().width > max);
    }
};
getSDG()[getSDG().getSetup().SYSTEM.MODULES].Advertisment = function (anchor) {
    this.mediaSegments = {
        anchor: anchor
    };
    this.countPixel = {
        container: undefined
    };
};
getSDG()[getSDG().getSetup().SYSTEM.MODULES].Advertisment.prototype = {
    getAnchor: function () {
        if (!!this.mediaSegments.anchor) {
            return this.mediaSegments.anchor
        } else {
            return false
        }
    },
    addMedia: function (name, mediaObj) {
        return this.mediaSegments[name] = mediaObj;
    },
    getMedia: function (name) {
        return this.mediaSegments[name]
    },
    createCountContainer: function () {
        this.countPixel.container = document.createElement('div');
        this.countPixel.container.className = 'sdgCountPixelAnker';
        this.countPixel.container.style["display"] = 'none';
        return this.countPixel.container
    },
    addCountPixel: function (number, counter) {
        return this.countPixel[number] = counter;
    },
    getCountContainer: function () {
        if (this.countPixel.container !== undefined) {
            return this.countPixel.container
        } else {
            return this.createCountContainer()
        }
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
            this.objectOrginalStyleTop = (this.stickyObject.style.top != '') ? parseFloat(this.stickyObject.style.top) : (window.getComputedStyle(this.stickyObject).getPropertyValue('top') !== "" && window.getComputedStyle(this.stickyObject).getPropertyValue('top') !== "auto") ? parseFloat(window.getComputedStyle(this.stickyObject).getPropertyValue('top')) : 0;
            this.objectOrginalStyleLeft = (this.stickyObject.style.left != '') ? parseFloat(this.stickyObject.style.left) : (window.getComputedStyle(this.stickyObject).getPropertyValue('left') !== "" && window.getComputedStyle(this.stickyObject).getPropertyValue('left') !== "auto") ? parseFloat(window.getComputedStyle(this.stickyObject).getPropertyValue('left')) : 0;
            this.objectOrginalStylePosition = this.stickyObject.style.position;
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
            if (instance.resObj.style.position == "absolute") {
                if (instance.recalcLeft) {
                    instance.resObj.style.width = getSDG().getUtil().getPos(instance.refObj).left + 'px';
                    instance.resObj.style.left = -getSDG().getUtil().getPos(instance.refObj).left + 'px';
                    if (!!this.currentStickies[instance.resObj.nodeName + '-' + instance.resObj.id]) {
                        this.currentStickies[instance.resObj.nodeName + '-' + instance.resObj.id].objOrgStyleLeft = -parseFloat(instance.resObj.style.width);
                    }
                } else {
                    instance.resObj.style.width = this.currentViewportWidth - getSDG().getUtil().getPos(instance.refObj).left - getSDG().getUtil().getObjectDimensions(instance.refObj).width + 'px';
                }
            } else if (instance.resObj.style.position == 'fixed') {
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
                if (instance.objectOrginalPosTop - (scrollTop + adhesionUnitHeight) <= 0 && stickyObject.style.position != 'fixed' && scrollTop >= instance.startTop) {
                    stickyObject.style.position = 'fixed';
                    stickyObject.style.left = instance.objectOrginalPosLeft + 'px';
                    stickyObject.style.top = adhesionUnitHeight + 'px';
                }
                if ((instance.objectOrginalPosTop - (scrollTop + adhesionUnitHeight) >= 0 || scrollTop >= instance.endTop) && stickyObject.style.position == 'fixed') {
                    stickyObject.style.position = instance.objectOrginalStylePosition;
                    stickyObject.style.left = instance.objectOrginalStyleLeft + 'px';
                    stickyObject.style.top = instance.objectOrginalStyleTop + 'px';
                }
                if (instance.stickyObject.style.position == 'fixed') {
                    posLeft = getSDG().getUtil().getPos(instance.refObj).left + instance.leftDifferenceFromObjectToReference - scrollLeft;
                    if (parseFloat(stickyObject.style.left) !== posLeft) {
                        stickyObject.style.left = posLeft + 'px';
                    }
                    if (parseFloat(instance.stickyObject.style.top) != adhesionUnitHeight) {
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
                this.calculateSticky(this.currentStickies[obj]);
            }
            for (var bgs in this.currentBackgrounds) {
                this.calculateBackground(this.currentBackgrounds[bgs]);
            }
        },
        processResizeFeatures: function () {
            for (var obj in this.currentStickies) {
                this.calculateSticky(this.currentStickies[obj]);
            }
            for (var res in this.currentResizes) {
                this.calculateResize(this.currentResizes[res]);
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
                var collectionObject = collection[obj];
                if (collectionObject.objOrgPosTop > 300) {
                    level2.push(collectionObject);
                } else {
                    level1.push(collectionObject);
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
     */
    startAdConstruction: function (formatObject) {
        var overwriteAdserverName = '',
            jsonData = formatObject.getReponseParameters();
        if (typeof jsonData.placementAlias !== 'undefined') {
            //tagMan backwards compatibility
            overwriteAdserverName = jsonData.placementAlias;
        }
        if (typeof jsonData.placementAdServerName !== 'undefined') {
            overwriteAdserverName = jsonData.placementAdServerName;
        }
        if (overwriteAdserverName !== '') {
            if (!!getSDG().getCN().getPlacementByAdServerName(overwriteAdserverName) && (getSDG().getCN().getPlacementByAdServerName(overwriteAdserverName).position !== formatObject.containerPosition)) {
                formatObject.containerPosition = getSDG().getCN().getPlacementByAdServerName(overwriteAdserverName).position;
            }
        } else {
            formatObject.containerPosition = getSDG().getCN().getPlacementBySizeId(jsonData.placementSizeId).position;
        }
        if (!!formatObject.getContainerPlacement()) {
            formatObject.getContainerPlacement().prepareNewAd(document.createElement('div'));
            if (!!this['build' + jsonData.adType](formatObject)) {
                this.finishAdConstruction(formatObject)
            } else {
                getSDG().log('SYSTEM: FORMATS: ' + formatObject.getContainerPlacement().position + ': Error during ad construction. Calling build' + jsonData.adType + '() did not return positive results!', getSDG().loglvl('ERROR'));
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
        var jsonData = formatObject.getReponseParameters(),
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
        if (typeof callback === 'function') {
            callback();
        }
        getSDG().log(placement.position + ' ad assets build and appended to page. Delivery finished!', getSDG().loglvl('DEBUG'));
    },
    /**
     * Determines if countPixel are needed for this ad, if yes passes each pixel entry to the builder
     * @param formatObject
     */
    setupCountPixels: function (formatObject) {
        var jsonData = formatObject.getReponseParameters(),
            placement = formatObject.getContainerPlacement();
        for (var obj in jsonData.countPix) {
            this.buildCountPixel(formatObject, obj, jsonData.countPix[obj].tech, jsonData.countPix[obj].url);
        }
    },
    /**
     * Adds an stickyObject to the featureController
     * @param stickyObj
     * @param referenceObj
     */
    addSticky: function (stickyObj, referenceObj) {
        this.featureController.currentStickies[stickyObj.nodeName + '-' + stickyObj.id] = new this.featureController.StickyInstance(stickyObj, referenceObj);
        if (this.featureController.eventsActive == false) {
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
        if (this.featureController.eventsActive == false) {
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
        if (this.featureController.eventsActive == false) {
            this.featureController.activateEvents();
        }
    },
    buildMediaSegments: function (formatObject) {
        var currentJsonSegment,
            mediaContainer,
            fileObject,
            jsonData = formatObject.getReponseParameters(),
            ad = formatObject.getContainerPlacement().getAd();
        for (var obj in jsonData.Media) {
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
        for (var entry in formatObject.reponseParameters.Media) {
            window[formatObject.reponseParameters.Media[entry].file.fileId + '_DoFSCommand'] = function (command) {
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
    },
    buildFlashMedia: function (jsonSegement, formatObject) {
        var mediaString, adSegment;
        adSegment = formatObject.getContainerPlacement().getAd().getMedia(jsonSegement.mediaName);
        //todo IDs an Flashobjekten bei IE10 und hoeher, ansonsten Probleme mit JS Aufrufen aus Flashdateien
        if (getSDG().getUtil().checkFlashVersion(jsonSegement.file.plugin.minVersion)) {
            mediaString = '<object classid="clsid:d27cdb6e-ae6d-11cf-96b8-444553540000" width="' + jsonSegement.file.width + '" height="' + jsonSegement.file.height + '" '
                + 'id="' + jsonSegement.file.fileId + '"><param name="movie" value="' + jsonSegement.file.url + '"/>';
            for (var key in jsonSegement.file.plugin.params) {
                var value = jsonSegement.file.plugin.params[key];
                mediaString += '<param name="' + key + '" value="' + value + '"/>';
            }
            var flashvars = '';
            for (var number in jsonSegement.links) {
                key = jsonSegement.links[number];
                if (number != 1) {
                    flashvars += '&';
                }
                flashvars += key.variable + '=' + key.url;
            }
            flashvars += (jsonSegement.file.plugin.additionalVariables != '') ? '&' + jsonSegement.file.plugin.additionalVariables : '';
            mediaString += '<param name="flashvars" value="' + flashvars + '"/>'
                + '<embed src="' + jsonSegement.file.url + '" width="' + jsonSegement.file.width + '" height="' + jsonSegement.file.height + '" type="application/x-shockwave-flash" name="' + jsonSegement.file.fileId + '" ';
            for (key in jsonSegement.file.plugin.params) {
                value = jsonSegement.file.plugin.params[key];
                mediaString += key + '="' + value + '" ';
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
        if (tech == 'image') {
            pixel = document.createElement('img');
            pixel.width = 1;
            pixel.height = 1;
            pixel.src = url;
            container.appendChild(ad.addCountPixel(name, pixel))
        }
        if (tech == 'javascript' || tech == 'iframe') {
            if (tech == 'javascript' && document.readyState !== 'loading') {
                ad.addCountPixel(name, getSDG().getUtil().loadScript(url, container));
            } else {
                pixel = document.createElement('iframe');
                pixel.src = 'about:blank';
                pixel.width = 1;
                pixel.height = 1;
                container.appendChild(ad.addCountPixel(name, pixel));
                if (tech == 'javascript') {
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
            jsonData = formatObject.reponseParameters,
            placement = formatObject.getContainerPlacement(),
            i;
        for (var obj in jsonData.Media) {
            currentMedia = jsonData.Media[obj];
            if (!currentMedia.sticky && currentMedia.position == 'top') {
                refObject = placement.getAd().getMedia(currentMedia.mediaName)
            }
            if (currentMedia.sticky) {
                stickyObjs.push(placement.getAd().getMedia(currentMedia.mediaName));
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
            linkurl = formatObject.getReponseParameters().formatParams.backgroundClickUrl;
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
            if (bgArray[div].tagName === 'DIV') {
                bgArray[div].style.cssText = 'width:1px;height:1px;position:absolute;cursor:pointer;top:0;left:0;';
                bgArray[div].onclick = function () {
                    window.open(linkurl);
                };
                divBgAnker.appendChild(bgArray[div])
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
        divBgAnker.style.position = 'absolute';
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
    buildNativeAd: function (formatObject) {
        var jsonData = formatObject.getReponseParameters(),
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
    buildBillboard: function (formatObject) {
        var jsonData = formatObject.getReponseParameters(),
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
            if ((contentDim.left + contentDim.width) == ((bbLeft - (bbLeft - contentDim.left)) + bbWidth  )) {
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
    buildHalfpageAd: function () {
    },
    buildBanderoleAd: function () {
    },
    buildFloorAd: function () {
    },
    buildInterstitial: function () {
    },
    buildPushdownAd: function () {
    },
    buildPrestitial: function () {
    },
    buildBridgeAd: function (formatObject) {
        var jsonData = formatObject.getReponseParameters(),
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
                currentJsonSegment = jsonData.Media[obj];
                currentMediaDiv = ad.getMedia(currentJsonSegment.mediaName);
                currentMediaDiv.style['position'] = 'absolute';
                if (currentJsonSegment.position == 'billboard') {
                    bbWidth = parseFloat(currentMediaDiv.style['width']);
                    bbHeight = parseFloat(currentMediaDiv.style['height']);
                    bbSegment = currentMediaDiv

                }
                if (currentJsonSegment.position == 'left') {
                    currentMediaDiv.style['left'] = -(parseFloat(currentMediaDiv.style['width'])) + 'px';
                    currentMediaDiv.style['top'] = -skyGap + 'px'
                }
                if (currentJsonSegment.position == 'right') {
                    currentMediaDiv.style['left'] = bbWidth + 'px';
                    currentMediaDiv.style['top'] = -skyGap + 'px'
                }
                anchor.appendChild(currentMediaDiv);
            }
            placement.getContainer().appendChild(anchor);
            anchor.style['width'] = bbWidth + 'px';
            anchor.style['height'] = bbHeight + 'px';

            //Falls Billboard mit margins platziert wurde, normalisiere Position
            bbLeft = getSDG().getUtil().getObjectDimensions(bbSegment).left;
            if (contentDim.left != bbLeft) {
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
    buildSingleAd: function (formatObject) {
        var jsonData = formatObject.getReponseParameters(),
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
                currentJsonSegment = jsonData.Media[obj];
                currentMediaDiv = ad.getMedia(currentJsonSegment.mediaName);
                anchor.appendChild(currentMediaDiv);
                width = (currentJsonSegment.expandable) ? currentJsonSegment.expandable.collapsedWidth : parseFloat(currentMediaDiv.style['width']);
                height = (currentJsonSegment.expandable) ? currentJsonSegment.expandable.collapsedHeight : parseFloat(currentMediaDiv.style['height']);
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
    buildMultiAd: function (formatObject) {
        var jsonData = formatObject.getReponseParameters(),
            placement = formatObject.getContainerPlacement(),
            ad = placement.getAd(),
            anchor = ad.getAnchor(),
            contentDimensions = getSDG().getPUB().getConfig().getContentObject(),
            topDimensions = {width: contentDimensions.widthModified, height: 90},
            leftDimensions = {width: 0, height: 0},
            rightDimensions = {width: 0, height: 0},
            overDimensions = {width: 0, height: 0},
            docked = (!!jsonData.formatParams.sideDocking) ? jsonData.formatParams.sideDocking : true,
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
                currentJsonSegment = jsonData.Media[obj];
                currentMediaDiv = ad.getMedia(jsonData.Media[obj].mediaName);
                if (currentJsonSegment.position == 'top') {
                    topDimensions.width = (currentJsonSegment.expandable) ? currentJsonSegment.expandable.collapsedWidth : parseFloat(currentMediaDiv.style['width']);
                    topDimensions.height = (currentJsonSegment.expandable) ? currentJsonSegment.expandable.collapsedHeight : parseFloat(currentMediaDiv.style['height']);
                }
                if (currentJsonSegment.position == 'left') {
                    leftDimensions.width = (currentJsonSegment.expandable) ? currentJsonSegment.expandable.collapsedWidth : parseFloat(currentMediaDiv.style['width']);
                    leftDimensions.height = (currentJsonSegment.expandable) ? currentJsonSegment.expandable.collapsedHeight : parseFloat(currentMediaDiv.style['height']);
                }
                if (currentJsonSegment.position == 'right') {
                    rightDimensions.width = (currentJsonSegment.expandable) ? currentJsonSegment.expandable.collapsedWidth : parseFloat(currentMediaDiv.style['width']);
                    rightDimensions.height = (currentJsonSegment.expandable) ? currentJsonSegment.expandable.collapsedHeight : parseFloat(currentMediaDiv.style['height']);
                }
                if (currentJsonSegment.position == 'overlay') {
                    overDimensions.width = (currentJsonSegment.expandable) ? currentJsonSegment.expandable.collapsedWidth : parseFloat(currentMediaDiv.style['width']);
                    overDimensions.height = (currentJsonSegment.expandable) ? currentJsonSegment.expandable.collapsedHeight : parseFloat(currentMediaDiv.style['height']);
                }
            }
            anchor.style['width'] = topDimensions.width + 'px';
            anchor.style['height'] = topDimensions.height + 'px';
            //Zweiter Durchlauf fuer Positionierung
            for (obj in jsonData.Media) {
                currentJsonSegment = jsonData.Media[obj];
                currentMediaDiv = ad.getMedia(currentJsonSegment.mediaName);
                currentMediaDiv.style['position'] = 'absolute';
                if (currentJsonSegment.position == 'left') {
                    posLeft = parseFloat(currentMediaDiv.style['left']) + (docked) ? -leftDimensions.width : 0;
                    posTop = parseFloat(currentMediaDiv.style['top']) + (docked) ? 0 : topDimensions.height;
                }
                if (currentJsonSegment.position == 'right') {
                    posLeft = parseFloat(currentMediaDiv.style['left']) + (docked) ? topDimensions.width : topDimensions.width - rightDimensions.width;
                    posTop = parseFloat(currentMediaDiv.style['top']) + (docked) ? 0 : topDimensions.height;
                }
                if (currentJsonSegment.position == 'overlay') {
                    posLeft = parseFloat(currentMediaDiv.style['left']) + (docked) ? topDimensions.width - overDimensions.width : leftDimensions.width + ((topDimensions.width - rightDimensions.width - leftDimensions.width) - overDimensions.width);
                    posTop = parseFloat(currentMediaDiv.style['top']) + topDimensions.height;
                }
                currentMediaDiv.style['left'] = posLeft + 'px';
                currentMediaDiv.style['top'] = posTop + 'px';
                anchor.appendChild(currentMediaDiv);
            }
            //Schreibe MultiAd auf Seite
            placement.getContainer().appendChild(anchor);
            //Positioniere Anker in Relation zu Seite
            anchor.style['left'] = ((docked) ? (contentDimensions.widthModified - topDimensions.width + (contentDimensions.leftModified - getSDG().getUtil().getPos(anchor).left)) : (contentDimensions.widthModified - topDimensions.width + rightDimensions.width + (contentDimensions.leftModified - getSDG().getUtil().getPos(anchor).left))) + 'px';
            getSDG().log(placement.position + ': buildMultiAd(): Positionsdbug: docked=' + docked + ', topBannerWidth=' + topDimensions.width + ', rightBannerWidth=' + rightDimensions.width + ', contentLeft=' + contentDimensions.leftModified + ',contentWidth=' + contentDimensions.widthModified + ', anchorLeft=' + getSDG().getUtil().getPos(anchor).left + '. Formel: docked (contentWidth-topBannerWidth+(contentLeft-anchorLeft)), undocked (contentWidth-topBannerWidth+rightBannerWidth+(contentWidth-anchorLeft)', getSDG().loglvl('DEBUG'));
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
                    divAnz.id = currentPlacement.adServerName + '_anz';
                    divAnz.className = 'sdgAnzeigenkennung sdgAnz-' + currentPlacement.position;
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
};
getSDG()[getSDG().getSetup().SYSTEM.MODULES].praeludiumConverter.prototype = {
    /**
     * Praeludium translation for the SDG.Publisher.registerPosition methode
     * @param SDM_adConfig
     */
    praeludiumRegisterAd: function (SDM_adConfig) {
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
        if (sitename != '' && sitename != getSDG().getPUB().getConfig().getCommonValue('name')) {
            getSDG().log('SYSTEM: PrealudiumAdapter:  registerAd(). Identifier for site overwritten by registerAd with value "' + sitename + '" was "' + getSDG().getPUB().getConfig().getCommonValue('name') + '"', getSDG().loglvl('NOTICE'));
            getSDG().getPUB().getConfig()._commonConfig.name = sitename;

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
            if (sizeToRemove.length == 0) {
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
            if (zone != '') {
                placement.setZone(zone);
            }
            if (sizeToRemove != '') {
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
        if (targetingString != '') {
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
        placementCall += (zone != '') ? '.setZone("' + zone + '")' : '';
        if (removeSizes != '') {
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
            getSDG().log('SYSTEM: PrealudiumAdapter:  disokayAd(). Position ' + adname + ' not found on site. Aborting display process', getSDG().loglvl('ERROR'));
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
        var head = (typeof elem !== 'undefined') ? elem : document.head || document.getElementsByTagName('head')[0];
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
            /**
             *
             * @param position
             * @param container
             * @param loadWithCommand
             */
            register: function (position, container, loadWithCommand) {
                container = (typeof container === 'string') ? document.querySelector('#' + container) : container;
                loadWithCommand = (typeof loadWithCommand === 'string') ? false : loadWithCommand;
                if (!loadWithCommand) {
                    return getSDG().getPUB().registerSlot(position, container).load();
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
                return getSDG().getPUB().unregisterAll(deleteAd)
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
        }
    };
    window.getIM = function () {
        return IM;
    }
};
/**
 * Events sub module
 * Controlls creation and firing of events.
 * @author: Bjoern Militzer
 */
getSDG()[getSDG().getSetup().SYSTEM.MODULES].EventDispatcher = function ()
{
    document.onreadystatechange = function () {
        if (document.readyState == "complete") {
            getSDG().getEventDispatcher().trigger('SDG_LOADED_ALL', this);
        }
    };
    this.POSITION_REGISTERED = this.setup('positionRegistered', {
        type: 'position',
        position: '',
        placement: ''

    });
    this.POSITION_PREPARED = this.setup('positionPrepared', {
        type: 'position',
        position: '',
        placement: ''
    });
    this.POSITION_DELETED = this.setup('positionDeleted', {
        type: 'position',
        position: '',
        placement: ''
    });
    this.POSITION_CALLING = this.setup('positionCalling', {
        type: 'position',
        position: '',
        placement: ''
    });
    this.POSITION_RESPONDED = this.setup('positionResponded', {
        type: 'position',
        position: '',
        placement: ''
    });
    this.POSITION_DONE = this.setup('positionDone', {
        type: 'position',
        position: '',
        placement: ''
    });
    this.SDG_BEFORE_LOAD_ALL = this.setup('beforeLoadAll', {type: 'system'});
    this.SDG_LOADED_ALL = this.setup('loadedAll', {type: 'system'}); //todo: trigger loadedAll at some point
    this.SDG_PLACEMENT_REGISTERED = this.setup('placementRegistered', {type: 'system'});
    this.SDG_PLACEMENT_UNREGISTERED = this.setup('placementUnRegistered', {type: 'system'});
    this.SDG_PLACEMENT_CALLING = this.setup('placementCalling', {type: 'system'});
    this.SDG_PLACEMENT_DONE = this.setup('placementDone', {type: 'system'});
    this.SDG_ZONE_SET = this.setup('zoneSet', {type: 'system'});
    this.SDG_NEW_LOG_ENTRY = this.setup('newLogEntry', {type: 'system'});
    this.SDG_PLACEMENT_DELETED = this.setup('placementDeleted', {type: 'system'});
    this.SDG_AD_SERVER_MODULE_LOADED = this.setup('adServerModuleLoaded', {type: 'system'});
    this.SDG_ADP_MODULE_LOADED = this.setup('adpModuleLoaded', {type: 'system'});
    this.SDG_RTB_MODULE_LOADED = this.setup('rtbModuleLoaded', {type: 'system'});
    this.SDG_CONTENT_ELEMENT_LOADED = this.setup('contentElementLoaded', {type: 'system'});
    this.SDG_POSTSCRIBE_RESOURCE_LOADED = this.setup('postscribeResourceLoaded', {type: 'system'});
    this.isComplete = false;
};
getSDG()[getSDG().getSetup().SYSTEM.MODULES].EventDispatcher.prototype = {
    /**
     * Creates new Event and passes additional info to the event
     * @param {string} eventName - Name of event
     * @param additionalInfos - object with additional informations for the event
     * @returns {object}
     */
    setup: function (eventName, additionalInfos)
    {
        var event;
        if (getSDG().getUtil().getBrowserData().app != 'MSIE')
        {
            //normal version
            //noinspection JSCheckFunctionSignatures
            event = new CustomEvent(eventName, {
                detail: additionalInfos
            });
        } else
        {
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
    trigger: function (eventName, passedObject)
    {
        var emittingObject;
        var event = (!!getSDG().getEventDispatcher()[eventName]) ? getSDG().getEventDispatcher()[eventName] : undefined;
        if (event)
        {
            if (event.detail['type'] === 'position')
            {
                emittingObject = passedObject.getContainer();
                event.detail['passedObject'] = passedObject;
            }
            if (event.detail['type'] === 'system')
            {
                emittingObject = window;
                event.detail['passedObject'] = passedObject;
            }
            //getSDG().log('EVENTS: ' + eventName + ': fired on object %o passing %o ', getSDG().loglvl('DEBUG'), [emittingObject, passedObject]);
            emittingObject.dispatchEvent(event);
            event.detail['passedObject'] = '';
        } else
        {
            getSDG().log('EVENTS: Tried to trigger event ' + eventName + ' but event was not found!', getSDG().loglvl('ERROR'))
        }
    }
};
/**
 * Created by b.militzer on 18.11.2016.
 */
getSDG()[getSDG().getSetup().SYSTEM.MODULES].FormatContainer = {
    Controller: function () {
        this._formatConfig = {};
    },
    FormatObject: function (params) {
        this.name = params.name;
        this.sizes = (!!params.sizes) ? params.sizes : 'variable';
        this.callPosition = (!!params.usePositionForCall) ? params.usePositionForCall : 'variable';
        this.containerPosition = (!!params.usePositionForRender) ? params.usePositionForRender : 'variable';
        if (typeof params.blockedPositions !== 'undefined') {
            this.blockedPositions = params.blockedPositions;
            this.countBlockedPositions = params.blockedPositions.length + 1;
        }
        this.reponseParameters = {};
        this.startFormat = (typeof params.buildFormat === 'function') ? params.buildFormat : false;
        this.finishFormat = (typeof params.finishFormat === 'function') ? params.finishFormat : false;
    }
};
getSDG()[getSDG().getSetup().SYSTEM.MODULES].FormatContainer.Controller.prototype = {
    configureFormat: function (params) {
        this._formatConfig[params.name] = new SDG[getSDG().getSetup().SYSTEM.MODULES].FormatContainer.FormatObject(params)
    },
    allocateFormat: function (params) {
        var formatObject;
        if (!!params.adType) {
            formatObject = this.searchFormatConfig(params.adType);
            if (formatObject) {
                formatObject.reponseParameters = params;
                formatObject.markUsedPositions();
                this.checkFormatReponseCapabilities(formatObject);
            } else {
                getSDG().log('SYSTEM: FORMATS: A format that was delivered by the adserver was not preconfigured. AdType was reported as: ' + params.adType + '.', getSDG().loglvl('ERROR'));
            }
        } else {
            getSDG().log('SYSTEM: FORMATS: No name for format found, discarding impression. Passed parameters: %o', getSDG().loglvl('EMERGENCY'), [params]);
        }
    },
    checkFormatReponseCapabilities: function (formatObject) {
        if (!!formatObject.getReponseParameters().sdgJsonTemplate) {
            formatObject.setup()
        }
    },
    searchFormatConfig: function (formatName) {
        if (!!this._formatConfig[formatName]) {
            return this._formatConfig[formatName]
        } else {
            return false;
        }
    }
};
getSDG()[getSDG().getSetup().SYSTEM.MODULES].FormatContainer.FormatObject.prototype = {
    /**
     * tries to determine if the ad format needs the contentObject to be present on the site. If yes and the object is not present, it will delay the ad construction until the contentElementLoaded Event.
     * If the object is present, the data is passed to the ad constructor
     */
    setup: function () {
        var jsonData = this.getReponseParameters();
        if (!!jsonData.formatParams && jsonData.formatParams.contentObjectRequired && !getSDG().getPUB().getConfig().getContentObject()) {
            window.addEventListener('contentElementLoaded', function () {
                getSDG()[getSDG().getSetup().SYSTEM.ADTEMPLATES].startAdConstruction(this);
            });
            getSDG().log('SYSTEM: FORMATS: Ad construction for "' + jsonData.name + '" delayed until _contentObject is fully loaded!', getSDG().loglvl('NOTICE'));
        } else {
            getSDG()[getSDG().getSetup().SYSTEM.ADTEMPLATES].startAdConstruction(this);
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
    getContainerPlacement: function () {
        return getSDG().getCN().getPlacementByPosition(this.containerPosition);
    },
    getReponseParameters: function () {
        return this.reponseParameters;
    },
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
    }
};
getSDG()[getSDG().getSetup().SYSTEM.MODULES].StandardTargets = function () {

    this.collectBrowserData();
    this.collectFlashVersion();
    this.collectMetaKeys();
    this.collectUrlParameters();
    this.collectViewportDimensions();
    this.startTargetingPixels()

};

getSDG()[getSDG().getSetup().SYSTEM.MODULES].StandardTargets.prototype = {
    collectViewportDimensions: function () {
        var dim = getSDG().getUtil().getViewportDimensions();
        getSDG().getPUB().addKeyValue('viewportWidth', dim.width);
        getSDG().getPUB().addKeyValue('viewportHeight', dim.height);
    },
    collectFlashVersion: function () {
        var version = getSDG().getUtil().getFlashVersion().split(',').shift();
        getSDG().getPUB().addKeyValue('flashVersion', version);
    },
    collectBrowserData: function () {
        var browser = getSDG().getUtil().getBrowserData();
        getSDG().getPUB().addKeyValue('browserApp', browser.app.toLowerCase());
        getSDG().getPUB().addKeyValue('browserVersion', browser.version);
    },
    collectMetaKeys: function () {
        getSDG().getPUB().addKeywords(getSDG().getUtil().convertStringToKeywords(getSDG().getUtil().getMetaContent('keywords'), 6));
    },
    collectUrlParameters: function(){
        var url = window.location.href,
            result = [];
        if (url.indexOf('sdmad') >-1){
            result = url.match(/(?:sdmad)=(\w+)=(\w+)/);
            if (result !== null){
                getSDG().getPUB().addKeyValue(result[1], result[2]);
            }

        }
        if (url.indexOf('sdgkv') >-1){
            result = url.match(/(?:sdgkv)=(\w+)=(\w+)/);
            if (result !== null) {
                getSDG().getPUB().addKeyValue(result[1], result[2]);
            }
        }

    },
    startTargetingPixels: function () {
        var key, entry;
        for (key in getSDG().getPUB().getConfig()._targetingConfigs) {
            entry = getSDG().getPUB().getConfig()._targetingConfigs[key];
            if (entry.active) {
                if (!!entry.resourceName) {
                    this.buildTargetingModule(entry)
                } else {
                    this.fireSimplePixel(entry)
                }
            }
        }
    },
    buildTargetingModule: function (params) {
        if (!!params.functionName) {
            getSDG().getRes().set(getSDG().getSetup().RESOURCES[params.resourceName], function () {
                return new SDG[getSDG().getSetup().SYSTEM.MODULES][params.functionName](params);
            });
        }
    },
    buildSimplePixel: function (params) {
        if (!!params.pixelMedia) {
            params.url = params.url.replace("#{TIMESTAMP}", getSDG().getUtil().generateRandomNumberString(8));
            if (params.pixelMedia == 'script') {
                getSDG().getUtil().loadScript(params.url, document.querySelector(params.insertionQuery), function () {
                    getSDG().log('SYSTEM: RESOURCES: Script with url: %o added successfully to ' + params.insertionQuery + '.', getSDG().loglvl('INFO'), [params.url]);
                }, params.usePostscribe, params.useCrossOrigin);
            }
            if (params.pixelMedia == 'img') {
                var pixel = document.createElement('img');
                pixel.sec = params.url;
                getSDG().log('SYSTEM: RESOURCES: Pixel with url: %o added successfully to website.', getSDG().loglvl('INFO'), [params.url]);
            }
        }
    },
    fireSimplePixel: function (params) {
        var instance = this;
        if (!!params.loadPattern) {
            if (params.loadPattern == 'contentLoaded') {
                document.addEventListener('DOMContentLoaded', function () {
                    instance.buildSimplePixel(params);
                });
            }
            if (params.loadPattern == 'beforeLoadAll') {
                window.addEventListener('beforeLoadAll', function (e) {
                    instance.buildSimplePixel(params);
                });
            }
            if (params.loadPattern == 'atOnce') {
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
        link.href = '//cdn.stroeerdigitalgroup.de/metatag/libraries/infotool.css';
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
        var instance = this;
        this._logPanelNode = document.createElement('div');
        this._logPanelNode.id = 'sdgLogPanel';
        this._logPanelNode.className = 'sdgLogPanelCss';
        window.addEventListener('newLogEntry', function (e) {
            var entryContainer = document.createElement('span'),
                logEntry = e.detail.passedObject,
                entryMessage;
            //scrub %o placeholders from message and link to messageObjects
            if (logEntry._messageObjects.length > 0) {
                for (var i = 0; i < logEntry._messageObjects.length; i++) {
                    logEntry._message = logEntry._message.replace(/%o/, logEntry._messageObjects[i].toString())
                }
            }
            //Build message for logPanel
            entryMessage = document.createTextNode('' +
                logEntry._timeStamp.getHours() + ':' + logEntry._timeStamp.getMinutes() + ':' + logEntry._timeStamp.getSeconds() + ':' + logEntry._timeStamp.getMilliseconds() + ' - ' +
                getSDG().getCore().get(getSDG().getSetup().MODULES.LOGGER).getStringForLogLevel(logEntry._level) +
                ': ' +
                logEntry._message);
            entryContainer.className = 'sdgLogEntry';
            if (logEntry._level >= 50) {
                instance._errorCount++;
                instance._errorCounterNode.innerHTML = instance._errorCount;
                entryContainer.className += ' sdgLogError';
            }
            entryContainer.appendChild(entryMessage);
            entryContainer.appendChild(document.createElement("br"));
            instance._logPanelNode.appendChild(entryContainer);
        });
        return this._logPanelNode;
    },
    constructReportPanel: function () {
        var instance = this;
        this._reportPanelNode = document.createElement('div');
        this._reportPanelNode.id = 'sdgReportPanel';
        this._reportPanelNode.className = 'sdgReportPanelCss';
        this._reportTextArea = document.createElement('textarea');
        this._reportTextArea.className = 'sdgReportTextArea';
        this._reportPanelNode.appendChild(this._reportTextArea);

        this._reportTextArea.value += 'Time of page request: ' + (new Date().toGMTString()) + '\n';
        this._reportTextArea.value += 'Browser used: ' + getSDG().getUtil().getBrowserData().app + ' version: ' + getSDG().getUtil().getBrowserData().version + '\n';
        this._reportTextArea.value += 'Full URL: ' + getSDG().getUtil().getCurrentUrl() + '\n';
        window.addEventListener('placementRegistered', function (e) {
            var placement = e.detail.passedObject;
            instance._reportTextArea.value += 'position: ' + placement.position + ' registered, waiting for ad.\n';
        });
        window.addEventListener('placementUnRegistered', function (e) {
            var placement = e.detail.passedObject;
            instance._reportTextArea.value += 'position: ' + placement.position + ' deleted by user.\n';
        });
        window.addEventListener('placementCalling', function (e) {
            var placement = e.detail.passedObject;
            instance._reportTextArea.value += 'position: ' + placement.position + ' calling. Zone: ' + ((!!placement.localZone) ? placement.localZone : getSDG().getPUB().getConfig().getZone()) + ', Name: ' + placement.adServerName + ', Sizes: ' + placement.sizeParams.sizeArray.toString() + '\n';
        });
        window.addEventListener('placementDone', function (e) {
            var placement = e.detail.passedObject;
            instance._reportTextArea.value += 'position: ' + placement.position + ' finished. ID dump: ' + JSON.stringify(placement.systemIds) + ' \n';
        });
        return this._reportPanelNode;
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
        //this._logPanel.style.display = 'block';
    },
    deactiveSettingsPanel: function () {
        //this._logPanel.style.display = 'none';
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
            if (levelAsString.toUpperCase() === aLevelName)
            {
                lvl = levels[aLevelName];
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

            if(level >= 50){
                if (messageObjects.length == 0)
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
            if (!this.getPlacementByPosition(position)) //Position is not already registered, otherwise error
            {
                if (containerNode instanceof Node && containerNode.nodeType === 1) //Container is a valid element node and avaible on site, otherwise error
                {
                    //build placement and send placement to AdServer module to finish setup
                    placement = placementDirectory[position] =
                        new SDG[getSDG().getSetup().SYSTEM.MODULES].AdSlotController.Placement(position, containerNode);
                    this.getAdServer().finishPlacementConstruction(placement);

                    placement.sendPlacementRegisteredEvent();
                    return placement;
                } else
                {
                    getSDG().log('register(): container not found. Please make sure that you pass a valid element node.', getSDG().loglvl('CRITICAL'));
                    return null;
                }
            } else
            {
                getSDG().log('register(): Position: "' + position + '" already registered. To reuse position, use unregister first.', getSDG().loglvl('CRITICAL'));
                return null;
            }
        } else
        {
            getSDG().log('register(): Position: "' + position + '" not found in site configuration or system uses malformed configuration file. Please contact InteractiveMedia technical support.', getSDG().loglvl('CRITICAL'));
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
        deleteAd = (deleteAd == undefined) ? true : deleteAd;
        if (currentPlacement)
        {
            if (deleteAd)
            {
                currentPlacement.deletePlacementContent();
            }
            if (currentPlacement.deleteAdserverPlacement())
            {
                getSDG().getEventDispatcher().trigger('POSITION_DELETED', currentPlacement);
                getSDG().getEventDispatcher().trigger('SDG_PLACEMENT_UNREGISTERED', currentPlacement);
                delete this.getPlacements()[currentPlacement.position];
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
            var currentPlacement = placementDirectory[x];
            this.unregisterSlot(currentPlacement.position, deleteAd)
        }
    },
    /**
     * Will start the load process of  a single placement defined by position argument
     * @param {string} position - Contains the pre-configured position name. Correlates to an ad format name shorthandle, example: "sb" for "Superbanner".
     */
    loadSingleSlot: function (position) {
        this.getPlacementByPosition(position).load()
    },

    /**
     * Will start the process to enqueue and load several plaacements at once.
     *
     * @param {boolean} reloadAds - Will load any placements on the site if set to true (default), will load only unloaded placements if set to false.
     */
    loadMultipleSlots: function (reloadAds)
    {
        this.getAdServer().executeMutipleAdServerCalls(reloadAds);
    },
    /**
     *
     * @this IM.Controller
     * @param position
     */
    getPlacementByPosition: function (position)
    {
        var placementDirectory = this.getPlacements();
        for (var x in placementDirectory)
        {
            var currentPlacement = placementDirectory[x];
            if (currentPlacement.position === position)
            {
                return currentPlacement
            }
        }
        return false;
    },
    getPlacementByAdServerName: function (adServerName) {
        var placementDirectory = this.getPlacements(),
            currentPlacement;
        for (var x in placementDirectory) {
            currentPlacement = placementDirectory[x];
            if (currentPlacement.adServerName === adServerName) {
                return currentPlacement;
            }
        }
        return false;
    },
    /**
     *
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
            currentPlacement = placementDirectory[x];
            if (currentPlacement.sizeParams.sizeId === sizeId)
            {
                return currentPlacement.position;
            }
        }
        return false;
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
            currentPlacement = placementDirectory[x];
            if (currentPlacement.sizeParams.sizeId === sizeId)
            {
                return currentPlacement;
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
                currentPlacement = placementDirectory[x];
                if (currentPlacement.getContainer().id === containerId) {
                    return currentPlacement;
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
            counter++;
            if (placementDirectory[x].stats.loaded)
            {
                loaded++
            }
        }
        getSDG().log('Loaded ' + loaded + ' of ' + counter + ' positions.', getSDG().loglvl('DEBUG'));
        return [loaded, counter];
    },
    /**
     *
     * @this SDG.Controller
     * @param position
     */
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
     *
     *
     *
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
 *
 * @param position
 * @param container
 * @constructor
 */
getSDG()[getSDG().getSetup().SYSTEM.MODULES].AdSlotController.Placement = function (position, container)
{
    this.adServerName = '';
    this.containerElement = container;
    this.position = position;
    this.loadType = '';
    this.localZone = '';
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
        loadedOnRegister: false
    };
    this.sizeParams = {
        sizeString: parseFloat(this.getConfig().getValueForPosition(position, 'width')) + 'x' + parseFloat(this.getConfig().getValueForPosition(position, 'height')),
        sizeArray: [],
        width: parseFloat(this.getConfig().getValueForPosition(position, 'width')),
        height: parseFloat(this.getConfig().getValueForPosition(position, 'height'))
    };
    this.localAddons = {};

    if (container.className != '') {
        container.className = container.className + ' ';
    }
    container.className = container.className + 'sdgSlotContainer sdgSlotName-'+position;
    if(this.getConfig().getValueForPosition(position, 'cssContainerPreset')){
        getSDG().getUtil().addCssToHead('.sdgSlotName-'+position+'{'+this.getConfig().getValueForPosition(position, 'cssContainerPreset')+'}')
    }
};
/**
 *
 * @type {{globalAddons: {}, prepareNewAd: prepareNewAd, getAd: getAd, executeSeperateAdserverCall: executeSeperateAdserverCall, readyMultiAdServerCall: readyMultiAdServerCall, reloadDynamicPlacementVariables: reloadDynamicPlacementVariables, deleteAdserverPlacement: deleteAdserverPlacement, wrapInFriendlyIframe: wrapInFriendlyIframe, executePreCallSetup: executePreCallSetup, completeLoad: placementResponded, getContainer: getContainer, deletePlacementContent: deletePlacementContent, updatePlacementParameters: updatePlacementParameters, executeGlobalAddons: executeGlobalAddons, activateLocalAddons: activateLocalAddons, finalizeCall: finalizeCall, getSiteConfig: getConfig, getAdServer: getAdServer}}
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
    executeSingleAdserverCall: function ()
    {
        return this.getAdServer().executeSingleAdserverCall(this);
    },
    /**
     *
     *
     * this IM.Controller.Placement
     * @returns {boolean}
     */
    readyMultiAdServerCall: function ()
    {
        return this.getAdServer().executeMutipleAdServerCalls(this);
    },
    /**
     *
     * @this IM.Controller.Placement
     * @returns {boolean}
     */
    reloadDynamicPlacementVariables: function ()
    {
        this.adServerName = this.getAdServer().returnAdServerPlacementName(this);
        if (getSDG().getUtil().hasObjectKeys(getSDG().getPUB().getConfig().getValueForPosition(this.position, 'kvPreset'))) {
            getSDG().getUtil().transferParamKeysToObject(this.localTargeting, getSDG().getPUB().getConfig().getValueForPosition(this.position, 'kvPreset'));
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
     *
     *
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
        if (this.reloadDynamicPlacementVariables())
        {
            if (this.flags.activeFriendlyIframe)
            {
                this.wrapInFriendlyIframe();
            }
            return true;
        } else
        {
            getSDG().log(this.position + ': executePreCallSetup(): returned "false" while preparing call, placement was not loaded!', getSDG().loglvl('ERROR'));
            return false;
        }
    },
    /**
     *
     *
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
    deletePlacementContent: function ()
    {
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
                            this[x][y][v] = subkey[v];
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
        for (var x in this.localAddons)
        {
            var currentAddon = this.localAddons[x];
            currentAddon.activate.call(this);
        }
    },
    /**
     * Sends Event SDG_PLACEMENT_REGISTERED and POSITION_REGISTERED events
     */
    sendPlacementRegisteredEvent: function () {
        getSDG().getEventDispatcher().trigger('SDG_PLACEMENT_REGISTERED', this);
        getSDG().getEventDispatcher().trigger('POSITION_REGISTERED', this);
        getSDG().log(this.position + ': register successfull. Waiting for load commands.', getSDG().loglvl('DEBUG'));
    },
    /**
     * Sends Event POSITION_PREPARED, should be triggered by AdServer Module when the placement was prepared (all dynamic values updated) or is in the process of beeing prepared
     */
    sendPlacementPreparedEvent: function () {
        getSDG().getEventDispatcher().trigger('POSITION_PREPARED', this);
        getSDG().log(this.position + ': placement is prepared for call, dynamic values updated. ', getSDG().loglvl('DEBUG'));
    },
    /**
     * Sends Event POSITION_CALLING, should be triggered by AdServer Module when the placement is calling for an adserver response or is milliseconds away from starting the call
     */
    sendPlacementCallingEvent: function () {
        getSDG().getEventDispatcher().trigger('POSITION_CALLING', this);
        getSDG().getEventDispatcher().trigger('SDG_PLACEMENT_CALLING', this);
        getSDG().log(this.position + ': placement is now calling the adServer. ', getSDG().loglvl('DEBUG'));
    },
    /**
     * Sends Event POSITION_RESPONDED, should be triggered by AdServer Module when the placement receives an adserver response
     */
    sendPlacementRespondedEvent: function () {
        getSDG().getEventDispatcher().trigger('POSITION_RESPONDED', this);
        getSDG().log(this.position + ': placement has received an adServer response.', getSDG().loglvl('DEBUG'));
    },
    /**
     * Sends Event POSITION_DONE, should be triggered when the placements is done with everything (banner is rendered)
     */
    sendPlacementDoneEvent: function () {
        getSDG().getEventDispatcher().trigger('POSITION_DONE', this);
        getSDG().getEventDispatcher().trigger('SDG_PLACEMENT_DONE', this);
        getSDG().log(this.position + ': placement has finished call/response/rendering process.', getSDG().loglvl('DEBUG'));
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
        var zonePostfix;
        zonePostfix = (this.getConfig().getValueForPosition(this.position, 'zonePostfix') ? this.getConfig().getValueForPosition(this.position, 'zonePostfix') : '');
        if (this.localZone !== '') {
            return this.localZone + zonePostfix;
        } else {
            return this.getConfig().getZone() + zonePostfix;
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
            getSDG().log('SYSTEM: ' + this.position + ': Malformed key values passed to adslot!', getSDG().loglvl('WARNING'));
        }
        return this;
    },
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
                            getSDG().log(this.position + ': removeSizes(): size ' + sizeString + ' removed from placement.', getSDG().loglvl('NOTICE'));
                        }
                    }
                }
            }
        } else {
            getSDG().log(this.position + ': removeSizes(): The size to remove was not correctly passed, please consult the documentation and try again', getSDG().loglvl('ERROR'));
        }
        return this;
    },
    load: function () {
        if (this.executeSingleAdserverCall()) {
            this.stats.loaded = true;
        }
        return this;
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
        this._zone = zone;
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
        this._pageType = pageType;
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
                if (e.detail.passedObject.position === alternativeIndicator) {
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
        if (!!this.getCommonValue('adhesionUnit')) {
            adhesionUnitNode = document.querySelector(this.getCommonValue('adhesionUnit'));
            if (!!adhesionUnitNode) {
                return adhesionUnitNode
            } else {
                return false
            }
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
     * @return
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
            keywords.push(kw);
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
        if (typeof keyValues == 'object')
        {
            for (key in keyValues)
            {
                if (SDG.getUtil().isArray(keyValues[key]))
                {
                    for (i = 0, length = keyValues[key].length; i < length; i++)
                    {
                        this.addKeyValue(key, keyValues[key][i]);
                    }
                } else
                {
                    this.addKeyValue(key, keyValues[key]);
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
        if (typeof keyValues == 'object') {
            for (key in keyValues) {
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
        getSDG().getCore().get(getSDG().getSetup().MODULES.FORMAT_CONFIG).configureFormat(params)
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
    this._url = params.url;
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
        if (typeof json == 'object')
        {
            for (key in json)
            {
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
            if (!this._wLoaded && this._loadStatus === null)
            {
                instance = this;
                window.removeEventListener('load', instance.windowLoaded);
                this.loadAdpCore();
            }
        } else
        {
            getIM().getGT().log('Malformed ADP value given.', getIM().getGT().logLvl('WARNING'));
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
    var placements;
    this._url = params.url.replace("#{placements}", params.placements.toString());
    this._url = this._url.replace("#{TIMESTAMP}", getSDG().getUtil().generateRandomNumberString(8));
    this._sdiCookie = (params.sdiCookie) ? params.sdiCookie : false;
    this._sdiTargets = (params.sdiKeyValues) ? params.sdiKeyValues : false;
    this._loadStatus = 'loading';
    this._asciResponse = {};
    this.scriptNode = getSDG().getUtil().loadScript(this._url, document.querySelector(params.insertionQuery), function ()
    {
        var instance = getSDG().getRes().get(getSDG().getSetup().RESOURCES.AUDIENCE_SCIENCE);
        getSDG().log('SYSTEM: RESOURCES: ASCI-Pre-Qual-Tag: Core loaded as %o and atached to %o', getSDG().loglvl('DEBUG'), [instance.scriptNode, document.querySelector(params.insertionQuery)]);
        instance._loadStatus = 'loaded';
        if (typeof window.asiPlacements != "undefined")
        {
            for (var p in window.asiPlacements)
            {
                instance._asciResponse[p] = "";
                for (var key in window.asiPlacements[p].data)
                {
                    instance._asciResponse[p] += "PQ_" + p;
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
            var value = response[key];
            if (value !== "")
            {
                kvArr.push(value);
            }
        }
        if (kvArr.length > 0)
        {
            if (this._sdiTargets) {
                for (sdiKey in kvArr) {
                    getSDG().getPUB().addKeyValue(kvArr[sdiKey], 'T');
                    //SDM Workaround as long as PG campaigns are not switched to acutally using asiPlacements object, instead of the SDM workaround asiPlacementTmp
                    //yes I know, sucks, but will have to do for now.
                    window.asiPlacementsTmp = asiPlacements;
                    window.asiAdserverTmp = asiAdserver;
                }
            } else {
                getSDG().getPUB().addKeyValues({ascformats: kvArr});
            }

            getSDG().log('SYSTEM: RESOURCES: AudienceScience HeaderBidder has responded with avaible formats.', getSDG().loglvl('INFO'));
            if (this._sdiCookie) {
                if (typeof asiPlacements !== 'undefined') {
                    if (typeof asiAdserver !== 'undefined') {
                        asiPlacements.asiAdserver = asiAdserver;
                    }
                    sdiCookie = encodeURIComponent(JSON.stringify(asiPlacements));
                    SDM_head.ping('//cdn.stroeerdigitalmedia.de/Cookie?co=asgw&val=' + sdiCookie + '&m=10&cb=' + getSDG().getUtil().generateRandomNumberString(9));
                }
            }
        } else {
            getSDG().log('SYSTEM: RESOURCES: AudienceScience HeaderBidder has not responded or response does not contain formats', getSDG().loglvl('INFO'));
        }
        getSDG().log('SYSTEM: RESOURCES: AudienceScience HeaderBidder loaded and finished', getSDG().loglvl('DEBUG'));
    },
    globalAddon: {
        execute: function () {
            var currentPlacement = this;

        },
        remove: function () {

        }
    }
};

getSDG()[getSDG().getSetup().SYSTEM.MODULES].Meetrics = function (url) {
    this._url = url;
    this._loadStatus = 'loading';
    this.scriptNode = getSDG().getUtil().loadScript(this._url, document.getElementsByTagName('head')[0], function () {
        var instance = getSDG().getRes().get(getSDG().getSetup().RESOURCES.MEETRICS);
        getSDG().log('SYSTEM: MeetricsCore loaded as %o and attached to %o', getSDG().loglvl('NOTICE'), [instance.scriptNode, document.head]);
        instance._loadStatus = 'loaded';
        instance.finishMeetricsSetup.call(instance);
    });
};
getSDG()[getSDG().getSetup().SYSTEM.MODULES].Meetrics.prototype = {
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
                    window.de_meetrics["802358"].detect_ad(div.id);
                } catch (error) {
                    getSDG().log(currentPlacement.position + ': MEETRICS: error tracking visibility on %o , Meetrics failed to initialize with error %o', getSDG().loglvl('ERROR'), [div, error]);
                }
                getSDG().log(currentPlacement.position + ': MEETRICS: now tracking visibility on anchor element %o ', getSDG().loglvl('DEBUG'), [div]);
            } else {
                getSDG().log(currentPlacement.position + ': MEETRICS: flightId is null, possible empty slot response. Measurement canceled', getSDG().loglvl('ERROR'));
            }

        },
        remove: function () {
            var currentPlacement = this;
            //todo Funktion einfuegen um asynchrones Laden bzw Entfernen von Meetrics zu unterstuetzen
            getSDG().log(currentPlacement.position + ': Meetrics addon removed.', getSDG().loglvl('DEBUG'));
        }
    }
};
getSDG()[getSDG().getSetup().SYSTEM.MODULES].NuggAdDmp = function (params) {
    var instance = this;
    this._useMobile = !!(navigator.userAgent.match(/mobile/i));
    this._useTemplate = (this._useMobile) ? 'nuggAdMobile' : 'nuggAdDesktop';
    this._mbrMatch = (params.mbrMatch) ? params.mbrMatch : false;
    this._mbrId = (params.mbrId) ? params.mbrId : '';
    this._sdiCookie = (params.sdiCookie) ? params.sdiCookie : false;
    this._templateOptions = {
        domain: (this._useMobile) ? params.domainMobile : params.domainDesktop,
        customerId: (this._useMobile) ? params.customerIdMobile : params.customerIdDesktop,
        siteId: (params.siteId) ? params.siteId : '',
        siteUrl: encodeURIComponent(location.href),
        tags: '' //todo insert metacontent keywords
    };
    this._nuggTag = new SDG[getSDG().getSetup().SYSTEM.UTILITY].Template(getSDG().getPUB().getConfig().getTemplateForType(this._useTemplate)).render(this._templateOptions);
    getSDG().getUtil().loadScript(this._nuggTag, document.querySelector(params.insertionQuery), function () {
        instance.finishNuggAdSetup();

    }, params.usePostscribe, params.useCrossOrigin);
};
getSDG()[getSDG().getSetup().SYSTEM.MODULES].NuggAdDmp.prototype = {
    finishNuggAdSetup: function () {
        var
            nuggadKeyValuePairs = {},
            nuggArr,
            nuggKV,
            nuggSdiCookie,
            instance = this;
        if (navigator.userAgent.match(/mobile/i)) {
            window.nuggad.init({"rptn-url": this._templateOptions.domain}, function (api) {
                api.rc({
                    "nuggn": instance._templateOptions.customerId,
                    "nuggsid": instance._templateOptions.siteId,
                    "nuggtg": instance._templateOptions.tags,
                    "nuggios": true
                });
            });
        }
        if (typeof window.n_pbt !== 'undefined' && window.n_pbt !== '') {
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

SDG.ox_renderCreativeByUid = function (uid, oxEl, winEl) {
    return getSDG().getRes().get(getSDG().getSetup().RESOURCES.OPENX).renderCreativeByUid(uid, oxEl, winEl)
};
getSDG()[getSDG().getSetup().SYSTEM.MODULES].OpenX = function (params) {

    this._loadStatus = 'loading';
    /**
     * sub modul to interpret the bidresponse from openx by Klaus Fleck from openX
     * @type {{_bidsById: {}, _bidsBySize: {}, _bidsBySlotSize: {}, _bidsByName: {}, _bids: Array, Bid: bidmanager.Bid, createBid: bidmanager.createBid, createOrderedBidArray: bidmanager.createOrderedBidArray, addBidResponse: bidmanager.addBidResponse, getBids: bidmanager.getBids, getBidsBySize: bidmanager.getBidsBySize, getBidsById: bidmanager.getBidsById, getBidsBySlotName: bidmanager.getBidsBySlotName, getBidsBySlotSizes: bidmanager.getBidsBySlotSizes}}
     */
    this.bidmanager = {
        _bidsById: {},
        _bidsBySize: {},
        _bidsBySlotSize: {},
        _bidsByName: {},
        _bids: [],
        /**
         * constructor to save bid and creative data
         * @param statusCode
         * @constructor
         */
        Bid: function (statusCode) {
            var _bidId = getSDG().getRes().get(getSDG().getSetup().RESOURCES.OPENX).getUid();
            var _statusCode = statusCode || 0;

            this.key = 'oxb';
            this.width = 0;
            this.height = 0;
            this.statusMessage = _getStatus();
            this.uid = _bidId;
            this.ad_id = '';
            this.cpm = 0;
            this.ad = '';
            this.sizes = [];
            this.bucket = 0;
            this.name = "";
            this.used = false;

            /**
             * evaluates the cpm returned by openx and tranlate it into an actual price bucket, which in turn is used to cluster the reponse into meaningful keyvalues for the adserver
             * @param cpm
             * @returns {string}
             */
            this.getBucketFromCPM = function (cpm) {
                var price,
                    pubRev = (cpm * 1000),
                    pubRevOrMaxTier = Math.min(pubRev, 20000);

                // round round cpms < .025 up to .05
                if (pubRevOrMaxTier > 0 && pubRevOrMaxTier < 25) {
                    pubRevOrMaxTier = 25;
                }

                //if (pubRev < 1000) {// 5 cents to 1 dollar
                price = Math.round(pubRevOrMaxTier / 50) * 5;
                // } else if (pubRev < 5000) {// 10 cents up to 5 dollar
                // price = Math.round(pubRevOrMaxTier / 100) * 10;
                // } else {// 50 cent up to max
                // price = Math.round(pubRevOrMaxTier / 500) * 50;
                // }
                return price + "";
            };
            /**
             * translate bid statuscode into a readable string
             * @returns {*}
             * @private
             */
            function _getStatus() {
                switch (_statusCode) {
                    case 0:
                        return 'Pending';
                    case 1:
                        return 'Zero Bid';
                    case 2:
                        return 'Valid Bid';
                    case 3:
                        return 'Bid returned empty or error response';
                    case 4:
                        return 'Bid timed out';
                }
            }

            /**
             * public call for _getStatus
             * @returns {*|number}
             */
            this.getStatusCode = function () {
                return _statusCode;
            };
            /**
             * returns the slot/creative size as string
             * @returns {string}
             */
            this.getSize = function () {
                return this.width + 'x' + this.height;
            };
            this.getBidTargetParams = function (flagUsed) {
                var params = {};
                params[this.key] = this.bucket;
                params["ox_bidid"] = this.uid;
                if (typeof flagUsed !== "undefined") {
                    this.used = flagUsed;
                } else {
                    this.used = true;
                }
                return params
            };
            this.getTargetingString = function (flagUsed) {
                var sTargeting = "";
                //if(this.cpm > 0){
                //  sTargeting += "kf_test=true;" // use test line item
                // }
                sTargeting += this.key + "=" + this.bucket + ";";
                sTargeting += "ox_bidid" + "=" + this.uid + ";";
                if (typeof flagUsed !== "undefined") {
                    this.used = flagUsed;
                } else {
                    this.used = true;
                }
                return sTargeting;
            }
        },
        // Bid factory function.
        createBid: function (statusCode) {
            return new this.Bid(statusCode);
        },
        createOrderedBidArray: function (bidObj, key, newBid) {
            if (!bidObj[key]) {
                bidObj[key] = [];
                bidObj[key].push(newBid);
            }
            else {
                if (bidObj[key][0].cpm < newBid.cpm) {
                    bidObj[key] = [newBid].concat(bidObj[key]);
                } else {
                    bidObj[key].push(newBid);
                }
            }

        },
        addBidResponse: function (bidResponse) {
            var length = this._bids.length,
                curBid,
                bidSize;
            bidSize = bidResponse.size;
            bidResponse.bucket = bidSize + "_" + bidResponse.getBucketFromCPM(bidResponse.cpm);
            this._bids.push(bidResponse);
            curBid = this._bids[length];
            this._bidsById[bidResponse.uid] = curBid;
            this.createOrderedBidArray(this._bidsBySize, bidSize, curBid);
            if (!this._bidsByName[curBid.name]) {
                this._bidsByName[curBid.name] = curBid;
            }
            var slotSizes = curBid.sizes.sort().join(",");
            this.createOrderedBidArray(this._bidsBySlotSize, slotSizes, curBid);
        },
        getBids: function () {
            return this._bids;
        },
        getBidsBySize: function (size) {
            if (size && this._bidsBySize[size]) {
                // try to return highest unused bid
                var szArr = this.ox_filterArray(function (bid) {
                    return bid.used === false;
                }, this._bidsBySize[size]);
                if (szArr.length > 0) {
                    return szArr[0];
                }
            }
            return false;
        },
        getBidsById: function (id) {
            if (id) {
                return this._bidsById[id] || false;
            }
            return false;
        },
        getBidsBySlotName: function (name) {
            if (name) {
                return this._bidsByName[name] || false;
            }
            return false;
        },
        getBidsBySlotSizes: function (sizes) {
            if (sizes && this._bidsBySlotSize[sizes]) {
                // try to return highest unused bid
                var szArr = this.ox_filterArray(function (bid) {
                    return bid.used === false;
                }, this._bidsBySlotSize[sizes]);
                if (szArr.length > 0) {
                    return szArr[0];
                }
            }
            return false;
        }
    };
    this._params = params;
    this._adUnits = {};
    this._delDomain = params.config.delDomain;
    this._site = params.config.site;
    this._section = params.config.section;
    this._units = params.config.units;

    var units, unit, sizeString;
    if (this._params.config !== undefined) {
        if ((this._params.config.units && this._params.config.delDomain && this._params.config.site && this._params.config.section)) {
            units = this._params.config.units;
            for (var i = 0; i < units.length; i++) {
                unit = units[i];
                if (unit.auid && unit.name && unit.sizes) {
                    if (this._adUnits[unit.auid]) {
                        getSDG().log('SYSTEM: OPENX: configuration error - auid already exists!', getSDG().loglvl('ERROR'));
                        return;
                    }
                    sizeString = this.ox_getSlotSizeString(unit.sizes);
                    if (sizeString === "") {
                        getSDG().log('SYSTEM: OPENX: configuration error - invalid size array for auid ' + unit.auid, getSDG().loglvl('ERROR'));
                        return;
                    }
                    unit.sizeString = sizeString;
                    // create dictionary for lookup
                    this._adUnits[unit.auid] = unit;
                }
            }
            this._unitSizeArray = this.ox_getUniqueSizes(this._adUnits);
        } else {
            getSDG().log('SYSTEM: OPENX: configuration error - missing required parameters!', getSDG().loglvl('ERROR'));
            return;
        }

    } else {
        getSDG().log('SYSTEM: OPENX: configuration error - missing required parameters!', getSDG().loglvl('ERROR'));
        return;
    }


    this._bt = 1000;
    this._requestUrl = this.buildOpenXRequestUrl();
    SDG.OpenX = {
        callback: function (response) {
            getSDG().getRes().get(getSDG().getSetup().RESOURCES.OPENX).evaluateResponse(response);
        }
    };
    if (this._params.useDocumentWrite) {
        document.write('<script type="text/javascript" src="' + this._requestUrl + '"><\/script>')
    } else {
        this.scriptNode = getSDG().getUtil().loadScript(this._requestUrl, document.getElementsByTagName('head')[0], function () {
            var instance = getSDG().getRes().get(getSDG().getSetup().RESOURCES.OPENX);
            getSDG().log('SYSTEM: OpenX responded with bids: as %o and attached to %o', getSDG().loglvl('NOTICE'), [instance.scriptNode, document.head]);
            instance._loadStatus = 'loaded';
        });
    }

    this._ieVersion = (function () {
        if (window.ActiveXObject === undefined) {
            return null;
        }
        if (!document.querySelector) {
            return 7;
        }
        if (!document.addEventListener) {
            return 8;
        }
        if (!window.atob) {
            return 9;
        }
        if (!document.__proto__) {
            return 10;
        } // jshint ignore:line
        return 11;
    })();
};

getSDG()[getSDG().getSetup().SYSTEM.MODULES].OpenX.prototype = {
    _loadStatus: null,
    // ????????
    getUid: function () {
        var count = 0;
        count++;
        return count + Math.random().toString(16).substr(2);
    },
    buildOpenXRequestUrl: function () {
        var tws, p_url = "",
            p_ref = document.referrer,
            s = screen,
            w = window,
            ws = (window.innerWidth || document.documentElement.clientWidth) + "x" + (window.innerHeight || document.documentElement.clientHeight),
            ifr = (window.self !== window.top) ? 1 : 0,
            //rq_rand = this.getUid(),
            auid = "",
            aus = "",
            i,
            unit;
        if (ifr) {
            try {
                var body = window.top.document.getElementsByTagName('body')[0],
                    width = window.top.innerWidth || window.top.document.documentElement.clientWidth || window.top.document.getElementsByTagName('body')[0].clientWidth,
                    height = window.top.innerHeight || window.top.document.documentElement.clientHeight || window.top.document.getElementsByTagName('body')[0].clientHeight;
                tws = width + "x" + height;
            } catch (e) {
            }
        } else {
            tws = ws;
        }

        try {
            p_url = top.location.href;
        } catch (e) {
            try {
                p_url = parent.location.href;
            } catch (e) {
                p_url = document.location.href;
            }
        }

        try {
            p_ref = top.document.referrer;
        } catch (e) {
            try {
                p_ref = parent.document.referrer;
            } catch (e) {
            }
        }
        if (!p_ref && opener) {
            try {
                p_ref = opener.location.href;
            } catch (e) {
            }
        }
        var src = this._params.config.delDomain + "/w/1.0/acj?bc=sb_dyn&prf=1";

        // Add each ad unit ID
        for (i = 1; i < this._units.length; i++) {
            unit = this._units[i];
            auid += "%2C" + unit.auid;
            aus += "%7C" + unit.sizeString.replace(/,/g, "%2C");
        }
        if (this._units.length) {
            unit = this._units[0];
            src += "&auid=" + unit.auid + auid;
            src += "&aus=" + unit.sizeString.replace(/,/g, "%2C") + aus;
        }

        src += "&bt=" + this._bt + "&be=1&cc=1&ee=api_sync_write&ef=bt%2Cdb&callback=SDG.OpenX.callback&bs=" + this._params.config.site + "&c.sect=" + this._params.config.section;
        src += "&ju=" + encodeURIComponent(p_url); // jshint ignore:line
        src += "&jr=" + encodeURIComponent(p_ref); // jshint ignore:line
        src += "&res=" + s.width + "x" + s.height + "x" + s.colorDepth;
        //noinspection JSUnresolvedVariable
        src += "&ch=" + (document.charset || document.characterSet);
        src += "&tz=" + new Date().getTimezoneOffset();
        src += "&ifr=" + ifr;
        src += "&tws=" + tws;
        //debug_log("src: " + src);
        this._ox_start = new Date().getTime();
        return src;

    },
    object_keys: function (object) {
        var keys = [];
        if (Object.keys) {
            return Object.keys(object);
        }
        for (var key in object) {
            //noinspection JSUnresolvedFunction
            if (object.hasOwnProperty(key)) {
                keys.push(key);
            }
        }
        return keys;
    },
    object_length: function (object) {
        return this.object_keys(object).length;
    },
    ox_filterArray: function (filterfunc, mArr) {
        if (typeof filterfunc === "function") {
            if (mArr.filter) {
                return mArr.filter(filterfunc);
            }
            else { // needs testing
                var filtered = [];
                // convert length to number
                var len = +mArr.length || 0;
                if (len) {
                    for (var k = 0; k < len; ++k) {
                        // ensure element exists
                        if (k in mArr) {
                            // store element in case it gets modified
                            var el = mArr[k];
                            if (filterfunc.call(mArr, el, k, mArr)) {
                                filtered.push(el);
                            }
                        }
                    }
                }
                return filtered;
            }
        }
    },
    ox_getUniqueSizes: function (units) {
        var instance = this;

        function uniqSizeArray(szArray) {
            // dictionary lookup works, because we are dealing with strings only
            var seen = {};
            return instance.ox_filterArray(function (item) {
                return seen.hasOwnProperty(item) ? false : (seen[item] = true);
            }, szArray);
        }

        var i, el, szArr = [], oArr = this.object_keys(units);
        for (i = 0; i < oArr.length; i++) {
            el = units[oArr[i]];
            if (el && el.sizes) {
                szArr = szArr.concat(el.sizes);
            }
        }
        return uniqSizeArray(szArr.sort());
    },
    ox_isArray: (function () {
        if (Array.isArray) {
            return Array.isArray;
        }
        var objectToStringFn = Object.prototype.toString,
            arrayToStringResult = objectToStringFn.call([]);
        return function (subject) {
            return objectToStringFn.call(subject) === arrayToStringResult;
        };
    }()),
    ox_findInArray: function (key, mArr) {
        if (this.ox_isArray(mArr)) {
            if (!Array.prototype.indexOf) {
                mArr.indexOf = function (obj, fromIndex) {
                    if (fromIndex == null) {
                        fromIndex = 0;
                    } else if (fromIndex < 0) {
                        fromIndex = Math.max(0, this.length + fromIndex);
                    }
                    for (var i = fromIndex, j = this.length; i < j; i++) {
                        if (this[i] === obj)
                            return i;
                    }
                    return -1;
                };
            }
            return (mArr.indexOf(key) !== -1);
        }
    },
    ox_mapArray: function (mapfunc, mArr) {
        if (typeof mapfunc === "function") {
            if (mArr.map) {
                return mArr.map(mapfunc);
            }
            else {
                // convert length to number
                var len = +mArr.length || 0;
                if (len) {
                    var mapped = new Array(len);
                    for (var k = 0; k < len; ++k) {
                        // ensure element exists
                        if (k in mArr) {
                            // store element in case it gets modified
                            var el = mArr[k];
                            //mappedVal = mapfunc.call(mArr, el, k, mArr);
                            mapped[k] = mapfunc.call(mArr, el, k, mArr);
                        }
                    }
                }
                return mapped;
            }
        }
    },
    ox_getSlotSizeString: function (sizeArray) {
        var mapArray;
        if (this.ox_isArray(sizeArray)) {
            if (this.ox_isArray(sizeArray[0])) {
                // dfpFormat
                mapArray = this.ox_mapArray(function (el) {
                    if (el.length === 2 && Number(el[0]) && Number(el[1]))
                        return el.join('x');
                }, sizeArray);
            } else {
                // [width]x[height] format
                mapArray = this.ox_filterArray(function (el) {
                    if (el && el.indexOf("x")) {
                        var sArr = el.split("x");
                        if (sArr.length === 2 && Number(sArr[0]) && Number(sArr[1])) {
                            return true;
                        }
                    }
                }, sizeArray);
            }
            if (mapArray.length) {
                return mapArray.sort().join(",");
            }
        }
        return "";
    },
    createOxIframe: function (id, width, height, defParent) {
        if (typeof defParent === "undefined") {
            defParent = window;
        }
        var f = defParent.document.createElement('iframe');
        f.id = id || "ox_ifr_" + this.getUid();
        f.name = f.id;
        f.style.height = (height || 1) + "px"; //jshint ignore:line
        f.style.width = (width || 1) + "px"; //jshint ignore:line
        f.hspace = '0';
        f.vspace = '0';
        f.marginWidth = '0';
        f.marginHeight = '0';
        f.style.border = '0';
        f.style.padding = '0';
        f.scrolling = 'no';
        f.frameBorder = 'no';
        f.frameSpacing = '0';
        f.src = 'about:blank';
        return f;
    },
    makePDCall: function (pixelsUrl) {
        var pdFrame = this.createOxIframe("ox_pd_" + this.getUid());
        var rootNode = document.body;
        if (!rootNode) {
            return;
        }
        pdFrame.src = pixelsUrl;
        rootNode.appendChild(pdFrame);
    },
    renderCreativeByUid: function (uid, oxEl, winEl) { // jshint ignore:line
        var bid = this.bidmanager.getBidsById(uid);
        var ad = bid['ad'],
            frameHTML = "<!DOCTYPE html><html><head><title>OpenX Ad</title><base target='_blank'/><script>var inDapIF=inDapMgrIf=true;<\/script></head><body style='margin:0;padding:0'>" + ad + "</body></html>",
            ifrm,
            ifrmDoc,
            name = "ox_" + uid,
            cpTest,
            winDoc;
        if (!ad) {
            // debug_log('error - no creative found for ' + uid);
            return;
        }
        ad = ad.replace(/<!doctype html>/ig, "").replace(/<\/?(body|head)>/ig, "");
        // debug_log("rendering ad:\n" + ad);
        var size = bid.size,
            sz = size.split("x"),
            width = sz[0],
            height = sz[1];
        if (size === 'none') {
            // debug_log('error - size not found for uid' + uid);
            return;
        }
        ifrm = this.createOxIframe(name, width, height, winEl);
        if (!window.opera)
            oxEl.parentNode.replaceChild(ifrm, oxEl);
        if (!this._ieVersion && !window.opera) {
            try {
                ifrmDoc = ifrm.contentDocument || ifrm.contentWindow.document;
                if (ifrmDoc) {
                    ifrmDoc.open("text/html", "replace");
                    ifrmDoc.write(frameHTML);
                    ifrmDoc.close();
                }
            } catch (e) {
                // debug_log("error writing iframe");
            }
        } else {
            if (window.opera) {
                cpTest = frameHTML.replace(/type=['"]?(application|text)\/javascript['"]/ig, "").replace(/"/g, '\\"').replace(/:/g, "\\x3A");// jshint ignore:line
                cpTest = cpTest.replace(/\/script/g, "\\/script");
                ifrm.src = "javascript:document.open();document.write(" + '"' + cpTest + '")' + ";setTimeout('document.close()',5000)";
                oxEl.parentNode.replaceChild(ifrm, oxEl);
            } else {
                if (document.domain != location.hostname) {
                    ifrm.src = "javascript:var d=document.open();d.domain='" + document.domain + "';void(0);";
                }
                ifrm.contentWindow.contents = frameHTML;
                ifrm.src = 'javascript:window["contents"]';
                if (document.domain != location.hostname) {
                    ifrm.src = "javascript:setTimeout('document.close()',5000);";
                }
            }
        }
        try {
            winDoc = winEl.document;
            if (winDoc.defaultView && winDoc.defaultView.frameElement) {
                winDoc.defaultView.frameElement.width = width;
                winDoc.defaultView.frameElement.height = height;
            }
        }
        catch (e) {
        }
    },
    evaluateResponse: function (response) {
        var i;
        var units, oxunit;
        var adUnit, auid, ch, ads, au_size, sizeArray;
        var bidResponse;
        var ts, medium, pub_rev, recordPixel, OX_SBucket, restime = "", br;
        if (this._ox_start)
            restime = (new Date()).getTime() - this._ox_start;
        // debug_log("OX - processing bid responses");
        //noinspection JSUnresolvedVariable
        ads = response.ads;
        //noinspection JSUnresolvedVariable
        if (ads && ads.pixels) {
            //noinspection JSUnresolvedVariable
            this.makePDCall(ads.pixels);
        }
        //noinspection JSUnresolvedVariable
        units = ads.adunits;
        if (units) {
            for (i = 0; i < units.length; i++) {
                adUnit = units[i];
                auid = adUnit.auid;
                // invalid requests don't have an auid
                if (auid) {
                    // get matching oxunits
                    oxunit = this._adUnits[auid];
                    //noinspection JSUnresolvedVariable
                    ch = adUnit.chain[0];
                    //noinspection JSUnresolvedVariable
                    if (ch && ch.pub_rev) {
                        //noinspection JSUnresolvedVariable
                        pub_rev = Number(ch.pub_rev);
                        if (pub_rev > 0) {
                            bidResponse = this.bidmanager.createBid(2);
                        } else {
                            bidResponse = this.bidmanager.createBid(1);
                        }
                        bidResponse.sizes = oxunit.sizes;
                        bidResponse.name = oxunit.name;
                        bidResponse.time = restime;
                        bidResponse.ad_id = ch.ad_id;
                        bidResponse.cpm = pub_rev / 1000;
                        bidResponse.width = ch.width;
                        bidResponse.height = ch.height;
                        bidResponse.size = ch.width + "x" + ch.height;
                        //noinspection JSUnresolvedVariable
                        if (ch.auct_win_is_deal) {
                            bidResponse.pmp_ox = bidResponse.cpm;
                        }
                        //noinspection JSUnresolvedVariable
                        if (ch.deal_id) {
                            //noinspection JSUnresolvedVariable
                            bidResponse.ox_dealId = ch.deal_id;
                            //noinspection JSUnresolvedVariable
                            bidResponse.dealId = ch.deal_id;
                        }
                        //debug_log("OX - bidResponse: " + oxunit, bidResponse);

                        bidResponse.ad = ch.html;

                        // Add record/impression pixel to the creative HTML
                        //noinspection JSUnresolvedVariable
                        ts = ch.ts;
                        //noinspection JSUnresolvedVariable
                        medium = ads.medium;
                        if (ts) {
                            //noinspection JSUnresolvedVariable
                            recordPixel = ads.record_tmpl.replace("{medium}", ads.medium).replace("{txn_state}", ts).replace("{rtype}", "ri");
                        }

                        bidResponse.ad += '<div style="position:absolute;left:0;top:0;visibility:hidden;"><img src="' + recordPixel + '"></div>';

                        //bidResponse.adUrl = ch.ad_url;
                        var pubRevOrMaxTier = Math.min(pub_rev, 20000);
                        if (pubRevOrMaxTier > 0 && pubRevOrMaxTier < 25) {
                            pubRevOrMaxTier = 25;
                        }
                        OX_SBucket = ((restime > this._bt) ? "t" : "" + (Math.round(pubRevOrMaxTier / 50) * 5));

                        bidResponse.OX_SB = OX_SBucket;

                        this.bidmanager.addBidResponse(bidResponse);

                        if (this._ox_start && ts) {
                            br = ((restime > this._bt) ? "t" : "p");
                            var img = new Image(),
                                boBase = recordPixel.match(/([^?]+\/)ri\?/);
                            if (boBase) {
                                img.src = boBase[1] + "bo?auid=" + auid + "&bd=" + restime + "&br=" + br + "&bp=" + pub_rev + "&bt=" + this._bt + "&bs=" + this._params.config.site + "&ts=" + ts;
                            }
                        }
                    } else {
                        bidResponse = this.bidmanager.createBid(3);
                        bidResponse.sizes = oxunit.sizes;
                        bidResponse.name = oxunit.name;
                        if (this._ox_start) {
                            OX_SBucket = ((restime > this._bt) ? "t" : "0");
                        } else {
                            OX_SBucket = "0";
                        }
                        au_size = adUnit.size;
                        if (!au_size) {
                            au_size = oxunit.sizes[0];
                        }
                        sizeArray = au_size.split("x");
                        bidResponse.width = sizeArray[0];
                        bidResponse.height = sizeArray[1];
                        bidResponse.size = au_size;
                        bidResponse.OX_SB = OX_SBucket;
                        bidResponse.time = restime;
                        bidResponse.cpm = 0;
                        //debug_log("OX - bidResponse: " + oxunit, bidResponse);
                        this.bidmanager.addBidResponse(bidResponse);
                    }
                }
            }
        }
        this.sendBidDataToKeyValueStore();
    },
    sendBidDataToKeyValueStore: function () {
        var bidsArray = [],
            bidKeys,
            bidDetails;
        bidsArray = bidsArray.concat(this.bidmanager.getBids());
        if (bidsArray.length !== 0) {
            for (bidKeys in bidsArray) {
                bidDetails = bidsArray[bidKeys];
                if (!!bidDetails.uid) {
                    getSDG().getPUB().getConfig().addKeyValuePresetToPosition(bidDetails.name, bidDetails.getBidTargetParams())
                }
            }
        }
    }
};

getSDG()[getSDG().getSetup().SYSTEM.MODULES].Postscribe = function (options)
{
    this._loadStatus = 'loading';
    this._debugModus = (options.debug) ? true : false;
    this._commandQueue = [];
    this.scriptNode = getSDG().getUtil().loadScript(
        '//cdn.stroeerdigitalgroup.de/metatag/libraries/postscribe.min.js'
        , document.getElementsByTagName('head')[0], function ()
    {
        getSDG().getRes().get(getSDG().getSetup().RESOURCES.POSTSCRIBE)._loadStatus = 'loaded';
        getSDG().getEventDispatcher().trigger('SDG_POSTSCRIBE_RESOURCE_LOADED');
        document.addEventListener('DOMContentLoaded', function () {
            getSDG().getRes().get(getSDG().getSetup().RESOURCES.POSTSCRIBE).startQueue()
        });
    }, false, false);
};
getSDG()[getSDG().getSetup().SYSTEM.MODULES].Postscribe.prototype = {

    parse: function (functionToCall) {
        if (this._loadStatus != 'loaded') {
            this._commandQueue.push(functionToCall)
        } else {
            functionToCall()
        }
    },
    startQueue: function () {
        this._commandQueue.forEach(function (functionToExecute) {
            functionToExecute()
        })
    }

};
getSDG()[getSDG().getSetup().SYSTEM.MODULES].Remintrex = function (params) {

    this._url = params.url;
    this._networkId = params.network;
    this._accountId = params.accountId;
    this._pageType = params.pageType;
    this._insertionQuery = params.insertionQuery;
    this._usePostscribe = params.usePostscribe;
    this._useCrossOrigin = params.useCrossOrigin;
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

getSDG()[getSDG().getSetup().SYSTEM.MODULES].XaxisFooterBidder = function (params) {

    this._url = params.url;
    this._insertionQuery = params.insertionQuery;
    this._usePostscribe = params.usePostscribe;
    this._useCrossOrigin = params.useCrossOrigin;
    this._placementId = params.placementID;
    this._segementUri = params.segmentUri;
    this._type = params.type;
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
    /**
     * Gets the first key for an element from an object if contained, false
     * otherwise.
     *
     * @param {Object} anObject - a object
     * @param {Object.<String>} anElement
     * @return {String||boolean}
     */
    getKeyForElementFromObject: function (anObject, anElement)
    {
        var foundKey = false,
            aKey;
        for (aKey in anObject)
        {
            if (anObject[aKey] === anElement)
            {
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
    isArray: Array.isArray || function (obj)
    {
        return Object.prototype.toString.call(obj) === '[object Array]';
    },
    /**
     * Checks if given array haystack contains needle.
     *
     * @param {Array} haystack
     * @param needle
     * @return {Boolean}
     */
    inArray: function (haystack, needle)
    {
        if (!this.isArray(haystack))
        {
            throw {
                name: 'InvalidArgumentException',
                message: '"' + haystack + '" is not an array.'
            };
        }
        if (!('indexOf' in Array.prototype))
        {
            Array.prototype.indexOf = function (find, i /*opt*/)
            {
                if (i === undefined)
                {
                    i = 0;
                }
                if (i < 0)
                {
                    i += this.length;
                }
                if (i < 0)
                {
                    i = 0;
                }
                for (var n = this.length; i < n; i++)
                {
                    if (i in this && this[i] === find)
                    {
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
    generateRandomNumberString: function (length)
    {
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
     * Recursively merge properties of two objects
     *
     * @param {Object} obj1
     * @param {Object} obj2
     * @return {Object}
     */
    mergeRecursive: function (obj1, obj2)
    {
        var p;
        for (p in obj2)
        {
            // Property in destination object set; update its value.
            if (obj2[p].constructor === Object)
            {
                if (!obj1[p])
                {
                    obj1[p] = {};
                }
                obj1[p] = this.mergeRecursive(obj1[p], obj2[p]);
            } else
            {
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
            if (imMeta[i].getAttribute("name") == metaName) {
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
            if (typeof maxKeywords == 'number') {
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
    getKeysFromObject: Object.keys || function (anObject)
    {
        var keys = [],
            aKey;
        for (aKey in anObject)
        {
            if (anObject.hasOwnProperty(aKey))
            {
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
        if (typeof params == 'object') {
            for (key in params) {
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
    removeLineBreaks: function (string)
    {
        return string.replace(/(\r|\n)/g, '');
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
            return new ActiveXObject('ShockwaveFlash.ShockwaveFlash').GetVariable('$version').replace(/\D+/g, ',').match(/^,?(.+),?$/)[1];
        } catch (e) {
            try {
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
    loadScript: function (url, obj, callback, usePostscribe, useCrossOrigin)
    {
        var script = document.createElement("script"),
            rdnNum = getSDG().getUtil().generateRandomNumberString(12);
        usePostscribe = (usePostscribe !== undefined) ? usePostscribe : false;
        useCrossOrigin = (useCrossOrigin !== undefined) ? useCrossOrigin : false;
        script.type = "text/javascript";
        script.src = url;
        script.id = rdnNum;
        if (usePostscribe)
        {
            script.dataset.usedPostscribe = "true";
            if (useCrossOrigin) {
                script.crossOrigin = true;
            }
            getSDG().getRes().get(getSDG().getSetup().RESOURCES.POSTSCRIBE).parse(function () {
                getSDG().getRes().get(getSDG().getSetup().RESOURCES.POSTSCRIBE).postscribe(obj, script.outerHTML, {done: callback});
            });


        } else
        {
            if (script.readyState)
            {
                script.onreadystatechange = function ()
                {
                    if (script.readyState == "loaded" || script.readyState == "complete")
                    {
                        script.onreadystatechange = null;
                        if (typeof callback === 'function')
                        {
                            callback();
                        }
                    }
                }
            } else
            {
                script.onload = function ()
                {
                    if (typeof callback === 'function')
                    {
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
     * @returns {Array.<T>|string|Buffer|Blob|ArrayBuffer}
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
            if (ablage != null) {
                return {
                    app: 'Opera',
                    version: (parseFloat(ablage[2]) || '')
                }
            }
        }
        data = data[2] ? [data[1], data[2]] : [navigator.appName, navigator.appVersion, '-?'];
        if ((ablage = userAgent.match(/version\/(\d+)/i)) != null) {
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
        for (var i = objectNodes.length - 1; objectNodes.length != 0; i--) {
            object.removeChild(objectNodes[i]);
        }
    },
    /**
     * @class Convenience class to merge placeholders into a template string.
     * @author Joerg Basedow <jbasedow@mindworks.de>
     * @constructor
     * @param {String} template
     */
    Template: function (template)
    {
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
    render: function (placeholders)
    {
        var instance = this;
        placeholders = placeholders || {};
        return this._template.replace(
            /#\{([^{}]*)\}/gi,
            function (completeMatch, placeholderName)
            {
                return instance.cleanPlaceholder(placeholders[placeholderName]);
            }
        );
    },
    isValidPlaceholder: function (placeholder)
    {
        return getSDG().getUtil().inArray(['string', 'number'], typeof placeholder);
    },
    /**
     * Make a placeholder an empty string, if it is not a string or a number.
     *
     * @param placeholder
     * @return {String}
     */
    cleanPlaceholder: function (placeholder)
    {
        if (!this.isValidPlaceholder(placeholder))
        {
            placeholder = '';
        }
        return String(placeholder);
    }
};