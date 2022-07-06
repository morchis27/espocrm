define('custom:print-opportunity-doc', ['action-handler'], function (Dep) {

    return Dep.extend({

        actionPrintOpportunityDoc: function (data, e) {
            window.open("https://espo.loc/api/v1/Attachment/file/62bda6bae041af08b")
            Espo.Ajax
                .getRequest(`print-opportunity-doc/`)
                .then(response => {
                    if (response)
                        console.log(response);
                });

        },

        initPrintOpportunityDoc: function () {
            this.controlButtonVisibility();

            this.view.listenTo(
                this.view.model,
                'change:status',
                this.controlButtonVisibility.bind(this)
            );
        },

        controlButtonVisibility: function () {
            if (~['Converted', 'Dead', 'Recycled'].indexOf(this.view.model.get('status'))) {
                this.view.hideHeaderActionItem('PrintOpportunityDoc');

                return;
            }

            this.view.showHeaderActionItem('PrintOpportunityDoc');
        },
    });
});
