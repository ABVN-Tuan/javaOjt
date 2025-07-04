sap.ui.define([], () => {
    "use strict";
    return {
      isAdmin: function (sRole) {
        return sRole === "admin";
      }
    };
  });