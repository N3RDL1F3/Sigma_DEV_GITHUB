console.log("[DEBUG] Meta-Tag Started");
window.SDG = {
    Setup: {
        PROTOCOLS: {
            HTTP: 'http',
            HTTPS: 'https'
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
            TAGMAN_CONVERTER: 'tagManConverter'
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
            AUDIENCE_SCIENCE: 'audienceScience',
            MEETRICS: 'meetrics'
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
     * @returns {null|MW.ServiceContainer|*}
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
    }
};
window.getSDG = function ()
{
    return SDG;
};
SDG[getSDG().getSetup().SYSTEM.MODULES] = {};
SDG[getSDG().getSetup().SYSTEM.RESOURCES] = {};


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
     * @param {mixed} obj
     * @return {Boolean}
     */
    isArray: Array.isArray || function (obj)
    {
        return Object.prototype.toString.call(obj) === '[object Array]';
    },
    /**
     * Checks if given haystack contains needle.
     *
     * @param {Array} haystack
     * @param {mixed} needle
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
     * Gets all keys from an object. Aliases native method if available.
     *
     * @param {Object.<String, mixed>} anObject
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
     * Loads a script by placing it into a given HTML object. The user can specify if the script should be parsed by postscribe (will prevent document.write() in external script) or if the script should be loaded directly onto the page, without any protection against document.write.
     *
     * @param url {String} - the url of the script
     * @param obj {object} - the object to which the script will be appended
     * @param usePostscribe {boolean} - should the script be parsed by postscribe before it is appended to the page?
     * @param callback {function} -  a callback function, executed as soon as the script is loaded.
     */
    loadAsynchronousScript: function (url, obj, callback, usePostscribe)
    {
        var script = document.createElement("script"),
            rdnNum = getSDG().getUtil().generateRandomNumberString(12);
        usePostscribe = (usePostscribe !== undefined) ? usePostscribe : false;
        script.type = "text/javascript";
        script.src = url;
        script.id = rdnNum;
        if (usePostscribe)
        {
            script.dataset.usedPostscribe = "true";
            if (getSDG().getRes().get(getSDG().Configuration.RESOURCES.POSTSCRIBE).loadStatus !== 'loaded')
            {
                document.addEventListener(getSDG().getEventDispatcher().SDG_POSTSCRIBE_RESOURCE_LOADED.type, function ()
                {
                    getSDG().getRes().get(getSDG().Configuration.RESOURCES.POSTSCRIBE).postscribe(obj, script.outerHTML, {done: callback});
                })
            } else
            {
                getSDG().getRes().get(getSDG().Configuration.RESOURCES.POSTSCRIBE).postscribe(obj, script.outerHTML, {done: callback});
            }
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
     * @param {mixed} placeholder
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
    this._loadSlotNumber = (!!parseFloat(this._config.getCommonValue('reservedAdSlots'))) ? parseFloat(this._config.getCommonValue('reservedAdSlots')) + 1 : 1;
    this._defaultTagTemplate = 'addyn';
    this.createAdserverTag = function (placement)
    {
        var position = placement.position,
            params = {
                protocol: this._config.getProtocol(),
                host: this._config.getCommonValue('host'),
                version: '3.0',
                networkId: this._config.getCommonValue('networkId'),
                fallbackPlacement: this._config.getValueForPosition(position, 'fallback'),
                size: this._config.getValueForPosition(position, 'size'),
                width: this._config.getValueForPosition(position, 'width'),
                height: this._config.getValueForPosition(position, 'height'),
                alias: this.returnAdServerPlacementName(position),
                group: this._config.getGroup(),
                custom: this.getKeywordString() + this.getKeyValueString(),
                misc: SDG.getUtil().generateRandomNumberString(this._config.getCommonValue('miscLength'))
            };
        return new SDG[getSDG().getSetup().SYSTEM.UTILITY].Template(this._config.getTemplateForType(placement.tagTemplateType)).render(params);
    };
    this.writeSynchronousTag = function (tagString, callback)
    {
        document.write('<script src="' + tagString + '" type="text/javascript"><\/script>');
        if (typeof callback === 'function')
        {
            callback()
        }
    };
    this.executeMultiAdserverCall = function ()
    {
        getSDG().log('SYSTEM: AdServerAdapter:  executeMultiAdserverCall() not set in new adServer module. Module will not work properly', getSDG().loglvl('ALERT'));
    };
    this.setPlacementAsynchron = function (placement)
    {
        getSDG().log('SYSTEM: AdServerAdapter:  setPlacementAsynchron() not set in new adServer module. Module will not work properly', getSDG().loglvl('ALERT'), placement);
    };
    this.wrapInFriendlyIframe = function (placement)
    {
        getSDG().log('SYSTEM: AdServerAdapter:  wrapInFriendlyIframe() not set in new adServer module. Module will not work properly', getSDG().loglvl('ALERT'), placement);
    };
};
getSDG()[getSDG().getSetup().SYSTEM.MODULES].AdTechIQAdServer.prototype = {
    /**
     * Generate ad call name from current configuration for given position.
     *
     * @param {String} position
     * @return {String}
     */
    returnAdServerPlacementName: function (position)
    {
        var alias = this._config.getCommonValue('name') +
            '_' + this._config.getZone() +
            '_' + this._config.getPageType() +
            '_' + position;
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
        var loadType = this._config.getValueForPosition(placement.position, 'tagType');
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
    getKeywordString: function ()
    {
        var kwString = '';
        if (this._config.getKeywords().length)
        {
            kwString = 'key=' + this._config.getKeywords().join('+') + ';';
        }
        return kwString;
    },
    getKeyValueString: function ()
    {
        var
            kvString = '',
            kv = this._config.getKeyValues(),
            key;
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
    executeSeperateAdserverCall: function (placement)
    {
        var tagString = this.createAdserverTag(placement);
        if (!placement.flags.activeAsyncModule && (document.readyState !== 'interactive' && document.readyState !== 'complete'))
        {
            this.writeSynchronousTag(tagString, function ()
            {
                placement.completeLoad();
            }, false, true);
        } else
        {
            getSDG().getUtil().loadAsynchronousScript(tagString, placement.getContainer(), function ()
            {
                placement.completeLoad();
            }, true, true);
        }
        if (placement.flags.activeFriendlyIframe)
        {
            //todo evaluate if friendlyiframe is still needed
            // this.buildFriendlyIframe(placement.getContainer(), tagString)
        } else
        {
        }
        return true;
    },
    /**
     * Will start the load process for mutiple placements defined by position argument
     *
     *
     * @param {boolean} reloadAds - Will load any placements on the site if set to true (default), will load only unloaded placements if set to false.
     */
    loadMultiplePositions: function (reloadAds) {
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
                    getSDG().log(readyPlacements[y] + ': Load command received, adserver call in progress.', getSDG().loglvl('Info'));
                    getSDG().getEventDispatcher().trigger('POSITION_CALLING', currentPlacement);
                    currentPlacement.stats.loaded = true;
                    getSDG().getUtil().loadAsynchronousScript(this.createAdserverTag(currentPlacement), currentPlacement.getContainer(), function () {
                        //todo fix mutable variable
                        currentPlacement.completeLoad();
                    }, true, true);
                }
            }
        }
    },
    readyMultiAdServerCall: function (placement) {
        getSDG().log('SYSTEM: AdServerAdapter:  readyMultiAdServerCall() not set in AOl ONE adServer module. Function is not needed.', getSDG().loglvl('INFO'), placement);
        return true;
    },
    deleteAdserverPlacement: function (placement) {
        getSDG().log('SYSTEM: AdServerAdapter:  deleteAdserverPlacement() not set in new adServer module. Module will not work properly', getSDG().loglvl('ALERT'), placement);
        return true;
    }
};
/**
 * @class Name space for ad server adapters.
 */
getSDG()[getSDG().getSetup().SYSTEM.MODULES].GoogleDfp = function (config, gptParameters) {

    //initialize googletag command queue
    window.googletag = window.googletag || {};
    window.googletag.cmd = window.googletag.cmd || [];

    //insert GPT scripte to head
    var scriptAnchor = document.getElementsByTagName('head')[0];
    getSDG().getUtil().loadAsynchronousScript('//www.googletagservices.com/tag/js/gpt.js', scriptAnchor, function () {
        getSDG().log('SYSTEM: Google Publisher Tag loaded and attached to %o', getSDG().loglvl('INFO'), [scriptAnchor]);
    }, false);

    //decide which tagVersion to use
    if (gptParameters) {
        if (typeof gptParameters.useSynchronTags !== 'undefined') {
            this._gptUseSynchronTags = gptParameters.useSynchronTags
        }
        if (typeof  gptParameters.useSingleRequest !== 'undefined') {
            this._gptUseSingleRequest = gptParameters.useSingleRequest
        }
    }
    //Send commands for tagVersion
    window.googletag.cmd.push(function () {
        var instance = this;
        if (instance._gptUseSingleRequest) {
            window.googletag.pubads().enableSingleRequest();
        }
        if (instance._gptUseSynchronTags) {
            window.googletag.pubads().enableSyncRendering();
        } else {
            window.googletag.pubads().enableAsyncRendering();
        }
    });
    this._config = config;
    this._defaultLoadType = 'standardGpt';
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
                placement.gptSlot = window.googletag.defineSlot(getSDG().getPUB().getAdServer().returnDfpPath(placement), placement.sizeParams.sizeArray, placement.getContainer().id).addService(window.googletag.pubads());
            });
            getSDG().log(placement.position + ': register(): placement set up as standard DFP GPT.', getSDG().loglvl('DEBUG'));
        },
        outOfPageGpt: function (placement) {
            placement.loadType = 'outOfPageGpt';
            window.googletag.cmd.push(function () {
                placement.gptSlot = window.googletag.defineOutOfPageSlot(getSDG().getPUB().getAdServer().returnDfpPath(placement), placement.getContainer().id).addService(window.googletag.pubads());
            });
            getSDG().log(placement.position + ': register(): placement set up as OutOfPage DFP GPT.', getSDG().loglvl('DEBUG'));
        }
    };
    this._loadSlotNumber = (!!parseFloat(this._config.getCommonValue('reservedAdSlots'))) ? parseFloat(this._config.getCommonValue('reservedAdSlots')) + 1 : 1;
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
            '/' + this._config.getCommonValue('name') +
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
            getSDG().log('SYSTEM: AdServerAdapter:  Generated alias "' + placementName + '" is longer that 128 chars.', getSDG().loglvl('ALERT'));
        }
        return placementName;
    },
    /**
     * Populates the placement created by register() with adserver specific values and parameters.
     *
     * @param placement
     */
    finishPlacementConstruction: function (placement) {
        var loadType = (this._config.getValueForPosition(placement.position, 'tagType')) ? this._config.getValueForPosition(placement.position, 'tagType') : this._defaultLoadType;
        //if container does not have an id, create one. Needed for GPT identifier
        placement.adServerName = this.returnAdServerPlacementName(placement);
        if (!placement.getContainer().id) {
            placement.getContainer().id = placement.adServerName;
        }
        //create GPT sizeArrays
        if (typeof this._config.getValueForPosition(placement.position, 'altSizes') !== 'undefined') {
            placement.sizeParams.altSizes = this._config.getValueForPosition(placement.position, 'altSizes')
        }
        placement.sizeParams.sizeArray = [[placement.sizeParams.width, placement.sizeParams.height]];
        placement.sizeParams.altSizes.forEach(function (value, index, wholeArray) {
            placement.sizeParams.sizeArray.push(value);
        });

        if (!parseFloat(this._config.getValueForPosition(placement.position, 'sequenceSlot'))) {
            placement.sequenceSlot = this._loadSlotNumber;
            this._loadSlotNumber++;
        } else {
            parseFloat(this._config.getValueForPosition(placement.position, 'sequenceSlot'))
        }
        //if pubad services are not started yet, do it.
        if (!window.googletag.pubadsReady) {
            //setup all async GPT placements up to be reloaded multiple times at will of the publisher
            if (!this._gptUseSynchronTags) {
                window.googletag.cmd.push(function () {
                    window.googletag.pubads().disableInitialLoad();
                });
            }
            //attach event to call for each rendered GPT Slot
            window.googletag.cmd.push(function () {
                window.googletag.pubads().addEventListener('slotRenderEnded', function (event) {
                    getSDG().log('SYSTEM: GPT slotRenderEnded Event fired: %o.', getSDG().loglvl('DEBUG'), [event]);
                    if (typeof getSDG().getCN().getPlacementByContainerId(event.slot.getSlotElementId()) !== 'undefined') {
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
            //pass targeting to GPT and if successfull activate GPT pubads services
            if (this.sendGlobalTargetingToGpt()) {
                window.googletag.cmd.push(function () {
                    window.googletag.enableServices();
                });
            }
        }
        //check if a tagType has to be used otherwise do nothing
        if (loadType !== undefined && !!this._loadTypes[loadType]) {
            this._loadTypes[loadType].call(this, placement);
        }
    },
    /**
     * Get the current keyValue targetings from MetaTag and send it to GPT in their format
     */
    sendGlobalTargetingToGpt: function () {
        var targetingKey, targetingSet;
        for (targetingKey in this._config.getKeyValues()) {
            targetingSet = this._config.getKeyValues()[targetingKey];
            if (typeof targetingKey === 'string' && targetingSet instanceof Array) {
                window.googletag.cmd.push(function () {
                    window.googletag.pubads().setTargeting(targetingKey, targetingSet)
                });
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
    executeSeperateAdserverCall: function (placement) {
        getSDG().log(placement.position + ': Load command received, adserver call in progress.', getSDG().loglvl('Info'));
        for (var key in placement.localTargeting) {
            if (placement.localTargeting.hasOwnProperty(key)) {
                window.googletag.cmd.push(function () {
                    placement.gptSlot.setTargeting(key, placement.localTargeting[key])
                });
            }
        }
        window.googletag.cmd.push(function () {
            window.googletag.display(placement.getContainer().id);
        });
        if (!this._gptUseSynchronTags) {
            window.googletag.cmd.push(function () {
                window.googletag.pubads().refresh([placement.gptSlot], {changeCorrelator: !!(placement.stats.loaded)})
            });
        }
        placement.completeLoad();
        return true;
    },
    /**
     * Will start the load process for mutiple placements defined by position argument
     *
     *
     * @param {boolean} reloadAds - Will load any placements on the site if set to true (default), will load only unloaded placements if set to false.
     */
    loadMultiplePositions: function (reloadAds) {
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
                    getSDG().log(readyPlacements[y] + ': Load command received, adserver call in progress.', getSDG().loglvl('Info'));
                    getSDG().getEventDispatcher().trigger('POSITION_CALLING', currentPlacement);
                    currentPlacement.stats.loaded = true;
                    this.executeSeperateAdserverCall(currentPlacement)
                }
            }
        }
    },
    getAdgetAdCallHtml: function (position, templateType) {
        getSDG().log('SYSTEM: AdServerAdapter:  getAdgetAdCallHtml() not set in DFP adServer module. Function is not needed.', getSDG().loglvl('INFO'), [position, templateType]);
        return true;
    },
    readyMultiAdServerCall: function (placement) {
        getSDG().log('SYSTEM: AdServerAdapter:  readyMultiAdServerCall() not set in DFP adServer module. Function is not needed.', getSDG().loglvl('INFO'), placement);
        return true;
    },
    deleteAdserverPlacement: function (placement) {
        window.googletag.cmd.push(function () {
            window.googletag.destroySlots([placement.gptSlot]);
        });
        return true;
    }
};
getSDG()[getSDG().getSetup().SYSTEM.MODULES].Advertisment = function (anchor, json) {
    this.jsonData = (!!json) ? json : null;
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
    getJson: function () {
        if (!!this.jsonData) {
            return this.jsonData;
        } else {
            return false;
        }
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
        eventsActive: false,
        /**
         * Ref
         *
         *
         * @param stickObj
         * @param referenceObject (object) Reference Object has to "touch" stickyObj during initial setup to be a viable reference!
         * @constructor
         */
        StickyInstance: function (stickObj, referenceObject) {
            this.active = true;
            this.stickyObject = stickObj;
            this.refObj = referenceObject;
            this.startTop = 0;
            this.endTop = 40000;
            this.objOrgStyleTop = (this.stickyObject.style.top != '') ? parseFloat(this.stickyObject.style.top) : 0;
            this.objOrgStyleLeft = (this.stickyObject.style.left != '') ? parseFloat(this.stickyObject.style.left) : 0;
            this.objOrgStylePosition = this.stickyObject.style.position;
            this.objOrgPosTop = getSDG().getUtil().getPos(this.stickyObject).top;
            this.objOrgPosLeft = getSDG().getUtil().getPos(this.stickyObject).left;
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
                    if (this.currentStickies[instance.resObj.nodeName + '-' + instance.resObj.id].objOrgStyleLeft) {
                        this.currentStickies[instance.resObj.nodeName + '-' + instance.resObj.id].objOrgStyleLeft = -parseFloat(instance.resObj.style.width);
                    }
                } else {
                    instance.resObj.style.width = this.currentViewportWidth - getSDG().getUtil().getPos(instance.refObj).left - getSDG().getUtil().getObjDim(instance.refObj).width + 'px';
                }
            } else if (instance.resObj.style.position == 'fixed') {
                if (instance.recalcLeft) {
                    instance.resObj.style.width = getSDG().getUtil().getPos(instance.refObj).left + 'px';
                    if (this.currentStickies[instance.resObj.nodeName + '-' + instance.resObj.id].objOrgStyleLeft) {
                        this.currentStickies[instance.resObj.nodeName + '-' + instance.resObj.id].objOrgStyleLeft = -getSDG().getUtil().getPos(instance.refObj).left;
                    }
                } else {
                    instance.resObj.style.width = this.currentViewportWidth - getSDG().getUtil().getPos(instance.refObj).left - getSDG().getUtil().getObjDim(instance.refObj).width + 'px';
                }
            }
        },
        calculateSticky: function (instance) {
            var scrollTop = this.currentScrollTop;
            var scrollLeft = this.currentScrollleft;
            if (instance.active) {
                if (instance.objOrgPosTop - scrollTop <= 0 && instance.stickyObject.style.position != 'fixed' && scrollTop >= instance.startTop) {
                    instance.stickyObject.style.position = 'fixed';
                    instance.stickyObject.style.left = instance.objOrgPosLeft + 'px';
                    instance.stickyObject.style.top = '0px';
                }
                if ((instance.objOrgPosTop - scrollTop >= 0 || scrollTop >= instance.endTop) && instance.stickyObject.style.position == 'fixed') {
                    instance.stickyObject.style.position = instance.objOrgStylePosition;
                    instance.stickyObject.style.left = instance.objOrgStyleLeft + 'px';
                    instance.stickyObject.style.top = instance.objOrgStyleTop + 'px';
                }
                if (instance.stickyObject.style.position == 'fixed') {
                    instance.stickyObject.style.left = getSDG().getUtil().getPos(instance.refObj).left + instance.objOrgStyleLeft - scrollLeft + 'px';
                    instance.objOrgPosLeft = getSDG().getUtil().getPos(instance.stickyObject).left;
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
                this.currentScrollTop = getSDG().getUtil().getScrollPositions().top;
                this.currentScrollleft = getSDG().getUtil().getScrollPositions().left;
                this.processScrollFeatures();
            }.bind(selfReference));
            getSDG().getUtil().addEventListener(window, 'resize', function () {
                this.currentViewportWidth = getSDG().getUtil().getViewportDimensions().width;
                this.currentViewportHeight = getSDG().getUtil().getViewportDimensions().height;
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
    buildAd: function (jsonData, callback) {
        if (!getSDG().getPUB().getConfig().getContentObject() && jsonData.formatParams.contentObjectRequired) {
            window.addEventListener('contentElementLoaded', function () {
                getSDG()[getSDG().getSetup().SYSTEM.ADTEMPLATES].startAdConstruction(jsonData, callback);
            });
            getSDG().log('SYSTEM: Ad construction for "' + jsonData.name + '" delayed until _contentObject is fully loaded!', getSDG().loglvl('DEBUG'));
        } else {
            this.startAdConstruction(jsonData, callback)
        }
    },
    startAdConstruction: function (jsonData, callback) {
        var ad, placement;
        if (jsonData.placementAlias !== '') {
            //todo rewrite json template to placementName
            placement = getSDG().getCN().getPlacementByName(jsonData.placementAlias);
        } else {
            placement = getSDG().getCN().getPlacementBySizeId(jsonData.placementSizeId);
        }
        if (!!placement) {
            ad = placement.prepareNewAd(document.createElement('div'), jsonData);
            if (!!this['build' + jsonData.adType](placement)) {
                this.finishAdConstruction(placement, callback)
            } else {
                getSDG().log(placement.position + ': Error during ad construction. Calling ' + placement.getAd().getJson().adType + ' did not return positive results!', getSDG().loglvl('ERROR'));
            }
        } else {
            getSDG().log('SYSTEM: Error during ad construction. Placement for new ad not found, discarding impression for ad ' + jsonData.name + '! Please contact InteractiveMedia Technical Support for further informations.', getSDG().loglvl('ERROR'));
        }
    },
    finishAdConstruction: function (placement, callback) {
        var jsonData = placement.getAd().getJson();
        if (jsonData.countPix) {
            this.setupCountPixels(placement, jsonData);
            placement.getContainer().appendChild(placement.getAd().getCountContainer());
        }
        //Starte Zaehlpixel Auslieferung, setze moegliche Stickys, Hintergrund und starte Sichtbarkeitsmessung
        if (jsonData.formatParams.useBackgroundColor && getSDG().getPUB().getConfig().isBackgroundColorAllowed()) {
            this.addBackground(jsonData.formatParams.backgroundColor, placement.getAd().getMedia(jsonData.Media["1"].mediaName));
            if (jsonData.formatParams.backgroundClickable && getSDG().getPUB().getConfig().isClickableBackgroundAllowed()) {
                this.buildBackgroundClick(placement, jsonData.formatParams.backgroundClickUrl);
            }
        }
        if (getSDG().getPUB().getConfig().isStickyAllowed()) {
            this.processStickySegments(placement);
        }
        if (typeof callback === 'function') {
            callback();
        }
        getSDG().log(placement.position + ' ad assets build and appended to page. Delivery finished!', getSDG().loglvl('DEBUG'));
    },
    setupCountPixels: function (placement, jsonData) {
        for (var obj in jsonData.countPix) {
            this.buildCountPixel(placement, obj, jsonData.countPix[obj].tech, jsonData.countPix[obj].url);
        }
    },
    addSticky: function (stickyObj, referenceObj) {
        this.featureController.currentStickies[stickyObj.nodeName + '-' + stickyObj.id] = new this.featureController.StickyInstance(stickyObj, referenceObj);
        if (this.featureController.eventsActive == false) {
            this.featureController.activateEvents();
        }
        this.featureController.evaluateEndPositions(this.featureController.currentStickies);
        this.featureController.processScrollFeatures();
    },
    addBackground: function (color, referenceObject) {
        this.featureController.currentBackgrounds[referenceObject.nodeName + '-' + referenceObject.id] = new this.featureController.BackgroundInstance(color, referenceObject);
        if (this.featureController.eventsActive == false) {
            this.featureController.activateEvents();
        }
        this.featureController.evaluateEndPositions(this.featureController.currentBackgrounds)
    },
    addResize: function (resizeObject, referenceObject, negativeLeftPosition) {
        this.featureController.currentResizes[resizeObject.nodeName + '-' + resizeObject.id] = new this.featureController.ResizeInstance(resizeObject, referenceObject, negativeLeftPosition);
        if (this.featureController.eventsActive == false) {
            this.featureController.activateEvents();
        }
    },
    buildMediaSegments: function (placement) {
        var currentJsonSegment, ad, mediaContainer, fileObject;
        ad = placement.getAd();
        /*Baut MediaFile

         */
        for (var obj in ad.getJson().Media) {
            currentJsonSegment = ad.getJson().Media[obj];
            mediaContainer = ad.addMedia(currentJsonSegment.mediaName, this.buildContainer(currentJsonSegment));
            fileObject = this['build' + currentJsonSegment.file.type + 'Media'](currentJsonSegment, placement);
            if (typeof fileObject === 'string') {
                mediaContainer.innerHTML = fileObject;
            }
            else {
                mediaContainer.appendChild(fileObject);
            }
            if (getSDG().getUtil().hasObjectKeys(currentJsonSegment.file.expandable)) {
                this.buildExpandable(currentJsonSegment, placement)
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
    buildExpandable: function (jsonSegement, placement) {
        var adSegment, cHeight, cWidth, mHeight, mWidth, collapseClip, top, left;
        adSegment = placement.getAd().getMedia(jsonSegement.mediaName);
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
        for (var entry in placement.getAd().getJson().Media) {
            window[placement.getAd().getJson().Media[entry].file.fileId + '_DoFSCommand'] = function (command) {
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
    buildFlashMedia: function (jsonSegement, placement) {
        var mediaString, adSegment;
        adSegment = placement.getAd().getMedia(jsonSegement.mediaName);
        //todo IDs an Flashobjekten bei IE10 und hoeher, ansonsten Probleme mit JS Aufrufen aus Flashdateien
        if (getSDG().getUtil().checkflashVersion(jsonSegement.file.plugin.minVersion)) {
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
    buildImageMedia: function (jsonSegement, placement) {
        var image, ahref, adSegment;
        adSegment = placement.getAd().getMedia(jsonSegement.mediaName);
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
    buildHtmlMedia: function (jsonSegement, placement) {
        var iframe, adSegment;
        adSegment = placement.getAd().getMedia(jsonSegement.mediaName);
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
    buildCountPixel: function (placement, name, tech, url) {
        var ad, pixel, container;
        ad = placement.getAd();
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
    processStickySegments: function (placement) {
        var refObject, stickyObjs = [], currentMedia, jsonData;
        jsonData = placement.getAd().getJson();
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
            for (var number in stickyObjs) {
                this.addSticky(stickyObjs[number], refObject)
            }
        }
    },
    buildBackgroundClick: function (placement, linkurl) {
        var divBgAnker, divBgLeft, divBgTop, divBgRight, bgArray, contentDim, viewHeight, viewWidth;
        divBgAnker = document.createElement('div');
        divBgAnker.id = 'backgroundClickAnker-' + placement.getAd().getAnchor().id;
        divBgLeft = document.createElement('div');
        divBgLeft.id = 'divBgLeft-' + placement.getAd().getAnchor().id;
        divBgTop = document.createElement('div');
        divBgTop.id = 'divBgTop-' + placement.getAd().getAnchor().id;
        divBgRight = document.createElement('div');
        divBgRight.id = 'divBgRight-' + placement.getAd().getAnchor().id;
        contentDim = getSDG().getPUB().getConfig().getLocalContentObj();
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
        if (getSDG().getPUB().getConfig().isClickableBackgroundTopAllowed()) {
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
        this.addResize(divBgRight, getSDG().getPUB().getConfig().getContentObject().element);
        this.addSticky(divBgLeft, divBgAnker);
        this.addSticky(divBgRight, divBgAnker);
        getSDG().getPUB().getConfig().executeLocalBackgroundClickable(placement)
    },
    buildNativeAd: function (placement) {
        var anchor, jsonData, templateParams;
        jsonData = placement.getAd().getJson();
        anchor = placement.getAd().getAnchor();
        anchor.id = jsonData.name;
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
        //todo: check if native ads are required in SDG context, until than function deativated
        //anchor.innerHTML = new MW.Template(IM.getGT().getConfig().getTemplateForType('native' + jsonData.nativeType)).render(templateParams);
        placement.getContainer().appendChild(anchor);
        return true;
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
    buildSingleAd: function (placement) {
        var anchor, jsonData;
        jsonData = placement.getAd().getJson();
        anchor = placement.getAd().getAnchor();
        if (!!this.buildMediaSegments(placement)) {
            anchor.style['position'] = 'relative';
            anchor.id = jsonData.name;
            placement.getContainer().appendChild(anchor);
            return true;
        } else {
            getSDG().log(placement.position + ': buildSingleAd(): Error while building media files. Ad construction halted!', getSDG().loglvl('ERROR'));
            return false;
        }
    },
    buildMultiAd: function (placement) {
        var ad, topD, leftD, rightD, overD, contentDim, currentJsonSegment, currentMediaDiv, posLeft, posTop, docked, anchor, jsonData;
        ad = placement.getAd();
        jsonData = ad.getJson();
        anchor = ad.getAnchor();
        getSDG().getPUB().getConfig().startLocalMultiAd(ad, jsonData, placement);
        contentDim = getSDG().getPUB().getConfig().getContentObject();
        topD = {width: contentDim.width, height: 90};
        leftD = {width: 0, height: 0};
        rightD = {width: 0, height: 0};
        overD = {width: 0, height: 0};
        docked = jsonData.formatParams.sideDocking;
        //Erstelle Media Elemente
        if (!!this.buildMediaSegments(placement) && (contentDim)) {
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
                    topD.width = (currentJsonSegment.expandable) ? currentJsonSegment.expandable.collapsedWidth : parseFloat(currentMediaDiv.style['width']);
                    topD.height = (currentJsonSegment.expandable) ? currentJsonSegment.expandable.collapsedHeight : parseFloat(currentMediaDiv.style['height']);
                }
                if (currentJsonSegment.position == 'left') {
                    leftD.width = (currentJsonSegment.expandable) ? currentJsonSegment.expandable.collapsedWidth : parseFloat(currentMediaDiv.style['width']);
                    leftD.height = (currentJsonSegment.expandable) ? currentJsonSegment.expandable.collapsedHeight : parseFloat(currentMediaDiv.style['height']);
                }
                if (currentJsonSegment.position == 'right') {
                    rightD.width = (currentJsonSegment.expandable) ? currentJsonSegment.expandable.collapsedWidth : parseFloat(currentMediaDiv.style['width']);
                    rightD.height = (currentJsonSegment.expandable) ? currentJsonSegment.expandable.collapsedHeight : parseFloat(currentMediaDiv.style['height']);
                }
                if (currentJsonSegment.position == 'overlay') {
                    overD.width = (currentJsonSegment.expandable) ? currentJsonSegment.expandable.collapsedWidth : parseFloat(currentMediaDiv.style['width']);
                    overD.height = (currentJsonSegment.expandable) ? currentJsonSegment.expandable.collapsedHeight : parseFloat(currentMediaDiv.style['height']);
                }
            }
            anchor.style['width'] = topD.width + 'px';
            anchor.style['height'] = topD.height + 'px';
            //Zweiter Durchlauf fuer Positionierung
            for (obj in jsonData.Media) {
                currentJsonSegment = jsonData.Media[obj];
                currentMediaDiv = placement.getAd().getMedia(currentJsonSegment.mediaName);
                currentMediaDiv.style['position'] = 'absolute';
                if (currentJsonSegment.position == 'left') {
                    posLeft = parseFloat(currentMediaDiv.style['left']) + (docked) ? -leftD.width : 0;
                    posTop = parseFloat(currentMediaDiv.style['top']) + (docked) ? 0 : topD.height;
                }
                if (currentJsonSegment.position == 'right') {
                    posLeft = parseFloat(currentMediaDiv.style['left']) + (docked) ? topD.width : topD.width - rightD.width;
                    posTop = parseFloat(currentMediaDiv.style['top']) + (docked) ? 0 : topD.height;
                }
                if (currentJsonSegment.position == 'overlay') {
                    posLeft = parseFloat(currentMediaDiv.style['left']) + (docked) ? topD.width - overD.width : leftD.width + ((topD.width - rightD.width - leftD.width) - overD.width);
                    posTop = parseFloat(currentMediaDiv.style['top']) + topD.height;
                }
                currentMediaDiv.style['left'] = posLeft + 'px';
                currentMediaDiv.style['top'] = posTop + 'px';
                anchor.appendChild(currentMediaDiv);
            }
            //Schreibe MultiAd auf Seite
            placement.getContainer().appendChild(anchor);
            //Positioniere Anker in Relation zu Seite
            anchor.style['left'] = ((docked) ? (contentDim.width - topD.width + (contentDim.left - getSDG().getUtil().getPos(anchor).left)) : (contentDim.width - topD.width + rightD.width + (contentDim.left - getSDG().getUtil().getPos(anchor).left))) + 'px';
            getSDG().log(placement.position + ': buildMultiAd(): Positionsdbug: docked=' + docked + ', topBannerWidth=' + topD.width + ', rightBannerWidth=' + rightD.width + ', contentLeft=' + contentDim.left + ',contentWidth=' + contentDim.width + ', anchorLeft=' + getSDG().getUtil().getPos(anchor).left + '. Formel: docked (contentWidth-topBannerWidth+(contentLeft-anchorLeft)), undocked (contentWidth-topBannerWidth+rightBannerWidth+(contentWidth-anchorLeft)', getSDG().loglvl('DEBUG'));
            anchor.style['top'] = '0px';
            //finish it
            anchor.appendChild(this.setAdLabel('absolute', -9, 8));
            if (!!getSDG().getPUB().getConfig().finishLocalMultiAd(jsonData, placement)) {
                anchor.style['visibility'] = 'visible';
                return true;
            } else {
                getSDG().log(placement.position + ': buildMultiAd(): Error while executing local ad templates. Calling local ' + jsonData.adType + ' did not return positive results!', getSDG().loglvl('ERROR'));
                return false;
            }
        } else {
            getSDG().log(placement.position + ': buildMultiAd(): Error while building media files. Ad construction halted!', getSDG().loglvl('ERROR'));
        }
    }
};
var SDM_head = SDM_head || {};
SDM_head.registerAd = function (SDM_adConfig) {
    var placement,
        targetParams = {},
        zone = typeof SDM_adConfig.defzone === 'string' ? SDM_adConfig.defzone : '',
        position = typeof SDM_adConfig.name === 'string' ? SDM_adConfig.name : '',
        targetDiv = typeof SDM_adConfig.targetDiv === 'string' ? SDM_adConfig.targetDiv : ('div-gpt-ad-' + (position === 'out-of-page' ? 'swf' : position)),
        sizes = typeof SDM_adConfig.size !== 'string' ? SDM_adConfig.size : '',
        loadAtOnce = typeof SDM_adConfig.display === 'boolean' ? SDM_adConfig.display : true,
        targetingString = typeof SDM_adConfig.targeting === 'string' ? SDM_adConfig.targeting : '',
        mobile = typeof SDM_adConfig.mobile === 'boolean' ? SDM_adConfig.mobile : false;
    if (typeof SDM_adConfig.defzone2 === 'string') {
        zone += '/' + SDM_adConfig.defzone2;
    }
    if (typeof SDM_adConfig.defzone3 === 'string') {
        zone += '/' + SDM_adConfig.defzone3;
    }
    //Check for errors in SDM_adConfig
    if (zone.indexOf(' ') === -1) {
        //pass


    } else {
        //fail
        getSDG().log('SYSTEM: PrealudiumAdapter:  registerAd(). Whitespace passed in "zone" definitions. RegisterAd for "' + position + '" aborted.', getSDG().loglvl('ERROR'));
    }


    if (getSDG().getPUB().getAdServer()._gptUseSynchronTags) {
        document.write('<div id="' + targetDiv + '"><script type="text/javascript">SDG.Publisher.registerPosition("' + position + '", document.getElementById("' + targetDiv + '")).setTargeting(' + SDM_head.parseTargetingString(targetingString) + ').load()<\/script></div>');
    } else {
        if (!document.getElementById(targetDiv)) {
            var arrScripts = document.getElementsByTagName('script');
            var currentScript = document.currentScript || (function () {
                    var scripts = document.getElementsByTagName('script');
                    return scripts[scripts.length - 1]; // BE CAREFUL: this won't work if adtag is injected asynchronously into website
                })();
            var newDiv = document.createElement('div');
            newDiv.id = targetDiv;
            currentScript.parentNode.insertBefore(newDiv, currentScript.nextSibling);
        }
        placement = SDG.Publisher.registerPosition(position, document.getElementById(targetDiv));
        placement.setTargeting(SDM_head.parseTargetingString(targetingString));
        if (loadAtOnce) {
            placement.load()
        }
    }
};
SDM_head.parseTargetingString = function (targetingString) {
    var targetArray = [],
        currentKeyValue,
        key,
        value,
        targetParams = {};
    if (targetingString != '') {
        targetArray = targetingString.split(';');
        targetArray.forEach(
            function (currentEntry, currentIndex, completeArray) {
                currentKeyValue = currentEntry.split('=');
                if (!targetParams.hasOwnProperty(currentKeyValue[0])) {
                    targetParams[currentKeyValue[0]] = [];
                }
                targetParams[currentKeyValue[0]].push(currentKeyValue[1]);
            }, this);
    } else {
        targetParams = '';
    }
    return targetParams;
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
                return getSDG().getPUB().load(position)
            },
            loadAll: function (reloadAds) {
                return getSDG().getPUB().loadAll(reloadAds)
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
                    return getSDG().getPUB().registerPosition(position, container).load();
                } else {
                    return getSDG().getPUB().registerPosition(position, container)
                }

            },
            /**
             *
             * @param position
             * @param deleteAd
             */
            unregister: function (position, deleteAd) {
                return getSDG().getPUB().unregister(position, deleteAd)
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
                return getSDG().getPUB().finalizeCall(placementName, params)
            },
            buildAd: function (jsonData, callback) {
                return getSDG()[getSDG().getSetup().SYSTEM.ADTEMPLATES].buildAd(jsonData, callback);
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
        getGT: function () {
            return IM.GlobalAdTag;
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
    this.SDG_LOADED_ALL = this.setup('loadedAll', {type: 'system'});
    this.SDG_PLACEMENT_REGISTERED = this.setup('placementRegistered', {type: 'system'});
    this.SDG_PLACEMENT_DELETED = this.setup('placementDeleted', {type: 'system'});
    this.SDG_AD_SERVER_MODULE_LOADED = this.setup('adServerModuleLoaded', {type: 'system'});
    this.SDG_ADP_MODULE_LOADED = this.setup('adpModuleLoaded', {type: 'system'});
    this.SDG_RTB_MODULE_LOADED = this.setup('rtbModuleLoaded', {type: 'system'});
    this.SDG_CONTENT_ELEMENT_LOADED = this.setup('contentElementLoaded', {type: 'system'});
    this.SDG_POSTSCRIBE_RESOURCE_LOADED = this.setup('postscribeResourceLoaded', {type: 'system'});
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
        if (typeof CustomEvent !== 'undefined')
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
            getSDG().log('EVENTS: Dispatching event ' + eventName + ' on object %o passing %o ', getSDG().loglvl('DEBUG'), [emittingObject, passedObject]);
            emittingObject.dispatchEvent(event);
            event.detail['passedObject'] = '';
        } else
        {
            getSDG().log('EVENTS: Tried to trigger event ' + eventName + ' but event was not found!', getSDG().loglvl('ERROR'))
        }
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
    },
    /**
     * @class Abstract logging service class supporting messages with log levels.
     * @author Joerg Basedow <jbasedow@mindworks.de>
     * @constructor
     * @param {number} logLevel
     */
    LogContainer: function (logLevel)
    {
        this._logLevel = getSDG().getSetup().LOGGER.LEVELS.NOLOG;
        this._logEntries = [];
        this.setLogLevel(logLevel);
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
    getLogEntries: function ()
    {
        var log = [],
            i,
            length,
            anEntry;
        for (i = 0, length = this._logEntries.length; i < length; i++)
        {
            anEntry = this._logEntries[i];
            log.push(anEntry.toString());
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
            levelString = this.getStringForLogLevel(level) + ': ';
        if (!this.isValidLevel(level))
        {
            level = getSDG().getSetup().LOGGER.LEVELS.DEBUG;
        }
        if (this.isCausingLogEntry(level) && window.console && typeof window.console.log === 'function')
        {
            this._logEntries.push(new SDG[getSDG().getSetup().SYSTEM.MODULES].Logger.LogEntry(message, messageObjects, level));
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
     */
    registerPosition: function (position, containerNode)
    {
        var placement,
            placementDirectory = this.getPlacements();
        //todo: write function to select container based on parsed container object or string Id and set ID on container if not present
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
                    getSDG().getEventDispatcher().trigger('SDG_PLACEMENT_REGISTERED', placement);
                    getSDG().getEventDispatcher().trigger('POSITION_REGISTERED', placement);
                    getSDG().log(placement.position + ': register(): successfull. Placement is ready and will wait for further commands.', getSDG().loglvl('INFO'));
                    return placement;
                } else
                {
                    getSDG().log('register(): container not found. Please make sure that you pass a valid element node.', getSDG().loglvl('CRITICAL'));
                }
            } else
            {
                getSDG().log('register(): Position: "' + position + '" already registered. To reuse position, use unregister first.', getSDG().loglvl('CRITICAL'));
            }
        } else
        {
            getSDG().log('register(): Position: "' + position + '" not found in site configuration or system uses malformed configuration file. Please contact InteractiveMedia technical support.', getSDG().loglvl('CRITICAL'));
        }
    },
    /**
     * Will delete a placement from the Placements namespace based on the position and remove all ad content from the site if deleteAd is true.
     *
     * @this Controller
     * @param {string} position - Contains the pre-configured position name. Correlates to an ad format name shorthandle, example: "sb" for "Superbanner".
     * @param {boolean} deleteAd - Will delete all content written by the placement if set to true or is not set, false will delete the placement but not the content.
     */
    unregister: function (position, deleteAd)
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
                delete this.getPlacements()[currentPlacement.systemIds.identifier];
                getSDG().getEventDispatcher().trigger('POSITION_DELETED', currentPlacement);
                getSDG().log('"' + position + '": succesfully deleted.', getSDG().loglvl('INFO'));
            }
        } else
        {
            getSDG().log('unregister(): Position ' + position + ' is currently not registered. Position can not be deleted.', getSDG().loglvl('WARNING'))
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
            this.unregister(currentPlacement.position, deleteAd)
        }
    },
    /**
     * Will start the load process of  a single placement defined by position argument
     * @param {string} position - Contains the pre-configured position name. Correlates to an ad format name shorthandle, example: "sb" for "Superbanner".
     */
    loadSinglePosition: function (position) {
        this.getPlacementByPosition(position).load()
    },

    /**
     * Will start the process to enqueue and load several plaacements at once.
     *
     * @param {boolean} reloadAds - Will load any placements on the site if set to true (default), will load only unloaded placements if set to false.
     */
    loadMultiplePositions: function (reloadAds)
    {
        this.getAdServer().loadMultiplePositions(reloadAds);
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
            getSDG().log('SYSTEM: getPlacementByContainerId(): containerId was not a string, search canceled.', getSDG().loglvl('DEBUG'));
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
        altSizes: [],
        width: parseFloat(this.getConfig().getValueForPosition(position, 'width')),
        height: parseFloat(this.getConfig().getValueForPosition(position, 'height'))
    };
    this.localAddons = {};
};
/**
 *
 * @type {{globalAddons: {}, prepareNewAd: prepareNewAd, getAd: getAd, executeSeperateAdserverCall: executeSeperateAdserverCall, readyMultiAdServerCall: readyMultiAdServerCall, reloadDynamicPlacementVariables: reloadDynamicPlacementVariables, deleteAdserverPlacement: deleteAdserverPlacement, wrapInFriendlyIframe: wrapInFriendlyIframe, executePreCallSetup: executePreCallSetup, completeLoad: completeLoad, getContainer: getContainer, deletePlacementContent: deletePlacementContent, updatePlacementParameters: updatePlacementParameters, executeGlobalAddons: executeGlobalAddons, activateLocalAddons: activateLocalAddons, finalizeCall: finalizeCall, getSiteConfig: getConfig, getAdServer: getAdServer}}
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
    executeSeperateAdserverCall: function ()
    {
        getSDG().getEventDispatcher().trigger('POSITION_CALLING', this);
        return this.getAdServer().executeSeperateAdserverCall(this);
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
     *
     * @this IM.Controller.Placement
     * @returns {boolean}
     */
    reloadDynamicPlacementVariables: function ()
    {
        this.adServerName = this.getAdServer().returnAdServerPlacementName(this);
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
            getSDG().getEventDispatcher().trigger('POSITION_PREPARED', this);
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
    completeLoad: function ()
    {
        getSDG().getEventDispatcher().trigger('POSITION_RESPONDED', this)
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
     *
     * @this IM.Controller.Placement
     * @param params
     */
    finalizeCall: function (params)
    {
        this.updatePlacementParameters(params);
        this.executeGlobalAddons();
        this.activateLocalAddons();
        getSDG().getEventDispatcher().trigger('POSITION_DONE', this);
        getSDG().log(this.position + ': finalizeCall(): position fully loaded and rendered. Delivery done!', getSDG().loglvl('INFO'));
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
    setTargeting: function (params) {
        var currentKey, currentValues;
        for (currentKey in params) {
            currentValues = params[currentKey];
            this.localTargeting[currentKey] = currentValues;
        }
        return this;
    },
    load: function () {
        if (this.executePreCallSetup() && this.executeSeperateAdserverCall()) {
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
    this._positionConfigs = this.mergeConfigs(validatedConfig.global.positions, validatedConfig.website.positions);
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
    this._protocol = 'http';
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
     * @type {String}
     */
    this._rtbCallPosition = '';
    /**
     * @type {Boolean}
     */
    this._stickiesAllowed = false;
    /**
     * @type {Boolean}
     */
    this._backgroundColorAllowed = false;
    /**
     * @type {Boolean}
     */
    this._clickableBackgroundAllowed = false;
    /**
     * @type {Boolean}
     */
    this._clickableTopBackgroundAllowed = false;
    /**
     * @type {Boolean}
     */
    this._jsonMultiAdAllowed = false;
    /**
     * @type {Boolean}
     */
    this._jsonBillboardAdAllowed = false;
    /**
     * @type {Boolean}
     */
    this._jsonHalfpageAdAllowed = false;
    /**
     * @type {Boolean}
     */
    this._jsonFloorAdAllowed = false;
    /**
     * @type {Boolean}
     */
    this._jsonBanderoleAdAllowed = false;
    /**
     * @type {Boolean}
     */
    this._jsonInterstitialAdAllowed = false;
    /**
     * @type {Boolean}
     */
    this._jsonPrestitialAdAllowed = false;
    /**
     * @type {Boolean}
     */
    this._jsonPushdownAdAllowed = false;
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
        if (!config.website.positions)
        {
            config.website.positions = {};
            getSDG().log('"site.positions" section of config is missing.', getSDG().loglvl('EMERGENCY'));
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
     * Add the zone from the current piece of content to the configuration.
     *
     * @param {String} zone
     */
    setZone: function (zone)
    {
        this._zone = zone;
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
     * Returns the local object as DOM Node with additional informations like width and position either from the object itself or the divergent values set by the tagman admin
     *
     * @param windowObj
     * @returns {*}
     */
    getContentObject: function (windowObj) {
        var objectInfo, obj;
        obj = this._contentObject;
        windowObj = (typeof windowObj === 'undefined') ? window : windowObj;
        if (this._contentObject !== '') {
            if (windowObj.document.querySelector(obj.query) !== null) {
                objectInfo = {
                    element: windowObj.document.querySelector(obj.query),
                    width: (typeof obj.width === 'number') ? obj.width : windowObj.document.querySelector(obj.query).offsetWidth,
                    top: (typeof obj.top === 'number') ? obj.top : getSDG().getUtil().getPos(windowObj.document.querySelector(obj.query)).top,
                    left: (typeof obj.left === 'number') ? obj.left : getSDG().getUtil().getPos(windowObj.document.querySelector(obj.query)).left
                };
                return objectInfo
            } else {
                return false
            }
        } else {
            getSDG().log('getLocalContentObj: _contentObject not set up correctly. Fix it in TagMan Local section!', getSDG().loglvl('WARNING'));
            return false;
        }
    },
    /**
     * The content object provides position data for ads surrounding the content. By passing a query for the object, this function will try to extrapolate width, top and left position.
     * This can be overwritten by passing "with", "top", "left" as numbers, when defining the _contentObject.
     * If the Query of the object can not be found when an ad is trying to select the object, a mutationobserver is created.
     * The Observer will report as soon as the browser has loaded the object and will fire the "SDG_CONTENT_ELEMENT_LOADED" Event
     * @param objectDescription
     * @param objectObserver
     */
    setContentObject: function (objectDescription, objectObserver) {
        if (!!objectDescription.query) {
            this._contentObject = {
                query: objectDescription.query,
                width: (typeof objectDescription.width === "number") ? objectDescription.width : objectDescription.query,
                top: (typeof objectDescription.top === "number") ? objectDescription.top : objectDescription.query,
                left: (typeof objectDescription.left === "number") ? objectDescription.left : objectDescription.query
            };
            if (objectObserver !== undefined) {
                this._contentObject['observer'] = {
                    targetElement: objectObserver.targetElement,
                    childList: objectObserver.childList,
                    attributes: objectObserver.attributes,
                    characterData: objectObserver.characterData,
                    subtree: objectObserver.subtree,
                    mutationFunction: objectObserver.mutationFunction,
                    alternativeIndicator: objectObserver.alternativeIndicator
                };
                if (
                    (getSDG().getUtil().getBrowserData().app === 'MSIE' && getSDG().getUtil().getBrowserData().version <= 10) ||
                    (getSDG().getUtil().getBrowserData().app === 'Firefox' && getSDG().getUtil().getBrowserData().version <= 16) ||
                    (getSDG().getUtil().getBrowserData().app === 'Safari' && getSDG().getUtil().getBrowserData().version <= 6) ||
                    (getSDG().getUtil().getBrowserData().app === 'Chrome' && getSDG().getUtil().getBrowserData().version <= 26) ||
                    (getSDG().getUtil().getBrowserData().app === 'Opera' && getSDG().getUtil().getBrowserData().version <= 15)
                ) {
                    window.addEventListener('placementRegistered', function (e) {
                        if (e === objectObserver.alternativeIndicator) {
                            getSDG().getEventDispatcher().trigger('SDG_CONTENT_ELEMENT_LOADED', objectObserver.alternativeIndicator);
                        }
                    });
                } else {
                    var obs = this._contentObject.observer;
                    obs.observerElement = getSDG().getUtil().createMutationObserver(obs.targetElement, obs.childList, obs.attributes, obs.characterData, obs.subtree, obs.mutationFunction)
                }
            }
        }
    },
    setRtbCallPosition: function (positionName) {
        this._rtbCallPosition = positionName;
    },
    getRtbCallPosition: function () {
        return this._rtbCallPosition;
    },
    allowStickies: function () {
        this._stickiesAllowed = true;
    },
    allowBackgroundColor: function () {
        this._backgroundColorAllowed = true;
    },
    allowClickableBackground: function () {
        this._clickableBackgroundAllowed = true;
    },
    allowClickableTopBackground: function () {
        this._clickableTopBackgroundAllowed = true;
    },
    allowJsonMultiAd: function () {
        this._jsonMultiAdAllowed = true;
    },
    allowJsonBillboardAdAllowed: function () {
        this._jsonBillboardAdAllowed = true;
    },
    allowJsonHalfpageAdAllowed: function () {
        this._jsonHalfpageAdAllowed = true;
    },
    allowJsonFloorAdAllowed: function () {
        this._jsonFloorAdAllowed = true;
    },
    allowJsonBanderoleAdAllowed: function () {
        this._jsonBanderoleAdAllowed = true;
    },
    allowJsonInterstitialAdAllowed: function () {
        this._jsonInterstitialAdAllowed = true;
    },
    allowJsonPrestitialAdAllowed: function () {
        this._jsonPrestitialAdAllowed = true;
    },
    allowJsonPushdownAdAllowed: function () {
        this._jsonPushdownAdAllowed = true;
    },
    isStickyAllowed: function () {
        return !!this._stickiesAllowed;
    },
    isBackgroundColorAllowed: function () {
        return !!this._backgroundColorAllowed;
    },
    isClickableBackgroundAllowed: function () {
        return !!this._clickableBackgroundAllowed;
    },
    isClickableBackgroundTopAllowed: function () {
        return !!this._clickableTopBackgroundAllowed;
    },
    isMultiAdAllowed: function () {
        return !!this._jsonMultiAdAllowed;
    },
    isBillboardAdAllowed: function () {
        return !!this._jsonBillboardAdAllowed
    },
    isHalfpageAdAllowed: function () {
        return !!this._jsonHalfpageAdAllowed
    },
    isFloorAdAllowed: function () {
        return !!this._jsonFloorAdAllowed
    },
    isBanderoleAdAllowed: function () {
        return !!this._jsonBanderoleAdAllowed
    },
    isInterstitialAdAllowed: function () {
        return !!this._jsonInterstitialAdAllowed
    },
    isPrestitialAdAllowed: function () {
        return !!this._jsonPrestitialAdAllowed
    },
    isPushdownAdAllowed: function () {
        return !!this._jsonPushdownAdAllowed
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
        } else
        {
            getSDG().log('Malformed keywords given.', getSDG().loglvl('WARNING'));
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
        } else
        {
            getSDG().log('Malformed keywords given.', getSDG().loglvl('WARNING'));
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
        } else
        {
            getSDG().log('Malformed key values given.', getSDG().loglvl('WARNING'));
        }
    }
    ,
    /**
     * Remove a key value pair from the key value pairs which will be added to all ad calls.
     *
     * @param {String} key
     */
    removeKeyValue: function (key)
    {
        delete this._keyValues[key];
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
        } else
        {
            getSDG().log('Malformed key values given.', getSDG().loglvl('WARNING'));
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
    /**
     * Get key value pairs.
     *
     * @return {Object.<String, String>}
     */
    getKeyValues: function ()
    {
        return this._keyValues;
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
SDG.Publisher = {
    /**
     * Render the ad tag for the given position respecting the given call type
     * and the current configuration.
     *
     * @param {String} position
     * @param {String} type
     */
    render: function (position, type)
    {
        var currentPlacement;
        if (currentPlacement = getSDG().getCN().getPlacementByPosition(position)) {
            currentPlacement.executePreCallSetup();
            this.getWindow().documentWrite(this.getAdServer().getAdCallHtml(position, type));
            currentPlacement.completeLoad();
        }
    },
    /**
     * register the position for a given HTML Container on the side
     * @param position
     * @param container
     */
    registerPosition: function (position, container)
    {
        return this.getController().registerPosition(position, container)
    },
    /**
     * unregister the position and delete the Ad from the page
     * @param position
     * @param deleteAllContent
     */
    unregister: function (position, deleteAllContent) {
        return this.getController().unregister(position, deleteAllContent)
    },
    /**
     * Add the zone from the current piece of content to the configuration.
     *
     * @param {String} zone
     */
    setZone: function (zone)
    {
        return this.getConfig().setZone(zone);
    },
    /**
     * Add the page type to the configuration (index, article, ...).
     *
     * @param {String} pageType
     */
    setPageType: function (pageType)
    {
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
    loadAll: function (reloadAds)
    {
        return this.getController().loadMultiplePositions(reloadAds)
    },
    load: function (position)
    {
        return this.getController().loadSinglePosition(position, true);
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

getSDG()[getSDG().getSetup().SYSTEM.MODULES].AudienceDiscoverPlattform = function (url)
{
    this._url = url;
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
        getSDG().log('SYSTEM: RESOURCES: ADP: Loading Core.', getSDG().loglvl('DEBUG'));
        getSDG().getRes().get(getSDG().getSetup().RESOURCES.ADP)._loadStatus = 'loading';
        this.scriptNode = getSDG().getUtil().loadAsynchronousScript(this._url, document.getElementsByTagName('head')[0], function ()
        {
            getSDG().getRes().get(getSDG().getSetup().RESOURCES.ADP)._loadStatus = 'loaded';
            getSDG().getEventDispatcher().trigger('SDG_ADP_MODULE_LOADED');
            getSDG().log('SYSTEM: RESOURCES: ADP: Core loaded as %o and atached to %o', getSDG().loglvl('INFO'),
                [getSDG().getRes().get(getSDG().getSetup().RESOURCES.ADP).scriptNode, document.head]);
        }, false);
    },
    addListener: function ()
    {
        var instance = this;
        window.addEventListener('load', instance.windowLoaded)
    }
};
getSDG()[getSDG().getSetup().SYSTEM.MODULES].AudienceScience = function (url)
{
    this._url = url;
    this._loadStatus = 'loading';
    this._asciResponse = {};
    this.scriptNode = getSDG().getUtil().loadAsynchronousScript(this._url, document.getElementsByTagName('head')[0], function ()
    {
        var instance = getSDG().getRes().get(getSDG().getSetup().RESOURCES.AUDIENCE_SCIENCE);
        getSDG().log('SYSTEM: RESOURCES: ASCI-Pre-Qual-Tag: Core loaded as %o and atached to %o', getSDG().loglvl('INFO'), [instance.scriptNode, document.head]);
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
            response = this._asciResponse;
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
            getSDG().getPUB().addKeyValues({ascformats: kvArr});
            getSDG().log('SYSTEM: AudienceScience HeaderBidder has responded with avaible formats.', getSDG().loglvl('DEBUG'));
        }
        getSDG().log('SYSTEM: AudienceScience HeaderBidder loaded and finished', getSDG().loglvl('DEBUG'));
    }
};

getSDG()[getSDG().getSetup().SYSTEM.MODULES].Meetrics = function (url) {
    this._url = url;
    this._loadStatus = 'loading';
    this.scriptNode = getSDG().getUtil().loadAsynchronousScript(this._url, document.getElementsByTagName('head')[0], function () {
        var instance = getSDG().getRes().get(getSDG().getSetup().RESOURCES.MEETRICS);
        getSDG().log('SYSTEM: MeetricsCore loaded as %o and attached to %o', getSDG().loglvl('INFO'), [instance.scriptNode, document.head]);
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
                    getSDG().log(currentPlacement.position + ': MEETRICS: error tracking visibility on %o , Meetrics failed to initialize with error %o', getSDG().loglvl('DEBUG'), [div, error]);
                }
                getSDG().log(currentPlacement.position + ': MEETRICS: now tracking visibility on anchor element %o ', getSDG().loglvl('DEBUG'), [div]);
            } else {
                getSDG().log(currentPlacement.position + ': MEETRICS: flightId is null, possible empty slot response. Measurement canceled', getSDG().loglvl('DEBUG'));
            }

        },
        remove: function () {
            var currentPlacement = this;
            //todo Funktion einfuegen um asynchrones Laden bzw Entfernen von Meetrics zu unterstuetzen
            getSDG().log(currentPlacement.position + ': Meetrics addon removed.', getSDG().loglvl('DEBUG'));
        }
    }
};
getSDG()[getSDG().getSetup().SYSTEM.MODULES].Postscribe = function ()
{
    this.scriptNode = getSDG().getUtil().loadAsynchronousScript('libraries/postscribe.min.js', document.getElementsByTagName('head')[0], function ()
    {
        getSDG().getRes().get(getSDG().getSetup().RESOURCES.POSTSCRIBE).loadStatus = 'loaded';
        getSDG().getEventDispatcher().trigger('SDG_POSTSCRIBE_RESOURCE_LOADED');
    });
};
getSDG()[getSDG().getSetup().SYSTEM.MODULES].Postscribe.prototype = {
    loadStatus: 'loading'
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
     * Checks if given haystack contains needle.
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
    gatherMetaKeywords: function () {
        var imMeta = (document.getElementsByTagName('meta')) ? document.getElementsByTagName('meta') : '';
        var imKey;
        for (var i = 0; i < imMeta.length; i++) {
            if (imMeta[i].getAttribute("name") == "keywords") {
                imKey = imMeta[i].getAttribute("content");
                imKey = imKey.toLowerCase();
                imKey = imKey.replace(/,\s?/g, "+");
                imKey = imKey.replace(/ä/gi, "ae");
                imKey = imKey.replace(/ü/gi, "ue");
                imKey = imKey.replace(/ö/gi, "oe");
                imKey = imKey.replace(/ und /gi, "+");
                imKey = imKey.replace(/ /g, "_");
                imKey = imKey.split('+');
                imKey = imKey.slice(0, 10);
                getSDG().getPUB().addKeywords(imKey);
                getSDG().getPUB().addKeyValues({"metakeys": imKey})
            }
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
     * Will test for the Flash and Shockwave Plugin to be present and activated in a given version. Returns true if the test is passed, and false if the plugin is not present or does not meet the required version.
     * Will automatically return false if the browser is Chrome 45 or above or Safari 7 and above.
     *
     * @param req - the minimum required version of the flash plugin needed to pass the test
     * @returns {*} returns
     */
    checkflashVersion: function (req) {
        return requiredVersion(req);
        function getFlashVersion() {
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
        }

        function requiredVersion(req) {
            if ((getSDG().getUtil().getBrowserData().app === 'Chrome' && getSDG().getUtil().getBrowserData().version >= 45)
                || (getSDG().getUtil().getBrowserData().app === 'Safari' && getSDG().getUtil().getBrowserData().version >= 7)) {
                req = 99;
            }
            return req <= getFlashVersion().split(',').shift();
        }
    },
    /**
     * Loads a script by placing it into a given HTML object. The user can specify if the script should be parsed by postscribe (will prevent document.write() in external script) or if the script should be loaded directly onto the page, without any protection against document.write.
     *
     * @param url {String} - the url of the script
     * @param obj {object} - the object to which the script will be appended
     * @param usePostscribe {boolean} - should the script be parsed by postscribe before it is appended to the page?
     * @param callback {function} -  a callback function, executed as soon as the script is loaded.
     */
    loadAsynchronousScript: function (url, obj, callback, usePostscribe, useCrossOrigin)
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
            if (getSDG().getRes().get(getSDG().getSetup().RESOURCES.POSTSCRIBE).loadStatus !== 'loaded')
            {
                document.addEventListener(getSDG().getEventDispatcher().SDG_POSTSCRIBE_RESOURCE_LOADED.type, function ()
                {
                    getSDG().getRes().get(getSDG().getSetup().RESOURCES.POSTSCRIBE).postscribe(obj, script.outerHTML, {done: callback});
                })
            } else
            {
                getSDG().getRes().get(getSDG().getSetup().RESOURCES.POSTSCRIBE).postscribe(obj, script.outerHTML, {done: callback});
            }
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
     * Will try to evaluate a given object and return its defining size attributes "with", "height", "top" position and "left" position as an object.
     * @param obj
     * @returns {Object}
     */
    getObjDim: function (obj) {
        var dimRet = [];
        dimRet.left = this.getPos(obj).left;
        dimRet.top = this.getPos(obj).top;
        dimRet.width = obj.offsetWidth;
        dimRet.height = obj.offsetHeight;
        return dimRet;
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
     * todo: create doc for createMutationObserver
     * @param observedElement
     * @param childList
     * @param attributes
     * @param characterData
     * @param subtree
     * @param mutationFunction
     * @returns {MutationObserver}
     */
    createMutationObserver: function (observedElement, childList, attributes, characterData, subtree, mutationFunction) {
        var observer = new MutationObserver(function (mutations) {
            mutations.forEach(function (mutation) {
                mutationFunction(mutation);
            })
        });
        observer.observe(observedElement, {
            childList: childList,
            attributes: attributes,
            characterData: characterData,
            subtree: subtree
        });
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
(function() {
var conf = {
    "global": {
        "common": {
            "grpLength": "9",
            "dfpNetwork": "4444",
            "host": "im.banner.t-online.de",
            "miscLength": "12",
            "mobileHost": "m.banner.t-online.de",
            "name": "testwebseite",
            "networkId": "784.1",
            "reservedAdSlots": "0"
        },
        "positions": {
            "banner": {
                "height": "90",
                "width": "728",
                "altSizes": [[728, 91]],
                "tagType": "standardGpt"
            },
            "bb": {
                "height": "250",
                "width": "800",
                "tagType": "standardGpt"
            },
            "bb_pos2": {
                "height": "250",
                "width": "800",
                "tagType": "standardGpt"
            },
            "mrec": {
                "height": "250",
                "width": "300",
                "tagType": "standardGpt",
                "altSizes": [[300, 600]]
            },
            "mrec_pos1": {
                "height": "250",
                "width": "300",
                "tagType": "standardGpt"
            },
            "mrec_pos2": {
                "height": "250",
                "width": "300",
                "tagType": "standardGpt"
            },
            "mrec_pos3": {
                "height": "250",
                "width": "300",
                "tagType": "standardGpt"
            },
            "ma": {
                "device": "mobile",
                "height": "50",
                "width": "320",
                "tagType": "standardGpt"
            },
            "out-of-page": {
                "height": "1",
                "width": "1",
                "tagType": "outOfPageGpt"
            },
            "ph": [],
            "pop": {
                "height": "1",
                "width": "1",
                "tagType": "outOfPageGpt"
            },
            "rectangle": {
                "height": "250",
                "width": "300",
                "tagType": "standardGpt"
            },
            "rectangle_2": {
                "height": "250",
                "width": "300",
                "tagType": "standardGpt"
            },
            "sb": {
                "height": "90",
                "width": "728",
                "altSizes": [[728, 91]],
                "tagType": "standardGpt"
            },
            "sb_pos1": {
                "height": "90",
                "width": "728",
                "altSizes": [[728, 91]],
                "tagType": "standardGpt"
            },
            "sky": {
                "height": "600",
                "width": "120",
                "adUnits": {
                    "sport": [[160, 600], [200, 600], [300, 600]]
                },
                "altSizes": [[160, 600], [200, 600], [300, 600]],
                "tagType": "standardGpt"
            },
            "tl": {
                "height": "1",
                "width": "6"
            }
        },
        "templates": {
            "addyn": "#{protocol}:\/\/#{host}\/addyn\/#{version}\/#{networkId}\/#{fallbackPlacement}\/0\/#{size}\/ADTECH;loc=100;cors=yes;alias=#{alias};target=_blank;#{custom}grp=#{group};misc=#{misc}"
        }
    },
    "website": {
        "common": {
            "name": "menshealth.de_sd",
            "reservedAdSlots": "0"
        },
        "positions": {
            "bb": {
                "adUnits": {
                    "sport": [[801, 251], [770, 150]]
                }
            },
            "mrec": {
                "adUnits": {
                    "mode": [[300, 251], [300, 601]]
                }
            },
            "mrec_pos2": {
            },
            "mrec_pos3": {
            },
            "pop": {
            },
            "sb": {
                "anzDir": "vertical",
                "altSizes": [[728, 91], [800, 200]]
                //"sequenceSlot": "1"
            },
            "sb_pos1": {
                "altSizes": [[728, 91], [800, 200]]
            },
            "sb_pos2": {
                //"sequenceSlot": "2"
            },
            "sky": {
                //"sequenceSlot": "3"
            },
            "ma": {
            },
            "cbmini_pos1": {
                "height": "180",
                "width": "610"
            }
        }
    },
    "metaData": {
        "generationDate": "2014-12-22T14:14:36+0000"
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
    var level = (location.href.indexOf('sdgLogLevel=') != -1) ? parseFloat(location.href.substr(location.href.indexOf('sdgLogLevel=') + 12, 2)) : getSDG().getSetup().LOGGER.LEVELS.ERROR;
    return new SDG[getSDG().getSetup().SYSTEM.MODULES].Logger.LogContainer(level);
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
    return new SDG[getSDG().getSetup().SYSTEM.MODULES].Postscribe();
});

/* +++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++
 GLOBAL MODULE & RESOURCES CONFIGURATION
 All modules and resources added here will load on EVERY site in the network
 +++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++ */
getSDG().getCore().set(getSDG().getSetup().MODULES.PUBLISHER_CONFIG, function ()
{
    return new SDG[getSDG().getSetup().SYSTEM.MODULES].PublisherSetup(conf);
});
getSDG().getRes().set(getSDG().getSetup().RESOURCES.ADP, function () {
    return new SDG[getSDG().getSetup().SYSTEM.MODULES].AudienceDiscoverPlattform('//cdn.xplosion.de/adp/69511/adp_loader.js');
});
/* +++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++
 LOCAL MODULE & RESOURCES CONFIGURATION
 Modules & resources added here will only load on the specific website owning the local.js
 +++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++ */
/**
 getSDG().getCore().set(getSDG().getSetup().MODULES.ADSERVER, function ()
 {
     return new SDG[getSDG().getSetup().SYSTEM.MODULES].AdTechIQAdServer(
         getSDG().getCore().get(getSDG().getSetup().MODULES.PUBLISHER_CONFIG));
 });

 */
getSDG().getCore().set(getSDG().getSetup().MODULES.ADSERVER, function ()
{
    return new SDG[getSDG().getSetup().SYSTEM.MODULES].GoogleDfp(
        getSDG().getCore().get(getSDG().getSetup().MODULES.PUBLISHER_CONFIG),
        {
            useSynchronTags: false,
            useSingleRequest: false
        }
    );
});


//TagMan Converter only needed on sites which have not switched to MetaTag API
getSDG().getCore().set(getSDG().getSetup().MODULES.TAGMAN_CONVERTER, function ()
{
    return new SDG[getSDG().getSetup().SYSTEM.MODULES].tagManConverter();
});
//Audience Science Headder Bidder
getSDG().getRes().set(getSDG().getSetup().RESOURCES.AUDIENCE_SCIENCE, function ()
{
    return new SDG[getSDG().getSetup().SYSTEM.MODULES].AudienceScience('//pq-direct.revsci.net/pql?placementIdList=wV1HMo,jRToJy,K37e9P,nOGLrM,Z4IsnP,QWgGZI,n7obvN,hD6oFp&cb=' + getSDG().getUtil().generateRandomNumberString(8));
});
/*Meetrics Visibility measurement for customer ID 802358
getSDG().getRes().set(getSDG().getSetup().RESOURCES.MEETRICS, function () {
    return new SDG[getSDG().getSetup().SYSTEM.MODULES].Meetrics('//s264.mxcdn.net/bb-mx/serve/mtrcs_802358.js');
});
 */
/* +++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++
 Event Configuration
 +++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++ */
window.addEventListener('beforeLoadAll', function (e)
{
    getSDG().getUtil().gatherMetaKeywords();
    if (typeof abp === 'boolean' && abp)
    {
        getSDG().getPUB().addKeyValue('abuser', 't');
    }
    getSDG().log('SYSTEM: Event: BEFORE_LOADED_ALL was triggered.', getSDG().loglvl('DEBUG'), e);
});
window.addEventListener('loadedAll', function (e)
{
    getSDG().log('SYSTEM: Event: LOADED_ALL was triggered. DOM now ready.', getSDG().loglvl('DEBUG'), e);
});
window.addEventListener('placementRegistered', function (e)
{
    //Exampel to wait for a specific position
    if (e.detail.passedObject.position === 'sb_pos1')
    {
        getSDG().log('sb_pos1 registered', getSDG().loglvl('ALERT'));
    }
});
/* +++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++
 AdddOn Configuration
 +++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++ */

//todo: rebuild globalAddons to fit into current module setup
//getSDG().getCN().addGlobalAddon('anzeigeController', IM.getSite().anzeigeController);
//getIM().getUtil().addCssObject(".imAnzeigenkennung{background:#FF00FF;}.imAnzeigenkennung:before{content:'Anzeige';}.imAnz-sb_pos1{position:absolute;}");


/* +++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++
 Additional Pixel Configuration
 +++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++ */



/* +++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++
 Site Configuration
 +++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++ */
getSDG().getPUB().getConfig().setContentObject({
    query: 'div#Tmainbox'
}, {
    targetElement: document.getElementsByTagName('html')[0],
    childList: true,
    attributes: false,
    characterData: false,
    subtree: true,
    alternativeIndicator: 'mrec',
    mutationFunction: function (e)
    {
        var element = e.addedNodes[0];
        if (element !== undefined && element.tagName === 'DIV' && element.id === 'Tmainbox')
        {
            getSDG().getPUB().getConfig()._contentObject.observer.observerElement.disconnect();
            getSDG().getEventDispatcher().trigger('SDG_CONTENT_ELEMENT_LOADED', element);
        }
    }
});
getSDG().getPUB().getConfig().allowStickies();
getSDG().getPUB().getConfig().allowBackgroundColor();
getSDG().getPUB().getConfig().allowClickableBackground();
getSDG().getPUB().getConfig().allowClickableTopBackground();
getSDG().getPUB().getConfig().executeLocalBackgroundColor = function (color) {
    //this.getIM().getGT().log('executeLocalBackgroundColor(): function not replaced with site specific commands.', this.getIM().getGT().logLvl('DEBUG'));
    return true;
};
getSDG().getPUB().getConfig().executeLocalBackgroundClickable = function (placement) {
    //this.getIM().getGT().log('executeLocalBackgroundClickable(): function not replaced with site specific commands.', this.getIM().getGT().logLvl('DEBUG'));
    return true;
};

getSDG().getPUB().getConfig().allowJsonMultiAd();
getSDG().getPUB().getConfig().startLocalMultiAd = function (ad, jsonData, placement) {
    //this.getIM().getGT().log('startLocalMultiAd(): function not replaced with site specific commands.', this.getIM().getGT().logLvl('DEBUG'));
    return true;
};
getSDG().getPUB().getConfig().finishLocalMultiAd = function (ad, jsonData, placement) {
    //this.getIM().getGT().log('finishLocalMultiAd(): function not replaced with site specific commands.', this.getIM().getGT().logLvl('DEBUG'));
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
 getIM().getGT().createRtbFormat(888, 600, 'AdnxsWallpaper', true, '728x90', 'sb_pos1', ['728x90', '800x250', '120x600']);
 getIM().getGT().createRtbFormat(800, 250, 'AdnxsBillboard', true, '728x90', 'bb', ['728x90', '800x250']);
 getIM().getGT().createRtbFormat(300, 600, 'AdnxsHalfpageAd', true, '728x90', 'mrec', ['300x250']);
 getIM().getGT().createRtbFormat(728, 690, 'AdnxsWallpaper', true, '728x90', 'sb_pos1', ['728x90', '800x250', '120x600']);
 getIM().getGT().createRtbFormat(600, 600, 'AdnxsDynamicSitebar', true, '728x90', 'sky', ['728x90', '800x250', '120x600']);
 getIM().getGT().createRtbFormat(1280, 1024, 'AdnxsFireplace', true, '728x90', 'sb_pos1', ['728x90', '800x250', '120x600', '300x250']);

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