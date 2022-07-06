define('custom:print-opportunity-doc', ['action-handler'], function (Dep) {

    return Dep.extend({


        actionPrintOpportunityDoc: function (data, e) {
            let opportunityName="";
            Espo.Ajax
                .getRequest('Opportunity/' + this.view.model.id)
                .then(response => {
                    console.log(response.name);
                    Espo.Ajax
                        .getRequest(`print-opportunity-doc/${response.name}`)
                        .then(response => {
                            if (response.success === false) {
                                window.alert(response.message);
                                return
                            }

                            let url = "/api/v1/Attachment/file/" + response.id
                            window.open(url)
                        });
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
