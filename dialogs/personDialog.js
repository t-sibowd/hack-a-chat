// Copyright (c) Microsoft Corporation. All rights reserved.
// Licensed under the MIT License.

const { ConfirmPrompt, TextPrompt, WaterfallDialog } = require('botbuilder-dialogs');
const { CancelAndHelpDialog } = require('./cancelAndHelpDialog');
const { DateResolverDialog } = require('./dateResolverDialog');

const CONFIRM_PROMPT = 'confirmPrompt';
const DATE_RESOLVER_DIALOG = 'dateResolverDialog';
const TEXT_PROMPT = 'textPrompt';
const WATERFALL_DIALOG = 'waterfallDialog';

class PersonDialog extends CancelAndHelpDialog {
    constructor(id) {
        super(id || 'findArticleDialog');

        this.addDialog(new TextPrompt(TEXT_PROMPT))
            .addDialog(new ConfirmPrompt(CONFIRM_PROMPT))
            .addDialog(new WaterfallDialog(WATERFALL_DIALOG, [
                this.getExpertiseStep.bind(this),
                this.confirmStep.bind(this),
                this.finalStep.bind(this)
            ]));

        this.initialDialogId = WATERFALL_DIALOG;
    }

    /**
     * If a location of interest has not been provided, prompt for one.
     */
    async getExpertiseStep(stepContext) {
        const personDetails = stepContext.options;

        if (!personDetails.expertise) {
            return await stepContext.prompt(TEXT_PROMPT, { prompt: 'What skill are you looking for?' });
        } else {
            return await stepContext.next(personDetails.expertise);
        }
    }

    /**
     * Confirm the information the user has provided.
     */
    async confirmStep(stepContext) {
        const personDetails = stepContext.options;

        // Capture the results of the previous step
        personDetails.location = stepContext.result;
        let msg = `Please confirm, you would like to search for a person with expertise in ${personDetails.expertise} near Buidling ${personDetails.location}`
        if (personDetails.language) {
            msg = msg + `who speaks ${personDetails.language}`
        }
        if (personDetails.team) {
            msg = msg + `on ${personDetails.team}`
        }

        msg = msg + '.'

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

module.exports.PersonDialog = PersonDialog;
