sap.ui.define([
    "sap/ui/model/json/JSONModel",
    "sap/ui/Device"
], 
function (JSONModel, Device) {
    "use strict";

    return {
        /**
         * Provides runtime information for the device the UI5 app is running on as a JSONModel.
         * @returns {sap.ui.model.json.JSONModel} The device model.
         */
        createDeviceModel: function () {
            var oModel = new JSONModel(Device);
            oModel.setDefaultBindingMode("OneWay");
            return oModel;
        },
        _setModel: function (oView, oData, sModelName) {
            oView.setModel(new JSONModel(oData), sModelName);
          },
        _getModel: function (oView, sModelName) {
            let oModel = oView.getModel(sModelName);
            return oModel;
          },
        setInitialModel: function(oView){   
        },
        setVisibleControl: function(oView){
            const visibleView = {
                list: true,
                detail: false,
                create: false,
                listLeave: false,
                createLeave: false,
            };
            this._setModel(oView, visibleView , "VisibleControl" );
        },
        getRole: async function(oView){
            try {
                const oResRole = await fetch("/ojt/whoami",
                {
                    method: "GET",
                    headers: {
                        "Content-Type": "application/json" }
                });
                if ( oResRole.status == 200 ) {
                    let oresRoJson = await oResRole.json();
                    let role = oresRoJson.value;
                    this._setModel(oView, { role: role }, "role");
                    return role;
                }
                if ( oResRole.status != 200 ) {
                    this._setModel(oView, { '': '' }, "role");
                    return role;
                }
                
            } 
            catch (error) {
                this._setModel(oView, { '': '' }, "role");
                return role;  
            }  
        },
    };

});