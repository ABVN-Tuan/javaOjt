sap.ui.define(
    [
      "sap/ui/core/mvc/Controller",
      "./../model/models",
      "./../model/formatter",
      "sap/m/MessageBox",
      "sap/m/MessageToast",
    ],
    (Controller, Model, formatter, MessageBox, MessageToast) => {
      "use strict";
  
      return Controller.extend("employee.controller.homeView", {
        formatter: formatter,
        onInit: async function () {
          const oView = this.getView();
          const oODataModel = await new sap.ui.model.odata.v4.ODataModel({
            serviceUrl: "/ojt/",
            synchronizationMode: "None",
          });
          this.byId("itemTable").bindItems({
            path: "EntityList>/Employees",
            parameters: {
              $expand: "role,department",
            },
            template: new sap.m.ColumnListItem({
              type: "Active",
              press: this.onPressItem.bind(this),
              cells: [
                new sap.m.Text({
                  text: "{EntityList>firstName},{EntityList>lastName}",
                }),
                new sap.m.Text({ text: "{EntityList>role/name}" }),
                new sap.m.Text({ text: "{EntityList>department/name}" }),
                new sap.m.Text({ text: "{EntityList>email}" }),
                new sap.m.Button({
                  id: "deleteButton",
                  icon: "sap-icon://delete",
                  type: "Transparent",
                  press: this.onDeleteEmployee.bind(this),
                  tooltip: "{i18n>deleteTooltip}",
                  enabled: {
                    parts: ["role>/role"],
                    formatter: this.formatter.isAdmin,
                  },
                }),
              ],
            }),
          });
          this.byId("itemLeaveTable").bindItems({
            path: "EntityList>/leaveRequest",
            parameters: {
              $expand: "employee"
            },
            template: new sap.m.ColumnListItem({
              id:"leaveListItem",
              type: "Active",
              cells: [
                new sap.m.Text({ text: "{EntityList>employee/firstName} {EntityList>employee/lastName}" }),
                new sap.m.Text({ text: "{EntityList>startDate}" }),
                new sap.m.Text({ text: "{EntityList>endDate}" }),
                new sap.m.Text({ text: "{EntityList>status}" }),
                new sap.m.Text({ text: "{EntityList>reason}" }),
                new sap.m.Button({
                  id: "deleteLeaveButton",
                  icon: "sap-icon://delete",
                  type: "Transparent",
                  press: this.onDeleteLeave.bind(this),
                  enabled: {
                    parts: ["role>/role"],
                    formatter: this.formatter.isAdmin,
                  },
                }),
              ],
            }),
          });
          await oView.setModel(oODataModel, "EntityList");
          const orole = await Model.getRole(oView);
          await Model.setVisibleControl(oView);
          console.log(this.getView().getModel("EntityList"))
        },
        onPressItem: async function (oEvent) {
          const oView = this.getView();
          const oItem = oEvent.getSource();
          const oContext = oItem.getBindingContext("EntityList");
          try {
            const oSelEmployee = await oContext.requestObject();
            const oJSONModel = new sap.ui.model.json.JSONModel(oSelEmployee);
            this.getView().setModel(oJSONModel, "employDetail");
          } catch (err) {}
          oView.getModel("VisibleControl").setProperty("/", {
            list: false,
            detail: true,
            create: false,
            listLeave: false,
            createLeave: false,
          });
          Model._setModel(oView, { isEdit: false }, "Edit");
        },
        onPressBack: function () {
          //Button back event
          const oView = this.getView();
          oView.getModel("VisibleControl").setProperty("/", {
            list: true,
            detail: false,
            create: false,
            listLeave: false,
            createLeave: false,
          });
        },
        onPressLeave: function () {
          const oView = this.getView();
          const oODataModel = new sap.ui.model.odata.v4.ODataModel({
            serviceUrl: "/ojt/",
            synchronizationMode: "None",
          });
          oView.getModel("VisibleControl").setProperty("/", {
            listLeave: true,
            createLeave: false,
            list: false,
            detail: false,
            create: false,
          });
        },
        onPressEdit: function () {
          const oView = this.getView();
          const oEditModel = oView.getModel("Edit");
          const bIsEdit = oEditModel.getProperty("/isEdit");
          oEditModel.setProperty("/isEdit", !bIsEdit);
        },
        onPressCreList: function () {
          var oStatusData = {
            statuses: [
              { key: "PENDING", text: "Pending" },
              { key: "APPROVED", text: "Approved" },
              { key: "REJECTED", text: "Rejected" },
            ],
          };
          var oStatusModel = new sap.ui.model.json.JSONModel(oStatusData);
          this.getView().setModel(oStatusModel, "statusModel");
          const oEmptyLeave = {
            status: "Pending",
            reason: "",
            endDate: "",
            startDate: "",
            employee: { ID: "" },
          };
          const oView = this.getView();
          oView.setModel(
            new sap.ui.model.json.JSONModel(oEmptyLeave),
            "createLeaveDetail"
          );
          oView.getModel("VisibleControl").setProperty("/", {
            list: false,
            detail: false,
            create: false,
            listLeave: false,
            createLeave: true,
          });
        },
        onPressCreEmp: function () {
          var oGenderData = {
            Genders: [
              { key: "Male", text: "Male" },
              { key: "Female", text: "Female" },
            ],
          };
          var oStatusModel = new sap.ui.model.json.JSONModel(oGenderData);
          this.getView().setModel(oStatusModel, "genderModel");
          const oEmptyEmp = {
            firstName: "",
            lastName: "",
            email: "",
            hireDate: "",
            dateOfBirth: "",
            salary: 0,
            gender: "",
            role: { ID: "" },
            department: { ID: "" },
          };
          const oView = this.getView();
          oView.setModel(
            new sap.ui.model.json.JSONModel(oEmptyEmp),
            "createDetail"
          );
          oView.getModel("VisibleControl").setProperty("/", {
            list: false,
            detail: false,
            create: true,
            listLeave: false,
            createLeave: false,
          });
        },
        onDeleteEmployee: function (oEvent) {
          const oItem = oEvent.getSource().getParent();
          const oContext = oItem.getBindingContext("EntityList");
  
          if (!oContext) {
            sap.m.MessageToast.show("No data found");
            return;
          }
  
          sap.m.MessageBox.confirm("Are you sure to delete?", {
            onClose: async (sAction) => {
              if (sAction === sap.m.MessageBox.Action.OK) {
                try {
                  if (typeof oContext.delete === "function") {
                    await oContext.delete();
                    sap.m.MessageToast.show("Delete success");
                  } else {
                    sap.m.MessageBox.error("Delete fail");
                  }
                } catch (err) {
                  sap.m.MessageBox.error("Delete fail" + err.message);
                }
              }
            },
          });
        },
        onCreateEmployee: async function () {
          //Create employee
          const oView = this.getView();
          const oModel = oView.getModel("EntityList");
          const oCreateData = oView.getModel("createDetail").getData();
          try {
            //Send post request
            const oListBinding = oModel.bindList("/Employees");
            if (!oCreateData.firstName || !oCreateData.lastName) {
              sap.m.MessageBox.warning("Please fill in name.");
              return;
            }
            if (!oCreateData.email || !oCreateData.email) {
              sap.m.MessageBox.warning("Please fill in email.");
              return;
            }
            if (!oCreateData.hireDate || !oCreateData.hireDate) {
              sap.m.MessageBox.warning("Please fill in hireDate.");
              return;
            }
            if (!oCreateData.gender) {
              sap.m.MessageBox.warning("Please fill in gender");
              return;
            }
            if (!oCreateData.role.ID) {
              sap.m.MessageBox.warning("Please fill in role.");
              return;
            }
            if (!oCreateData.department.ID) {
              sap.m.MessageBox.warning("Please fill in department.");
              return;
            }
            //Create new record    
            await oListBinding.create(oCreateData);
            //Refresh model
            await oModel.refresh();
            oView.getModel("VisibleControl").setProperty("/", {
              list: true,
              detail: false,
              create: false,
              listLeave: false,
              createLeave: false,
            });
            sap.m.MessageToast.show("Create success");
          } catch (oError) {
            sap.m.MessageBox.error("Create employee fail", oError);
          }
        },
        onCreateLeave: async function () {
          //Create employee
          const oView = this.getView();
          const oModel = oView.getModel("EntityList");
          const oCreateData = oView.getModel("createLeaveDetail").getData();
          try {
            //Send post request
            const oListBinding = oModel.bindList("/leaveRequest");
            //Create new record
            await oListBinding.create(oCreateData);
            sap.m.MessageToast.show("Create success");
            //Refresh model
            await oModel.refresh();
            oView.getModel("VisibleControl").setProperty("/", {
              list: false,
              detail: false,
              create: false,
              listLeave: true,
              createLeave: false,
            });
          } catch (oError) {
            sap.m.MessageBox.error("Create leave request fail", oError);
          }
        },
        onPressUpdate: async function () {
          const oView = this.getView();
          const oModel = oView.getModel("EntityList");
          const oUpdateData = oView.getModel("employDetail").getData();
          const updateData = oView.getModel("employDetail").getData();
          try {
            const oFunction = oModel.bindContext("/calEmpSalary(...)");
            await oFunction.ready();
            const oParamContext = oFunction.getParameterContext();
            await oParamContext.setProperty("Employee/ID", updateData.ID);
            await oParamContext.setProperty("Employee/hireDate", updateData.hireDate);
            await oParamContext.setProperty("Employee/role_ID", updateData.role.ID);
            await oParamContext.setProperty(
              "Employee/performanceRating",
              parseInt(updateData.performanceRating, 10)
            );
            await oFunction.execute();
            const oRes = await oFunction.requestObject();
            if (oRes.value !== null && oRes.value !== undefined && !isNaN(oRes.value)) {
              await oModel.refresh();
              this.getView().getModel("employDetail").setProperty("/salary", oRes.value);
            } else {
              sap.m.MessageBox.error("Update fail");
            }
          } catch (err) {
            sap.m.MessageBox.error("Call function fail: " + err.message);
          }
          try {
            const sPath = `/Employees(${oUpdateData.ID})`;
            const oEmpContext = oModel.bindContext(sPath);
            //Check context
            if (!oEmpContext) {
              sap.m.MessageBox.error("Not found data");
              return;
            }
            // Update data
            const oBindingContext = await oEmpContext.getBoundContext();
            oBindingContext.setProperty("firstName", oUpdateData.firstName);
            oBindingContext.setProperty("lastName", oUpdateData.lastName);
            oBindingContext.setProperty("email", oUpdateData.email);
            oBindingContext.setProperty("hireDate", oUpdateData.hireDate);
            oBindingContext.setProperty("salary", oUpdateData.salary);
            oBindingContext.setProperty(
              "performanceRating",
              parseInt(oUpdateData.performanceRating)
            );
            oBindingContext.setProperty("role_ID", oUpdateData.role.ID);
            oBindingContext.setProperty(
              "department_ID",
              oUpdateData.department.ID
            );
            sap.m.MessageToast.show("update employee success");
            //Refresh model
            await oModel.refresh();
          } catch (oError) {
            sap.m.MessageBox.error("Update employee fail", oError);
          }
        },
        onPressSalary: async function () {
          const oView = this.getView();
          const oModel = oView.getModel("EntityList");
          const oDetailModel = oView.getModel("employDetail");
          const updateID = oView.getModel("employDetail").getData().ID;
          const updateData = oView.getModel("employDetail").getData();
          try {
            const oFunction = oModel.bindContext("/calEmpSalary(...)");
            await oFunction.ready();
            const oParamContext = oFunction.getParameterContext();
            await oParamContext.setProperty("Employee/ID", updateData.ID);
            await oParamContext.setProperty("Employee/hireDate", updateData.hireDate);
            await oParamContext.setProperty("Employee/role_ID", updateData.role.ID);
            await oParamContext.setProperty(
              "Employee/performanceRating",
              parseInt(updateData.performanceRating, 10)
            );
            await oFunction.execute();
            const oRes = await oFunction.requestObject();
            if (oRes.value !== null && oRes.value !== undefined && !isNaN(oRes.value)) {
              await oModel.refresh();
              this.getView().getModel("employDetail").setProperty("/salary", oRes.value);
              sap.m.MessageToast.show("Calculate salary success");
            } else {
              sap.m.MessageBox.error("Calculate salary fail");
            }
          } catch (err) {
            sap.m.MessageBox.error("Call function fail: " + err.message);
          }
        },
        onDeleteLeave: function (oEvent) {
          const oItem = oEvent.getSource().getParent();
          const oContext = oItem.getBindingContext("EntityList");
  
          if (!oContext) {
            sap.m.MessageToast.show("No data found");
            return;
          }
  
          sap.m.MessageBox.confirm("Are you sure to delete?", {
            onClose: async (sAction) => {
              if (sAction === sap.m.MessageBox.Action.OK) {
                try {
                  if (typeof oContext.delete === "function") {
                    await oContext.delete();
                    sap.m.MessageToast.show("Delete success");
                  } else {
                    sap.m.MessageBox.error("Delete fail");
                  }
                } catch (err) {
                  sap.m.MessageBox.error("Delete fail" + err.message);
                }
              }
            },
          });
        },
        onChangeText: function (oEvent) {
          const oText = oEvent.getSource();
          let oValue = oText.getValue();
          var rexMail = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
          if (!oValue.match(rexMail)) {
            oText.setValueState("Error");
            oText.setValueStateText("Email not valid");
          } else {
            oText.setValueState("Success");
            oText.setValueStateText("Input email valid");
          }
        },
      });
    }
  );
  