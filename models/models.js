

function setModels(Bookshelf){
  var Staff = null;
  var Leave = null;
  var Leave_type = null;
  var Lead = null;
  var Staff_leave_type = null;
  var Admin = null;

  // Staff model
  Staff = Bookshelf.Model.extend({
    tableName: 'staff',
//relationships
    leave: function () {
        return this.hasMany(Leave, 'id');
      },

    lead: function () {
          return this.hasOne(Lead);
      },

      staff_leave_type: function () {
        return this.hasMany(Staff_leave_type, 'staff_id');
      }
  });

  // Leave model
  Leave = Bookshelf.Model.extend({
    tableName: 'leave',

    //relationships
    staff: function () {
        return this.belongsTo(Staff, 'staff_id');
      },

    leave_type: function () {
        return this.belongsTo(Leave_type, 'leave_type_id');
      },
  });

  // Leave Type model
  Leave_type = Bookshelf.Model.extend({
    tableName: 'leave_type',

  //relationships
    leave: function () {
        return this.hasMany(Leave, 'id');
      },

    staff_leave_type: function () {
      return this.hasMany(Staff_leave_type, 'id');
    },
  });

  // Staff Leave Type model
  Staff_leave_type = Bookshelf.Model.extend({
    tableName: 'staff_leave_type',

    //relationships
    staff: function () {
      return this.belongsTo(Staff, 'id');
    },
    leave_type: function () {
      return this.hasOne(Leave_type, 'id');
    },
  });

//lead Model
  Lead = Bookshelf.Model.extend({
    tableName: 'lead',

    staff: function () {
        return this.belongsTo(Staff);
      },
  });

//Admin model
  Admin = Bookshelf.Model.extend({
    tableName: 'admin'

  });

  //Variables
  exports.Staff = Staff;
  exports.Leave = Leave;
  exports.Leave_type = Leave_type;
  exports.Lead = Lead;
  exports.Admin = Admin;
  exports.Staff_leave_type = Staff_leave_type;

}


//Functions
exports.setModels = setModels;
