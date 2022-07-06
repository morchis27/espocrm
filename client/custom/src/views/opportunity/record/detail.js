Espo.define('custom:views/opportunity/record/detail', 'views/record/detail', function (Dep) {

    return Dep.extend({
        template: 'custom:/opportunity/record/detail',

        setup: function () {
            this.stages = ["Prospecting", "Qualification", "Proposal", "Negotiation", "Closed Won", "Closed Lost"];
            Dep.prototype.setup.call(this);
        },

        afterRender: function () {
            Dep.prototype.afterRender.call(this);
            this.ul = this.$el.find(".progressbar");
            let stageName = document.querySelector(".progressbar-name")
            stageName.textContent = this.attributes.stage;
            for (let i = 0; i <= this.stages.indexOf(`${this.attributes.stage}`); i++) {
                this.ul.find('div:not(.active):first').addClass("active");
            }
        }


    });
});
