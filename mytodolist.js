
Tasks = new Mongo.Collection("tasks");



if (Meteor.isClient) {

  // This code only runs on the client

  Template.body.helpers({

    tasks: function () {

      return Tasks.find({});

    }
  });

// Event on form to update DB
Template.body.events({

  "submit .new-task": function (event) {

    // Prevent default browser form submit

    event.preventDefault();

    // Get value from form element
    var text = event.target.text.value;

    // Insert a task into the collection

    Tasks.insert({

      text: text,

      createdAt: new Date(), // current time
      owner: Meteor.userId(),           // _id of logged in user
      username: Meteor.user().username  // username of logged in user

    });



    // Clear form

    event.target.text.value = "";

  }
});


// template for update and remove
Template.task.events({

  "click .toggle-checked": function () {

    // Set the checked property to the opposite of its current value

    Tasks.update(this._id, {

      $set: {checked: ! this.checked}

    });

  },

  "click .delete": function () {

    Tasks.remove(this._id);

  }

});

// LOGIN template

Accounts.ui.config({

  passwordSignupFields: "USERNAME_ONLY"

});

}
