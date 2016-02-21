Taches = new Mongo.Collection("taches");

if (Meteor.isServer) {
  // This code only runs on the server
  Meteor.publish("taches", function() {
    return Taches.find({
      $or: [ { private: {$ne: true}},
        { owner: this.userId }]
    });
  });
}


if (Meteor.isClient) {
  // This code only runs on the client
  Meteor.subscribe("taches");

  Template.body.helpers({
    taches: function () {
          if (Session.get("hideCompleted")) {
      // If hide completed is checked, filter tasks
      return Taches.find({checked: {$ne: true}}, {sort: {createdAt: -1}});
    } else {
      // Otherwise, return all of the tasks
      return Taches.find({}, {sort: {createdAt: -1}});
    }
    },

    hideCompleted: function () {
          return Session.get("hideCompleted");
        },
    incompleteCount: function () {
          return Taches.find({checked: {$ne: true}}).count();
        }
    });

  // Event on form to update DB
  Template.body.events({
    "submit .new-tache": function(event) {
      // Prevent default browser form submit
      event.preventDefault();
      // Get value from form element
      var text = event.target.text.value;
      var deadline = event.target.deadline.value;
      // Insert a task into the collection
      Meteor.call("addtache", text, deadline);
      // Clear form
      event.target.text.value = "";
      event.target.deadline.value = "";
    },
    "change .hide-completed input": function (event) {
        Session.set("hideCompleted", event.target.checked);
    }
  });

  // PRIVATE FUNCTION
  Template.tache.helpers({
    isOwner: function() {
      return this.owner === Meteor.userId();
    }
  });

  // template for update and remove
  Template.tache.events({
    "click .toggle-checked": function() {
      // Set the checked property to the opposite of its current value
      Meteor.call("setChecked", this._id, !this.checked);
    },

    "click .delete": function() {
      Meteor.call("deletetache", this._id);
    },

    "click .toggle-private": function() {
      Meteor.call("setPrivate", this._id, !this.private);
    }
  });


  // LOGIN template
  Accounts.ui.config({
    passwordSignupFields: "USERNAME_ONLY"
  });
}

  Meteor.methods({

    addtache: function(text,deadline) {
      // Make sure the user is logged in before inserting a task
      if (!Meteor.userId()) {
        throw new Meteor.Error("not-authorized");
      }
      Taches.insert({
        text: text,
        createdAt: new Date(),
        deadline: deadline,
        owner: Meteor.userId(),
        username: Meteor.user().username
      });
    },

    deletetache: function(tacheId) {
      var tache = Taches.findOne(tacheId);

      if (tache.private && tache.owner !== Meteor.userId()) {
  // If the task is private, make sure only the owner can delete it
        throw new Meteor.Error("not-authorized");
      }
      Taches.remove(tacheId);
    },

    setChecked: function(tacheId, setChecked) {
      var tache = Taches.findOne(tacheId);

      if (tache.private && tache.owner !== Meteor.userId()) {
  // If the task is private, make sure only the owner can check it off
            throw new Meteor.Error("not-authorized");
          }
      Taches.update(tacheId, {
        $set: {
          checked: setChecked
        }
      });
    },

    setPrivate: function(tacheId, setToPrivate) {

      var tache = Taches.findOne(tacheId);
      // Make sure only the task owner can make a task private
      if (tache.owner !== Meteor.userId()) {
        throw new Meteor.Error("not-authorized");
      }
      Taches.update(tacheId, {
        $set: {
          private: setToPrivate
        }
      });
    },

  });
