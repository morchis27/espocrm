Espo.define('custom:views/opportunity/record/detail', 'views/record/detail', function (Dep) {

    return Dep.extend({
        template: 'custom:/opportunity/record/detail',

        setup: function () {
            this.stages = ["Prospecting", "Qualification", "Proposal", "Negotiation", "Closed Won", "Closed Lost"];
            Dep.prototype.setup.call(this);
            console.log(this);
        },

        afterRender: function () {
            Dep.prototype.afterRender.call(this);
            this.ul = this.$el.find(".progressbar");
            for (let i = 0; i <= this.stages.indexOf(`${this.attributes.stage}`); i++) {
                this.ul.find('li:not(.active):first').addClass("active");
            }
            console.log(this.ul.find("li:before"));
            if (this.attributes.stage === "Closed Lost") {
                Array.from(this.ul.children()).forEach(child => {
                    child.classList.remove("active");
                    child.classList.add("lost");
                });
            }
        }


    });
});
