// Copyright (c) Microsoft Corporation. All rights reserved.
// Licensed under the MIT License.

const { ConfirmPrompt, TextPrompt, WaterfallDialog } = require('botbuilder-dialogs');
const { CancelAndHelpDialog } = require('./cancelAndHelpDialog');
const { DateResolverDialog } = require('./dateResolverDialog');

const CONFIRM_PROMPT = 'confirmPrompt';
const DATE_RESOLVER_DIALOG = 'dateResolverDialog';
const TEXT_PROMPT = 'textPrompt';
const WATERFALL_DIALOG = 'waterfallDialog';

class FindArticleDialog extends CancelAndHelpDialog {
    constructor(id) {
        super(id || 'findArticleDialog');

        this.addDialog(new TextPrompt(TEXT_PROMPT))
            .addDialog(new ConfirmPrompt(CONFIRM_PROMPT))
            .addDialog(new DateResolverDialog(DATE_RESOLVER_DIALOG))
            .addDialog(new WaterfallDialog(WATERFALL_DIALOG, [
                this.getLocationStep.bind(this),
                this.confirmStep.bind(this),
                this.finalStep.bind(this)
            ]));

        this.initialDialogId = WATERFALL_DIALOG;
    }

    /**
     * If a location of interest has not been provided, prompt for one.
     */
    async getLocationStep(stepContext) {
        const articleDetails = stepContext.options;

        if (!articleDetails.location) {
            return await stepContext.prompt(TEXT_PROMPT, { prompt: 'Which city\'s news would you like to see?' });
        } else {
            return await stepContext.next(articleDetails.location);
        }
    }

    /**
     * Confirm the information the user has provided.
     */
    async confirmStep(stepContext) {
        const articleDetails = stepContext.options;

        // Capture the results of the previous step
        articleDetails.location = stepContext.result;
        const msg = `Please confirm, you would like to see news from ${articleDetails.location}.`;

        // Offer a YES/NO prompt.
        return await stepContext.prompt(CONFIRM_PROMPT, { prompt: msg });
    }

    /**
     * Complete the interaction and end the dialog.
     */
    async finalStep(stepContext) {
        if (stepContext.result === true) {
            const articleDetails = stepContext.options;

            return await stepContext.endDialog(articleDetails);
        } else {
            return await stepContext.endDialog();
        }
    }

}

module.exports.ArticleDialog = ArticleDialog;
