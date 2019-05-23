// Copyright (c) Microsoft Corporation. All rights reserved.
// Licensed under the MIT License.

const { LuisRecognizer } = require('botbuilder-ai');

class LuisHelper {
    /**
     * Returns an object with preformatted LUIS results for the bot's dialogs to consume.
     * @param {*} logger
     * @param {TurnContext} context
     */
    static async executeLuisQuery(logger, context) {
        const details = {};

        try {
            const recognizer = new LuisRecognizer({
                applicationId: process.env.LuisAppId,
                endpointKey: process.env.LuisAPIKey,
                endpoint: `https://${ process.env.LuisAPIHostName }`
            }, {}, true);

            const recognizerResult = await recognizer.recognize(context);

            const intent = LuisRecognizer.topIntent(recognizerResult);

            details.intent = intent;

            if (intent === 'Book_flight') {
                // We need to get the result from the LUIS JSON which at every level returns an array

                details.destination = LuisHelper.parseCompositeEntity(recognizerResult, 'To', 'Airport');
                details.origin = LuisHelper.parseCompositeEntity(recognizerResult, 'From', 'Airport');

                // This value will be a TIMEX. And we are only interested in a Date so grab the first result and drop the Time part.
                // TIMEX is a format that represents DateTime expressions that include some ambiguity. e.g. missing a Year.
                details.travelDate = LuisHelper.parseDatetimeEntity(recognizerResult);
            }

            if (intent === 'List_articles_by_place') {
                details.location = LuisHelper.parseGeographyV2Entity(recognizerResult);
            }
        } catch (err) {
            logger.warn(`LUIS Exception: ${ err } Check your LUIS configuration`);
        }
        return details;
    }

    static parseCompositeEntity(result, compositeName, entityName) {
        const compositeEntity = result.entities[compositeName];
        if (!compositeEntity || !compositeEntity[0]) return undefined;

        const entity = compositeEntity[0][entityName];
        if (!entity || !entity[0]) return undefined;

        const entityValue = entity[0][0];
        return entityValue;
    }

    static parseDatetimeEntity(result) {
        const datetimeEntity = result.entities['datetime'];
        if (!datetimeEntity || !datetimeEntity[0]) return undefined;

        const timex = datetimeEntity[0]['timex'];
        if (!timex || !timex[0]) return undefined;

        const datetime = timex[0].split('T')[0];
        return datetime;
    }

    static parseGeographyV2Entity(result) {
        const entities = result.LuisResult.entities
        if (!entities || !entities[0]) return undefined;

        const location = geographyV2Entity[0].entity;
        return location;
    }
}

module.exports.LuisHelper = LuisHelper;
